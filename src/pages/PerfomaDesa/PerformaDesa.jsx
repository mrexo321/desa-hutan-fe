import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import DataTable from "../../components/DataTable";
import Pagination from "../../components/Pagination";
import { useQuery, useMutation } from "@tanstack/react-query";
import { performaDesaService } from "../../services/master/performaDesaService";
import { indikatorService } from "../../services/master/indikatorService";
import { toast } from "sonner";
import { 
  Download, 
  UploadCloud, 
  Plus, 
  Filter, 
  Info,
  Loader2,
  Calendar,
  Calculator,
  SearchX,
  Eye,
  FileSpreadsheet
} from "lucide-react";

export default function PerformaDesa() {
  const navigate = useNavigate();

  // State untuk mengontrol Modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // State form Upload
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTahunId, setUploadTahunId] = useState("");
  const [uploadFormulaId, setUploadFormulaId] = useState("");

  // State untuk Filter & Pagination
  const [selectedTahun, setSelectedTahun] = useState("");
  const [selectedFormula, setSelectedFormula] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Fetch Master Data untuk Filter
  const { data: yearsData, isLoading: isYearsLoading } = useQuery({
    queryKey: ["allYears"],
    queryFn: () => indikatorService.getAllYearIndicator(),
  });
  const years = yearsData?.data || yearsData || [];

  const { data: formulaData, isLoading: isFormulaLoading } = useQuery({
    queryKey: ["allFormulaIndicators"],
    queryFn: () => indikatorService.getAllFormula(),
  });
  const formulas = formulaData?.data || formulaData || [];

  // Fetch Performa Desa
  const {
    data: performaData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["performaDesa", selectedTahun, selectedFormula],
    queryFn: () =>
      performaDesaService.getListPerformaDesa({
        tahun: selectedTahun,
        formulaId: selectedFormula,
      }),
    enabled: !!selectedTahun && !!selectedFormula,
  });

  const columnsData = performaData?.data?.column || [];
  const itemsData = performaData?.data?.items || [];

  // Pagination Client-Side
  const totalItems = itemsData.length;
  const totalPage = Math.ceil(totalItems / perPage) || 1;
  const paginatedItems = itemsData.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const handleDownloadTemplate = async () => {
    if (!selectedFormula) {
      toast.error("Silakan pilih formula terlebih dahulu untuk mengunduh template.");
      return;
    }
    
    try {
      setIsDownloading(true);
      const blob = await performaDesaService.downloadPerformaExcelTemplate(selectedFormula);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      // Get formula name for better file naming
      const formulaName = formulas.find(f => f.id === selectedFormula)?.nama || "Template";
      link.setAttribute("download", `Template_Performa_Desa_${selectedTahun || "All"}_${formulaName}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success("Template berhasil diunduh!");
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengunduh template. Silakan periksa koneksi Anda.");
    } finally {
      setIsDownloading(false);
    }
  };

  const { refetch: refetchPerforma } = useQuery({
    queryKey: ["performaDesa", selectedTahun, selectedFormula],
  });

  const { mutate: uploadData, isPending: isUploading } = useMutation({
    mutationFn: (formData) => performaDesaService.uploadExcelPerformaDesa(formData),
    onSuccess: () => {
      toast.success("Berhasil mengunggah data performa desa!");
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadTahunId("");
      setUploadFormulaId("");
      refetchPerforma();
    },
    onError: (error) => {
      console.error(error);
      toast.error("Gagal mengunggah data. Pastikan format file sesuai.");
    },
  });

  const handleUploadSubmit = () => {
    if (!uploadFile) return toast.error("Pilih file excel terlebih dahulu.");
    if (!uploadTahunId) return toast.error("Pilih tahun penilaian.");
    if (!uploadFormulaId) return toast.error("Pilih formula indikator.");

    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("tahunId", uploadTahunId);
    formData.append("formulaId", uploadFormulaId);

    uploadData(formData);
  };

  const handleDelete = async (id, namaDesa) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus data performa untuk desa ${namaDesa}?`)) {
      try {
        await performaDesaService.deletePerformaDesa(id);
        toast.success("Data performa desa berhasil dihapus.");
        refetchPerforma();
      } catch (error) {
        console.error(error);
        toast.error("Gagal menghapus data performa desa.");
      }
    }
  };

  // Setup Kolom untuk DataTable
  const staticColumns = [
    {
      header: "No",
      className: "w-12 text-center text-slate-500",
      render: (_, idx) => (currentPage - 1) * perPage + idx + 1,
    },
    {
      header: "Nama Desa",
      className: "min-w-[150px] font-semibold text-slate-800",
      render: (row) => row.desa?.nama || "-",
    },
  ];

  const dynamicColumns = columnsData.map((col) => ({
    header: col.nama,
    className: "min-w-[120px]",
    render: (row) => {
      const val = row.nilaiIndikator?.find((n) => n.kode === col.kode);
      return val ? (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
          {val.label}
        </span>
      ) : (
        <span className="text-slate-400">-</span>
      );
    },
  }));

  const actionColumn = [
    {
      header: "Aksi",
      className: "text-center w-24",
      render: (row) => (
        <div className="flex justify-center gap-2">
          <button
            type="button"
            onClick={() => navigate(`/dashboard/performa-desa/detail/${row.id}`)}
            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors outline-none"
            title="Lihat Detail"
          >
            <Eye size={18} />
          </button>
          <button
            type="button"
            onClick={() => navigate(`/dashboard/performa-desa/edit/${row.id}`)}
            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors outline-none"
            title="Edit Data"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => handleDelete(row.id, row.desa?.nama)}
            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors outline-none"
            title="Hapus Data"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>
      ),
    },
  ];

  const columns = [...staticColumns, ...dynamicColumns, ...actionColumn];

  return (
    <DashboardLayout activeMenu="Performa Desa">
      <div className="flex flex-col gap-6 min-h-[calc(100vh-120px)] bg-slate-50/50 p-4 md:p-6 rounded-[2rem]">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
              Performa Desa Hutan
            </h1>
            <p className="text-sm text-slate-500 mt-1.5">
              Pantau dan kelola performa desa berdasarkan indikator formula yang berlaku.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleDownloadTemplate}
              disabled={isDownloading || !selectedFormula}
              className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading ? (
                <Loader2 size={18} className="animate-spin text-emerald-600" />
              ) : (
                <Download size={18} className="text-slate-500" />
              )}
              {isDownloading ? "Mengunduh..." : "Download Template"}
            </button>

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95"
            >
              <UploadCloud size={18} className="text-slate-500" />
              Upload Data
            </button>

            <button
              onClick={() => navigate("/dashboard/performa-desa/tambah")}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-emerald-600/20 active:scale-95"
            >
              <Plus size={18} />
              Tambah Performa
            </button>
          </div>
        </div>

        {/* FILTER SECTION */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 md:p-6">
          <div className="flex items-center gap-2 mb-4 text-emerald-700 font-bold text-sm">
            <Filter size={16} />
            <span>Filter Data</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 ml-1">Tahun Penilaian</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                  <Calendar size={18} />
                </div>
                <select
                  value={selectedTahun}
                  onChange={(e) => {
                    setSelectedTahun(e.target.value);
                    setSelectedFormula("");
                    setCurrentPage(1);
                  }}
                  disabled={isYearsLoading}
                  className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none cursor-pointer transition-all disabled:opacity-50 hover:border-slate-300"
                >
                  <option value="">-- Pilih Tahun --</option>
                  {years.map((y) => (
                    <option key={y.id} value={y.tahun}>
                      {y.tahun}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-2 lg:col-span-2">
              <label className="text-xs font-bold text-slate-600 ml-1">Formula Indikator</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                  <Calculator size={18} />
                </div>
                <select
                  value={selectedFormula}
                  onChange={(e) => {
                    setSelectedFormula(e.target.value);
                    setCurrentPage(1);
                  }}
                  disabled={isFormulaLoading}
                  className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none cursor-pointer transition-all disabled:opacity-50 hover:border-slate-300"
                >
                  <option value="">-- Pilih Formula --</option>
                  {formulas.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nama}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DATA TABLE SECTION */}
        <div className="flex-1 bg-white rounded-2xl flex flex-col shadow-sm border border-slate-100 overflow-hidden relative min-h-[400px]">
          
          {!selectedTahun || !selectedFormula ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center h-full">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-6 shadow-inner">
                <Info size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2.5">Tentukan Filter Data</h3>
              <p className="text-slate-500 max-w-md text-sm leading-relaxed">
                Silakan pilih <span className="font-bold text-slate-700">Tahun Penilaian</span> dan <span className="font-bold text-slate-700">Formula Indikator</span> terlebih dahulu untuk memuat dan menampilkan tabel data performa desa.
              </p>
            </div>
          ) : isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 h-full">
              <Loader2 size={40} className="animate-spin text-emerald-500 mb-5" />
              <p className="text-sm text-slate-500 font-semibold tracking-wide">Memuat data performa desa...</p>
            </div>
          ) : isError ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 h-full">
               <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-5 shadow-inner">
                 <SearchX size={32} />
               </div>
               <p className="text-lg font-bold text-slate-800">Gagal Memuat Data</p>
               <p className="text-sm text-slate-500 mt-2 max-w-sm text-center">Terjadi kesalahan pada server saat mencoba mengambil data. Silakan coba beberapa saat lagi.</p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="p-5 md:px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shadow-sm border border-emerald-200/50">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="3" y1="9" x2="21" y2="9"></line>
                      <line x1="9" y1="21" x2="9" y2="9"></line>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-slate-800">
                      Tabel Data Performa Tahun {selectedTahun}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Formula: <span className="font-semibold text-slate-700">{formulas.find((f) => f.id === selectedFormula)?.nama || "Tidak ada nama"}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto w-full custom-scrollbar flex-1">
                <DataTable
                  columns={columns}
                  data={paginatedItems}
                  isLoading={false}
                  isError={false}
                  emptyMessage="Belum ada data performa desa untuk tahun dan formula ini."
                />
              </div>

              {totalItems > 0 && (
                <div className="border-t border-slate-100 mt-auto">
                  <Pagination
                    currentPage={currentPage}
                    totalPage={totalPage}
                    perPage={perPage}
                    total={totalItems}
                    onPageChange={setCurrentPage}
                    onSizeChange={setPerPage}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ================= MODAL OVERLAY ================= */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 transition-all">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500"></div>

            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">
                    Upload Data Excel
                  </h3>
                  <p className="text-sm text-slate-500 mt-1.5">
                    Unggah file excel sesuai template yang disediakan.
                  </p>
                </div>
                <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 shrink-0 shadow-sm">
                  <UploadCloud size={24} className="text-emerald-500" />
                </div>
              </div>

              <div className="space-y-5">
                {/* Tahun Penilaian */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Tahun Penilaian
                  </label>
                  <div className="relative">
                    <select 
                      value={uploadTahunId}
                      onChange={(e) => setUploadTahunId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none cursor-pointer transition-all font-medium"
                    >
                      <option value="">-- Pilih Tahun --</option>
                      {years.map((y) => (
                        <option key={y.id} value={y.id}>
                          {y.tahun}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Formula Indikator */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Formula Indikator
                  </label>
                  <div className="relative">
                    <select 
                      value={uploadFormulaId}
                      onChange={(e) => setUploadFormulaId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none cursor-pointer transition-all font-medium"
                    >
                      <option value="">-- Pilih Formula --</option>
                      {formulas.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.nama}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Upload File */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Pilih File Excel
                  </label>
                  <div className="relative group">
                    <input 
                      type="file"
                      accept=".xlsx, .xls"
                      onChange={(e) => setUploadFile(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className={`w-full flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all duration-300 ${uploadFile ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 bg-slate-50 group-hover:border-emerald-400 group-hover:bg-slate-100'}`}>
                      {uploadFile ? (
                        <>
                          <FileSpreadsheet size={32} className="text-emerald-500 mb-3" />
                          <p className="text-sm font-bold text-emerald-800 text-center break-all">{uploadFile.name}</p>
                          <p className="text-xs text-emerald-600 mt-1">{(uploadFile.size / 1024).toFixed(1)} KB</p>
                        </>
                      ) : (
                        <>
                          <UploadCloud size={32} className="text-slate-400 mb-3 group-hover:text-emerald-500 transition-colors" />
                          <p className="text-sm font-bold text-slate-700">Tarik & Lepas file Excel di sini</p>
                          <p className="text-xs text-slate-500 mt-1">atau klik untuk menelusuri (Maks 10MB)</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-10 pt-6 border-t border-slate-100">
                <button
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    setUploadFile(null);
                  }}
                  className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-bold transition-all active:scale-95"
                >
                  Batal
                </button>
                <button 
                  onClick={handleUploadSubmit}
                  disabled={isUploading || !uploadFile || !uploadTahunId || !uploadFormulaId}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-emerald-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}
                  {isUploading ? "Mengunggah..." : "Mulai Upload"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
