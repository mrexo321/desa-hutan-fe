// src/hooks/useChunkedUpload.js
import { useState, useCallback, useRef } from "react";
import masterInstance from "../api/masterInstance";

const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB per chunk

/**
 * Hook untuk chunked upload file SHP (.zip) ke BE
 *
 * Usage:
 *   const { upload, progress, status, result, error, reset } = useChunkedUpload();
 *   await upload(file, 'shpWilayahDesa', { manualData: { nama: '...' } });
 *
 * status: 'idle' | 'uploading' | 'processing' | 'done' | 'error'
 * progress: 0-100
 */
export function useChunkedUpload() {
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState("idle"); // idle | uploading | processing | done | error
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    // Ref untuk support abort di masa depan
    const abortRef = useRef(false);

    const upload = useCallback(async (file, type, meta = {}) => {
        abortRef.current = false;
        setStatus("uploading");
        setProgress(0);
        setError(null);
        setResult(null);

        try {
            const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

            // ── 1. Init session ──────────────────────────────────────────────────
            const { data: initData } = await masterInstance.post("/upload/init", {
                type,
                totalChunks,
                fileName: file.name,
                meta,
            });

            const { uploadId } = initData;

            // ── 2. Kirim chunks secara sequential ────────────────────────────────
            // Sequential (bukan parallel) karena BE pakai appendFile urutan terjaga
            for (let i = 0; i < totalChunks; i++) {
                if (abortRef.current) throw new Error("Upload dibatalkan");

                const start = i * CHUNK_SIZE;
                const end = Math.min(start + CHUNK_SIZE, file.size);
                const blob = file.slice(start, end);

                const form = new FormData();
                form.append("uploadId", uploadId);
                form.append("chunkIndex", String(i));
                form.append("chunk", blob, file.name);

                // Retry sederhana: coba max 3x per chunk kalau network flaky
                let attempt = 0;
                while (attempt < 3) {
                    try {
                        await masterInstance.post("/upload/chunk", form, {
                            headers: { "Content-Type": "multipart/form-data" },
                        });
                        break;
                    } catch (chunkErr) {
                        attempt++;
                        if (attempt >= 3) throw chunkErr;
                        // Tunggu sebentar sebelum retry
                        await new Promise((r) => setTimeout(r, 500 * attempt));
                    }
                }

                // Progress 0–90 untuk fase upload, 90–100 untuk fase processing
                setProgress(Math.round(((i + 1) / totalChunks) * 90));
            }

            // ── 3. Finalize ──────────────────────────────────────────────────────
            setStatus("processing");

            const { data: finalData } = await masterInstance.post(
                "/upload/finalize",
                { uploadId }
            );

            // Jika BE mengembalikan status PROCESSING (proses dijalankan async di background)
            if (finalData.status === "PROCESSING") {
                let isFinished = false;
                let finalResultData = null;

                while (!isFinished) {
                    if (abortRef.current) throw new Error("Upload dibatalkan");
                    await new Promise((r) => setTimeout(r, 3000)); // Poll tiap 3 detik

                    try {
                        const { data: statusRes } = await masterInstance.get(
                            `/upload/status/${uploadId}`
                        );

                        if (statusRes.status === "COMPLETED") {
                            finalResultData = { success: true, data: statusRes.result };
                            isFinished = true;
                        } else if (statusRes.status === "FAILED") {
                            const msg = statusRes.error || "Gagal memproses data shapefile";
                            setError(msg);
                            setStatus("error");
                            throw new Error(msg);
                        }
                    } catch (pollErr) {
                        if (pollErr.response?.status === 404) {
                            const msg = "Session upload tidak ditemukan atau sudah expired";
                            setError(msg);
                            setStatus("error");
                            throw pollErr;
                        }
                        if (pollErr.message === "Upload dibatalkan") throw pollErr;
                        // Jaringan flaky saat poll, retry di iterasi berikutnya
                    }
                }

                setProgress(100);
                setStatus("done");
                setResult(finalResultData);
                return finalResultData;
            }

            // Fallback jika BE merespons langsung (sync)
            setProgress(100);
            setStatus("done");
            setResult(finalData);
            return finalData;

        } catch (err) {
            const msg =
                err.response?.data?.message ??
                err.message ??
                "Terjadi kesalahan saat upload";
            setError(msg);
            setStatus("error");
            throw err;
        }
    }, []);

    const reset = useCallback(() => {
        abortRef.current = true; // stop loop kalau masih jalan
        setProgress(0);
        setStatus("idle");
        setResult(null);
        setError(null);
    }, []);

    return { upload, progress, status, result, error, reset };
}