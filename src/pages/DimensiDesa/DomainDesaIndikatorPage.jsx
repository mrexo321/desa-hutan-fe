import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  Plus,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Trash2,
  Download,
  Upload,
  Loader2,
  Award,
  ListPlus,
  Check,
  HelpCircle,
  Info,
  Search,
  X,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { dimensiDesaService } from "../../services/master/dimensiDesaService";
import { indikatorService } from "../../services/master/indikatorService";
import { masterWilayahService } from "../../services/master/masterWilayahService";
import { usePermission } from "../../hooks/usePermission";
import DataTable from "../../components/DataTable";

export default function DomainDesaIndikatorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const indicatorIdParam = searchParams.get("indicatorId");
  const detailTahunParam = searchParams.get("detailTahun");
  const tahunParam = searchParams.get("tahun") || detailTahunParam;
  const { can } = usePermission();

  // State Halaman
  const [selectedTahun, setSelectedTahun] = useState(null); // Menyimpan objek tahun terpilih

  // State Tahun
  const [tahunList, setTahunList] = useState([]);
  const [loadingTahun, setLoadingTahun] = useState(false);
  const [modalTahunOpen, setModalTahunOpen] = useState(false);
  const [newTahun, setNewTahun] = useState("");

  // State Konfigurasi Indikator
  const [schemaIndikator, setSchemaIndikator] = useState([]);
  const [loadingIndikator, setLoadingIndikator] = useState(false);

  // State Master Kategori (Untuk Dropdown Tambah Indikator)
  const [masterKategori, setMasterKategori] = useState([]);
  const [selectedKategoriId, setSelectedKategoriId] = useState("");
  const [addingIndikator, setAddingIndikator] = useState(false);
  const [deleteKategori, setDeleteKategori] = useState(null);

  // State Excel Upload
  const [uploadingExcel, setUploadingExcel] = useState(false);

  // State Dimensi Desa DataTable & Filters
  const [dimensiDesaData, setDimensiDesaData] = useState(null);
  const [loadingDimensiDesa, setLoadingDimensiDesa] = useState(false);
  const [errorDimensiDesa, setErrorDimensiDesa] = useState(false);
  const [dimensiDesaPage, setDimensiDesaPage] = useState(1);
  const [dimensiDesaSize, setDimensiDesaSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvinsiId, setSelectedProvinsiId] = useState("");
  const [selectedKabupatenId, setSelectedKabupatenId] = useState("");
  const [selectedKecamatanId, setSelectedKecamatanId] = useState("");

  // ── Wilayah Filter Queries ──
  const { data: provinsiList = [] } = useQuery({
    queryKey: ["provinsi-list"],
    queryFn: () => masterWilayahService.getAllProvinsi(),
  });

  const { data: kabupatenListRaw = [] } = useQuery({
    queryKey: ["kabupaten-list", selectedProvinsiId],
    queryFn: () => masterWilayahService.getAllKabupaten(null, null, "", selectedProvinsiId),
    enabled: !!selectedProvinsiId,
  });
  const kabupatenList = useMemo(() => {
    if (Array.isArray(kabupatenListRaw)) return kabupatenListRaw;
    return kabupatenListRaw?.rows || kabupatenListRaw?.items || [];
  }, [kabupatenListRaw]);

  const { data: kecamatanListRaw = [] } = useQuery({
    queryKey: ["kecamatan-list", selectedKabupatenId],
    queryFn: () => masterWilayahService.getAllKecamatan(null, null, "", selectedKabupatenId),
    enabled: !!selectedKabupatenId,
  });
  const kecamatanList = useMemo(() => {
    if (Array.isArray(kecamatanListRaw)) return kecamatanListRaw;
    return kecamatanListRaw?.rows || kecamatanListRaw?.items || [];
  }, [kecamatanListRaw]);

  // ==================== FETCH DATA ====================
  const fetchTahunList = async () => {
    setLoadingTahun(true);
    try {
      const res = await dimensiDesaService.getTahun();
      const list = res?.data?.rows || res?.data || res || [];
      // Sort descending by year
      const sortedList = [...list].sort((a, b) => b.tahun - a.tahun);
      setTahunList(sortedList);
    } catch (err) {
      toast.error("Gagal memuat daftar tahun dimensi");
    } finally {
      setLoadingTahun(false);
    }
  };

  const fetchSchemaIndikator = async (dimensiId) => {
    setLoadingIndikator(true);
    try {
      const res = await dimensiDesaService.getIndikatorByTahun(dimensiId);
      const rows = Array.isArray(res?.data) ? res.data : res?.data ? [res.data] : [];
      setSchemaIndikator(rows[0]?.dimensiIndikator || []);
    } catch (err) {
      toast.error("Gagal memuat indikator");
    } finally {
      setLoadingIndikator(false);
    }
  };

  const fetchMasterKategori = async () => {
    try {
      const res = await indikatorService.getAllCategoryIndicator();
      const list = res?.data?.rows || res?.data || res || [];
      setMasterKategori(list);
    } catch (err) {
      toast.error("Gagal mengambil daftar master kategori indikator");
    }
  };

  // Fetch data dimensi desa (tabel dinamis)
  const fetchDimensiDesa = async (
    targetVal,
    page = 1,
    size = 10,
    isById = false,
    filters = {}
  ) => {
    setLoadingDimensiDesa(true);
    setErrorDimensiDesa(false);
    try {
      let res;
      const params = {
        page,
        size,
        search: filters.search || undefined,
        provinsiId: filters.provinsiId || undefined,
        kabupatenId: filters.kabupatenId || undefined,
        kecamatanId: filters.kecamatanId || undefined,
      };
      if (isById) {
        res = await dimensiDesaService.getDimensiDesaById(targetVal, params);
      } else {
        res = await dimensiDesaService.getDimensiDesa({ tahun: targetVal, ...params });
      }
      setDimensiDesaData(res?.data || null);
    } catch (err) {
      setErrorDimensiDesa(true);
      toast.error("Gagal memuat data dimensi desa");
    } finally {
      setLoadingDimensiDesa(false);
    }
  };

  useEffect(() => {
    fetchTahunList();
    fetchMasterKategori();
  }, []);

  useEffect(() => {
    if (indicatorIdParam) {
      const yearVal = tahunParam && !isNaN(parseInt(tahunParam)) ? parseInt(tahunParam) : null;
      const item = { tahun: yearVal || "-", indicatorId: indicatorIdParam };
      setSelectedTahun(item);
      fetchSchemaIndikator(indicatorIdParam);
    } else if (detailTahunParam) {
      const yearVal = parseInt(detailTahunParam);
      if (!isNaN(yearVal)) {
        const item = { tahun: yearVal };
        setSelectedTahun(item);
      }
    }
  }, [indicatorIdParam, detailTahunParam, tahunParam]);

  useEffect(() => {
    if (selectedTahun) {
      const isById = !!selectedTahun.indicatorId;
      const targetVal = isById ? selectedTahun.indicatorId : selectedTahun.tahun;
      fetchDimensiDesa(targetVal, dimensiDesaPage, dimensiDesaSize, isById, {
        search: searchQuery,
        provinsiId: selectedProvinsiId,
        kabupatenId: selectedKabupatenId,
        kecamatanId: selectedKecamatanId,
      });
    }
  }, [
    selectedTahun,
    dimensiDesaPage,
    dimensiDesaSize,
    searchQuery,
    selectedProvinsiId,
    selectedKabupatenId,
    selectedKecamatanId,
  ]);

  // Switch ke Detail View (Arahkan ke /dashboard/indikator/:tahun)
  const handleSelectTahun = (item) => {
    navigate(`/dashboard/indikator/${item.tahun}`);
  };


  // ==================== HANDLER TAHUN ====================
  const handleCreateTahun = async (e) => {
    e.preventDefault();
    if (!newTahun || isNaN(newTahun)) {
      toast.warning("Tahun harus berupa angka valid");
      return;
    }
    const yearVal = parseInt(newTahun);
    if (yearVal < 1900 || yearVal > 2100) {
      toast.warning("Masukkan tahun yang valid (1900 - 2100)");
      return;
    }
    try {
      await dimensiDesaService.createTahun({ tahun: yearVal });
      toast.success(`Berhasil menambahkan tahun dimensi ${newTahun}`);
      setNewTahun("");
      setModalTahunOpen(false);
      fetchTahunList();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menambahkan tahun");
    }
  };

  // ==================== HANDLER INDIKATOR ====================
  // Reload tabel Data Dimensi Desa (kolom dinamisnya berubah setelah indikator ditambah/dihapus)
  const reloadDimensiDesaTable = () => {
    if (selectedTahun?.indicatorId) {
      fetchDimensiDesa(selectedTahun.indicatorId, dimensiDesaPage, dimensiDesaSize, true);
    } else if (selectedTahun?.tahun) {
      fetchDimensiDesa(selectedTahun.tahun, dimensiDesaPage, dimensiDesaSize, false);
    }
  };

  const handleAddIndikator = async () => {
    if (!selectedKategoriId) {
      toast.warning("Silakan pilih indikator terlebih dahulu");
      return;
    }
    setAddingIndikator(true);
    try {
      await dimensiDesaService.addIndikator(selectedTahun.indicatorId, {
        kategoriIndikatorId: selectedKategoriId,
      });
      toast.success("Indikator berhasil ditambahkan ke tahun ini");
      setSelectedKategoriId("");
      fetchSchemaIndikator(selectedTahun.indicatorId);
      reloadDimensiDesaTable();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menambahkan indikator");
    } finally {
      setAddingIndikator(false);
    }
  };

  const handleRemoveIndikator = (kategoriId, nama) => {
    setDeleteKategori({ id: kategoriId, nama });
  };

  const confirmRemoveIndikator = async () => {
    if (!deleteKategori) return;
    try {
      await dimensiDesaService.removeIndikator(selectedTahun.indicatorId, [deleteKategori.id]);
      toast.success(`Berhasil menghapus indikator ${deleteKategori.nama}`);
      setDeleteKategori(null);
      fetchSchemaIndikator(selectedTahun.indicatorId);
      reloadDimensiDesaTable();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menghapus indikator");
    }
  };

  // ==================== HANDLER EXCEL ====================
  const handleDownloadTemplate = async () => {
    if (schemaIndikator.length === 0) {
      toast.warning("Daftarkan minimal 1 indikator sebelum mengunduh template!");
      return;
    }
    const toastId = toast.loading("Menyiapkan berkas template Excel...");
    try {
      const response = await dimensiDesaService.downloadTemplate(selectedTahun.tahun);
      const blob = response.data || response;
      const url = window.URL.createObjectURL(
        new Blob([blob], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        })
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = `Template_Data_Domain_Desa_${selectedTahun.tahun}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Template berhasil diunduh!", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengunduh template Excel", { id: toastId });
    }
  };

  const handleUploadExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("tahun", selectedTahun.tahun.toString());

    setUploadingExcel(true);
    const toastId = toast.loading("Mengunggah berkas Excel...");
    try {
      const res = await dimensiDesaService.uploadExcel(formData);
      toast.success(
        res.message || "File Excel berhasil diproses & data disimpan!",
        { id: toastId }
      );
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Gagal mengunggah berkas Excel",
        { id: toastId }
      );
    } finally {
      setUploadingExcel(false);
      e.target.value = null; // reset file input
    }
  };


  // Handler filter & pagination
  const handleDimensiDesaPageChange = (newPage) => {
    setDimensiDesaPage(newPage);
  };

  const handleDimensiDesaSizeChange = (newSize) => {
    const size = parseInt(newSize);
    setDimensiDesaSize(size);
    setDimensiDesaPage(1);
  };

  const handleProvinsiChange = (provId) => {
    setSelectedProvinsiId(provId);
    setSelectedKabupatenId("");
    setSelectedKecamatanId("");
    setDimensiDesaPage(1);
  };

  const handleKabupatenChange = (kabId) => {
    setSelectedKabupatenId(kabId);
    setSelectedKecamatanId("");
    setDimensiDesaPage(1);
  };

  const handleKecamatanChange = (kecId) => {
    setSelectedKecamatanId(kecId);
    setDimensiDesaPage(1);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setDimensiDesaPage(1);
  };

  const handleResetFilter = () => {
    setSearchQuery("");
    setSelectedProvinsiId("");
    setSelectedKabupatenId("");
    setSelectedKecamatanId("");
    setDimensiDesaPage(1);
  };


  // Build dynamic columns for dimensi desa table
  const dimensiDesaColumns = useMemo(() => {
    const baseColumns = [
      {
        header: "No",
        accessor: "no",
        className: "w-14 text-center",
        render: (row, rowIndex) => (
          <span className="text-slate-500 font-semibold text-xs">
            {(dimensiDesaPage - 1) * dimensiDesaSize + rowIndex + 1}
          </span>
        ),
      },
      {
        header: "Kode Kemendagri",
        accessor: "kodeKemendagri",
        className: "w-40",
        render: (row) => (
          <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            {row.desa?.kodeKemendagri || "-"}
          </span>
        ),
      },
      {
        header: "Nama Desa",
        accessor: "namaDesa",
        render: (row) => (
          <div>
            <span className="text-slate-800 font-semibold block">{row.desa?.nama || "-"}</span>
            <span className="text-slate-400 text-xs">{row.desa?.provinsi || ""}</span>
          </div>
        ),
      },
    ];

    // Dynamic columns from API response
    const dynamicColumns = (dimensiDesaData?.column || []).map((col) => ({
      header: col.kode,
      accessor: col.id,
      className: "text-center",
      render: (row) => {
        const nilaiItem = (row.nilai || []).find(
          (n) => n.kategoriIndikatorId === col.id
        );
        if (!nilaiItem) return <span className="text-slate-300">—</span>;

        const val = nilaiItem.nilai;
        if (typeof val === "number") {
          return (
            <span className="font-mono text-xs font-bold text-slate-700">
              {val.toFixed(2)}
            </span>
          );
        }
        // String value (like status)
        const statusColors = {
          MAJU: "bg-emerald-50 text-emerald-700 border-emerald-200",
          BERKEMBANG: "bg-blue-50 text-blue-700 border-blue-200",
          TERTINGGAL: "bg-red-50 text-red-700 border-red-200",
          MANDIRI: "bg-purple-50 text-purple-700 border-purple-200",
          SANGAT_TERTINGGAL: "bg-orange-50 text-orange-700 border-orange-200",
        };
        const colorClass = statusColors[val?.toUpperCase()] || "bg-slate-50 text-slate-700 border-slate-200";
        return (
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${colorClass}`}>
            {val}
          </span>
        );
      },
    }));

    // Also add columns for nilai items not in the column array (like Status)
    // Check first item's nilai for extra columns
    const existingColIds = new Set((dimensiDesaData?.column || []).map((c) => c.id));
    const firstItem = (dimensiDesaData?.items || [])[0];
    const extraColumns = [];
    if (firstItem) {
      (firstItem.nilai || []).forEach((n) => {
        if (!existingColIds.has(n.kategoriIndikatorId)) {
          extraColumns.push({
            header: n.kode,
            accessor: n.kategoriIndikatorId,
            className: "text-center",
            render: (row) => {
              const nilaiItem = (row.nilai || []).find(
                (ni) => ni.kategoriIndikatorId === n.kategoriIndikatorId
              );
              if (!nilaiItem) return <span className="text-slate-300">—</span>;
              const val = nilaiItem.nilai;
              if (typeof val === "number") {
                return (
                  <span className="font-mono text-xs font-bold text-slate-700">
                    {val.toFixed(2)}
                  </span>
                );
              }
              const statusColors = {
                MAJU: "bg-emerald-50 text-emerald-700 border-emerald-200",
                BERKEMBANG: "bg-blue-50 text-blue-700 border-blue-200",
                TERTINGGAL: "bg-red-50 text-red-700 border-red-200",
                MANDIRI: "bg-purple-50 text-purple-700 border-purple-200",
                SANGAT_TERTINGGAL: "bg-orange-50 text-orange-700 border-orange-200",
              };
              const colorClass = statusColors[val?.toUpperCase()] || "bg-slate-50 text-slate-700 border-slate-200";
              return (
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${colorClass}`}>
                  {val}
                </span>
              );
            },
          });
        }
      });
    }

    return [...baseColumns, ...dynamicColumns, ...extraColumns];
  }, [dimensiDesaData, dimensiDesaPage, dimensiDesaSize]);

  return (
    <div className="w-full text-slate-800 animate-in fade-in duration-300">
      {/* ================= TAMPILAN 1: DAFTAR TAHUN DIMENSI ================= */}
      {!selectedTahun ? (
        <div>
          {/* Toolbar */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-[#2D7344] shrink-0 border border-emerald-100/50">
                <Award size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-800">
                  Dimensi & Indikator Desa
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  Atur skema kolom indikator dinamis per tahun sebelum mengupload nilai desa
                </p>
              </div>
            </div>
            {can('dimensi_desa:create') && (
              <button
                onClick={() => setModalTahunOpen(true)}
                className="flex items-center gap-2 bg-[#2D7344] hover:bg-[#1E5230] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all transform hover:-translate-y-0.5"
              >
                <Plus size={18} strokeWidth={2.5} /> Daftarkan Tahun
              </button>
            )}
          </div>

          {/* List Grid */}
          {loadingTahun ? (
            <div className="flex flex-col justify-center items-center py-24 bg-white rounded-2xl border border-slate-200 min-h-[300px]">
              <Loader2 className="animate-spin text-[#2D7344] mb-3" size={36} />
              <span className="text-slate-500 text-sm font-medium">
                Memuat tahun dimensi...
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tahunList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectTahun(item)}
                  className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-[#2D7344]/40 hover:shadow-md transition-all duration-300 cursor-pointer group flex justify-between items-center relative"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3.5 bg-emerald-50 rounded-2xl text-[#2D7344] border border-emerald-100/50 group-hover:bg-[#2D7344] group-hover:text-white transition-colors duration-300">
                      <Calendar size={22} strokeWidth={2.2} />
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-800">
                        Tahun {item.tahun}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        Atur skema & unggah excel
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    size={18}
                    className="text-slate-400 group-hover:translate-x-1 group-hover:text-[#2D7344] transition-all"
                  />
                </div>
              ))}

              {tahunList.length === 0 && (
                <div className="col-span-full bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center text-slate-400 font-medium">
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-400 mb-3">
                    <Info size={24} />
                  </div>
                  <h3>Belum Ada Tahun Dimensi</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Klik tombol "Daftarkan Tahun" di kanan atas untuk membuat skema tahun pertama.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        // ================= TAMPILAN 2: DETAIL SKEMA INDIKATOR & EXCEL =================
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Back & Title */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  const targetYear = selectedTahun?.tahun;
                  setSelectedTahun(null);
                  if (targetYear) {
                    navigate(`/dashboard/indikator/${targetYear}`);
                  } else {
                    navigate("/dashboard/indikator?tab=dimensi");
                  }
                }}
                className="p-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl transition-all cursor-pointer shadow-sm"
                title="Kembali"
              >
                <ArrowLeft size={18} strokeWidth={2.5} />
              </button>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-lg font-extrabold text-slate-800">
                    {dimensiDesaData?.dimensiDesa?.nama
                      ? `Dimensi ${dimensiDesaData.dimensiDesa.nama} — Tahun ${selectedTahun.tahun}`
                      : `Dimensi Desa — Tahun ${selectedTahun.tahun}`}
                  </h2>
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-[#2D7344] border border-emerald-100/50 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                    Skema Aktif
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  Konfigurasi kolom indikator dan lakukan import data Excel seluruh desa
                </p>
              </div>
            </div>

            {/* Action Files */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={handleDownloadTemplate}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer w-1/2 md:w-auto"
              >
                <Download size={14} strokeWidth={2.5} /> Template Excel
              </button>
              {can('dimensi_desa:import') && (
                <label className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#2D7344] hover:bg-[#1E5230] text-white rounded-xl text-xs font-bold cursor-pointer shadow-sm transition-all w-1/2 md:w-auto">
                  {uploadingExcel ? (
                    <>
                      <Loader2 className="animate-spin" size={14} /> Memproses...
                    </>
                  ) : (
                    <>
                      <Upload size={14} strokeWidth={2.5} /> Unggah Excel
                    </>
                  )}
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleUploadExcel}
                    className="hidden"
                    disabled={uploadingExcel}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Split Grid: Left (Schema List), Right (Add Form) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Kolom Kiri: Daftar Skema Indikator Terdaftar */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3.5 mb-4 flex items-center gap-2">
                <ListPlus size={16} className="text-[#2D7344]" />
                Struktur Kolom Indikator
              </h3>

              {loadingIndikator ? (
                <div className="flex justify-center items-center py-16">
                  <Loader2 className="animate-spin text-[#2D7344]" size={36} />
                </div>
              ) : (
                <div className="space-y-3">
                  {schemaIndikator.map((item, idx) => (
                    <div
                      key={item.kategoriIndikatorId || idx}
                      className="flex justify-between items-center p-4 bg-slate-50 border border-slate-200 rounded-xl group hover:border-[#2D7344]/30 hover:shadow-xs transition-all"
                    >
                      <div>
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-600 font-mono text-[9px] font-bold rounded uppercase border border-slate-300">
                          {item.kode}
                        </span>
                        <h4 className="font-extrabold text-slate-800 text-sm mt-1.5">
                          {item.nama}
                        </h4>
                      </div>
                      {can('dimensi_desa:delete') && (
                        <button
                          onClick={() =>
                            handleRemoveIndikator(item.kategoriIndikatorId, item.nama)
                          }
                          className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                          title="Hapus dari tahun ini"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}

                  {schemaIndikator.length === 0 && (
                    <div className="bg-slate-50/50 border border-dashed border-slate-250 rounded-xl p-12 text-center text-slate-400 text-xs font-semibold leading-relaxed">
                      <Info size={24} className="mx-auto mb-2 text-slate-350" />
                      Belum ada indikator terdaftar untuk skema tahun ini.<br />
                      Silakan daftarkan indikator dari dropdown menu di sebelah kanan.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Kolom Kanan: Tambah Kategori Indikator Baru — hanya tampil jika punya izin create */}
            {can('dimensi_desa:create') && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-fit">
                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3.5 mb-4 flex items-center gap-2">
                  <Plus size={16} className="text-[#2D7344]" />
                  Tambah Indikator
                </h3>
                <p className="text-xs text-slate-450 leading-relaxed mb-5 font-semibold">
                  Pilih kategori indikator dari daftar master untuk dimasukkan sebagai struktur data di tahun {selectedTahun.tahun}.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-2 uppercase tracking-wide">
                      Pilih Kategori Indikator
                    </label>
                    <select
                      value={selectedKategoriId}
                      onChange={(e) => setSelectedKategoriId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#2D7344] focus:ring-2 focus:ring-emerald-500/10 transition-all cursor-pointer"
                    >
                      <option value="">-- Pilih Indikator --</option>
                      {masterKategori
                        .filter(
                          (mk) =>
                            !schemaIndikator.some(
                              (si) => si.kategoriIndikatorId === mk.id
                            )
                        )
                        .map((mk) => (
                          <option key={mk.id} value={mk.id}>
                            {mk.nama} ({mk.kode})
                          </option>
                        ))}
                    </select>
                  </div>

                  <button
                    onClick={handleAddIndikator}
                    disabled={addingIndikator || !selectedKategoriId}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#2D7344] hover:bg-[#1E5230] text-white rounded-xl text-xs font-bold disabled:bg-slate-150 disabled:text-slate-400 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
                  >
                    {addingIndikator ? (
                      <>
                        <Loader2 className="animate-spin" size={14} /> Menyimpan...
                      </>
                    ) : (
                      <>
                        <Check size={14} strokeWidth={2.5} /> Daftarkan Indikator
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-100 text-[10px] text-slate-400 leading-relaxed flex gap-2 font-medium">
                  <HelpCircle size={28} className="text-slate-300 flex-shrink-0" />
                  <span>
                    <strong>Penting:</strong> Menambahkan/menghapus indikator akan mengubah susunan kolom di file template Excel secara otomatis di backend.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ================= SECTION 3: DATA TABLE DIMENSI DESA ================= */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mt-6">
            <div className="p-5 border-b border-slate-100 bg-slate-50/30 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Award size={16} className="text-[#2D7344]" />
                    {dimensiDesaData?.dimensiDesa?.nama
                      ? `Data Dimensi ${dimensiDesaData.dimensiDesa.nama} — Tahun ${selectedTahun.tahun}`
                      : `Data Dimensi Desa — Tahun ${selectedTahun.tahun}`}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    {dimensiDesaData?.pagination
                      ? `Menampilkan ${dimensiDesaData.items?.length || 0} dari ${dimensiDesaData.pagination.total} data`
                      : "Memuat data..."}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-500">Tampilkan:</label>
                  <select
                    value={dimensiDesaSize}
                    onChange={(e) => handleDimensiDesaSizeChange(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#2D7344] focus:ring-2 focus:ring-emerald-500/10 transition-all cursor-pointer"
                  >
                    {[5, 10, 25, 50, 100].map((s) => (
                      <option key={s} value={s}>
                        {s} data
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* FILTER BAR: Search, Provinsi, Kabupaten, Kecamatan */}
              <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 font-sans">
                {/* Search Input */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Cari desa, kecamatan, kabupaten, provinsi, atau kode..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#2D7344] focus:ring-2 focus:ring-emerald-500/10 transition-all"
                  />
                </div>

                {/* Dropdown Provinsi */}
                <select
                  value={selectedProvinsiId}
                  onChange={(e) => handleProvinsiChange(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#2D7344] focus:ring-2 focus:ring-emerald-500/10 transition-all cursor-pointer min-w-[150px]"
                >
                  <option value="">Semua Provinsi</option>
                  {provinsiList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name || p.nama || p.provinsi}
                    </option>
                  ))}
                </select>

                {/* Dropdown Kabupaten */}
                <select
                  value={selectedKabupatenId}
                  onChange={(e) => handleKabupatenChange(e.target.value)}
                  disabled={!selectedProvinsiId}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#2D7344] focus:ring-2 focus:ring-emerald-500/10 transition-all cursor-pointer min-w-[150px] disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  <option value="">Semua Kabupaten/Kota</option>
                  {kabupatenList.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.name || k.nama || k.kabupaten}
                    </option>
                  ))}
                </select>

                {/* Dropdown Kecamatan */}
                <select
                  value={selectedKecamatanId}
                  onChange={(e) => handleKecamatanChange(e.target.value)}
                  disabled={!selectedKabupatenId}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#2D7344] focus:ring-2 focus:ring-emerald-500/10 transition-all cursor-pointer min-w-[150px] disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  <option value="">Semua Kecamatan</option>
                  {kecamatanList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name || c.nama || c.kecamatan}
                    </option>
                  ))}
                </select>

                {/* Reset Filter Button */}
                {(searchQuery || selectedProvinsiId || selectedKabupatenId || selectedKecamatanId) && (
                  <button
                    type="button"
                    onClick={handleResetFilter}
                    className="px-3 py-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                    title="Reset Filter"
                  >
                    <X size={14} />
                    Reset
                  </button>
                )}
              </div>
            </div>

            <DataTable
              columns={dimensiDesaColumns}
              data={dimensiDesaData?.items || []}
              isLoading={loadingDimensiDesa}
              isError={errorDimensiDesa}
              emptyMessage="Belum ada data dimensi desa untuk tahun ini"
            />

            {/* Pagination */}
            {dimensiDesaData?.pagination && dimensiDesaData.pagination.totalPage > 1 && (
              <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row justify-between items-center gap-3">
                <p className="text-xs text-slate-500 font-medium">
                  Halaman <span className="font-bold text-slate-700">{dimensiDesaData.pagination.currentPage}</span> dari{" "}
                  <span className="font-bold text-slate-700">{dimensiDesaData.pagination.totalPage}</span>
                  {" "}• Total <span className="font-bold text-slate-700">{dimensiDesaData.pagination.total}</span> data
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleDimensiDesaPageChange(1)}
                    disabled={dimensiDesaData.pagination.currentPage <= 1}
                    className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    Awal
                  </button>
                  <button
                    onClick={() => handleDimensiDesaPageChange(dimensiDesaData.pagination.currentPage - 1)}
                    disabled={dimensiDesaData.pagination.currentPage <= 1}
                    className="p-1.5 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={14} strokeWidth={2.5} />
                  </button>

                  {/* Page number buttons */}
                  {(() => {
                    const current = dimensiDesaData.pagination.currentPage;
                    const total = dimensiDesaData.pagination.totalPage;
                    const pages = [];
                    let start = Math.max(1, current - 2);
                    let end = Math.min(total, current + 2);
                    if (current <= 3) end = Math.min(total, 5);
                    if (current >= total - 2) start = Math.max(1, total - 4);
                    for (let i = start; i <= end; i++) pages.push(i);
                    return pages.map((p) => (
                      <button
                        key={p}
                        onClick={() => handleDimensiDesaPageChange(p)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${p === current
                            ? "bg-[#2D7344] text-white border-[#2D7344] shadow-sm"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                          }`}
                      >
                        {p}
                      </button>
                    ));
                  })()}

                  <button
                    onClick={() => handleDimensiDesaPageChange(dimensiDesaData.pagination.currentPage + 1)}
                    disabled={dimensiDesaData.pagination.currentPage >= dimensiDesaData.pagination.totalPage}
                    className="p-1.5 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <ChevronRight size={14} strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={() => handleDimensiDesaPageChange(dimensiDesaData.pagination.totalPage)}
                    disabled={dimensiDesaData.pagination.currentPage >= dimensiDesaData.pagination.totalPage}
                    className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    Akhir
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Tambah Tahun Dimensi */}
      {modalTahunOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-lg font-extrabold text-slate-900 mb-4">
              Daftarkan Tahun Dimensi Baru
            </h2>
            <form onSubmit={handleCreateTahun} className="space-y-4">
              <div>
                <label className="block text-slate-700 text-xs font-bold mb-2 uppercase tracking-wide">
                  Tahun Dimensi
                </label>
                <input
                  type="number"
                  value={newTahun}
                  onChange={(e) => setNewTahun(e.target.value)}
                  placeholder="Contoh: 2026"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2D7344] focus:ring-2 focus:ring-emerald-500/10 transition-all font-medium text-slate-700"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalTahunOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#2D7344] hover:bg-[#1E5230] text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-emerald-800/10 cursor-pointer"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL CONFIRMATION DELETE INDICATOR */}
      {deleteKategori && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="h-1 bg-red-500" />
            <div className="p-6">
              <div className="flex items-center gap-3 text-red-500 mb-3 font-sans">
                <Trash2 size={24} />
                <h3 className="text-lg font-bold text-gray-800">Hapus Indikator</h3>
              </div>
              <p className="text-xs text-gray-500 font-semibold mb-6 font-sans">
                Apakah Anda yakin ingin menghapus indikator "{deleteKategori.nama}" dari skema tahun ini?
              </p>
              <div className="flex justify-end gap-3 font-sans">
                <button
                  type="button"
                  onClick={() => setDeleteKategori(null)}
                  className="px-4 py-2.5 text-xs font-bold text-gray-600 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmRemoveIndikator}
                  className="px-4 py-2.5 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
