import React, { useState, useEffect, useMemo, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download, Upload, Loader2, X, FileUp, ChevronDown, Search } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { indikatorService } from "../../services/master/indikatorService";
import { performaDesaService } from "../../services/master/performaDesaService";
import { usePermission } from "../../hooks/usePermission";
import DataTable from "../../components/DataTable";
import Pagination from "../../components/Pagination";

// ── KOMPONEN CUSTOM: SEARCHABLE DROPDOWN (Premium UI & UX) ──
const SearchableDropdown = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Pilih opsi",
  required = false,
  emptyMessage = "Tidak ada hasil ditemukan",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset search input when dropdown is closed
  useEffect(() => {
    if (!isOpen) {
      setSearch("");
    }
  }, [isOpen]);

  const selectedOption = useMemo(() => {
    return options.find((opt) => String(opt.value) === String(value));
  }, [options, value]);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const query = search.toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(query));
  }, [options, search]);

  return (
    <div ref={dropdownRef} className="relative w-full flex flex-col">
      {/* CSS Scrollbar Kustom Lokal */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(45, 115, 68, 0.15);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(45, 115, 68, 0.3);
        }
      `}</style>

      {/* Label */}
      <label className="text-[10px] text-[#2D7344] font-extrabold uppercase tracking-wider mb-1 block select-none">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Trigger Button */}
      <div
        onClick={() => {
          if (!disabled) setIsOpen((prev) => !prev);
        }}
        className={`w-full rounded-xl border flex items-center justify-between px-4 py-2 transition-all h-[42px] select-none ${
          disabled
            ? "bg-slate-100/80 text-gray-400 border-gray-200 cursor-not-allowed opacity-70"
            : isOpen
            ? "bg-white border-[#2D7344]/50 ring-2 ring-[#2D7344]/10 shadow-sm cursor-pointer"
            : "bg-white hover:shadow-md hover:border-gray-300 border-gray-250 shadow-sm cursor-pointer"
        }`}
      >
        <span
          className={`text-xs font-bold truncate ${disabled ? "text-gray-400" : selectedOption ? "text-gray-800" : "text-gray-400"}`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={14}
          className={`text-gray-500 transition-transform duration-200 flex-shrink-0 ml-2 ${
            isOpen ? "transform rotate-180 text-[#2D7344]" : ""
          }`}
        />
      </div>


      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute z-[100] top-[60px] left-0 w-full bg-white border border-gray-150 rounded-2xl shadow-xl p-2 animate-in fade-in slide-in-from-top-2 duration-150 flex flex-col">
          {/* Search Box */}
          <div className="flex items-center gap-2 px-3 py-2 border border-gray-100 rounded-xl mb-2 focus-within:border-[#2D7344]/40 focus-within:ring-2 focus-within:ring-[#2D7344]/10 transition-all bg-slate-50/50 flex-shrink-0">
            <Search size={14} className="text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Cari ${label.toLowerCase()}...`}
              className="w-full bg-transparent text-xs font-bold text-gray-700 focus:outline-none placeholder-gray-400"
              autoFocus
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="overflow-y-auto overflow-x-hidden flex-1 space-y-0.5 custom-scrollbar pr-1 max-h-[190px]">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs font-bold text-gray-400 italic">
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isActive = String(opt.value) === String(value);
                return (
                  <button
                    key={opt.key || opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-between ${isActive
                        ? "bg-green-50 text-[#2D7344] font-extrabold"
                        : "text-gray-700 hover:bg-slate-50 hover:text-[#2D7344]"
                      }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2D7344] flex-shrink-0 ml-2" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function PerformaDesa() {
  const { can } = usePermission();
  const [selectedFormulaId, setSelectedFormulaId] = useState("");
  const [selectedTahunId, setSelectedTahunId] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadFormulaId, setUploadFormulaId] = useState("");
  const [uploadTahunId, setUploadTahunId] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const fileRef = useRef(null);

  // ── FETCH FORMULA LIST ──
  const { data: formulaRes } = useQuery({
    queryKey: ["formula-list", selectedTahunId],
    queryFn: () => indikatorService.getAllFormula({ tahunIndikatorPerhitunganId: selectedTahunId }),
    enabled: !!selectedTahunId,
  });
  const formulaList = formulaRes?.data || formulaRes || [];

  // ── FETCH UPLOAD FORMULA LIST ──
  const { data: uploadFormulaRes } = useQuery({
    queryKey: ["upload-formula-list", uploadTahunId],
    queryFn: () => indikatorService.getAllFormula({ tahunIndikatorPerhitunganId: uploadTahunId }),
    enabled: !!uploadTahunId,
  });
  const uploadFormulaList = uploadFormulaRes?.data || uploadFormulaRes || [];


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
    queryKey: ["performa-desa", selectedFormulaId, page, pageSize],
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

  // Options formatting for SearchableDropdown
  const formulaOptions = useMemo(() => {
    return formulaList.map((f) => ({
      value: f.id,
      label: f.nama || f.name || "-",
    }));
  }, [formulaList]);

  const tahunOptions = useMemo(() => {
    return tahunList.map((t) => ({
      value: t.id,
      label: String(t.tahun),
    }));
  }, [tahunList]);

  // Dynamic columns mapper for DataTable
  const tableColumns = useMemo(() => {
    const baseColumns = [
      {
        header: "No",
        className: "text-center w-16",
        render: (row, idx) => (
          <div className="text-center text-slate-500">
            {(page - 1) * pageSize + idx + 1}
          </div>
        ),
      },
      {
        header: "Nama Desa",
        className: "font-semibold text-slate-800 min-w-[160px]",
        render: (row) => <span>{row.desa?.nama || "-"}</span>,
      },
    ];

    const dynamicColumns = columns.map((col) => ({
      header: col.nama,
      render: (row) => {
        const indVal = Array.isArray(row.nilaiIndikator)
          ? row.nilaiIndikator.find((x) => x.kode === col.kode)
          : null;
        return <span>{indVal ? (indVal.label ?? indVal.nilai ?? "-") : "-"}</span>;
      },
    }));

    return [...baseColumns, ...dynamicColumns];
  }, [columns, page, pageSize]);

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
    <DashboardLayout activeMenu="Perhitungan Indeks">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col min-h-[calc(100vh-120px)] overflow-hidden">

        {/* HEADER */}
        <div className="flex flex-col items-center mb-6">
          <h2 className="text-xl font-bold text-[#2D7344] tracking-widest mb-3">Perhitungan Indeks</h2>
          <div className="w-full h-[2px] bg-[#2D7344]"></div>
        </div>

        {/* FILTER BAR (Menggunakan grid & z-index agar dropdown melayang dengan indah) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 relative z-30 font-sans">

          {/* Tahun Filter (Paling Kiri) */}
          <SearchableDropdown
            label="Tahun"
            value={selectedTahunId}
            onChange={(val) => {
              setSelectedTahunId(val);
              setSelectedFormulaId("");
            }}
            options={tahunOptions}
            placeholder="Pilih Tahun"
            required={true}
          />

          {/* Formula Filter (Paling Kanan & Terdisabled bila belum pilih Tahun) */}
          <SearchableDropdown
            label="Formula"
            value={selectedFormulaId}
            onChange={(val) => {
              setSelectedFormulaId(val);
              setPage(1);
            }}
            options={formulaOptions}
            placeholder={selectedTahunId ? "Pilih Formula" : "Pilih Tahun Terlebih Dahulu"}
            disabled={!selectedTahunId}
            required={true}
          />

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
                className="flex items-center gap-2 bg-[#2D7344] hover:bg-[#1d4d2b] disabled:opacity-60 text-white px-4 py-2 rounded-md text-xs font-semibold transition-colors shadow-sm cursor-pointer"
              >
                {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                Download Template
              </button>
              {can('performa_desa_hutan:import') && (
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="flex items-center gap-2 bg-[#2D7344] hover:bg-[#1d4d2b] text-white px-4 py-2 rounded-md text-xs font-semibold transition-colors shadow-sm cursor-pointer"
                >
                  <Upload size={14} />
                  Upload Excel
                </button>
              )}
            </div>
          </div>

          {/* TABLE & PAGINATION */}
          {!selectedFormulaId ? (
            <div className="flex items-center justify-center h-48 text-sm text-gray-400 font-bold font-sans">
              Pilih formula di atas untuk menampilkan data kalkulasi.
            </div>
          ) : (
            <>
              <DataTable
                columns={tableColumns}
                data={items}
                isLoading={isLoading}
                isError={isError}
                emptyMessage="Belum ada data kalkulasi untuk formula ini"
              />

              {!isLoading && !isError && items.length > 0 && (
                <Pagination
                  currentPage={page}
                  totalPage={totalPages}
                  perPage={pageSize}
                  total={total}
                  onPageChange={setPage}
                  onSizeChange={(size) => {
                    setPageSize(size);
                    setPage(1);
                  }}
                />
              )}
            </>
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
                <button onClick={() => setIsUploadModalOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                {/* Tahun */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tahun</label>
                  <select
                    value={uploadTahunId}
                    onChange={(e) => {
                      setUploadTahunId(e.target.value);
                      setUploadFormulaId("");
                    }}
                    className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-700 focus:outline-none focus:border-[#2D7344]"
                    required
                  >
                    <option value="">-- Pilih Tahun --</option>
                    {tahunList.map((t) => (
                      <option key={t.id} value={t.id}>{t.tahun}</option>
                    ))}
                  </select>
                </div>

                {/* Formula */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Formula</label>
                  <select
                    value={uploadFormulaId}
                    onChange={(e) => setUploadFormulaId(e.target.value)}
                    disabled={!uploadTahunId}
                    className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-700 focus:outline-none focus:border-[#2D7344] disabled:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
                    required
                  >
                    <option value="">{uploadTahunId ? "-- Pilih Formula --" : "-- Pilih Tahun Terlebih Dahulu --"}</option>
                    {uploadFormulaList.map((f) => (
                      <option key={f.id} value={f.id}>{f.nama || f.name}</option>
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
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setIsUploadModalOpen(false)}
                    className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                    disabled={uploadMutation.isPending}>
                    Batal
                  </button>
                  <button type="submit" disabled={uploadMutation.isPending}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#2D7344] hover:bg-[#1d4d2b] text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-70 shadow-sm cursor-pointer">
                    {uploadMutation.isPending ? <><Loader2 size={16} className="animate-spin" /> Mengunggah...</> : <><Upload size={16} /> Upload</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
