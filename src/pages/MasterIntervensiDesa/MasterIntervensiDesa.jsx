import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import DataTable from "../../components/DataTable";
import RichTextEditor from "../../components/RichTextEditor";
import { intervensiDesaService } from "../../services/master/intervensiDesaService";
import { wilayahDesaService } from "../../services/master/wilayahDesaService";
import { masterWilayahService } from "../../services/master/masterWilayahService";
import { usePermission } from "../../hooks/usePermission";
import {
  Search,
  Edit2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Calendar,
  Eye,
  X,
  Plus,
  Trash2,
  Save,
  Loader2,
  Info,
  Download,
  Upload,
  AlertTriangle,
  FileSpreadsheet,
} from "lucide-react";

const createEmptyRun = () => ({ text: "", bold: false, italic: false });

const emptyIntervensiForm = {
  desaId: "",
  tahunIntervensiDesaId: "",
  intervensi: [{ header: "", value: [createEmptyRun()] }],
};

// Render array of rich-text runs ({text, bold, italic}) dengan formatting aslinya.
const renderRuns = (value, emptyLabel = "-") => {
  const runs = Array.isArray(value) ? value : value ? [{ text: String(value) }] : [];
  const validRuns = runs.filter((run) => run.text);
  if (validRuns.length === 0) return emptyLabel;
  return validRuns.map((run, idx) =>
    run.text === "\n" ? (
      <br key={idx} />
    ) : (
      <span
        key={idx}
        className={`${run.bold ? "font-bold" : ""} ${run.italic ? "italic" : ""}`}
      >
        {run.text}
      </span>
    ),
  );
};

const MasterIntervensiDesa = () => {
  const queryClient = useQueryClient();
  const { can } = usePermission();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(
    tabParam === "tahun" ? "tahun" : "data",
  );
  const [selectedTahunId, setSelectedTahunId] = useState(searchParams.get("tahunId") || null);

  useEffect(() => {
    if (tabParam && ["data", "tahun"].includes(tabParam) && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabParam]);

  const handleChangeTab = (tab) => {
    setActiveTab(tab);
    setSearchParams(
      tab === "data" && selectedTahunId ? { tab, tahunId: selectedTahunId } : { tab },
    );
  };

  const handleSelectTahun = (t) => {
    setSelectedTahunId(t.id);
    setPage(1);
    setSearchQuery("");
    setSearchParams({ tab: "data", tahunId: t.id });
  };

  const handleBackToTahunList = () => {
    setSelectedTahunId(null);
    setPage(1);
    setSearchQuery("");
    setSearchParams({ tab: "data" });
  };

  // ==========================================
  // TAB: DATA INTERVENSI DESA
  // ==========================================
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  const [viewId, setViewId] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyIntervensiForm);

  const [searchDesa, setSearchDesa] = useState("");
  const [debouncedSearchDesa, setDebouncedSearchDesa] = useState("");
  const [filterProvinsi, setFilterProvinsi] = useState("");
  const [filterKabupaten, setFilterKabupaten] = useState("");
  const [filterKecamatan, setFilterKecamatan] = useState("");
  const [selectedDesaLabel, setSelectedDesaLabel] = useState(null);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTahunId, setUploadTahunId] = useState("");
  const [uploadFile, setUploadFile] = useState(null);

  const {
    data: listResponse,
    isLoading: isLoadingList,
    isError: isErrorList,
  } = useQuery({
    queryKey: ["intervensiDesaList", selectedTahunId, page, size],
    queryFn: () =>
      intervensiDesaService.getAll({ page, size, tahunIntervensiDesaId: selectedTahunId }),
    keepPreviousData: true,
    enabled: activeTab === "data" && !!selectedTahunId,
  });

  const items = listResponse?.data?.items || [];
  const pagination = listResponse?.data?.pagination || {};
  const total = pagination.total || items.length;
  const totalPages = pagination.totalPage || Math.ceil(total / size) || 1;
  const startIdx = (page - 1) * size;

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    const q = searchQuery.toLowerCase();
    return items.filter((row) => {
      const name = (row.wilayahDesa?.nama || "").toLowerCase();
      const code = (row.wilayahDesa?.kodeKemendagri || "").toLowerCase();
      return name.includes(q) || code.includes(q);
    });
  }, [items, searchQuery]);

  const { data: tahunResponse } = useQuery({
    queryKey: ["tahunIntervensiDesaList"],
    queryFn: () => intervensiDesaService.getAllTahun(),
  });
  const tahunList = tahunResponse?.data || [];
  const selectedTahunObj = tahunList.find((t) => t.id === selectedTahunId) || null;

  const { data: viewResponse, isLoading: isLoadingView } = useQuery({
    queryKey: ["intervensiDesaDetail", viewId],
    queryFn: () => intervensiDesaService.getById(viewId),
    enabled: !!viewId,
  });
  const viewData = viewResponse?.data || null;

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchDesa(searchDesa), 300);
    return () => clearTimeout(handler);
  }, [searchDesa]);

  const { data: provincesList = [] } = useQuery({
    queryKey: ["allProvincesForIntervensi"],
    queryFn: () => masterWilayahService.getAllProvinsi(),
    enabled: isFormModalOpen && !editingId,
  });

  const { data: kabupatensList = [] } = useQuery({
    queryKey: ["allKabupatensForIntervensi", filterProvinsi],
    queryFn: () => masterWilayahService.getAllKabupaten(null, null, "", filterProvinsi),
    enabled: isFormModalOpen && !editingId && !!filterProvinsi,
  });

  const { data: kecamatansList = [] } = useQuery({
    queryKey: ["allKecamatansForIntervensi", filterKabupaten],
    queryFn: () => masterWilayahService.getAllKecamatan(null, null, "", filterKabupaten),
    enabled: isFormModalOpen && !editingId && !!filterKabupaten,
  });

  const { data: searchDesaData, isLoading: isLoadingDesa } = useQuery({
    queryKey: [
      "searchDesaForIntervensi",
      debouncedSearchDesa,
      filterProvinsi,
      filterKabupaten,
      filterKecamatan,
    ],
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
    enabled: isFormModalOpen && !editingId,
  });

  const filteredDesa = useMemo(() => {
    if (!searchDesaData) return [];
    const hasRegionFilters = filterProvinsi || filterKabupaten || filterKecamatan;
    if (debouncedSearchDesa.trim().length >= 2 && !hasRegionFilters) {
      return searchDesaData?.data || searchDesaData || [];
    }
    return searchDesaData?.items || searchDesaData?.data || searchDesaData || [];
  }, [searchDesaData, debouncedSearchDesa, filterProvinsi, filterKabupaten, filterKecamatan]);

  const resetDesaPicker = () => {
    setSearchDesa("");
    setDebouncedSearchDesa("");
    setFilterProvinsi("");
    setFilterKabupaten("");
    setFilterKecamatan("");
    setSelectedDesaLabel(null);
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ ...emptyIntervensiForm, tahunIntervensiDesaId: selectedTahunId || "" });
    resetDesaPicker();
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (row) => {
    setEditingId(row.id);
    setFormData({
      desaId: row.desaId,
      tahunIntervensiDesaId: row.tahunIntervensiDesaId,
      intervensi: (row.intervensi || []).map((item) => ({
        header: item.header || "",
        value:
          Array.isArray(item.value) && item.value.length > 0
            ? item.value.map((run) => ({
                text: run.text || "",
                bold: !!run.bold,
                italic: !!run.italic,
              }))
            : [createEmptyRun()],
      })),
    });
    setSelectedDesaLabel(row.wilayahDesa?.nama || null);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingId(null);
    setFormData(emptyIntervensiForm);
    resetDesaPicker();
  };

  const createMutation = useMutation({
    mutationFn: (payload) => intervensiDesaService.create(payload),
    onSuccess: () => {
      toast.success("Data Intervensi Desa berhasil ditambahkan!");
      queryClient.invalidateQueries({ queryKey: ["intervensiDesaList"] });
      handleCloseFormModal();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Gagal menambahkan data intervensi.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => intervensiDesaService.update(id, payload),
    onSuccess: () => {
      toast.success("Data Intervensi Desa berhasil diperbarui!");
      queryClient.invalidateQueries({ queryKey: ["intervensiDesaList"] });
      handleCloseFormModal();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Gagal memperbarui data intervensi.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => intervensiDesaService.destroy(id),
    onSuccess: () => {
      toast.success("Data Intervensi Desa berhasil dihapus.");
      queryClient.invalidateQueries({ queryKey: ["intervensiDesaList"] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Gagal menghapus data intervensi.");
    },
  });

  const handleAddIntervensiRow = () => {
    setFormData((prev) => ({
      ...prev,
      intervensi: [...prev.intervensi, { header: "", value: [createEmptyRun()] }],
    }));
  };

  const handleRemoveIntervensiRow = (idx) => {
    setFormData((prev) => ({
      ...prev,
      intervensi: prev.intervensi.filter((_, i) => i !== idx),
    }));
  };

  const handleHeaderChange = (idx, header) => {
    setFormData((prev) => {
      const updated = [...prev.intervensi];
      updated[idx] = { ...updated[idx], header };
      return { ...prev, intervensi: updated };
    });
  };

  const handleValueChange = (rowIdx, runs) => {
    setFormData((prev) => {
      const updated = [...prev.intervensi];
      updated[rowIdx] = { ...updated[rowIdx], value: runs };
      return { ...prev, intervensi: updated };
    });
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();

    if (!formData.desaId) {
      toast.error("Silakan pilih desa terlebih dahulu.");
      return;
    }
    if (!formData.tahunIntervensiDesaId) {
      toast.error("Silakan pilih tahun intervensi terlebih dahulu.");
      return;
    }

    const intervensiPayload = formData.intervensi
      .map((item) => ({
        header: item.header.trim(),
        value: item.value
          .filter((run) => run.text)
          .map((run) => ({
            text: run.text,
            bold: !!run.bold,
            italic: !!run.italic,
          })),
      }))
      .filter((item) => item.header && item.value.length > 0);

    if (intervensiPayload.length === 0) {
      toast.error("Isi minimal satu data intervensi.");
      return;
    }

    const payload = {
      desaId: formData.desaId,
      tahunIntervensiDesaId: formData.tahunIntervensiDesaId,
      intervensi: intervensiPayload,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDeleteConfirmation = (row) => {
    toast.custom(
      (t) => (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-red-900/5 p-5 w-full max-w-sm">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0 text-red-500">
              <AlertTriangle size={20} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-800 mb-1">
                Konfirmasi Penghapusan
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Apakah Anda yakin ingin menghapus data intervensi desa{" "}
                <span className="font-bold text-slate-700">
                  {row.wilayahDesa?.nama || "-"}
                </span>{" "}
                tahun{" "}
                <span className="font-bold text-slate-700">
                  {row.tahunIntervensiDesa?.tahun || "-"}
                </span>
                ? Tindakan ini permanen dan tidak dapat dibatalkan.
              </p>
              <div className="flex items-center justify-end gap-2 mt-2">
                <button
                  onClick={() => toast.dismiss(t)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    toast.dismiss(t);
                    deleteMutation.mutate(row.id);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      ),
      { duration: 10000, position: "top-center" },
    );
  };

  // Upload & Template Excel
  const handleDownloadTemplate = async () => {
    try {
      const response = await intervensiDesaService.downloadTemplate();
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Template_Intervensi_Desa.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Gagal mengunduh template Excel.");
    }
  };

  const uploadMutation = useMutation({
    mutationFn: (formDataPayload) => intervensiDesaService.uploadExcel(formDataPayload),
    onSuccess: (res) => {
      const result = res?.data || {};
      toast.success(
        `Berhasil memproses file Excel. ${result.total_inserted || 0} data disimpan.`,
      );
      queryClient.invalidateQueries({ queryKey: ["intervensiDesaList"] });
      setIsUploadModalOpen(false);
      setUploadTahunId("");
      setUploadFile(null);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Gagal memproses file Excel.");
    },
  });

  const handleSubmitUpload = (e) => {
    e.preventDefault();
    if (!uploadTahunId) {
      toast.error("Silakan pilih tahun intervensi terlebih dahulu.");
      return;
    }
    if (!uploadFile) {
      toast.error("Silakan pilih file Excel terlebih dahulu.");
      return;
    }
    const formDataPayload = new FormData();
    formDataPayload.append("tahunIntervensiDesaId", uploadTahunId);
    formDataPayload.append("file", uploadFile);
    uploadMutation.mutate(formDataPayload);
  };

  // ==========================================
  // TAB: TAHUN INTERVENSI
  // ==========================================
  const [isTahunModalOpen, setIsTahunModalOpen] = useState(false);
  const [formTahun, setFormTahun] = useState("");

  const createTahunMutation = useMutation({
    mutationFn: (payload) => intervensiDesaService.createTahun(payload),
    onSuccess: () => {
      toast.success("Tahun intervensi berhasil ditambahkan!");
      queryClient.invalidateQueries({ queryKey: ["tahunIntervensiDesaList"] });
      setIsTahunModalOpen(false);
      setFormTahun("");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Gagal menambahkan tahun intervensi.");
    },
  });

  const handleSubmitTahun = (e) => {
    e.preventDefault();
    if (!formTahun) {
      toast.error("Tahun wajib diisi!");
      return;
    }
    createTahunMutation.mutate({ tahun: Number(formTahun) });
  };

  return (
    <DashboardLayout activeMenu="Master Intervensi Desa">
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#FAFBFC]">
        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8 custom-scrollbar">
          {/* HEADER HALAMAN */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Master Intervensi Desa
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Kelola data program/bantuan intervensi yang diterima setiap desa hutan per tahun.
            </p>
          </div>

          {/* TABS */}
          <div className="flex items-center gap-2 mb-6 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm w-fit">
            <button
              onClick={() => handleChangeTab("data")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === "data"
                  ? "bg-[#2D7344] text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <ClipboardList size={16} />
              Data Intervensi
            </button>
            <button
              onClick={() => handleChangeTab("tahun")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === "tahun"
                  ? "bg-[#2D7344] text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <Calendar size={16} />
              Tahun Intervensi
            </button>
          </div>

          {/* ============================================== */}
          {/* TAB CONTENT: DATA INTERVENSI                    */}
          {/* ============================================== */}
          {activeTab === "data" && !selectedTahunId && (
            <div>
              {/* Toolbar pilih tahun */}
              <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-[#2D7344] shrink-0">
                    <ClipboardList size={20} strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">Pilih Tahun Intervensi</h2>
                    <p className="text-xs text-gray-400 font-medium">
                      Pilih tahun untuk melihat & mengelola data intervensi desa
                    </p>
                  </div>
                </div>
                {can("tahun_intervensi_desa:create") && (
                  <button
                    onClick={() => setIsTahunModalOpen(true)}
                    className="flex items-center gap-2 bg-[#2D7344] hover:bg-[#1E5230] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all cursor-pointer"
                  >
                    <Plus size={18} strokeWidth={2.5} />
                    Tambah Tahun
                  </button>
                )}
              </div>

              {/* Grid pilihan tahun */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {tahunList.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleSelectTahun(t)}
                    className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-[#2D7344]/40 hover:shadow-md transition-all duration-300 cursor-pointer group flex justify-between items-center"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3.5 bg-emerald-50 rounded-2xl text-[#2D7344] border border-emerald-100/50 group-hover:bg-[#2D7344] group-hover:text-white transition-colors duration-300">
                        <Calendar size={22} strokeWidth={2.2} />
                      </div>
                      <div>
                        <h3 className="text-xl font-extrabold text-gray-800">Tahun {t.tahun}</h3>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">
                          Lihat data intervensi desa
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      size={18}
                      className="text-gray-400 group-hover:translate-x-1 group-hover:text-[#2D7344] transition-all"
                    />
                  </div>
                ))}

                {tahunList.length === 0 && (
                  <div className="col-span-full bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center text-gray-400 font-medium">
                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-400 mb-3">
                      <Info size={24} />
                    </div>
                    <h3>Belum Ada Tahun Intervensi</h3>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                      Klik tombol "Tambah Tahun" di kanan atas untuk mendaftarkan tahun pertama.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "data" && selectedTahunId && (
            <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 flex flex-col">
              <div className="p-6 border-b border-gray-50 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <button
                    onClick={handleBackToTahunList}
                    className="flex items-center gap-2 text-gray-500 hover:text-[#2D7344] font-bold text-sm transition-colors w-fit px-3 py-2 -ml-3 rounded-xl hover:bg-emerald-50 cursor-pointer"
                  >
                    <ChevronLeft size={18} />
                    Kembali
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-[#2D7344] shrink-0">
                      <ClipboardList size={20} strokeWidth={2} />
                    </div>
                    <h2 className="text-lg font-bold text-gray-800 whitespace-nowrap">
                      Data Intervensi — Tahun {selectedTahunObj?.tahun || "-"}
                    </h2>
                  </div>

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
                  {can("intervensi_desa:import") && (
                    <button
                      onClick={() => {
                        setUploadTahunId(selectedTahunId);
                        setIsUploadModalOpen(true);
                      }}
                      title="Upload Excel"
                      className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer"
                    >
                      <Upload size={16} />
                      <span className="hidden lg:inline">Upload</span>
                    </button>
                  )}

                  {can("intervensi_desa:create") && (
                    <button
                      onClick={handleOpenAdd}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#2D7344] hover:bg-[#1E5230] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm cursor-pointer active:scale-[0.98]"
                    >
                      <Plus size={18} strokeWidth={2.5} />
                      <span>Tambah Data</span>
                    </button>
                  )}
                </div>
              </div>

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
                    render: (row) => <span>{row.wilayahDesa?.kodeKemendagri || "-"}</span>,
                  },
                  {
                    header: "Nama Desa",
                    className: "font-bold text-gray-900",
                    render: (row) => <span>{row.wilayahDesa?.nama || "-"}</span>,
                  },
                  {
                    header: "Jumlah Intervensi",
                    className: "w-40",
                    render: (row) => (
                      <span className="px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                        {row.intervensi?.length || 0} data
                      </span>
                    ),
                  },
                  {
                    header: "Aksi",
                    className: "text-center w-28",
                    render: (row) => (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setViewId(row.id)}
                          className="p-1.5 text-gray-400 hover:text-[#0A66C2] hover:bg-blue-50 rounded-md transition-all cursor-pointer"
                          title="Lihat Detail Intervensi"
                        >
                          <Eye size={16} strokeWidth={2} />
                        </button>
                        {can("intervensi_desa:update") && (
                          <button
                            onClick={() => handleOpenEdit(row)}
                            className="p-1.5 text-gray-400 hover:text-[#2D7344] hover:bg-[#EAFBF0] rounded-md transition-all cursor-pointer"
                            title="Edit Intervensi"
                          >
                            <Edit2 size={16} strokeWidth={2} />
                          </button>
                        )}
                        {can("intervensi_desa:delete") && (
                          <button
                            onClick={() => handleDeleteConfirmation(row)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all cursor-pointer"
                            title="Hapus Intervensi"
                          >
                            <Trash2 size={16} strokeWidth={2} />
                          </button>
                        )}
                      </div>
                    ),
                  },
                ]}
                data={filteredItems}
                isLoading={isLoadingList}
                isError={isErrorList}
                searchQuery={searchQuery}
                emptyMessage={`Belum ada data intervensi desa untuk tahun ${selectedTahunObj?.tahun || "-"}.`}
              />

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
                          (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
                        )
                        .map((p, i, arr) => {
                          const showDots = i > 0 && p - arr[i - 1] > 1;
                          return (
                            <React.Fragment key={p}>
                              {showDots && <span className="text-gray-400 text-xs">...</span>}
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
          )}

          {/* ============================================== */}
          {/* TAB CONTENT: TAHUN INTERVENSI                   */}
          {/* ============================================== */}
          {activeTab === "tahun" && (
            <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 flex flex-col">
              <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
                    <Calendar size={20} strokeWidth={2} />
                  </div>
                  <h2 className="text-lg font-bold text-slate-800">Daftar Tahun Intervensi</h2>
                </div>

                {can("tahun_intervensi_desa:create") && (
                  <button
                    onClick={() => setIsTahunModalOpen(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#2D7344] hover:bg-[#1E5230] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md active:scale-[0.98] cursor-pointer"
                  >
                    <Plus size={18} strokeWidth={2.5} />
                    Tambah Tahun
                  </button>
                )}
              </div>

              <DataTable
                columns={[
                  {
                    header: "No",
                    className: "w-16 text-center text-slate-400",
                    render: (_, idx) => idx + 1,
                  },
                  {
                    header: "Tahun Intervensi",
                    render: (row) => (
                      <span className="font-bold text-slate-800 text-base">{row.tahun}</span>
                    ),
                  },
                ]}
                data={tahunList}
                isLoading={false}
                isError={false}
                emptyMessage="Belum ada data tahun intervensi yang ditambahkan."
              />
            </div>
          )}
        </div>
      </main>

      {/* ============================================== */}
      {/* MODAL: VIEW DETAIL INTERVENSI                   */}
      {/* ============================================== */}
      {viewId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#F8FAFC] rounded-[32px] shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200/50 animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="h-1.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-green-500" />

            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-extrabold px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-full uppercase tracking-wider font-mono shadow-sm">
                    Detail Intervensi Desa
                  </span>
                  <span className="text-[10px] font-extrabold px-3 py-1 bg-amber-50 border border-amber-100 text-amber-700 rounded-full uppercase tracking-wider font-mono shadow-sm">
                    Tahun {viewData?.tahunIntervensiDesa?.tahun || "-"}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-slate-800 mt-2 tracking-tight">
                  Desa {viewData?.wilayahDesa?.nama || "-"}
                </h3>
                <p className="text-xs font-bold text-slate-400 font-mono mt-1">
                  Kode Kemendagri: {viewData?.wilayahDesa?.kodeKemendagri || "-"}
                </p>
              </div>
              <button
                onClick={() => setViewId(null)}
                className="p-2.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-2xl transition-all cursor-pointer border border-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto custom-scrollbar flex-1 bg-[#FAFCFD]">
              {isLoadingView ? (
                <div className="flex flex-col items-center justify-center py-32 text-slate-400">
                  <Loader2 size={40} className="animate-spin text-emerald-600 mb-4" />
                  <span className="text-sm font-semibold tracking-wide">Memuat data intervensi...</span>
                </div>
              ) : viewData ? (
                <div className="p-8 space-y-6">
                  {viewData.intervensi && viewData.intervensi.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {viewData.intervensi.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
                        >
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                            {item.header}
                          </span>
                          <p className="text-slate-800 text-lg mt-2 leading-relaxed whitespace-pre-wrap">
                            {renderRuns(item.value)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
                      <Info size={32} className="mb-2.5 text-slate-300 mx-auto" />
                      <p className="text-xs font-bold text-slate-500">
                        Belum ada data intervensi yang tercatat untuk desa ini.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400">
                  Gagal memuat rincian data intervensi. Silakan coba lagi.
                </div>
              )}
            </div>

            <div className="px-8 py-5 border-t border-slate-100 flex justify-end bg-white">
              <button
                onClick={() => setViewId(null)}
                className="px-6 py-2.5 text-xs font-black text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer border border-slate-200/30"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================== */}
      {/* MODAL: TAMBAH / EDIT INTERVENSI                 */}
      {/* ============================================== */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#F8FAFC] rounded-[32px] shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200/50 animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="h-1.5 bg-gradient-to-r from-emerald-600 to-[#10B981]" />

            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <div>
                <span className="text-[10px] font-bold px-2.5 py-1 bg-amber-50 border border-amber-100 text-amber-700 rounded-lg uppercase tracking-wider">
                  {editingId ? "Mode Penyuntingan" : "Master Data"}
                </span>
                <h3 className="text-xl font-bold text-slate-800 mt-1.5">
                  {editingId ? "Edit Data Intervensi Desa" : "Tambah Data Intervensi Desa"}
                </h3>
              </div>
              <button
                onClick={handleCloseFormModal}
                className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-2xl transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                {/* Pilih Desa (hanya untuk mode Tambah) */}
                {!editingId ? (
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-700">Desa Hutan</label>

                    {!formData.desaId ? (
                      <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

                        <div className="relative">
                          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                          <input
                            type="text"
                            placeholder="Cari desa berdasarkan nama..."
                            value={searchDesa}
                            onChange={(e) => setSearchDesa(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold text-slate-700"
                          />
                        </div>

                        {isLoadingDesa ? (
                          <div className="flex justify-center py-6">
                            <Loader2 className="animate-spin text-emerald-600" size={22} />
                          </div>
                        ) : (
                          <div className="max-h-48 overflow-y-auto border border-slate-200/60 rounded-2xl divide-y divide-slate-100 bg-white custom-scrollbar">
                            {filteredDesa.length > 0 ? (
                              filteredDesa.map((d) => (
                                <button
                                  key={d.id}
                                  type="button"
                                  onClick={() => {
                                    setFormData((prev) => ({ ...prev, desaId: d.id }));
                                    setSelectedDesaLabel(d.nama);
                                  }}
                                  className="w-full px-4 py-2.5 text-left hover:bg-emerald-50/50 flex items-center justify-between text-xs transition-colors cursor-pointer group"
                                >
                                  <div>
                                    <span className="font-bold text-slate-700 group-hover:text-emerald-700">
                                      {d.nama}
                                    </span>
                                    <span className="text-[11px] text-slate-400 block mt-0.5 font-medium">
                                      Kec. {d.kecamatan || "-"} • Kab. {d.kabupaten || "-"}
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-bold text-slate-400 group-hover:text-emerald-600 bg-slate-100 group-hover:bg-emerald-100/50 border border-slate-200/50 group-hover:border-emerald-200 px-2.5 py-1 rounded">
                                    Pilih
                                  </span>
                                </button>
                              ))
                            ) : (
                              <div className="p-6 text-center text-slate-400 text-xs font-semibold">
                                Tidak menemukan desa dengan kata kunci tersebut.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex justify-between items-center">
                        <div>
                          <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest font-mono">
                            Desa Terpilih
                          </span>
                          <h4 className="font-bold text-slate-800 text-sm mt-1">
                            {selectedDesaLabel}
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({ ...prev, desaId: "" }));
                            setSelectedDesaLabel(null);
                          }}
                          className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-white border border-emerald-200 hover:bg-emerald-100/30 rounded-xl transition-all cursor-pointer"
                        >
                          Ganti Desa
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-100/70 border border-slate-200 rounded-2xl p-4">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                      Desa
                    </span>
                    <h4 className="font-bold text-slate-700 text-sm mt-1">{selectedDesaLabel}</h4>
                  </div>
                )}

                {/* Tahun (mengikuti konteks tahun yang sedang dipilih) */}
                <div className="bg-slate-100/70 border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-slate-500 border border-slate-200 shrink-0">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                      Tahun Intervensi
                    </span>
                    <h4 className="font-bold text-slate-700 text-sm mt-0.5">
                      {tahunList.find((t) => t.id === formData.tahunIntervensiDesaId)?.tahun || "-"}
                    </h4>
                  </div>
                </div>

                {/* Daftar Intervensi */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                    Daftar Intervensi
                  </span>

                  <div className="space-y-4">
                    {formData.intervensi.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50/50 p-3 rounded-xl border border-slate-100/50 space-y-2.5"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            placeholder="Nama Intervensi (Contoh: Bantuan Bibit)"
                            value={item.header}
                            onChange={(e) => handleHeaderChange(idx, e.target.value)}
                            className="flex-1 min-w-[150px] px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all font-semibold"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveIntervensiRow(idx)}
                            className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors cursor-pointer shrink-0"
                            title="Hapus Baris"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* Keterangan / Nilai — rich text box, bisa diformat bold/italic seperti compose email */}
                        <RichTextEditor
                          value={item.value}
                          onChange={(runs) => handleValueChange(idx, runs)}
                          placeholder="Tulis keterangan / nilai intervensi di sini..."
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddIntervensiRow}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-[#2D7344] hover:text-[#1E5230] bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100/50 cursor-pointer"
                  >
                    <Plus size={12} strokeWidth={3} />
                    <span>Tambah Baris Intervensi</span>
                  </button>
                </div>
              </div>

              <div className="px-8 py-5 border-t border-slate-100 flex justify-end gap-3 bg-white">
                <button
                  type="button"
                  onClick={handleCloseFormModal}
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#2D7344] hover:bg-[#1E5230] rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-sm shadow-emerald-800/10 cursor-pointer"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  <span>Simpan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================== */}
      {/* MODAL: UPLOAD EXCEL                             */}
      {/* ============================================== */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Upload Excel Intervensi Desa</h3>
              <button
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setUploadTahunId("");
                  setUploadFile(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitUpload} className="p-5 space-y-5">
              <p className="text-xs text-slate-500 leading-relaxed">
                Gunakan template Excel resmi. Data lama untuk kombinasi desa & tahun yang sama akan digantikan oleh data baru dari file ini.
              </p>

              <div className="bg-slate-100/70 border border-slate-200 rounded-xl p-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-slate-500 border border-slate-200 shrink-0">
                  <Calendar size={16} />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                    Tahun Intervensi
                  </span>
                  <h4 className="font-bold text-slate-700 text-sm mt-0.5">
                    {tahunList.find((t) => t.id === uploadTahunId)?.tahun || "-"}
                  </h4>
                </div>
              </div>

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
                    setUploadTahunId("");
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

      {/* ============================================== */}
      {/* MODAL: TAMBAH TAHUN INTERVENSI                  */}
      {/* ============================================== */}
      {isTahunModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Tambah Tahun Intervensi</h3>
              <button
                onClick={() => {
                  setIsTahunModalOpen(false);
                  setFormTahun("");
                }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitTahun} className="p-5">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Tahun</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Calendar size={18} />
                  </div>
                  <input
                    type="number"
                    placeholder="Contoh: 2024"
                    value={formTahun}
                    onChange={(e) => setFormTahun(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsTahunModalOpen(false);
                    setFormTahun("");
                  }}
                  className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createTahunMutation.isPending}
                  className="flex items-center gap-2 px-5 py-2 bg-[#2D7344] hover:bg-[#1E5230] text-white text-sm font-semibold rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  <Save size={16} />
                  {createTahunMutation.isPending ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MasterIntervensiDesa;
