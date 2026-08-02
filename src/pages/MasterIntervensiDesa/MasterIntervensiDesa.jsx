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

const createEmptyParagraph = () => [
  {
    listType: null,
    runs: [
      {
        bold: false,
        size: null,
        text: "",
        color: null,
        italic: false,
        strike: false,
        subscript: false,
        underline: false,
        superscript: false,
      },
    ],
  },
];

const emptyIntervensiForm = {
  desaId: "",
  tahunIntervensiDesaId: "",
  intervensi: [{ header: "", value: createEmptyParagraph() }],
};

// Render array of paragraph objects [{ listType, runs }] atau array of runs ({text, bold, italic})
const renderRuns = (value, emptyLabel = "-") => {
  if (!value) return emptyLabel;

  if (Array.isArray(value)) {
    const isParagraphArray = value.some(
      (item) => item && typeof item === "object" && Array.isArray(item.runs)
    );

    if (isParagraphArray) {
      let numberedCounter = 0;
      const elements = [];

      value.forEach((para, pIdx) => {
        const listType = para?.listType;
        const runs = Array.isArray(para?.runs) ? para.runs : [];
        const validRuns = runs.filter((r) => r.text);
        if (validRuns.length === 0) return;

        if (listType === "numbered") {
          numberedCounter++;
        } else {
          numberedCounter = 0;
        }

        const runContent = validRuns.map((run, rIdx) => {
          if (run.text === "\n") return <br key={rIdx} />;
          let spanNode = (
            <span
              key={rIdx}
              className={`${run.bold ? "font-bold" : ""} ${
                run.italic ? "italic" : ""
              } ${run.underline ? "underline" : ""} ${
                run.strike ? "line-through" : ""
              }`}
              style={{
                color: run.color || undefined,
                fontSize: run.size ? `${run.size}px` : undefined,
              }}
            >
              {run.text}
            </span>
          );

          if (run.subscript) {
            spanNode = <sub key={rIdx} className="text-[0.8em]">{spanNode}</sub>;
          }
          if (run.superscript) {
            spanNode = <sup key={rIdx} className="text-[0.8em]">{spanNode}</sup>;
          }

          return spanNode;
        });

        if (listType === "numbered") {
          elements.push(
            <div key={pIdx} className="flex items-start gap-2 my-1">
              <span className="font-bold text-emerald-700 min-w-[20px] shrink-0 text-right font-mono text-sm">
                {numberedCounter}.
              </span>
              <div className="flex-1 text-slate-800 text-sm">{runContent}</div>
            </div>
          );
        } else if (listType === "bullet") {
          elements.push(
            <div key={pIdx} className="flex items-start gap-2 my-1">
              <span className="font-bold text-emerald-600 shrink-0 text-sm">•</span>
              <div className="flex-1 text-slate-800 text-sm">{runContent}</div>
            </div>
          );
        } else {
          elements.push(
            <div key={pIdx} className="my-1 text-slate-800 text-sm leading-relaxed">
              {runContent}
            </div>
          );
        }
      });

      return elements.length > 0 ? elements : emptyLabel;
    }

    // Legacy flat array of runs
    const validRuns = value.filter((run) => run && run.text);
    if (validRuns.length === 0) return emptyLabel;
    return validRuns.map((run, idx) => {
      if (run.text === "\n") return <br key={idx} />;
      let spanNode = (
        <span
          key={idx}
          className={`${run.bold ? "font-bold" : ""} ${run.italic ? "italic" : ""}`}
        >
          {run.text}
        </span>
      );
      if (run.subscript) spanNode = <sub key={idx} className="text-[0.8em]">{spanNode}</sub>;
      if (run.superscript) spanNode = <sup key={idx} className="text-[0.8em]">{spanNode}</sup>;
      return spanNode;
    });
  }

  if (typeof value === "string") return value;
  return emptyLabel;
};

const MasterIntervensiDesa = () => {
  const queryClient = useQueryClient();
  const { can } = usePermission();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab] = useState("data");
  const [selectedTahunId, setSelectedTahunId] = useState(
    searchParams.get("tahunId") || null
  );

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
  const [isExporting, setIsExporting] = useState(false);

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
      desaId: row.desaId || row.desa_id,
      tahunIntervensiDesaId: row.tahunIntervensiDesaId || row.tahun_intervensi_desa_id,
      intervensi: (row.intervensi || []).map((item) => ({
        header: item.header || "",
        value:
          Array.isArray(item.value) && item.value.length > 0
            ? item.value
            : createEmptyParagraph(),
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
      intervensi: [...prev.intervensi, { header: "", value: createEmptyParagraph() }],
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
      .map((item) => {
        let cleanValue = [];
        if (Array.isArray(item.value)) {
          const isParagraphArray = item.value.some(
            (p) => p && typeof p === "object" && Array.isArray(p.runs)
          );

          if (isParagraphArray) {
            cleanValue = item.value
              .map((para) => ({
                listType: para.listType || null,
                runs: (para.runs || [])
                  .filter((r) => r.text)
                  .map((r) => ({
                    bold: !!r.bold,
                    size: r.size || null,
                    text: r.text,
                    color: r.color || null,
                    italic: !!r.italic,
                    strike: !!r.strike,
                    subscript: !!r.subscript,
                    underline: !!r.underline,
                    superscript: !!r.superscript,
                  })),
              }))
              .filter((para) => para.runs.length > 0);
          } else {
            const runs = item.value
              .filter((r) => r.text)
              .map((r) => ({
                bold: !!r.bold,
                size: r.size || null,
                text: r.text,
                color: r.color || null,
                italic: !!r.italic,
                strike: !!r.strike,
                subscript: !!r.subscript,
                underline: !!r.underline,
                superscript: !!r.superscript,
              }));
            if (runs.length > 0) {
              cleanValue = [{ listType: null, runs }];
            }
          }
        }
        return {
          header: item.header.trim(),
          value: cleanValue,
        };
      })
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

  const handleExportIntervensi = async () => {
    if (!selectedTahunId) {
      toast.error("Silakan pilih tahun intervensi terlebih dahulu.");
      return;
    }
    setIsExporting(true);
    try {
      const response = await intervensiDesaService.exportExcel(selectedTahunId);
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Data_Intervensi_Desa_${selectedTahunObj?.tahun || "semua"}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Gagal mengekspor data intervensi desa.");
    } finally {
      setIsExporting(false);
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
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-[#2D7344] text-white shadow-sm">
              <ClipboardList size={16} />
              <span>Data Intervensi</span>
            </div>
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
                  <button
                      onClick={handleExportIntervensi}
                      disabled={isExporting}
                      title="Export Excel"
                      className="flex items-center justify-center gap-2 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isExporting ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        <FileSpreadsheet size={16} />
                    )}
                    <span className="hidden lg:inline">Export</span>
                  </button>
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
                    className: "text-center w-24",
                    render: (row) => (
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => setViewId(row.id)}
                          className="p-1.5 text-gray-400 hover:text-[#0A66C2] hover:bg-blue-50 rounded-md transition-all cursor-pointer"
                          title="Lihat Detail Intervensi"
                        >
                          <Eye size={16} strokeWidth={2} />
                        </button>
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
                              <div className="mt-2 text-slate-800">
                                {renderRuns(item.value)}
                              </div>
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
    </DashboardLayout>
  );
};

export default MasterIntervensiDesa;
