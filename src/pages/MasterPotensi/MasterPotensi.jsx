import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import DashboardLayout from "../../components/DashboardLayout";
import DataTable from "../../components/DataTable";
import { potensiDesaService } from "../../services/master/potensiDesaService";
import { wilayahDesaService } from "../../services/master/wilayahDesaService";
import { masterWilayahService } from "../../services/master/masterWilayahService";
import {
  Search,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Sprout,
  Eye,
  X,
  Plus,
  Trash2,
  Save,
  Loader2,
  Info,
  Building,
  Download,
  Upload,
  FileDown,
  FileSpreadsheet,
} from "lucide-react";

const MasterPotensi = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  // States for Detail & Edit Modals
  const [detailDesaId, setDetailDesaId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editPotensi, setEditPotensi] = useState([]);
  const [activeDetailTab, setActiveDetailTab] = useState(0);
  const [selectedDesa, setSelectedDesa] = useState(null);

  // States for Tambah Potensi Modal
  const [isAddPotensiModalOpen, setIsAddPotensiModalOpen] = useState(false);
  const [selectedDesaId, setSelectedDesaId] = useState(null);
  const [addPotensi, setAddPotensi] = useState([{ kategori: "Kategori Baru", sub: [] }]);
  const [searchDesa, setSearchDesa] = useState("");
  const [debouncedSearchDesa, setDebouncedSearchDesa] = useState("");

  // States for Wilayah Filters in Modal
  const [filterProvinsi, setFilterProvinsi] = useState("");
  const [filterKabupaten, setFilterKabupaten] = useState("");
  const [filterKecamatan, setFilterKecamatan] = useState("");

  // States for Import/Export Excel
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch list of potensi
  const {
    data: listResponse,
    isLoading: isLoadingList,
    isError: isErrorList,
  } = useQuery({
    queryKey: ["potensiList", page, size],
    queryFn: () => potensiDesaService.getPotensiList({ page, size }),
    keepPreviousData: true,
  });

  const items = listResponse?.data?.items || [];
  const pagination = listResponse?.data?.pagination || {};
  const total = pagination.total || items.length;
  const totalPages = pagination.totalPage || Math.ceil(total / size) || 1;
  const startIdx = (page - 1) * size;

  // Filter local for search query (if backend doesn't support search parameter)
  const filteredItems = React.useMemo(() => {
    if (!items) return [];
    if (!searchQuery) return items;
    const q = searchQuery.toLowerCase();
    return items.filter((item) => {
      const name = (item.nama || "").toLowerCase();
      const code = (item.kode_kemendagri || "").toLowerCase();
      return name.includes(q) || code.includes(q);
    });
  }, [items, searchQuery]);

  // Fetch specific detail for modal
  const { data: detailResponse, isLoading: isLoadingDetail } = useQuery({
    queryKey: ["potensiDetail", detailDesaId],
    queryFn: () => potensiDesaService.getPotensiDetail(detailDesaId),
    enabled: !!detailDesaId,
  });

  const detailData = detailResponse?.data || detailResponse || null;

  // Synchronize detail payload to local edit state
  useEffect(() => {
    if (detailData && isEditMode) {
      setEditPotensi(JSON.parse(JSON.stringify(detailData.potensi || [])));
    }
  }, [detailData, isEditMode]);

  // Reset tab selection when detail modal is opened
  useEffect(() => {
    if (detailDesaId) {
      setActiveDetailTab(0);
    }
  }, [detailDesaId]);

  // Mutation to save edits
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => potensiDesaService.updatePotensi(id, payload),
    onSuccess: () => {
      toast.success("Data Potensi Desa berhasil diperbarui!");
      queryClient.invalidateQueries({ queryKey: ["potensiList"] });
      queryClient.invalidateQueries({ queryKey: ["potensiDetail", detailDesaId] });
      setDetailDesaId(null);
      setIsEditMode(false);
    },
    onError: (err) => {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Gagal memperbarui data potensi."
      );
    },
  });

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchDesa(searchDesa);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchDesa]);

  // Fetch region options for dropdowns in modal
  const { data: provincesList = [] } = useQuery({
    queryKey: ["allProvincesForModal"],
    queryFn: () => masterWilayahService.getAllProvinsi(),
    enabled: isAddPotensiModalOpen,
  });

  const { data: kabupatensList = [] } = useQuery({
    queryKey: ["allKabupatensForModal", filterProvinsi],
    queryFn: () => masterWilayahService.getAllKabupaten(null, null, "", filterProvinsi),
    enabled: isAddPotensiModalOpen && !!filterProvinsi,
  });

  const { data: kecamatansList = [] } = useQuery({
    queryKey: ["allKecamatansForModal", filterKabupaten],
    queryFn: () => masterWilayahService.getAllKecamatan(null, null, "", filterKabupaten),
    enabled: isAddPotensiModalOpen && !!filterKabupaten,
  });

  // Fetch Desa List for selection (queries backend based on filters & search)
  const { data: searchDesaData, isLoading: isLoadingDesa } = useQuery({
    queryKey: ["searchDesaForSelect", debouncedSearchDesa, filterProvinsi, filterKabupaten, filterKecamatan],
    queryFn: () => {
      const hasRegionFilters = filterProvinsi || filterKabupaten || filterKecamatan;
      if (debouncedSearchDesa.trim().length >= 2 && !hasRegionFilters) {
        return wilayahDesaService.searchMap(debouncedSearchDesa, 50);
      }
      return wilayahDesaService.getAllDesa({
        page: 1,
        size: 150,
        search: debouncedSearchDesa,
        provinsiId: filterProvinsi || null,
        kabupatenId: filterKabupaten || null,
        kecamatanId: filterKecamatan || null,
      });
    },
    enabled: isAddPotensiModalOpen,
  });

  const filteredDesa = React.useMemo(() => {
    if (!searchDesaData) return [];
    const hasRegionFilters = filterProvinsi || filterKabupaten || filterKecamatan;
    if (debouncedSearchDesa.trim().length >= 2 && !hasRegionFilters) {
      return searchDesaData?.data || searchDesaData || [];
    }
    return searchDesaData?.items || searchDesaData?.data || searchDesaData || [];
  }, [searchDesaData, debouncedSearchDesa, filterProvinsi, filterKabupaten, filterKecamatan]);

  // Mutation to add new Potensi
  const createPotensiMutation = useMutation({
    mutationFn: ({ desaId, payload }) => potensiDesaService.updatePotensi(desaId, payload),
    onSuccess: () => {
      toast.success("Potensi Desa berhasil ditambahkan!");
      queryClient.invalidateQueries({ queryKey: ["potensiList"] });
      setIsAddPotensiModalOpen(false);
      setSelectedDesaId(null);
      setAddPotensi([{ kategori: "Kategori Baru", sub: [] }]);
      setSearchDesa("");
      setFilterProvinsi("");
      setFilterKabupaten("");
      setFilterKecamatan("");
    },
    onError: (err) => {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Gagal menambahkan data potensi."
      );
    },
  });

  // Import/Export Excel Handlers
  const handleDownloadTemplate = async () => {
    try {
      const response = await potensiDesaService.downloadTemplate();
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Template_Data_Potensi_Desa.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Gagal mengunduh template Excel.");
    }
  };

  const uploadMutation = useMutation({
    mutationFn: (formData) => potensiDesaService.importExcel(formData),
    onSuccess: (res) => {
      const result = res?.data || {};
      toast.success(
        `Berhasil memproses file Excel. ${result.total_desa_diupdate || 0} desa diperbarui.`
      );
      queryClient.invalidateQueries({ queryKey: ["potensiList"] });
      setIsUploadModalOpen(false);
      setUploadFile(null);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Gagal memproses file Excel.");
    },
  });

  const handleSubmitUpload = (e) => {
    e.preventDefault();
    if (!uploadFile) {
      toast.error("Silakan pilih file Excel terlebih dahulu.");
      return;
    }
    const formData = new FormData();
    formData.append("file", uploadFile);
    uploadMutation.mutate(formData);
  };

  const handleExportPotensi = async () => {
    setIsExporting(true);
    try {
      const response = await potensiDesaService.exportExcel();
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      link.download = `Data_Potensi_Desa_${dateStr}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Gagal mengekspor data potensi desa.");
    } finally {
      setIsExporting(false);
    }
  };

  // Edit Handlers
  const handleAddCategory = () => {
    setEditPotensi([...editPotensi, { kategori: "Kategori Baru", sub: [] }]);
  };

  const handleRemoveCategory = (catIdx) => {
    setEditPotensi(editPotensi.filter((_, idx) => idx !== catIdx));
  };

  const handleCategoryNameChange = (catIdx, name) => {
    const updated = [...editPotensi];
    updated[catIdx].kategori = name;
    setEditPotensi(updated);
  };

  const handleAddSubItem = (catIdx) => {
    const updated = [...editPotensi];
    updated[catIdx].sub.push({ nama: "", unit: "buah", nilai: 0 });
    setEditPotensi(updated);
  };

  const handleRemoveSubItem = (catIdx, subIdx) => {
    const updated = [...editPotensi];
    updated[catIdx].sub = updated[catIdx].sub.filter((_, idx) => idx !== subIdx);
    setEditPotensi(updated);
  };

  const handleSubItemChange = (catIdx, subIdx, field, value) => {
    const updated = [...editPotensi];
    updated[catIdx].sub[subIdx][field] = field === "nilai" ? Number(value) : value;
    setEditPotensi(updated);
  };

  const handleSaveUpdate = (e) => {
    e.preventDefault();
    updateMutation.mutate({
      id: detailDesaId,
      payload: { potensi: editPotensi },
    });
  };

  // Helper formatting flat names
  const getDesaName = (row) => {
    return row.nama || "-";
  };

  const getDesaKode = (row) => {
    return row.kode_kemendagri || "-";
  };

  const getKecamatanName = (row) => {
    return row.kecamatan || "-";
  };

  const getKabupatenName = (row) => {
    return row.kabupaten || "-";
  };

  const getProvinsiName = (row) => {
    return row.provinsi || "-";
  };

  return (
    <DashboardLayout activeMenu="Master Potensi">
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#FAFBFC]">
        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8 custom-scrollbar">
          {/* HEADER HALAMAN */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Master Potensi Desa
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Kelola data spasial dan inventarisasi potensi komoditas sosial ekonomi di setiap wilayah desa hutan.
            </p>
          </div>

          {/* CARD KONTEN UTAMA */}
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 flex flex-col">
            {/* Header Toolbar (Filter, Search, Sizing) */}
            <div className="p-6 border-b border-gray-50 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
              
              {/* Kiri: Judul & Sizing Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-[#2D7344] shrink-0">
                    <Sprout size={20} strokeWidth={2} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-800 whitespace-nowrap hidden sm:block">
                    Tabel Potensi Wilayah
                  </h2>
                </div>

                {/* Sizing row count selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Baris:
                  </span>
                  <select
                    value={size}
                    onChange={(e) => {
                      setSize(Number(e.target.value));
                      setPage(1);
                    }}
                    className="bg-gray-50 border border-gray-200 text-gray-700 py-1.5 px-3 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-[#2D7344] cursor-pointer font-bold"
                  >
                    <option value={5}>5 Baris</option>
                    <option value={10}>10 Baris</option>
                    <option value={25}>25 Baris</option>
                    <option value={50}>50 Baris</option>
                    <option value={100}>100 Baris</option>
                  </select>
                </div>
              </div>

              {/* Kanan: Search input & Tambah Potensi Button */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64 group">
                  <Search
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2D7344] transition-colors"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Cari desa..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-[#2D7344] transition-all font-semibold"
                  />
                </div>

                <button
                  onClick={handleDownloadTemplate}
                  title="Unduh Template Excel"
                  className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer"
                >
                  <Download size={16} />
                  <span className="hidden lg:inline">Template</span>
                </button>

                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  title="Import Excel"
                  className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer"
                >
                  <Upload size={16} />
                  <span className="hidden lg:inline">Import</span>
                </button>

                <button
                  onClick={handleExportPotensi}
                  disabled={isExporting}
                  title="Export Excel"
                  className="flex items-center justify-center gap-2 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isExporting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <FileDown size={16} />
                  )}
                  <span className="hidden lg:inline">Export</span>
                </button>

                <button
                  onClick={() => setIsAddPotensiModalOpen(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#2D7344] hover:bg-[#1E5230] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm cursor-pointer active:scale-[0.98]"
                >
                  <Plus size={18} strokeWidth={2.5} />
                  <span>Tambah Potensi</span>
                </button>
              </div>
            </div>

            {/* DATATABLE */}
            <DataTable
              columns={[
                {
                  header: "No",
                  className: "w-16 text-center",
                  render: (_, idx) => (
                    <div className="text-center text-gray-400 font-semibold font-mono text-xs">
                      {startIdx + idx + 1}
                    </div>
                  ),
                },
                {
                  header: "Kode Kemendagri",
                  className: "w-36 font-semibold font-mono",
                  render: (row) => <span>{getDesaKode(row)}</span>,
                },
                {
                  header: "Nama Desa",
                  className: "font-bold text-gray-900",
                  render: (row) => <span>{getDesaName(row)}</span>,
                },
                {
                  header: "Kecamatan",
                  render: (row) => <span>{getKecamatanName(row)}</span>,
                },
                {
                  header: "Kabupaten",
                  render: (row) => <span>{getKabupatenName(row)}</span>,
                },
                {
                  header: "Provinsi",
                  render: (row) => <span>{getProvinsiName(row)}</span>,
                },
                {
                  header: "Aksi",
                  className: "text-center w-28",
                  render: (row) => (
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          setDetailDesaId(row.id || row.desaId);
                          setSelectedDesa(row);
                          setIsEditMode(false);
                        }}
                        className="p-1.5 text-gray-400 hover:text-[#0A66C2] hover:bg-blue-50 rounded-md transition-all cursor-pointer"
                        title="Lihat Detail Potensi"
                      >
                        <Eye size={16} strokeWidth={2} />
                      </button>
                      <button
                        onClick={() => {
                          setDetailDesaId(row.id || row.desaId);
                          setSelectedDesa(row);
                          setIsEditMode(true);
                        }}
                        className="p-1.5 text-gray-400 hover:text-[#2D7344] hover:bg-[#EAFBF0] rounded-md transition-all cursor-pointer"
                        title="Edit Potensi"
                      >
                        <Edit2 size={16} strokeWidth={2} />
                      </button>
                    </div>
                  ),
                },
              ]}
              data={filteredItems}
              isLoading={isLoadingList}
              isError={isErrorList}
              searchQuery={searchQuery}
              emptyMessage="Belum ada data potensi desa yang terdaftar."
            />

            {/* PAGINATION PANEL */}
            {!isLoadingList && !isErrorList && items.length > 0 && (
              <div className="p-4 md:p-6 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/30 rounded-b-2xl">
                <p className="text-xs font-semibold text-gray-500">
                  Menampilkan baris{" "}
                  <span className="font-bold text-gray-900">
                    {startIdx + 1} - {Math.min(startIdx + items.length, total)}
                  </span>{" "}
                  dari <span className="font-bold text-gray-900">{total}</span>
                </p>

                <div className="flex items-center gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <div className="flex items-center gap-1 px-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(
                        (p) =>
                          p === 1 ||
                          p === totalPages ||
                          Math.abs(p - page) <= 1
                      )
                      .map((p, i, arr) => {
                        const showDots = i > 0 && p - arr[i - 1] > 1;
                        return (
                          <React.Fragment key={p}>
                            {showDots && (
                              <span className="text-gray-400 text-xs">...</span>
                            )}
                            <button
                              onClick={() => setPage(p)}
                              className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                page === p
                                  ? "bg-[#2D7344] text-white shadow-md shadow-emerald-800/10"
                                  : "text-gray-600 hover:bg-gray-100"
                              }`}
                            >
                              {p}
                            </button>
                          </React.Fragment>
                        );
                      })}
                  </div>

                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                    className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* DETAIL MODAL PANEL */}
      {detailDesaId && !isEditMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#F8FAFC] rounded-[32px] shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200/50 animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            {/* Soft gradient top accent */}
            <div className="h-1.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-green-500" />

            {/* Modal Header with banner look */}
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <div>
                <span className="text-[10px] font-extrabold px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-full uppercase tracking-wider font-mono shadow-sm">
                  Informasi Spasial & Potensi
                </span>
                <h3 className="text-2xl font-black text-slate-800 mt-2 tracking-tight">
                  Desa {selectedDesa ? getDesaName(selectedDesa) : (detailData ? getDesaName(detailData) : "")}
                </h3>
              </div>
              <button
                onClick={() => setDetailDesaId(null)}
                className="p-2.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-2xl transition-all cursor-pointer border border-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-hidden flex-1 flex flex-col min-h-0 bg-[#FAFCFD]">
              {isLoadingDetail ? (
                <div className="flex flex-col items-center justify-center py-32 text-slate-400 flex-1">
                  <Loader2 size={40} className="animate-spin text-emerald-600 mb-4" />
                  <span className="text-sm font-semibold tracking-wide">Mengakses database wilayah...</span>
                </div>
              ) : detailData ? (
                <div className="flex flex-col flex-1 min-h-0">
                  {/* Top Metadata Grid */}
                  <div className="p-8 pb-4 grid grid-cols-2 md:grid-cols-4 gap-4 bg-white border-b border-slate-100">
                    <div className="bg-[#FAFCFD] border border-slate-100 p-4 rounded-2xl">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Kode Kemendagri</span>
                      <span className="block text-xs font-black text-slate-700 mt-1 font-mono">{getDesaKode(selectedDesa || detailData)}</span>
                    </div>
                    <div className="bg-[#FAFCFD] border border-slate-100 p-4 rounded-2xl">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Kecamatan</span>
                      <span className="block text-xs font-black text-slate-700 mt-1">{getKecamatanName(selectedDesa || detailData)}</span>
                    </div>
                    <div className="bg-[#FAFCFD] border border-slate-100 p-4 rounded-2xl">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Kabupaten</span>
                      <span className="block text-xs font-black text-slate-700 mt-1">{getKabupatenName(selectedDesa || detailData)}</span>
                    </div>
                    <div className="bg-[#FAFCFD] border border-slate-100 p-4 rounded-2xl">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Provinsi</span>
                      <span className="block text-xs font-black text-slate-700 mt-1">{getProvinsiName(selectedDesa || detailData)}</span>
                    </div>
                  </div>

                  {/* Main Split-Pane Content */}
                  <div className="flex-1 flex min-h-0">
                    {detailData.potensi && detailData.potensi.length > 0 ? (
                      <>
                        {/* Left Tab Sidebar */}
                        <div className="w-1/3 border-r border-slate-100 overflow-y-auto custom-scrollbar p-6 bg-white space-y-2">
                          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3 font-mono">Pilih Kategori</span>
                          {detailData.potensi.map((cat, idx) => {
                            const isActive = activeDetailTab === idx;
                            return (
                              <button
                                key={idx}
                                onClick={() => setActiveDetailTab(idx)}
                                className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                                  isActive
                                    ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/10 scale-[1.02]"
                                    : "bg-[#FAFCFD] border-slate-100 hover:bg-slate-50 text-slate-600"
                                }`}
                              >
                                <span className={`text-xs font-black uppercase tracking-wider ${isActive ? 'text-white' : 'text-slate-700'}`}>
                                  {cat.kategori}
                                </span>
                                <span className={`text-[10px] font-semibold ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>
                                  {cat.sub?.length || 0} Sub-Potensi
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Right Content Pane */}
                        <div className="w-2/3 p-8 overflow-y-auto custom-scrollbar bg-[#FAFCFD]">
                          {detailData.potensi[activeDetailTab] ? (
                            <div className="space-y-6 animate-in fade-in duration-300">
                              {/* Tab Headline */}
                              <div className="flex justify-between items-center pb-3 border-b border-slate-200/60">
                                <div>
                                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest font-mono">Menampilkan Potensi</span>
                                  <h4 className="text-lg font-black text-slate-800 mt-0.5">
                                    Kategori {detailData.potensi[activeDetailTab].kategori}
                                  </h4>
                                </div>
                                <span className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-full font-bold text-[10px] uppercase font-mono tracking-wider shadow-sm">
                                  {detailData.potensi[activeDetailTab].sub?.length || 0} Unit Terdaftar
                                </span>
                              </div>

                              {/* Card Deck of Sub-Items */}
                              {detailData.potensi[activeDetailTab].sub && detailData.potensi[activeDetailTab].sub.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {detailData.potensi[activeDetailTab].sub.map((subItem, subIdx) => (
                                    <div
                                      key={subIdx}
                                      className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-slate-200/80 transition-all hover:scale-[1.01]"
                                    >
                                      <div>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Nama Indikator</span>
                                        <h5 className="font-bold text-slate-800 text-sm mt-1 leading-snug">{subItem.nama}</h5>
                                      </div>
                                      
                                      <div className="mt-5 pt-3 border-t border-slate-50 flex justify-between items-end">
                                        <div>
                                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Satuan</span>
                                          <span className="block text-xs font-semibold text-slate-500 mt-0.5">{subItem.unit}</span>
                                        </div>
                                        <div className="text-right">
                                          <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider font-mono block mb-0.5">Nilai</span>
                                          <span className="text-lg font-black text-slate-800 font-mono bg-slate-50 border border-slate-100 px-3.5 py-1 rounded-xl">
                                            {subItem.nilai}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="py-12 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
                                  <Info size={32} className="mb-2.5 text-slate-300 mx-auto" />
                                  <p className="text-xs font-bold text-slate-500">Kategori ini belum memiliki indikator sub-potensi.</p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="py-20 text-center text-slate-400">
                              Pilih salah satu kategori di sebelah kiri untuk melihat rincian.
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400 bg-white m-8 rounded-3xl border border-dashed border-slate-200">
                        <Info size={40} className="mb-3 text-slate-300" />
                        <h4 className="text-sm font-bold text-slate-700">Data Potensi Kosong</h4>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm">
                          Belum ada indikator potensi ekonomi, pariwisata, atau lingkungan yang tercatat untuk desa ini. Anda dapat menambahkannya melalui tombol Edit.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400 flex-1">
                  Gagal memuat rincian desa. Silakan coba lagi.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-5 border-t border-slate-100 flex justify-end bg-white">
              <button
                onClick={() => setDetailDesaId(null)}
                className="px-6 py-2.5 text-xs font-black text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer border border-slate-200/30"
              >
                Tutup Dokumen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL PANEL */}
      {detailDesaId && isEditMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#F8FAFC] rounded-[32px] shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200/50 animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="h-1.5 bg-gradient-to-r from-emerald-600 to-[#10B981]" />

            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <div>
                <span className="text-[10px] font-bold px-2.5 py-1 bg-amber-50 border border-amber-100 text-amber-700 rounded-lg uppercase tracking-wider">
                  Mode Penyuntingan
                </span>
                <h3 className="text-xl font-bold text-slate-800 mt-1.5">
                  Edit Potensi Desa {selectedDesa ? getDesaName(selectedDesa) : (detailData ? getDesaName(detailData) : "")}
                </h3>
              </div>
              <button
                onClick={() => {
                  setDetailDesaId(null);
                  setIsEditMode(false);
                }}
                className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-2xl transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body & Form */}
            <form onSubmit={handleSaveUpdate} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                {isLoadingDetail ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <Loader2 size={36} className="animate-spin text-emerald-600 mb-3" />
                    <span className="text-sm font-semibold">Memuat data penyuntingan...</span>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {editPotensi.map((cat, catIdx) => (
                      <div key={catIdx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 relative">
                        {/* Remove Category button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveCategory(catIdx)}
                          className="absolute top-4 right-4 text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Kategori"
                        >
                          <Trash2 size={16} />
                        </button>

                        <div className="flex flex-col sm:flex-row gap-4 sm:items-center w-[85%]">
                          <div className="flex-1">
                            <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider font-mono">
                              Nama Kategori
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Kategori (Contoh: Ekonomi, Pariwisata)"
                              value={cat.kategori}
                              onChange={(e) => handleCategoryNameChange(catIdx, e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-700"
                            />
                          </div>
                        </div>

                        {/* Sub Potensi Rows */}
                        <div className="space-y-3 pt-2">
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                            Daftar Sub-Potensi
                          </span>

                          <div className="space-y-2">
                            {cat.sub && cat.sub.map((subItem, subIdx) => (
                              <div key={subIdx} className="flex flex-wrap items-center gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                                <div className="flex-1 min-w-[150px]">
                                  <input
                                    type="text"
                                    required
                                    placeholder="Nama Sub-Potensi (Contoh: Puskesmas)"
                                    value={subItem.nama}
                                    onChange={(e) => handleSubItemChange(catIdx, subIdx, "nama", e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all font-semibold"
                                  />
                                </div>
                                <div className="w-24">
                                  <input
                                    type="text"
                                    required
                                    placeholder="Unit (buah, ton)"
                                    value={subItem.unit}
                                    onChange={(e) => handleSubItemChange(catIdx, subIdx, "unit", e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all font-semibold"
                                  />
                                </div>
                                <div className="w-24">
                                  <input
                                    type="number"
                                    required
                                    min="0"
                                    placeholder="Nilai"
                                    value={subItem.nilai}
                                    onChange={(e) => handleSubItemChange(catIdx, subIdx, "nilai", e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all font-bold text-slate-800"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSubItem(catIdx, subIdx)}
                                  className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                                  title="Hapus Sub-Potensi"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleAddSubItem(catIdx)}
                            className="flex items-center gap-1.5 text-[10px] font-bold text-[#2D7344] hover:text-[#1E5230] mt-2 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100/50 cursor-pointer"
                          >
                            <Plus size={12} strokeWidth={3} />
                            <span>Tambah Sub-Potensi</span>
                          </button>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handleAddCategory}
                      className="flex items-center gap-2 text-xs font-extrabold text-[#2D7344] hover:text-[#1E5230] mt-4 bg-emerald-100/50 hover:bg-emerald-100 px-5 py-3 rounded-2xl border border-emerald-200/40 transition-all cursor-pointer"
                    >
                      <Plus size={14} strokeWidth={3} />
                      <span>Tambah Kategori Potensi Baru</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-8 py-5 border-t border-slate-100 flex justify-end gap-3 bg-white">
                <button
                  type="button"
                  onClick={() => {
                    setDetailDesaId(null);
                    setIsEditMode(false);
                  }}
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#2D7344] hover:bg-[#1E5230] rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-sm shadow-emerald-800/10 cursor-pointer"
                >
                  {updateMutation.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH DATA POTENSI */}
      {isAddPotensiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#F8FAFC] rounded-[32px] shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200/50 animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="h-1.5 bg-gradient-to-r from-emerald-600 to-[#10B981]" />

            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <div>
                <span className="text-[10px] font-bold px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg uppercase tracking-wider">
                  Master Data
                </span>
                <h3 className="text-xl font-bold text-slate-800 mt-1.5">
                  Tambah Potensi Desa Baru
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsAddPotensiModalOpen(false);
                  setSelectedDesaId(null);
                  setSearchDesa("");
                  setFilterProvinsi("");
                  setFilterKabupaten("");
                  setFilterKecamatan("");
                  setAddPotensi([{ kategori: "Kategori Baru", sub: [] }]);
                }}
                className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-2xl transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              
              {/* Step 1: Select Desa */}
              {!selectedDesaId ? (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <label className="block text-sm font-bold text-slate-700">
                    Langkah 1: Pilih Desa Hutan
                  </label>

                  {/* Filter Wilayah Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                    {/* Provinsi select */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                        Provinsi
                      </label>
                      <select
                        value={filterProvinsi}
                        onChange={(e) => {
                          setFilterProvinsi(e.target.value);
                          setFilterKabupaten("");
                          setFilterKecamatan("");
                        }}
                        className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-700 cursor-pointer"
                      >
                        <option value="">-- Semua Provinsi --</option>
                        {provincesList.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name || p.nama}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Kabupaten select */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                        Kabupaten
                      </label>
                      <select
                        value={filterKabupaten}
                        onChange={(e) => {
                          setFilterKabupaten(e.target.value);
                          setFilterKecamatan("");
                        }}
                        disabled={!filterProvinsi}
                        className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-700 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <option value="">-- Semua Kabupaten --</option>
                        {kabupatensList.map((k) => (
                          <option key={k.id} value={k.id}>
                            {k.name || k.nama}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Kecamatan select */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                        Kecamatan
                      </label>
                      <select
                        value={filterKecamatan}
                        onChange={(e) => setFilterKecamatan(e.target.value)}
                        disabled={!filterKabupaten}
                        className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-700 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <option value="">-- Semua Kecamatan --</option>
                        {kecamatansList.map((k) => (
                          <option key={k.id} value={k.id}>
                            {k.name || k.nama}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Cari desa berdasarkan nama..."
                      value={searchDesa}
                      onChange={(e) => setSearchDesa(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold text-slate-700"
                    />
                  </div>

                  {isLoadingDesa ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="animate-spin text-emerald-600" size={24} />
                    </div>
                  ) : (
                    <div className="max-h-60 overflow-y-auto border border-slate-200/60 rounded-2xl divide-y divide-slate-100 bg-white custom-scrollbar">
                      {filteredDesa.length > 0 ? (
                        filteredDesa.map((d) => (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => setSelectedDesaId(d.id)}
                            className="w-full px-5 py-3 text-left hover:bg-emerald-50/50 flex items-center justify-between text-xs sm:text-sm transition-colors cursor-pointer group"
                          >
                            <div>
                              <span className="font-bold text-slate-700 group-hover:text-emerald-700">{d.nama}</span>
                              <span className="text-xs text-slate-400 block mt-0.5 font-medium">
                                Kec. {d.kecamatan || "-"} • Kab. {d.kabupaten || "-"} • Prov. {d.provinsi || "-"}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 group-hover:text-emerald-600 bg-slate-100 group-hover:bg-emerald-100/50 border border-slate-200/50 group-hover:border-emerald-200 px-2.5 py-1 rounded">
                              Pilih
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="p-8 text-center text-slate-400 text-sm font-semibold">
                          Tidak menemukan desa dengan kata kunci tersebut.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* Step 2: Input Potensi Data */
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Selected Desa Info */}
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 flex justify-between items-center">
                    <div>
                      <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest font-mono">Desa Hutan Terpilih</span>
                      <h4 className="font-bold text-slate-800 text-base mt-1">
                        {filteredDesa.find(d => d.id === selectedDesaId)?.nama || "Desa Terpilih"}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5 font-semibold">
                        Kec. {filteredDesa.find(d => d.id === selectedDesaId)?.kecamatan || "-"} • Kab. {filteredDesa.find(d => d.id === selectedDesaId)?.kabupaten || "-"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedDesaId(null)}
                      className="px-3.5 py-1.5 text-xs font-bold text-emerald-700 bg-white border border-emerald-200 hover:bg-emerald-100/30 rounded-xl transition-all cursor-pointer"
                    >
                      Ganti Desa
                    </button>
                  </div>

                  {/* Category & sub list builder */}
                  <div className="space-y-6">
                    {addPotensi.map((cat, catIdx) => (
                      <div key={catIdx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 relative">
                        {/* Remove Category */}
                        <button
                          type="button"
                          onClick={() => setAddPotensi(addPotensi.filter((_, idx) => idx !== catIdx))}
                          className="absolute top-4 right-4 text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Kategori"
                        >
                          <Trash2 size={16} />
                        </button>

                        <div className="w-[85%]">
                          <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider font-mono">
                            Nama Kategori
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Kategori (Contoh: Ekonomi, Kesehatan)"
                            value={cat.kategori}
                            onChange={(e) => {
                              const updated = [...addPotensi];
                              updated[catIdx].kategori = e.target.value;
                              setAddPotensi(updated);
                            }}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-700"
                          />
                        </div>

                        {/* Sub Items */}
                        <div className="space-y-3 pt-2">
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                            Daftar Sub-Potensi
                          </span>

                          <div className="space-y-2">
                            {cat.sub.map((subItem, subIdx) => (
                              <div key={subIdx} className="flex flex-wrap items-center gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                                <div className="flex-1 min-w-[150px]">
                                  <input
                                    type="text"
                                    required
                                    placeholder="Nama Sub-Potensi (Contoh: Puskesmas)"
                                    value={subItem.nama}
                                    onChange={(e) => {
                                      const updated = [...addPotensi];
                                      updated[catIdx].sub[subIdx].nama = e.target.value;
                                      setAddPotensi(updated);
                                    }}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all font-semibold"
                                  />
                                </div>
                                <div className="w-24">
                                  <input
                                    type="text"
                                    required
                                    placeholder="Unit (buah, ton)"
                                    value={subItem.unit}
                                    onChange={(e) => {
                                      const updated = [...addPotensi];
                                      updated[catIdx].sub[subIdx].unit = e.target.value;
                                      setAddPotensi(updated);
                                    }}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all font-semibold"
                                  />
                                </div>
                                <div className="w-24">
                                  <input
                                    type="number"
                                    required
                                    min="0"
                                    placeholder="Nilai"
                                    value={subItem.nilai}
                                    onChange={(e) => {
                                      const updated = [...addPotensi];
                                      updated[catIdx].sub[subIdx].nilai = Number(e.target.value);
                                      setAddPotensi(updated);
                                    }}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all font-bold text-slate-800"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...addPotensi];
                                    updated[catIdx].sub = updated[catIdx].sub.filter((_, idx) => idx !== subIdx);
                                    setAddPotensi(updated);
                                  }}
                                  className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...addPotensi];
                              updated[catIdx].sub.push({ nama: "", unit: "buah", nilai: 0 });
                              setAddPotensi(updated);
                            }}
                            className="flex items-center gap-1.5 text-[10px] font-bold text-[#2D7344] hover:text-[#1E5230] mt-2 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100/50 cursor-pointer"
                          >
                            <Plus size={12} strokeWidth={3} />
                            <span>Tambah Sub-Potensi</span>
                          </button>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => setAddPotensi([...addPotensi, { kategori: "Kategori Baru", sub: [] }])}
                      className="flex items-center gap-2 text-xs font-extrabold text-[#2D7344] hover:text-[#1E5230] mt-4 bg-emerald-100/50 hover:bg-emerald-100 px-5 py-3 rounded-2xl border border-emerald-200/40 transition-all cursor-pointer"
                    >
                      <Plus size={14} strokeWidth={3} />
                      <span>Tambah Kategori Potensi Baru</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-5 border-t border-slate-100 flex justify-end gap-3 bg-white">
              <button
                type="button"
                onClick={() => {
                  setIsAddPotensiModalOpen(false);
                  setSelectedDesaId(null);
                  setSearchDesa("");
                  setFilterProvinsi("");
                  setFilterKabupaten("");
                  setFilterKecamatan("");
                  setAddPotensi([{ kategori: "Kategori Baru", sub: [] }]);
                }}
                className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
              >
                Batal
              </button>
              {selectedDesaId && (
                <button
                  type="button"
                  onClick={() => {
                    createPotensiMutation.mutate({
                      desaId: selectedDesaId,
                      payload: { potensi: addPotensi }
                    });
                  }}
                  disabled={createPotensiMutation.isPending}
                  className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#2D7344] hover:bg-[#1E5230] rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-sm shadow-emerald-800/10 cursor-pointer"
                >
                  {createPotensiMutation.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  <span>Simpan Potensi</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL IMPORT EXCEL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Import Excel Potensi Desa</h3>
              <button
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setUploadFile(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitUpload} className="p-5 space-y-5">
              <p className="text-xs text-slate-500 leading-relaxed">
                Gunakan template Excel resmi. Kategori potensi dari file akan digabungkan dengan data yang sudah ada untuk masing-masing desa (bukan menggantikan).
              </p>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  File Excel (.xlsx)
                </label>
                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl py-6 cursor-pointer hover:bg-slate-50 transition-colors">
                  <FileSpreadsheet size={28} className="text-emerald-600" />
                  <span className="text-xs font-semibold text-slate-500">
                    {uploadFile ? uploadFile.name : "Klik untuk memilih file"}
                  </span>
                  <input
                    type="file"
                    accept=".xlsx"
                    className="hidden"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    setUploadFile(null);
                  }}
                  className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={uploadMutation.isPending}
                  className="flex items-center gap-2 px-5 py-2 bg-[#2D7344] hover:bg-[#1E5230] text-white text-sm font-semibold rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  {uploadMutation.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Upload size={16} />
                  )}
                  {uploadMutation.isPending ? "Memproses..." : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MasterPotensi;
