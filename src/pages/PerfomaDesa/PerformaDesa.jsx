import React, { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import DashboardLayout from "../../components/DashboardLayout";
import { indikatorService } from "../../services/master/indikatorService";
import { performaDesaService } from "../../services/master/performaDesaService";
import { Download, Upload, Loader2, X, FileUp } from "lucide-react";

export default function PerformaDesa() {
  const [selectedFormulaId, setSelectedFormulaId] = useState("");
  const [selectedTahunId, setSelectedTahunId] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadFormulaId, setUploadFormulaId] = useState("");
  const [uploadTahunId, setUploadTahunId] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const fileRef = useRef(null);

  // ── FETCH FORMULA LIST ──
  const { data: formulaRes } = useQuery({
    queryKey: ["formula-list"],
    queryFn: indikatorService.getAllFormula,
  });
  const formulaList = formulaRes?.data || formulaRes || [];

  // ── FETCH TAHUN LIST ──
  const { data: tahunRes } = useQuery({
    queryKey: ["tahun-list"],
    queryFn: indikatorService.getAllYearIndicator,
  });
  const tahunList = tahunRes?.data || tahunRes || [];

  // ── FETCH PERFORMA DATA (kolom dinamis) ──
  const {
    data: performaRes,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["performa-desa", selectedFormulaId, page],
    queryFn: () =>
      performaDesaService.getPerformaList({
        formulaId: selectedFormulaId,
        page,
        size: pageSize,
      }),
    enabled: !!selectedFormulaId,
    keepPreviousData: true,
  });

  const columns = performaRes?.data?.column || performaRes?.column || [];
  const items = performaRes?.data?.items || performaRes?.items || [];
  const total = performaRes?.data?.total || performaRes?.total || 0;
  const totalPages = Math.ceil(total / pageSize) || 1;

  // ── DOWNLOAD TEMPLATE ──
  const handleDownloadTemplate = async () => {
    if (!selectedFormulaId) return toast.warning("Pilih formula terlebih dahulu!");
    setIsDownloading(true);
    try {
      await performaDesaService.downloadTemplate(selectedFormulaId);
      toast.success("Template berhasil diunduh!");
    } catch {
      toast.error("Gagal mengunduh template.");
    } finally {
      setIsDownloading(false);
    }
  };

  // ── UPLOAD MUTATION ──
  const uploadMutation = useMutation({
    mutationFn: (formData) => performaDesaService.importExcel(formData),
    onSuccess: (res) => {
      toast.success(
        res?.message || "File sedang diproses di latar belakang.",
        { description: res?.jobId ? `Job ID: ${res.jobId}` : undefined }
      );
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadFormulaId("");
      setUploadTahunId("");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Gagal mengunggah file."),
  });

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!uploadFile) return toast.warning("Pilih file Excel terlebih dahulu!");
    if (!uploadFormulaId) return toast.warning("Pilih formula terlebih dahulu!");
    if (!uploadTahunId) return toast.warning("Pilih tahun terlebih dahulu!");
    const fd = new FormData();
    fd.append("file", uploadFile);
    fd.append("formulaId", uploadFormulaId);
    fd.append("tahunId", uploadTahunId);
    uploadMutation.mutate(fd);
  };

  return (
    <DashboardLayout activeMenu="Performa Desa">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col min-h-[calc(100vh-120px)] overflow-hidden">

        {/* HEADER */}
        <div className="flex flex-col items-center mb-6">
          <h2 className="text-xl font-bold text-[#2D7344] tracking-widest mb-3">Performa Desa Hutan</h2>
          <div className="w-full h-[2px] bg-[#2D7344]"></div>
        </div>

        {/* FILTER: Formula & Tahun */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex items-center px-4 py-2.5 gap-3 min-w-[260px]">
            <span className="text-xs text-[#2D7344] font-bold whitespace-nowrap">Formula</span>
            <select
              className="flex-1 bg-transparent text-gray-600 text-xs focus:outline-none appearance-none cursor-pointer"
              value={selectedFormulaId}
              onChange={(e) => { setSelectedFormulaId(e.target.value); setPage(1); }}
            >
              <option value="">-- Pilih Formula --</option>
              {formulaList.map((f) => (
                <option key={f.id} value={f.id}>{f.nama || f.name}</option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex items-center px-4 py-2.5 gap-3 min-w-[200px]">
            <span className="text-xs text-[#2D7344] font-bold whitespace-nowrap">Tahun</span>
            <select
              className="flex-1 bg-transparent text-gray-600 text-xs focus:outline-none appearance-none cursor-pointer"
              value={selectedTahunId}
              onChange={(e) => setSelectedTahunId(e.target.value)}
            >
              <option value="">-- Pilih Tahun --</option>
              {tahunList.map((t) => (
                <option key={t.id} value={t.id}>{t.tahun}</option>
              ))}
            </select>
          </div>
        </div>

        {/* TABEL AREA */}
        <div className="flex-1 bg-white rounded-xl flex flex-col border border-gray-100 shadow-sm overflow-hidden">

          {/* TABLE TOOLBAR */}
          <div className="p-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
            <h3 className="text-sm font-bold text-gray-800">
              {selectedFormulaId
                ? `Hasil Kalkulasi — ${formulaList.find((f) => String(f.id) === String(selectedFormulaId))?.nama || "Formula"}`
                : "Pilih formula untuk menampilkan data"}
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleDownloadTemplate}
                disabled={isDownloading || !selectedFormulaId}
                className="flex items-center gap-2 bg-[#2D7344] hover:bg-[#1d4d2b] disabled:opacity-60 text-white px-4 py-2 rounded-md text-xs font-semibold transition-colors shadow-sm"
              >
                {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                Download Template
              </button>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-2 bg-[#2D7344] hover:bg-[#1d4d2b] text-white px-4 py-2 rounded-md text-xs font-semibold transition-colors shadow-sm"
              >
                <Upload size={14} />
                Upload Excel
              </button>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto w-full flex-1">
            {!selectedFormulaId ? (
              <div className="flex items-center justify-center h-48 text-sm text-gray-400">
                Pilih formula di atas untuk menampilkan data kalkulasi.
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center h-48 gap-2 text-[#2D7344]">
                <Loader2 size={20} className="animate-spin" />
                <span className="text-sm">Memuat data...</span>
              </div>
            ) : isError ? (
              <div className="flex items-center justify-center h-48 text-sm text-red-500">
                Gagal memuat data. Coba lagi.
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-[#2D7344] text-white text-xs font-bold">
                    <th className="py-3 px-4 text-center w-12 border-r border-[#3A8353]">No</th>
                    <th className="py-3 px-4 border-r border-[#3A8353] min-w-[160px]">Nama Desa</th>
                    {columns.map((col) => (
                      <th key={col.kode} className="py-3 px-4 border-r border-[#3A8353] whitespace-nowrap">
                        {col.nama}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-xs text-gray-600 font-medium">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={2 + columns.length} className="text-center py-10 text-gray-400">
                        Belum ada data untuk formula ini.
                      </td>
                    </tr>
                  ) : (
                    items.map((row, idx) => (
                      <tr key={row.id} className="border-b border-gray-100 even:bg-[#E8EEF2] hover:bg-green-50 transition-colors">
                        <td className="py-3 px-4 text-center">{(page - 1) * pageSize + idx + 1}</td>
                        <td className="py-3 px-4 font-semibold text-gray-800">{row.desa?.nama || "-"}</td>
                        {columns.map((col) => {
                          const indVal = Array.isArray(row.nilaiIndikator)
                            ? row.nilaiIndikator.find((x) => x.kode === col.kode)
                            : null;
                          return (
                            <td key={col.kode} className="py-3 px-4">
                              {indVal ? (indVal.label ?? indVal.nilai ?? "-") : "-"}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* PAGINATION */}
          {selectedFormulaId && !isLoading && (
            <div className="flex justify-between items-center gap-4 p-4 text-xs text-gray-500 bg-white border-t border-gray-100">
              <span>
                Halaman {page} dari {totalPages} · Total {total} data
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded border border-gray-200 hover:bg-gray-100 disabled:opacity-40 transition-colors"
                >
                  ‹ Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1 rounded border border-gray-200 hover:bg-gray-100 disabled:opacity-40 transition-colors"
                >
                  Next ›
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── UPLOAD MODAL ── */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-[520px] overflow-hidden">
            <div className="w-full h-1.5 bg-[#2D7344]"></div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Upload Data Excel</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Import data desa untuk proses kalkulasi performa</p>
                </div>
                <button onClick={() => setIsUploadModalOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* Formula */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Formula</label>
                <select
                  value={uploadFormulaId}
                  onChange={(e) => setUploadFormulaId(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-700 focus:outline-none focus:border-[#2D7344]"
                  required
                >
                  <option value="">-- Pilih Formula --</option>
                  {formulaList.map((f) => (
                    <option key={f.id} value={f.id}>{f.nama || f.name}</option>
                  ))}
                </select>
              </div>

              {/* Tahun */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tahun</label>
                <select
                  value={uploadTahunId}
                  onChange={(e) => setUploadTahunId(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-700 focus:outline-none focus:border-[#2D7344]"
                  required
                >
                  <option value="">-- Pilih Tahun --</option>
                  {tahunList.map((t) => (
                    <option key={t.id} value={t.id}>{t.tahun}</option>
                  ))}
                </select>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">File Excel (.xlsx)</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-[#2D7344] hover:bg-green-50/30 transition-all"
                >
                  <FileUp size={28} className="text-gray-300 mb-2" />
                  {uploadFile ? (
                    <p className="text-sm font-semibold text-[#2D7344]">{uploadFile.name}</p>
                  ) : (
                    <p className="text-sm text-gray-400">Klik untuk memilih file Excel</p>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".xlsx,.xls"
                    className="hidden"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-slate-800">
                    Tabel Data Performa Tahun {years.find((y) => y.id === selectedTahun)?.tahun || ""}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Formula: <span className="font-semibold text-slate-700">{formulasMain.find((f) => f.id === selectedFormula)?.nama || "Tidak ada nama"}</span>
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsUploadModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                  disabled={uploadMutation.isPending}>
                  Batal
                </button>
                <button type="submit" disabled={uploadMutation.isPending}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#2D7344] hover:bg-[#1d4d2b] text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-70 shadow-sm">
                  {uploadMutation.isPending ? <><Loader2 size={16} className="animate-spin" /> Mengunggah...</> : <><Upload size={16} /> Upload</>}
                </button>
              </div>
            </form>
          </div>
        </div>
        </div>
  )
}
    </DashboardLayout >
  );
}
