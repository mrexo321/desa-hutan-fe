import React, { useState, useRef, useCallback } from "react";
import {
    X,
    UploadCloud,
    FileArchive,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ChevronDown,
    MapPin,
    Info,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useChunkedUpload } from "../hooks/useChunkedUpload";
import { masterWilayahService } from "../services/master/masterWilayahService";

/**
 * Modal upload SHP (chunked)
 *
 * Props:
 *   isOpen       {boolean}
 *   onClose      {() => void}
 *   onSuccess    {(result) => void}  — dipanggil setelah upload + import selesai
 *   uploadType   {string}           — default 'shpWilayahDesa'
 */
export default function ModalUploadChunked({
    isOpen,
    onClose,
    onSuccess,
    uploadType = "shpWilayahDesa",
}) {
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [replaceMode, setReplaceMode] = useState("");       // "" | "provinsi" | "auto"
    const [selectedProvinsi, setSelectedProvinsi] = useState("");

    const fileInputRef = useRef(null);
    const { upload, progress, status, result, error, reset } = useChunkedUpload();

    const isUploading = status === "uploading" || status === "processing";
    const isDone = status === "done";
    const isError = status === "error";

    // ── Fetch daftar provinsi (hanya untuk uploadType shpWilayahDesa) ──────────
    const isDesaUpload = uploadType === "shpWilayahDesa";
    const { data: provinsiData, isLoading: isLoadingProvinsi } = useQuery({
        queryKey: ["master-provinsi-all"],
        queryFn: () => masterWilayahService.getAllProvinsi(),
        enabled: isOpen && isDesaUpload,
        staleTime: 5 * 60 * 1000, // cache 5 menit
    });
    const provinsiList = provinsiData?.items || provinsiData || [];

    // ── File handling ──────────────────────────────────────────────────────────
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

    // ── Submit ─────────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (!file || isUploading) return;
        try {
            const meta = {};
            let effectiveType = uploadType;

            // Build replaceRegion based on selected mode
            if (isDesaUpload && replaceMode) {
                if (replaceMode === 'auto') {
                    meta.replaceRegion = { by: 'auto' };
                    effectiveType = 'shpWilayahDesaReplaceRegion';
                } else if (replaceMode === 'provinsi' && selectedProvinsi) {
                    meta.replaceRegion = { by: 'provinsi', value: selectedProvinsi };
                    effectiveType = 'shpWilayahDesaReplaceRegion';
                }
            }

            const res = await upload(file, effectiveType, meta);
            toast.success(
                res?.message || "Upload file selesai. Pemrosesan data sedang berjalan di background."
            );
            onSuccess?.(res);
            handleClose();
        } catch {
            // error sudah di-handle di hook, tidak perlu re-throw
        }
    };

    // ── Close & reset ──────────────────────────────────────────────────────────
    const handleClose = () => {
        if (isUploading) return;
        reset();
        setFile(null);
        setReplaceMode("");
        setSelectedProvinsi("");
        onClose();
    };

    if (!isOpen) return null;

    // ── Config label per uploadType ────────────────────────────────────────────
    const UPLOAD_TYPE_LABELS = {
        shpWilayahDesa: { title: "Tambah Data dengan Import Shapefile Desa", subtitle: "Upload file .zip berisi SHP wilayah desa" },
        shpWilayahHutan: { title: "Tambah Data dengan Import Shapefile Hutan", subtitle: "Upload file .zip berisi SHP kawasan hutan" },
        shpWilayahKhdtk: { title: "Import Shapefile KHDTK", subtitle: "Upload file .zip berisi SHP kawasan KHDTK" },
    };
    const typeLabel = UPLOAD_TYPE_LABELS[uploadType] ?? {
        title: `Import Shapefile`,
        subtitle: "Upload file .zip berisi shapefile",
    };

    // ── Label status ───────────────────────────────────────────────────────────
    const statusLabel = {
        idle: "",
        uploading: `Mengupload file... ${progress}%`,
        processing: "Memproses geometri ke database...",
        done: "Import selesai!",
        error: "Upload gagal",
    }[status];

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                        <div>
                            <h3 className="text-base font-bold text-gray-900">
                                {typeLabel.title}
                            </h3>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {typeLabel.subtitle}
                            </p>
                        </div>
                        <button
                            onClick={handleClose}
                            disabled={isUploading}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-40 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="px-6 py-5 flex flex-col gap-5 overflow-y-auto max-h-[70vh]">
                        {/* ── Drop zone ───────────────────────────────────────────────── */}
                        {!isDone && (
                            <div
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onClick={() => !file && fileInputRef.current?.click()}
                                className={`
                  relative flex flex-col items-center justify-center gap-3 
                  rounded-xl border-2 border-dashed py-8 px-4 transition-all cursor-pointer
                  ${isDragging ? "border-[#2D7344] bg-green-50" : "border-gray-200 hover:border-[#2D7344] hover:bg-gray-50"}
                  ${file ? "cursor-default" : ""}
                  ${isUploading ? "pointer-events-none opacity-70" : ""}
                `}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".zip"
                                    className="hidden"
                                    onChange={(e) => handleFileSelect(e.target.files?.[0])}
                                />

                                {file ? (
                                    // File sudah dipilih
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
                                        {!isUploading && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFile(null);
                                                    reset();
                                                }}
                                                className="text-gray-300 hover:text-red-400 transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    // Belum ada file
                                    <>
                                        <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-[#2D7344]">
                                            <UploadCloud size={24} strokeWidth={1.5} />
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
                                        <p className="text-[11px] text-gray-300">
                                            Maks. 500 MB · Format: .zip (shapefile)
                                        </p>
                                    </>
                                )}
                            </div>
                        )}

                        {/* ── Mode Replace (hanya untuk Desa SHP) ──────────────────── */}
                        {isDesaUpload && !isDone && (
                            <div className="flex flex-col gap-3">
                                {/* Mode selector */}
                                <div className="flex flex-col gap-2">
                                    <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                                        <MapPin size={14} className="text-gray-400" />
                                        Mode Import
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={replaceMode}
                                            onChange={(e) => {
                                                setReplaceMode(e.target.value);
                                                if (e.target.value !== 'provinsi') setSelectedProvinsi("");
                                            }}
                                            disabled={isUploading}
                                            className="w-full px-3.5 py-2.5 pr-10 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 font-medium focus:outline-none focus:border-[#2D7344] focus:ring-2 focus:ring-emerald-500/10 transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <option value="">Append / Upsert (tanpa hapus data lama)</option>
                                            <option value="provinsi">Replace by Provinsi tertentu</option>
                                            <option value="auto">Auto-detect Provinsi dari SHP</option>
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <ChevronDown size={16} />
                                        </div>
                                    </div>
                                </div>

                                {/* Provinsi dropdown — muncul hanya kalau mode = 'provinsi' */}
                                {replaceMode === 'provinsi' && (
                                    <div className="flex flex-col gap-2">
                                        <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                                            <MapPin size={14} className="text-gray-400" />
                                            Pilih Provinsi
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={selectedProvinsi}
                                                onChange={(e) => setSelectedProvinsi(e.target.value)}
                                                disabled={isUploading || isLoadingProvinsi}
                                                className="w-full px-3.5 py-2.5 pr-10 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 font-medium focus:outline-none focus:border-[#2D7344] focus:ring-2 focus:ring-emerald-500/10 transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <option value="">— Pilih provinsi —</option>
                                                {Array.isArray(provinsiList) && provinsiList.map((prov) => (
                                                    <option key={prov.id} value={prov.name}>
                                                        {prov.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                {isLoadingProvinsi ? (
                                                    <Loader2 size={14} className="animate-spin" />
                                                ) : (
                                                    <ChevronDown size={16} />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Info box: behavior explanation */}
                                <div className={`flex items-start gap-2 px-3 py-2.5 rounded-lg text-xs leading-relaxed transition-colors ${
                                    replaceMode === 'auto'
                                        ? "bg-blue-50 border border-blue-100 text-blue-700"
                                        : replaceMode === 'provinsi'
                                            ? "bg-amber-50 border border-amber-100 text-amber-700"
                                            : "bg-gray-50 border border-gray-100 text-gray-500"
                                }`}>
                                    <Info size={14} className="shrink-0 mt-0.5" />
                                    {replaceMode === 'auto' ? (
                                        <span>
                                            Mode <strong>Auto-detect</strong>: Provinsi akan dibaca otomatis dari data SHP (kolom WADMPR). Semua data desa di provinsi yang terdeteksi akan dihapus lalu diganti dengan data baru. Cocok untuk SHP <strong>per-pulau</strong>.
                                        </span>
                                    ) : replaceMode === 'provinsi' ? (
                                        <span>
                                            Mode <strong>Replace</strong>: {selectedProvinsi
                                                ? <>Data desa di provinsi <strong>{selectedProvinsi}</strong> akan dihapus dan diganti dengan data dari file SHP.</>
                                                : 'Pilih provinsi yang datanya akan dihapus dan diganti.'
                                            }
                                        </span>
                                    ) : (
                                        <span>
                                            Mode <strong>Append/Upsert</strong>: Data baru akan ditambahkan tanpa menghapus data yang sudah ada.
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ── Progress bar ─────────────────────────────────────────────── */}
                        {(isUploading || isDone || isError) && (
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span
                                        className={`font-medium ${isDone
                                            ? "text-[#2D7344]"
                                            : isError
                                                ? "text-red-500"
                                                : "text-gray-600"
                                            }`}
                                    >
                                        {statusLabel}
                                    </span>
                                    {isUploading && (
                                        <span className="text-gray-400 font-mono">{progress}%</span>
                                    )}
                                </div>
                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-300 ${isDone
                                            ? "bg-[#2D7344]"
                                            : isError
                                                ? "bg-red-400"
                                                : "bg-[#2D7344]"
                                            }`}
                                        style={{ width: `${isError ? 100 : progress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* ── Status selesai ────────────────────────────────────────────── */}
                        {isDone && result && (
                            <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex gap-3">
                                <CheckCircle2
                                    size={18}
                                    className="text-[#2D7344] shrink-0 mt-0.5"
                                />
                                <div className="text-sm">
                                    <p className="font-semibold text-[#2D7344]">
                                        {result.data?.isUpdate ? "Data diperbarui" : "Data ditambahkan"}
                                    </p>
                                    <p className="text-gray-600 mt-0.5">
                                        <span className="font-medium">{result.data?.nama}</span>
                                        {result.data?.kecamatan && ` · ${result.data.kecamatan}`}
                                        {result.data?.kabupaten && ` · ${result.data.kabupaten}`}
                                    </p>
                                    {result.data?.luas_ha && (
                                        <p className="text-gray-400 text-xs mt-1">
                                            Luas:{" "}
                                            {new Intl.NumberFormat("id-ID").format(result.data.luas_ha)}{" "}
                                            Ha
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ── Error ────────────────────────────────────────────────────── */}
                        {isError && error && (
                            <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3">
                                <AlertCircle
                                    size={18}
                                    className="text-red-500 shrink-0 mt-0.5"
                                />
                                <div className="text-sm">
                                    <p className="font-semibold text-red-600">Upload gagal</p>
                                    <p className="text-red-500 mt-0.5 text-xs leading-relaxed">
                                        {error}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* ── Manual data (accordion) ───────────────────────────────────── */}
                        {/* {!isDone && (
                            <div className="border border-gray-100 rounded-xl overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => setShowManual((v) => !v)}
                                    disabled={isUploading}
                                    className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    <span>Isi data manual</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] text-gray-400 font-normal">
                                            opsional · override DBF shapefile
                                        </span>
                                        {showManual ? (
                                            <ChevronUp size={15} className="text-gray-400" />
                                        ) : (
                                            <ChevronDown size={15} className="text-gray-400" />
                                        )}
                                    </div>
                                </button>

                                {showManual && (
                                    <div className="px-4 pb-4 pt-1 grid grid-cols-2 gap-3 border-t border-gray-50">
                                        {[
                                            {
                                                key: "kode_kemendagri",
                                                label: "Kode Kemendagri",
                                                placeholder: "13 digit",
                                                colSpan: 2,
                                            },
                                            {
                                                key: "nama",
                                                label: "Nama Desa",
                                                placeholder: "Nama desa",
                                                colSpan: 2,
                                            },
                                            {
                                                key: "provinsi",
                                                label: "Provinsi",
                                                placeholder: "Nama provinsi",
                                                colSpan: 1,
                                            },
                                            {
                                                key: "kabupaten",
                                                label: "Kabupaten/Kota",
                                                placeholder: "Nama kabupaten",
                                                colSpan: 1,
                                            },
                                            {
                                                key: "kecamatan",
                                                label: "Kecamatan",
                                                placeholder: "Nama kecamatan",
                                                colSpan: 1,
                                            },
                                            {
                                                key: "luas_ha",
                                                label: "Luas (Ha)",
                                                placeholder: "Otomatis jika kosong",
                                                colSpan: 1,
                                                type: "number",
                                            },
                                        ].map(({ key, label, placeholder, colSpan, type }) => (
                                            <div
                                                key={key}
                                                className={colSpan === 2 ? "col-span-2" : "col-span-1"}
                                            >
                                                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                                    {label}
                                                </label>
                                                <input
                                                    type={type || "text"}
                                                    placeholder={placeholder}
                                                    value={manualData[key]}
                                                    onChange={(e) =>
                                                        setManualData((prev) => ({
                                                            ...prev,
                                                            [key]: e.target.value,
                                                        }))
                                                    }
                                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-[#2D7344] focus:bg-white transition-colors"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )} */}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
                        {isDone ? (
                            <button
                                onClick={handleClose}
                                className="px-5 py-2 bg-[#2D7344] text-white rounded-lg text-sm font-semibold hover:bg-[#1E5230] transition-colors"
                            >
                                Selesai
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={handleClose}
                                    disabled={isUploading}
                                    className="px-5 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 disabled:opacity-40 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!file || isUploading || (replaceMode === 'provinsi' && !selectedProvinsi)}
                                    className="flex items-center gap-2 px-5 py-2 bg-[#2D7344] text-white rounded-lg text-sm font-semibold hover:bg-[#1E5230] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 size={15} className="animate-spin" />
                                            {status === "processing" ? "Memproses..." : "Mengupload..."}
                                        </>
                                    ) : (
                                        <>
                                            <UploadCloud size={15} />
                                            Import SHP
                                        </>
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}