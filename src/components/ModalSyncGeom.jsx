import React, { useState, useRef, useCallback, useEffect } from "react";
import {
    X,
    UploadCloud,
    FileArchive,
    CheckCircle2,
    AlertCircle,
    Loader2,
    RefreshCw,
} from "lucide-react";
import masterInstance from "../api/masterInstance";

export default function ModalSyncGeom({ isOpen, onClose, onSuccess }) {
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const [jobId, setJobId] = useState(null);
    const [jobStatus, setJobStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const pollRef = useRef(null);
    const fileInputRef = useRef(null);

    const STATUS_LABEL = {
        pending: { text: "Menunggu...", color: "#6b7280" },
        running: { text: "Sedang sync...", color: "#2563eb" },
        done: { text: "Selesai", color: "#16a34a" },
        done_with_errors: { text: "Selesai (ada error)", color: "#d97706" },
        error: { text: "Gagal", color: "#dc2626" },
    };

    // Bersihkan interval saat unmount
    useEffect(() => {
        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, []);

    const handleFileSelect = (selected) => {
        if (!selected) return;
        if (!selected.name.toLowerCase().endsWith(".zip")) {
            alert("File harus berformat .zip yang berisi shapefile");
            return;
        }
        setFile(selected);
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        const dropped = e.dataTransfer.files[0];
        if (dropped) handleFileSelect(dropped);
    }, []);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const startPolling = (jid) => {
        pollRef.current = setInterval(async () => {
            try {
                const res = await masterInstance.get(
                    `/wilayah-hutan/sync-geom/status/${jid}`
                );
                // Menyesuaikan jika backend membungkus dengan data.data atau langsung
                const data = res.data?.data || res.data;
                setJobStatus(data);

                const done = ["done", "done_with_errors", "error"].includes(
                    data.status
                );
                if (done) {
                    clearInterval(pollRef.current);
                    setLoading(false);
                    if (data.status === "done" && onSuccess) onSuccess();
                }
            } catch (err) {
                console.error("Polling error:", err);
            }
        }, 3000);
    };

    const handleSync = async () => {
        if (!file) {
            setError("Pilih file SHP ZIP terlebih dahulu");
            return;
        }

        setLoading(true);
        setError(null);
        setJobId(null);
        setJobStatus(null);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await masterInstance.post("/wilayah-hutan/sync-geom", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            const data = res.data?.data || res.data;

            setJobId(data.jobId);
            setJobStatus({ status: "pending", progress: 0 });
            startPolling(data.jobId);
        } catch (err) {
            setError(
                err.response?.data?.message || err.message || "Gagal memulai sync"
            );
            setLoading(false);
        }
    };

    const handleReset = () => {
        if (pollRef.current) clearInterval(pollRef.current);
        setFile(null);
        setJobId(null);
        setJobStatus(null);
        setLoading(false);
        setError(null);
    };

    const handleClose = () => {
        if (loading && !isDone && !isErrorSync) return;
        handleReset();
        onClose();
    };

    if (!isOpen) return null;

    const isDone =
        jobStatus && ["done", "done_with_errors", "error"].includes(jobStatus.status);
    const isErrorSync = error || (jobStatus && jobStatus.status === "error");
    const statusInfo = jobStatus ? STATUS_LABEL[jobStatus.status] : null;

    return (
        <>
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                onClick={handleClose}
            />

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                        <div>
                            <h3 className="text-base font-bold text-gray-900">
                                Sync Geometry Hutan
                            </h3>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Lanjutkan insert geometry yang belum masuk ke database.
                            </p>
                        </div>
                        <button
                            onClick={handleClose}
                            disabled={loading && !isDone && !isErrorSync}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-40 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="px-6 py-5 flex flex-col gap-5 overflow-y-auto max-h-[70vh]">
                        {/* Drop zone */}
                        {!loading && !isDone && !isErrorSync && (
                            <div
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onClick={() => !file && fileInputRef.current?.click()}
                                className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-8 px-4 transition-all cursor-pointer
                  ${isDragging ? "border-[#2D7344] bg-green-50" : "border-gray-200 hover:border-[#2D7344] hover:bg-gray-50"}
                  ${file ? "cursor-default" : ""}`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".zip"
                                    className="hidden"
                                    onChange={(e) => handleFileSelect(e.target.files?.[0])}
                                />

                                {file ? (
                                    <div className="flex items-center gap-3 w-full">
                                        <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-[#2D7344] shrink-0">
                                            <FileArchive size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 truncate">
                                                {file.name}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFile(null);
                                            }}
                                            className="text-gray-300 hover:text-red-400 transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-[#2D7344]">
                                            <RefreshCw size={24} strokeWidth={1.5} />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-semibold text-gray-700">
                                                Seret file ke sini
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                atau{" "}
                                                <span className="text-[#2D7344] font-semibold">
                                                    klik untuk memilih
                                                </span>{" "}
                                                file .zip
                                            </p>
                                        </div>
                                        <p className="text-[11px] text-gray-300 text-center mt-2 max-w-[80%] leading-relaxed">
                                            Upload file SHP ZIP yang sama dengan saat import sebelumnya.
                                        </p>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Error Manual */}
                        {error && !jobStatus && (
                            <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3">
                                <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-semibold text-red-600">Terjadi Kesalahan</p>
                                    <p className="text-red-500 mt-0.5 text-xs leading-relaxed">
                                        {error}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Progress Monitoring */}
                        {jobStatus && (
                            <div className="flex flex-col gap-4 bg-gray-50/50 rounded-xl p-5 border border-gray-100">
                                {/* Header Status */}
                                <div className="flex items-center justify-between">
                                    <span
                                        className="font-semibold text-sm"
                                        style={{ color: statusInfo?.color }}
                                    >
                                        {statusInfo?.text}
                                    </span>
                                    {jobId && (
                                        <span className="text-[11px] font-mono text-gray-400 bg-white px-2 py-1 rounded border border-gray-100">
                                            Job: {jobId}
                                        </span>
                                    )}
                                </div>

                                {/* Progress Bar */}
                                <div className="flex flex-col gap-2">
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{
                                                width: `${jobStatus.progress ?? 0}%`,
                                                backgroundColor: statusInfo?.color,
                                            }}
                                        />
                                    </div>
                                    <div className="text-xs text-right text-gray-500 font-medium">
                                        {jobStatus.progress ?? 0}%
                                    </div>
                                </div>

                                {/* Statistik */}
                                {jobStatus.total > 0 && (
                                    <div className="grid grid-cols-4 gap-2 pt-2">
                                        <StatCard label="Total" value={jobStatus.total} />
                                        <StatCard label="Masuk" value={jobStatus.inserted} color="#16a34a" />
                                        <StatCard label="Gagal" value={jobStatus.failed} color="#dc2626" />
                                        <StatCard label="Lewat" value={jobStatus.skipped} color="#6b7280" />
                                    </div>
                                )}

                                {/* Error List */}
                                {jobStatus.errors?.length > 0 && (
                                    <div className="mt-2 bg-amber-50 rounded-lg p-3 border border-amber-100">
                                        <details className="text-xs">
                                            <summary className="font-medium text-amber-700 cursor-pointer select-none">
                                                Terdapat {jobStatus.errors.length} masalah
                                            </summary>
                                            <ul className="mt-2 pl-4 list-disc text-amber-600 flex flex-col gap-1 max-h-32 overflow-y-auto">
                                                {jobStatus.errors.map((e, i) => (
                                                    <li key={i}>{e}</li>
                                                ))}
                                            </ul>
                                        </details>
                                    </div>
                                )}

                                {/* Selesai Waktu */}
                                {isDone && jobStatus.finishedAt && (
                                    <p className="text-[11px] text-gray-400 text-center mt-2">
                                        Selesai pada: {new Date(jobStatus.finishedAt).toLocaleString("id-ID")}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50 rounded-b-2xl">
                        {isDone || (error && !jobStatus) ? (
                            <button
                                onClick={handleReset}
                                className="px-5 py-2 text-sm font-semibold text-gray-600 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Upload File Lain
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={handleClose}
                                    disabled={loading}
                                    className="px-5 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 disabled:opacity-40 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleSync}
                                    disabled={!file || loading}
                                    className="flex items-center gap-2 px-5 py-2 bg-[#2D7344] text-white rounded-lg text-sm font-semibold hover:bg-[#1E5230] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={15} className="animate-spin" />
                                            Memproses...
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw size={15} />
                                            Mulai Sync
                                        </>
                                    )}
                                </button>
                            </>
                        )}
                        {isDone && (
                            <button
                                onClick={handleClose}
                                className="px-5 py-2 bg-[#2D7344] text-white rounded-lg text-sm font-semibold hover:bg-[#1E5230] transition-colors"
                            >
                                Selesai
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

function StatCard({ label, value, color = "#111827" }) {
    return (
        <div className="flex flex-col items-center justify-center bg-white rounded-lg p-2 border border-gray-100">
            <span className="text-lg font-bold" style={{ color }}>
                {value ?? 0}
            </span>
            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mt-0.5">
                {label}
            </span>
        </div>
    );
}
