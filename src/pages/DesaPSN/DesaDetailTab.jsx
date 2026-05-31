import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Download, Upload, Loader2, Info, Search, MapPin, CheckCircle, RotateCcw } from "lucide-react";
import { desaPsnService } from "../../services/master/desaPsnService";
import { masterWilayahService } from "../../services/master/masterWilayahService";
import { toast } from "sonner";
import Pagination from "../../components/Pagination";


const dummyDesas = [
  {
    id: "dummy-1",
    namaDesa: "Desa Aramiyah (Demo 2024 - 2030)",
    kodeDesa: "11.03.04.2019",
    kecamatan: "Birem Bayeun",
    kabupaten: "Aceh Timur",
    provinsi: "Aceh",
    indikatorDesa: [
      {
        id: "ind-2024",
        tahun: 2024,
        nilai: [
          { nama: "IDM (Status)", nilai: "BERKEMBANG" },
          { nama: "IDM (Nilai)", nilai: 0.6614 },
          { nama: "IKH (Indeks)", nilai: 0.7230 },
          { nama: "IPD (Perkembangan)", nilai: 64.50 },
          { nama: "Kemiskinan Ext", nilai: "2.14%" },
          { nama: "Gini Ratio", nilai: 0.28 },
          { nama: "Stunting", nilai: "14.2%" },
        ],
      },
      {
        id: "ind-2025",
        tahun: 2025,
        nilai: [
          { nama: "IDM (Status)", nilai: "MAJU" },
          { nama: "IDM (Nilai)", nilai: 0.7120 },
          { nama: "IKH (Indeks)", nilai: 0.7650 },
          { nama: "IPD (Perkembangan)", nilai: 68.20 },
          { nama: "Kemiskinan Ext", nilai: "1.80%" },
          { nama: "Gini Ratio", nilai: 0.27 },
          { nama: "Stunting", nilai: "12.5%" },
        ],
      },
      {
        id: "ind-2026",
        tahun: 2026,
        nilai: [
          { nama: "IDM (Status)", nilai: "MAJU" },
          { nama: "IDM (Nilai)", nilai: 0.7410 },
          { nama: "IKH (Indeks)", nilai: 0.7890 },
          { nama: "IPD (Perkembangan)", nilai: 71.10 },
          { nama: "Kemiskinan Ext", nilai: "1.45%" },
          { nama: "Gini Ratio", nilai: 0.26 },
          { nama: "Stunting", nilai: "10.8%" },
        ],
      },
      {
        id: "ind-2027",
        tahun: 2027,
        nilai: [
          { nama: "IDM (Status)", nilai: "MAJU" },
          { nama: "IDM (Nilai)", nilai: 0.7820 },
          { nama: "IKH (Indeks)", nilai: 0.8120 },
          { nama: "IPD (Perkembangan)", nilai: 74.80 },
          { nama: "Kemiskinan Ext", nilai: "1.10%" },
          { nama: "Gini Ratio", nilai: 0.25 },
          { nama: "Stunting", nilai: "9.2%" },
        ],
      },
      {
        id: "ind-2028",
        tahun: 2028,
        nilai: [
          { nama: "IDM (Status)", nilai: "MANDIRI" },
          { nama: "IDM (Nilai)", nilai: 0.8150 },
          { nama: "IKH (Indeks)", nilai: 0.8350 },
          { nama: "IPD (Perkembangan)", nilai: 78.40 },
          { nama: "Kemiskinan Ext", nilai: "0.85%" },
          { nama: "Gini Ratio", nilai: 0.24 },
          { nama: "Stunting", nilai: "7.9%" },
        ],
      },
      {
        id: "ind-2029",
        tahun: 2029,
        nilai: [
          { nama: "IDM (Status)", nilai: "MANDIRI" },
          { nama: "IDM (Nilai)", nilai: 0.8520 },
          { nama: "IKH (Indeks)", nilai: 0.8680 },
          { nama: "IPD (Perkembangan)", nilai: 82.30 },
          { nama: "Kemiskinan Ext", nilai: "0.50%" },
          { nama: "Gini Ratio", nilai: 0.23 },
          { nama: "Stunting", nilai: "6.5%" },
        ],
      },
      {
        id: "ind-2030",
        tahun: 2030,
        nilai: [
          { nama: "IDM (Status)", nilai: "MANDIRI" },
          { nama: "IDM (Nilai)", nilai: 0.8980 },
          { nama: "IKH (Indeks)", nilai: 0.9230 },
          { nama: "IPD (Perkembangan)", nilai: 88.50 },
          { nama: "Kemiskinan Ext", nilai: "0.20%" },
          { nama: "Gini Ratio", nilai: 0.22 },
          { nama: "Stunting", nilai: "4.8%" },
        ],
      },
    ],
  },
  {
    id: "dummy-2",
    namaDesa: "Desa Sukamaju (Demo 2024 - 2030)",
    kodeDesa: "32.04.11.2001",
    kecamatan: "Ciwidey",
    kabupaten: "Bandung",
    provinsi: "Jawa Barat",
    indikatorDesa: [
      {
        id: "ind-2-2024",
        tahun: 2024,
        nilai: [
          { nama: "IDM (Status)", nilai: "BERKEMBANG" },
          { nama: "IDM (Nilai)", nilai: 0.6420 },
          { nama: "IKH (Indeks)", nilai: 0.6980 },
          { nama: "Stunting", nilai: "18.4%" },
        ],
      },
      {
        id: "ind-2-2027",
        tahun: 2027,
        nilai: [
          { nama: "IDM (Status)", nilai: "MAJU" },
          { nama: "IDM (Nilai)", nilai: 0.7320 },
          { nama: "IKH (Indeks)", nilai: 0.7710 },
          { nama: "Stunting", nilai: "12.1%" },
        ],
      },
      {
        id: "ind-2-2030",
        tahun: 2030,
        nilai: [
          { nama: "IDM (Status)", nilai: "MANDIRI" },
          { nama: "IDM (Nilai)", nilai: 0.8250 },
          { nama: "IKH (Indeks)", nilai: 0.8640 },
          { nama: "Stunting", nilai: "6.2%" },
        ],
      },
    ],
  },
];

export default function DesaDetailTab({ periode, onBack }) {
  const [desas, setDesas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [useDummy, setUseDummy] = useState(false);
  const [activeViewTab, setActiveViewTab] = useState("cards"); // 'cards' | 'table'

  // Pagination states
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [paginate, setPaginate] = useState({
    total: 0,
    perPage: 10,
    currentPage: 1,
    totalPage: 1,
  });

  // Filter states
  const [filterProvinsi, setFilterProvinsi] = useState("");
  const [filterKabupaten, setFilterKabupaten] = useState("");
  const [filterKecamatan, setFilterKecamatan] = useState("");

  // Dropdown options lists
  const [listProvinsi, setListProvinsi] = useState([]);
  const [listKabupaten, setListKabupaten] = useState([]);
  const [listKecamatan, setListKecamatan] = useState([]);

  // Loading states for dropdowns
  const [loadingProvinsi, setLoadingProvinsi] = useState(false);
  const [loadingKabupaten, setLoadingKabupaten] = useState(false);
  const [loadingKecamatan, setLoadingKecamatan] = useState(false);

  const handleResetFilters = () => {
    setFilterProvinsi("");
    setFilterKabupaten("");
    setFilterKecamatan("");
    setSearchTerm("");
    setPage(1);
  };

  const getCleanFilters = useCallback(() => {
    const selectedProv = listProvinsi.find(p => String(p.id) === String(filterProvinsi));
    const selectedKab = listKabupaten.find(k => String(k.id) === String(filterKabupaten));
    const selectedKec = listKecamatan.find(k => String(k.id) === String(filterKecamatan));

    const cleanName = (name) => {
      if (!name) return null;
      return name.replace(/^(Kab\.|Kabupaten|Kota|Kec\.|Kecamatan)\s+/i, "");
    };

    return {
      provinsi: selectedProv ? (selectedProv.name || selectedProv.nama || selectedProv.provinsi) : null,
      kabupaten: selectedKab ? cleanName(selectedKab.name || selectedKab.nama || selectedKab.kabupaten) : null,
      kecamatan: selectedKec ? cleanName(selectedKec.name || selectedKec.nama || selectedKec.kecamatan) : null,
    };
  }, [filterProvinsi, filterKabupaten, filterKecamatan, listProvinsi, listKabupaten, listKecamatan]);

  const fetchDesas = useCallback(async () => {
    setLoading(true);
    try {
      const activeFilters = getCleanFilters();
      const response = await desaPsnService.getDesaByPeriode(periode.id, page, size, activeFilters);
      const dataObj = response?.data || response || {};
      const listData = dataObj.items || dataObj.data || (Array.isArray(dataObj) ? dataObj : []);
      const paginationData = dataObj.pagination || {
        total: listData.length,
        perPage: size,
        currentPage: page,
        totalPage: Math.ceil(listData.length / size) || 1,
      };
      setDesas(listData);
      setPaginate(paginationData);
    } catch (error) {
      console.error("Gagal mengambil data desa:", error);
      toast.error("Gagal memuat data desa");
    } finally {
      setLoading(false);
    }
  }, [periode?.id, page, size, getCleanFilters]);

  // Fetch provinces on mount
  useEffect(() => {
    const fetchProvinces = async () => {
      setLoadingProvinsi(true);
      try {
        const data = await masterWilayahService.getAllProvinsi();
        setListProvinsi(data || []);
      } catch (err) {
        console.error("Gagal memuat provinsi:", err);
      } finally {
        setLoadingProvinsi(false);
      }
    };
    fetchProvinces();
  }, []);

  // Fetch kabupaten when province changes
  useEffect(() => {
    setListKabupaten([]);
    setListKecamatan([]);
    setFilterKabupaten("");
    setFilterKecamatan("");

    if (!filterProvinsi) return;

    const fetchKabupatens = async () => {
      setLoadingKabupaten(true);
      try {
        const data = await masterWilayahService.getAllKabupaten(null, null, "", filterProvinsi);
        setListKabupaten(data || []);
      } catch (err) {
        console.error("Gagal memuat kabupaten:", err);
      } finally {
        setLoadingKabupaten(false);
      }
    };
    fetchKabupatens();
  }, [filterProvinsi]);

  // Fetch kecamatan when kabupaten changes
  useEffect(() => {
    setListKecamatan([]);
    setFilterKecamatan("");

    if (!filterKabupaten) return;

    const fetchKecamatans = async () => {
      setLoadingKecamatan(true);
      try {
        const data = await masterWilayahService.getAllKecamatan(null, null, "", filterKabupaten);
        setListKecamatan(data || []);
      } catch (err) {
        console.error("Gagal memuat kecamatan:", err);
      } finally {
        setLoadingKecamatan(false);
      }
    };
    fetchKecamatans();
  }, [filterKabupaten]);

  useEffect(() => {
    if (periode?.id && !useDummy) {
      fetchDesas();
    }
  }, [periode?.id, useDummy, fetchDesas]);

  useEffect(() => {
    if (useDummy) {
      setPaginate({
        total: dummyDesas.length,
        perPage: size,
        currentPage: 1,
        totalPage: Math.ceil(dummyDesas.length / size) || 1,
      });
    }
  }, [useDummy, size]);


  const handleDownloadTemplate = async () => {
    try {
      toast.loading("Mengunduh template...", { id: "dl-template" });
      const response = await desaPsnService.downloadTemplate();
      const blob = response.data || response;
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `template-import-desa-psn-${periode.tahun}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Template berhasil diunduh", { id: "dl-template" });
    } catch (error) {
      console.error("Gagal mengunduh template:", error);
      toast.error("Gagal mengunduh template Excel", { id: "dl-template" });
    }
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("psnPeriodeId", periode.id);

    setImporting(true);
    const toastId = toast.loading("Meng-import berkas Excel...");
    try {
      const response = await desaPsnService.importExcel(formData);
      toast.success(response.message || "Data Excel berhasil di-import!", { id: toastId });
      fetchDesas();
    } catch (error) {
      console.error("Gagal import:", error);
      toast.error(error.response?.data?.message || "Gagal meng-import file Excel", { id: toastId });
    } finally {
      setImporting(false);
      e.target.value = null;
    }
  };

  const activeList = useDummy ? dummyDesas : desas;
  const filteredDesas = activeList.filter((desa) => {
    // Search Term Filter
    const matchesSearch = !searchTerm ||
      desa.namaDesa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      desa.kodeDesa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      desa.kecamatan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      desa.kabupaten?.toLowerCase().includes(searchTerm.toLowerCase());

    if (useDummy) {
      // For dummy data, we also filter by province, kab, kec since they aren't filtered on backend
      const activeFilters = getCleanFilters();
      const matchesProv = !activeFilters.provinsi ||
        desa.provinsi?.toLowerCase().includes(activeFilters.provinsi.toLowerCase());
      const matchesKab = !activeFilters.kabupaten ||
        desa.kabupaten?.toLowerCase().includes(activeFilters.kabupaten.toLowerCase());
      const matchesKec = !activeFilters.kecamatan ||
        desa.kecamatan?.toLowerCase().includes(activeFilters.kecamatan.toLowerCase());

      return matchesSearch && matchesProv && matchesKab && matchesKec;
    }

    return matchesSearch;
  });


  return (
    <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8 custom-scrollbar">
      {/* Top Bar / Breadcrumb */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-5 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-3 bg-white hover:bg-slate-50 text-slate-600 rounded-xl border border-slate-200 shadow-sm transition-all duration-200 cursor-pointer"
            title="Kembali ke Daftar Periode"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-extrabold text-slate-900">Desa PSN</h1>
              <span className="px-3 py-1 bg-emerald-50 text-[#2D7344] font-bold rounded-full text-xs border border-emerald-100/50">
                Tahun {periode.tahun}
              </span>
            </div>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              Daftar desa penerima manfaat PSN periode {periode.tahun}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-bold border border-slate-200 transition-all text-xs cursor-pointer shadow-sm"
          >
            <Download size={15} strokeWidth={2.5} /> Template Excel
          </button>
          <label className="flex items-center gap-2 px-5 py-2.5 bg-[#2D7344] hover:bg-[#1E5230] text-white rounded-xl font-bold cursor-pointer shadow-sm shadow-emerald-800/10 transition-all text-xs">
            {importing ? (
              <>
                <Loader2 className="animate-spin" size={15} /> Meng-import...
              </>
            ) : (
              <>
                <Upload size={15} strokeWidth={2.5} /> Import Excel
              </>
            )}
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleImportExcel}
              className="hidden"
              disabled={importing}
            />
          </label>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="mb-6 flex flex-col xl:flex-row gap-4 items-stretch xl:items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full xl:w-72 group flex-shrink-0">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#2D7344] transition-colors"
            size={16}
          />
          <input
            type="text"
            placeholder="Cari nama desa, kode, atau kec..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2D7344] focus:ring-2 focus:ring-emerald-500/10 transition-all font-medium text-slate-700"
          />
        </div>

        {/* Region Filters */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
            {/* Provinsi */}
            <div className="relative">
              <select
                value={filterProvinsi}
                onChange={(e) => {
                  setFilterProvinsi(e.target.value);
                  setPage(1);
                }}
                disabled={loadingProvinsi}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2D7344] focus:ring-2 focus:ring-emerald-500/10 transition-all font-semibold text-slate-700 disabled:bg-slate-50 cursor-pointer"
              >
                <option value="">Semua Provinsi</option>
                {listProvinsi.map((prov) => (
                  <option key={prov.id} value={prov.id}>
                    {prov.name || prov.nama || prov.provinsi}
                  </option>
                ))}
              </select>
              {loadingProvinsi && (
                <span className="absolute right-8 top-1/2 -translate-y-1/2">
                  <Loader2 className="animate-spin text-slate-400" size={14} />
                </span>
              )}
            </div>

            {/* Kabupaten */}
            <div className="relative">
              <select
                value={filterKabupaten}
                onChange={(e) => {
                  setFilterKabupaten(e.target.value);
                  setPage(1);
                }}
                disabled={!filterProvinsi || loadingKabupaten}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2D7344] focus:ring-2 focus:ring-emerald-500/10 transition-all font-semibold text-slate-700 disabled:bg-slate-50 cursor-pointer disabled:cursor-not-allowed"
              >
                <option value="">Semua Kabupaten</option>
                {listKabupaten.map((kab) => (
                  <option key={kab.id} value={kab.id}>
                    {kab.name || kab.nama || kab.kabupaten}
                  </option>
                ))}
              </select>
              {loadingKabupaten && (
                <span className="absolute right-8 top-1/2 -translate-y-1/2">
                  <Loader2 className="animate-spin text-slate-400" size={14} />
                </span>
              )}
            </div>

            {/* Kecamatan */}
            <div className="relative">
              <select
                value={filterKecamatan}
                onChange={(e) => {
                  setFilterKecamatan(e.target.value);
                  setPage(1);
                }}
                disabled={!filterKabupaten || loadingKecamatan}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2D7344] focus:ring-2 focus:ring-emerald-500/10 transition-all font-semibold text-slate-700 disabled:bg-slate-50 cursor-pointer disabled:cursor-not-allowed"
              >
                <option value="">Semua Kecamatan</option>
                {listKecamatan.map((kec) => (
                  <option key={kec.id} value={kec.id}>
                    {kec.name || kec.nama || kec.kecamatan}
                  </option>
                ))}
              </select>
              {loadingKecamatan && (
                <span className="absolute right-8 top-1/2 -translate-y-1/2">
                  <Loader2 className="animate-spin text-slate-400" size={14} />
                </span>
              )}
            </div>
          </div>

          {/* Reset Button */}
          <button
            type="button"
            onClick={handleResetFilters}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-xl text-xs font-bold border border-slate-200 shadow-sm transition-all duration-200 cursor-pointer"
            title="Reset semua filter"
          >
            <RotateCcw size={14} strokeWidth={2.5} className="text-slate-500" />
            Reset
          </button>
        </div>

        <div className="shrink-0 text-slate-400 text-xs font-semibold xl:pl-4 xl:text-right xl:ml-auto">
          Menampilkan {filteredDesas.length} dari {useDummy ? dummyDesas.length : desas.length} Desa
        </div>
      </div>

      {/* VIEW TABS CONTROLLER */}
      <div className="flex p-1 bg-slate-100 rounded-xl w-max mb-6 border border-slate-200/50 shadow-inner-sm">
        <button
          type="button"
          onClick={() => setActiveViewTab("cards")}
          className={`px-5 py-2 text-xs font-bold rounded-lg transition-all duration-300 cursor-pointer ${activeViewTab === "cards"
            ? "bg-white text-[#2D7344] shadow-sm ring-1 ring-slate-900/5"
            : "text-slate-550 hover:text-slate-800 hover:bg-slate-200/30"
            }`}
        >
          Tampilan Kartu
        </button>
        <button
          type="button"
          onClick={() => setActiveViewTab("table")}
          className={`px-5 py-2 text-xs font-bold rounded-lg transition-all duration-300 cursor-pointer ${activeViewTab === "table"
            ? "bg-white text-[#2D7344] shadow-sm ring-1 ring-slate-900/5"
            : "text-slate-550 hover:text-slate-800 hover:bg-slate-200/30"
            }`}
        >
          Tabel Data
        </button>
      </div>


      {/* Table Data */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs font-bold tracking-wider">
                {activeViewTab === "cards" ? (
                  <>
                    <th className="py-4 px-6 w-1/3">Identitas & Wilayah Desa</th>
                    <th className="py-4 px-6 w-2/3">Dimensi & Nilai Indikator Desa</th>
                  </>
                ) : (
                  <>
                    <th className="py-4 px-6 w-36">Kode Kemendagri</th>
                    <th className="py-4 px-6 w-48">Nama Desa</th>
                    <th className="py-4 px-6 w-36">Provinsi</th>
                    <th className="py-4 px-6 w-36">Kabupaten/Kota</th>
                    <th className="py-4 px-6 w-36">Kecamatan</th>
                    <th className="py-4 px-6">Indikator Dimensi</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3].map((idx) => (
                <tr key={idx} className="animate-pulse border-b border-slate-100">
                  <td className="py-5 px-6">
                    <div className="h-6 bg-slate-200 rounded-lg w-2/3 mb-2.5"></div>
                    <div className="h-4 bg-slate-100 rounded-md w-1/3 mb-3"></div>
                    <div className="flex gap-2">
                      <div className="h-5 bg-slate-100 rounded-md w-20"></div>
                      <div className="h-5 bg-slate-100 rounded-md w-24"></div>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="h-8 bg-slate-100 border-b border-slate-100 flex items-center justify-between px-4">
                        <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                        <div className="h-4 bg-slate-200 rounded w-16"></div>
                      </div>
                      <div className="flex gap-3 p-4 overflow-hidden bg-slate-50/30">
                        {[1, 2, 3].map((s) => (
                          <div key={s} className="flex-shrink-0 bg-white border border-slate-150 rounded-xl p-3 flex flex-col items-center justify-center min-w-[140px]">
                            <div className="h-3 bg-slate-100 rounded w-16 mb-2"></div>
                            <div className="h-4 bg-slate-200 rounded w-12"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : activeViewTab === "cards" ? (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left min-w-[900px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs font-bold tracking-wider">
                  <th className="py-4 px-6 w-1/3">Identitas & Wilayah Desa</th>
                  <th className="py-4 px-6 w-2/3">Indikator Desa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredDesas.map((desa) => (
                  <tr key={desa.id} className="hover:bg-slate-50/30 transition-colors">
                    {/* Kolom A: Identitas Desa */}
                    <td className="py-5 px-6 align-top">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-900 font-extrabold text-base leading-tight">
                            {desa.namaDesa}
                          </span>
                        </div>
                        <span className="text-slate-400 text-xs font-mono font-medium tracking-tighter">
                          KODE KEMENDAGRI: {desa.kodeDesa}
                        </span>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50/80 text-[#2D7344] rounded-lg text-xs font-extrabold border border-emerald-100">
                            {desa.provinsi}
                          </span>
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-extrabold border border-slate-200">
                            Kab. {desa.kabupaten}
                          </span>
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-extrabold border border-slate-200">
                            <MapPin size={12} strokeWidth={2.5} />
                            Kec. {desa.kecamatan}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Kolom B: Split layout untuk Indikator */}
                    <td className="py-5 px-6 align-top">
                      {Array.isArray(desa.indikatorDesa) && desa.indikatorDesa.length > 0 ? (
                        <div className="flex flex-col gap-4">
                          {desa.indikatorDesa.map((indikator) => (
                            <div
                              key={indikator.id}
                              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-inner-sm"
                            >
                              {/* Baris Atas: Dimensi & Tahun */}
                              <div className="bg-slate-50/80 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                                  Dimensi Indikator
                                </span>
                                <span className="px-2.5 py-0.5 bg-emerald-50 text-[#2D7344] text-[10px] font-bold rounded-md border border-emerald-100/50">
                                  Tahun {indikator.tahun}
                                </span>
                              </div>

                              {/* Baris Bawah: Horizontal Scroll Container untuk data yang sangat panjang */}
                              <div className="flex gap-3 p-4 overflow-x-auto bg-slate-50/30 custom-scrollbar-horizontal">
                                {indikator.nilai && indikator.nilai.length > 0 ? (
                                  indikator.nilai.map((val, idx) => (
                                    <div
                                      key={idx}
                                      className="flex-shrink-0 bg-white border border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-xs min-w-[140px] hover:border-[#2D7344]/30 hover:shadow-sm transition-all"
                                    >
                                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight block truncate max-w-[125px]" title={val.nama || val.kode}>
                                        {val.nama || val.kode}
                                      </span>
                                      <span className="mt-1.5 text-xs font-extrabold text-slate-800 break-all">
                                        {typeof val.nilai === "number"
                                          ? val.nilai.toLocaleString("id-ID", {
                                            minimumFractionDigits: 4,
                                          })
                                          : val.nilai}
                                      </span>
                                    </div>
                                  ))
                                ) : (
                                  <div className="p-3 w-full text-center text-xs text-slate-400 italic">
                                    Tidak ada nilai indikator
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : typeof desa.indikatorDesa === "string" ? (
                        <div className="flex items-center gap-2 p-4 bg-amber-50/50 border border-dashed border-amber-200 rounded-xl text-amber-700 text-xs font-semibold">
                          <Info size={14} className="text-amber-500 shrink-0" />
                          <span>{desa.indikatorDesa}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 p-4 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs font-semibold">
                          <Info size={14} className="text-slate-400 shrink-0" />
                          <span>Dimensi Desa belum diunggah untuk desa ini.</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}

                {filteredDesas.length === 0 && (
                  <tr>
                    <td colSpan="2" className="py-12 text-center text-slate-400">
                      <div className="max-w-sm mx-auto flex flex-col items-center">
                        <Info size={24} className="mb-2 text-slate-300" />
                        <span className="text-sm font-semibold text-slate-500">
                          {desas.length === 0
                            ? "Belum ada desa yang terdaftar untuk periode ini."
                            : "Hasil pencarian tidak ditemukan."}
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-slate-300 text-left min-w-[1100px]">
              <thead>
                <tr className="bg-slate-100 text-slate-700 uppercase text-xs font-bold tracking-wider">
                  <th rowSpan="2" className="border border-slate-300 py-2.5 px-4 w-40 text-[11px] font-extrabold uppercase text-center align-middle">Kode Kemendagri</th>
                  <th rowSpan="2" className="border border-slate-300 py-2.5 px-4 w-48 text-[11px] font-extrabold uppercase text-center align-middle">Nama Desa</th>
                  <th rowSpan="2" className="border border-slate-300 py-2.5 px-4 w-40 text-[11px] font-extrabold uppercase text-center align-middle">Provinsi</th>
                  <th rowSpan="2" className="border border-slate-300 py-2.5 px-4 w-44 text-[11px] font-extrabold uppercase text-center align-middle">Kabupaten/Kota</th>
                  <th rowSpan="2" className="border border-slate-300 py-2.5 px-4 w-44 text-[11px] font-extrabold uppercase text-center align-middle">Kecamatan</th>
                  <th colSpan="3" className="border border-slate-300 py-2 px-4 text-[11px] font-extrabold uppercase text-center">Indikator Dimensi</th>
                </tr>
                <tr className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
                  <th className="border border-slate-300 py-1.5 px-3 w-24 text-center">Tahun</th>
                  <th className="border border-slate-300 py-1.5 px-3">Nama Indikator</th>
                  <th className="border border-slate-300 py-1.5 px-3 w-36">Nilai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {filteredDesas.flatMap((desa) => {
                  const years = Array.isArray(desa.indikatorDesa) ? desa.indikatorDesa : [];
                  
                  if (years.length === 0) {
                    return [
                      <tr key={`${desa.id}-empty`} className="hover:bg-slate-50/50">
                        <td className="border border-slate-300 py-2.5 px-4 font-mono text-xs font-bold text-slate-500 bg-slate-50/20 align-middle">
                          {desa.kodeDesa}
                        </td>
                        <td className="border border-slate-300 py-2.5 px-4 text-slate-900 font-extrabold text-sm align-middle">
                          {desa.namaDesa}
                        </td>
                        <td className="border border-slate-300 py-2.5 px-4 text-slate-700 font-bold text-xs align-middle">
                          {desa.provinsi}
                        </td>
                        <td className="border border-slate-300 py-2.5 px-4 text-slate-700 font-bold text-xs align-middle">
                          {desa.kabupaten}
                        </td>
                        <td className="border border-slate-300 py-2.5 px-4 text-slate-700 font-bold text-xs align-middle">
                          {desa.kecamatan}
                        </td>
                        <td className="border border-slate-300 py-2.5 px-4 text-center text-slate-400 italic bg-white align-middle" colSpan="3">
                          Belum ada data indikator dimensi untuk desa ini.
                        </td>
                      </tr>
                    ];
                  }

                  const totalRows = years.reduce((acc, yr) => {
                    const vals = Array.isArray(yr.nilai) ? yr.nilai : [];
                    return acc + (vals.length || 1);
                  }, 0);

                  const rows = [];
                  let desaRendered = false;

                  years.forEach((indikator) => {
                    const nilaiArray = Array.isArray(indikator.nilai) ? indikator.nilai : [];
                    
                    if (nilaiArray.length === 0) {
                      rows.push({
                        indikator,
                        val: null,
                        isFirstOfYear: true,
                        yearSpan: 1,
                        isFirstOfDesa: !desaRendered,
                        totalRows
                      });
                      desaRendered = true;
                      return;
                    }

                    nilaiArray.forEach((val, idx) => {
                      rows.push({
                        indikator,
                        val,
                        isFirstOfYear: idx === 0,
                        yearSpan: nilaiArray.length,
                        isFirstOfDesa: !desaRendered,
                        totalRows
                      });
                      desaRendered = true;
                    });
                  });

                  return rows.map((item, rowIndex) => (
                    <tr key={`${desa.id}-${item.indikator.tahun}-${rowIndex}`} className="hover:bg-slate-50/50 transition-colors">
                      {item.isFirstOfDesa && (
                        <>
                          <td rowSpan={item.totalRows} className="border border-slate-300 py-2.5 px-4 font-mono text-xs font-bold text-slate-500 bg-slate-50/20 align-middle">
                            {desa.kodeDesa}
                          </td>
                          <td rowSpan={item.totalRows} className="border border-slate-300 py-2.5 px-4 text-slate-900 font-extrabold text-sm align-middle">
                            {desa.namaDesa}
                          </td>
                          <td rowSpan={item.totalRows} className="border border-slate-300 py-2.5 px-4 text-slate-700 font-bold text-xs align-middle">
                            {desa.provinsi}
                          </td>
                          <td rowSpan={item.totalRows} className="border border-slate-300 py-2.5 px-4 text-slate-700 font-bold text-xs align-middle">
                            {desa.kabupaten}
                          </td>
                          <td rowSpan={item.totalRows} className="border border-slate-300 py-2.5 px-4 text-slate-700 font-bold text-xs align-middle">
                            {desa.kecamatan}
                          </td>
                        </>
                      )}

                      {item.isFirstOfYear && (
                        <td 
                          rowSpan={item.yearSpan} 
                          className="border border-slate-300 px-3 py-2 font-extrabold text-slate-900 bg-slate-50 text-center align-middle w-24 border-b border-slate-200"
                        >
                          <span className="inline-flex items-center px-2 py-0.5 bg-emerald-50 text-[#2D7344] text-[10px] font-extrabold rounded border border-emerald-250">
                            Tahun {item.indikator.tahun}
                          </span>
                        </td>
                      )}

                      {item.val ? (
                        <>
                          <td className="border border-slate-300 px-3 py-1.5 text-slate-600 font-semibold align-middle border-b border-slate-255">
                            {item.val.nama || item.val.kode}
                          </td>
                          <td className="border border-slate-300 px-3 py-1.5 text-slate-900 font-extrabold align-middle w-36 border-b border-slate-255">
                            {typeof item.val.nilai === "number"
                              ? item.val.nilai.toLocaleString("id-ID", { minimumFractionDigits: 4 })
                              : item.val.nilai}
                          </td>
                        </>
                      ) : (
                        <td colSpan="2" className="border border-slate-300 px-3 py-2 text-slate-400 italic bg-white text-center align-middle border-b border-slate-255">
                          Tidak ada nilai indikator
                        </td>
                      )}
                    </tr>
                  ));
                })}

                {filteredDesas.length === 0 && (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-slate-400 border border-slate-300 bg-white">
                      <div className="max-w-sm mx-auto flex flex-col items-center">
                        <Info size={24} className="mb-2 text-slate-300" />
                        <span className="text-sm font-semibold text-slate-500">
                          {desas.length === 0
                            ? "Belum ada desa yang terdaftar untuk periode ini."
                            : "Hasil pencarian tidak ditemukan."}
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PAGINATION */}
      {!loading && filteredDesas.length > 0 && (
        <Pagination
          currentPage={paginate.currentPage}
          totalPage={paginate.totalPage}
          perPage={paginate.perPage}
          total={paginate.total}
          onPageChange={setPage}
          onSizeChange={setSize}
        />
      )}
      {/* Style tag khusus untuk custom scrollbar horizontal tipis */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .custom-scrollbar-horizontal::-webkit-scrollbar {
              height: 5px;
            }
            .custom-scrollbar-horizontal::-webkit-scrollbar-track {
              background: transparent;
            }
            .custom-scrollbar-horizontal::-webkit-scrollbar-thumb {
              background: #CBD5E1;
              border-radius: 10px;
            }
            .custom-scrollbar-horizontal:hover::-webkit-scrollbar-thumb {
              background: #94A3B8;
            }
          `,
        }}
      />
    </div>
  );
}
