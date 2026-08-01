import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import HomeLayout from "../../components/HomeLayout";
import { analystSpatialService } from "../../services/master/analystSpatialService";
import { masterWilayahService } from "../../services/master/masterWilayahService";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  MapPin,
  Layers,
  TreePine,
  Compass,
  LandPlot,
  Loader2,
  RefreshCw,
  Search,
  Database,
  ArrowUpDown,
  Table,
  BarChart3,
  PieChart as PieChartIcon,
  Globe,
  Cpu,
  Home,
  Leaf
} from "lucide-react";


export default function Infografis() {
  // ── States for Dynamic Filters ──
  const [selectedProvinsiId, setSelectedProvinsiId] = useState("");
  const [selectedProvinsiName, setSelectedProvinsiName] = useState("");

  const [selectedKabupatenId, setSelectedKabupatenId] = useState("");
  const [selectedKabupatenName, setSelectedKabupatenName] = useState("");

  const [selectedKecamatanId, setSelectedKecamatanId] = useState("");
  const [selectedKecamatanName, setSelectedKecamatanName] = useState("");

  const [selectedTipeAdministrasi, setSelectedTipeAdministrasi] = useState("");

  const labelTipeAdmin = selectedTipeAdministrasi === "Kelurahan" ? "Kelurahan" : selectedTipeAdministrasi === "Desa" ? "Desa" : "Desa / Kelurahan";

  // Table pagination & search state
  const [tableSearch, setTableSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Chart configuration state
  const [showAllFunctions, setShowAllFunctions] = useState(false);

  // ── Dynamic Dropdowns Data Fetching (Public APIs) ──

  // 1. Fetch Provinces
  const { data: provincesRes, isLoading: isLoadingProvinces } = useQuery({
    queryKey: ["provinces-public-infografis"],
    queryFn: async () => {
      const data = await masterWilayahService.getAllProvinsiPublic();
      return data || [];
    },
    retry: 1,
  });
  const provinces = Array.isArray(provincesRes) ? provincesRes : [];

  // 2. Fetch Kabupatens
  const { data: kabupatensRes, isLoading: isLoadingKabupatens } = useQuery({
    queryKey: ["kabupatens-public-infografis", selectedProvinsiId],
    queryFn: async () => {
      const data = await masterWilayahService.getAllKabupatenPublic(null, null, "", selectedProvinsiId);
      return data || [];
    },
    enabled: !!selectedProvinsiId,
    retry: 1,
  });
  const kabupatens = Array.isArray(kabupatensRes) ? kabupatensRes : [];

  // 3. Fetch Kecamatans
  const { data: kecamatansRes, isLoading: isLoadingKecamatans } = useQuery({
    queryKey: ["kecamatans-public-infografis", selectedKabupatenId],
    queryFn: async () => {
      const data = await masterWilayahService.getAllKecamatanPublic(null, null, "", selectedKabupatenId);
      return data || [];
    },
    enabled: !!selectedKabupatenId,
    retry: 1,
  });
  const kecamatans = Array.isArray(kecamatansRes) ? kecamatansRes : [];

  // Reset child selectors when parent selector changes
  useEffect(() => {
    if (!selectedProvinsiId) {
      setSelectedProvinsiName("");
      setSelectedKabupatenId("");
      setSelectedKabupatenName("");
      setSelectedKecamatanId("");
      setSelectedKecamatanName("");
    }
  }, [selectedProvinsiId]);

  useEffect(() => {
    if (!selectedKabupatenId) {
      setSelectedKabupatenName("");
      setSelectedKecamatanId("");
      setSelectedKecamatanName("");
    }
  }, [selectedKabupatenId]);

  useEffect(() => {
    if (!selectedKecamatanId) {
      setSelectedKecamatanName("");
    }
  }, [selectedKecamatanId]);

  // Handle Dropdown changes & store names (which is needed for the infographics API)
  const handleProvinsiChange = (e) => {
    const id = e.target.value;
    setSelectedProvinsiId(id);
    if (id) {
      const provObj = provinces.find((p) => String(p.id) === String(id));
      setSelectedProvinsiName(provObj?.name || provObj?.nama || provObj?.provinsi || "");
    } else {
      setSelectedProvinsiName("");
    }
    // reset downstream
    setSelectedKabupatenId("");
    setSelectedKabupatenName("");
    setSelectedKecamatanId("");
    setSelectedKecamatanName("");
    setCurrentPage(1);
  };

  const handleKabupatenChange = (e) => {
    const id = e.target.value;
    setSelectedKabupatenId(id);
    if (id) {
      const kabObj = kabupatens.find((k) => String(k.id) === String(id));
      setSelectedKabupatenName(kabObj?.name || kabObj?.nama || kabObj?.kabupaten || "");
    } else {
      setSelectedKabupatenName("");
    }
    // reset downstream
    setSelectedKecamatanId("");
    setSelectedKecamatanName("");
    setCurrentPage(1);
  };

  const handleKecamatanChange = (e) => {
    const id = e.target.value;
    setSelectedKecamatanId(id);
    if (id) {
      const kecObj = kecamatans.find((kc) => String(kc.id) === String(id));
      setSelectedKecamatanName(kecObj?.name || kecObj?.nama || kecObj?.kecamatan || "");
    } else {
      setSelectedKecamatanName("");
    }
    setCurrentPage(1);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedProvinsiId("");
    setSelectedProvinsiName("");
    setSelectedKabupatenId("");
    setSelectedKabupatenName("");
    setSelectedKecamatanId("");
    setSelectedKecamatanName("");
    setSelectedTipeAdministrasi("");
    setTableSearch("");
    setCurrentPage(1);
  };

  // ── Fetch Main Infographics Data via useQuery ──
  const {
    data: infoData,
    isLoading: isLoadingInfo,
    isError: isErrorInfo,
    refetch: refetchInfo,
  } = useQuery({
    queryKey: [
      "public-infografis-data",
      selectedProvinsiName,
      selectedKabupatenName,
      selectedKecamatanName,
      selectedTipeAdministrasi,
    ],
    queryFn: async () => {
      const data = await analystSpatialService.getInfografisPublic({
        provinsi: selectedProvinsiName,
        kabupaten: selectedKabupatenName,
        kecamatan: selectedKecamatanName,
        tipe_administrasi: selectedTipeAdministrasi,
      });
      return data;
    },
    keepPreviousData: true,
    retry: 2,
  });

  // Numbers formatter helpers
  const formatNumber = (num) => {
    if (num === null || num === undefined) return "0";
    return new Intl.NumberFormat("id-ID").format(num);
  };

  const formatHa = (num) => {
    if (num === null || num === undefined) return "0 Ha";
    return new Intl.NumberFormat("id-ID", {
      maximumFractionDigits: 2,
    }).format(num) + " Ha";
  };

  // Calculate percentages safely
  const getPercentage = (partial, total) => {
    if (!total) return "0%";
    const pct = (partial / total) * 100;
    return pct.toFixed(1) + "%";
  };

  // Extract variables safely with defaults
  const totalDesa = infoData?.total_desa || 0;
  const totalDesaBeririsan = infoData?.total_desa_beririsan || 0;
  const totalDesaDalam = infoData?.total_desa_dalam || 0;
  const totalDesaBeririsanSebagian = infoData?.total_desa_beririsan_sebagian || 0;
  const totalDesaHutan = infoData?.total_desa_hutan ?? (totalDesaDalam + totalDesaBeririsanSebagian);
  const totalDesaLuar = infoData?.total_desa_luar_kawasan || 0;

  const totalLuasDesa = infoData?.total_luas_desa_ha || 0;
  const totalLuasHutan = infoData?.total_luas_hutan_ha || 0;
  const totalLuasIrisan = infoData?.total_luas_irisan_ha || 0;

  const rawDesaPerFungsi = infoData?.desa_per_fungsi_kawasan_hutan || [];

  // Filter and compute table/chart breakdown lists
  const processedFungsiKawasan = useMemo(() => {
    return rawDesaPerFungsi.map((item) => ({
      name: item.fungsi_kawasan_hutan || "Tidak Terdefinisi",
      total: item.total_desa || 0,
      dalam: item.total_desa_dalam || 0,
      beririsan: item.total_desa_beririsan || 0,
    }));
  }, [rawDesaPerFungsi]);

  // Chart data formatting: limit to top functions or group them
  const chartData = useMemo(() => {
    if (showAllFunctions || processedFungsiKawasan.length <= 8) {
      return processedFungsiKawasan;
    }
    // Take top 7 and group the rest
    const top7 = processedFungsiKawasan.slice(0, 7);
    const rest = processedFungsiKawasan.slice(7);
    const otherTotal = rest.reduce((sum, item) => sum + item.total, 0);
    const otherDalam = rest.reduce((sum, item) => sum + item.dalam, 0);
    const otherBeririsan = rest.reduce((sum, item) => sum + item.beririsan, 0);

    return [
      ...top7,
      {
        name: "Lain-lain",
        total: otherTotal,
        dalam: otherDalam,
        beririsan: otherBeririsan,
      },
    ];
  }, [processedFungsiKawasan, showAllFunctions]);

  // Pie chart data
  const pieData = useMemo(() => {
    return [
      { name: "Dalam Kawasan Hutan", value: totalDesaDalam, color: "#0B6E48" },
      { name: "Beririsan Sebagian", value: totalDesaBeririsanSebagian, color: "#E5B82A" },
      { name: "Luar Kawasan Hutan", value: totalDesaLuar, color: "#6C757D" },
    ].filter((item) => item.value > 0);
  }, [totalDesaDalam, totalDesaBeririsanSebagian, totalDesaLuar]);

  // Filter and Paginate detailed breakdown table data
  const filteredTableData = useMemo(() => {
    if (!tableSearch.trim()) return processedFungsiKawasan;
    return processedFungsiKawasan.filter((item) =>
      item.name.toLowerCase().includes(tableSearch.toLowerCase())
    );
  }, [processedFungsiKawasan, tableSearch]);

  const totalPages = Math.ceil(filteredTableData.length / itemsPerPage) || 1;
  const paginatedTableData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTableData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTableData, currentPage]);

  return (
    <HomeLayout>
      <div className="bg-[#FAFBFC] font-sans text-gray-800 min-h-screen">
        {/* Banner Hero */}
        <section className="bg-gradient-to-r from-[#0B8457] via-[#0B6E48] to-[#0B5C3C] py-16 px-6 text-white text-center relative overflow-hidden shadow-inner">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
            <div className="absolute -top-[50%] -left-[20%] w-[80%] h-[150%] bg-white rounded-full blur-3xl"></div>
          </div>
          <div className="max-w-4xl mx-auto z-10 relative">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 animate-fade-in">
              Infografis & Statistik Wilayah Desa Hutan
            </h1>
            <p className="text-sm sm:text-base text-green-100 max-w-2xl mx-auto leading-relaxed">
              Analisis spasial wilayah administrasi desa hutan.
            </p>
          </div>
        </section>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 -mt-10">

          {/* Section: Filters Panel */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] p-6 mb-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
              <div className="w-10 h-10 rounded-2xl bg-green-50 flex items-center justify-center text-[#0B8457] shrink-0 shadow-inner">
                <MapPin size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 tracking-tight">Filter Infografis Desa Hutan</h2>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Pilih wilayah untuk memfilter data infografis</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              {/* Provinsi */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Provinsi</label>
                <div className="relative">
                  <select
                    value={selectedProvinsiId}
                    onChange={handleProvinsiChange}
                    disabled={isLoadingProvinces}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 font-medium focus:bg-white focus:outline-none focus:border-[#0B8457] focus:ring-4 focus:ring-green-500/10 transition-all cursor-pointer disabled:bg-gray-100 disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    <option value="">{isLoadingProvinces ? "Memuat Provinsi..." : "-- Pilih Provinsi --"}</option>
                    {provinces.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name || p.nama || p.provinsi}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Kabupaten */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Kabupaten/Kota</label>
                <div className="relative">
                  <select
                    value={selectedKabupatenId}
                    onChange={handleKabupatenChange}
                    disabled={!selectedProvinsiId || isLoadingKabupatens}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 font-medium focus:bg-white focus:outline-none focus:border-[#0B8457] focus:ring-4 focus:ring-green-500/10 transition-all cursor-pointer disabled:bg-gray-100 disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {isLoadingKabupatens
                        ? "Memuat Kabupaten..."
                        : !selectedProvinsiId
                        ? "Pilih Provinsi Terlebih Dahulu"
                        : "-- Pilih Kabupaten --"}
                    </option>
                    {kabupatens.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.name || k.nama || k.kabupaten}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Kecamatan */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Kecamatan</label>
                <div className="relative">
                  <select
                    value={selectedKecamatanId}
                    onChange={handleKecamatanChange}
                    disabled={!selectedKabupatenId || isLoadingKecamatans}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 font-medium focus:bg-white focus:outline-none focus:border-[#0B8457] focus:ring-4 focus:ring-green-500/10 transition-all cursor-pointer disabled:bg-gray-100 disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {isLoadingKecamatans
                        ? "Memuat Kecamatan..."
                        : !selectedKabupatenId
                        ? "Pilih Kabupaten Terlebih Dahulu"
                        : "-- Pilih Kecamatan --"}
                    </option>
                    {kecamatans.map((kc) => (
                      <option key={kc.id} value={kc.id}>
                        {kc.name || kc.nama || kc.kecamatan}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tipe Administrasi */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Tipe Administrasi</label>
                <div className="relative">
                  <select
                    value={selectedTipeAdministrasi}
                    onChange={(e) => {
                      setSelectedTipeAdministrasi(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 font-medium focus:bg-white focus:outline-none focus:border-[#0B8457] focus:ring-4 focus:ring-green-500/10 transition-all cursor-pointer"
                  >
                    <option value="">Semua Tipe</option>
                    <option value="Desa">Desa</option>
                    <option value="Kelurahan">Kelurahan</option>
                  </select>
                </div>
              </div>

              {/* Reset Action */}
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-full flex items-center justify-center gap-2 text-[#0B8457] bg-green-50 hover:bg-green-100 border border-green-200/50 text-sm font-bold py-3 px-4 rounded-xl transition-all active:scale-95 cursor-pointer h-[46px]"
              >
                <RefreshCw size={16} />
                Reset Filter
              </button>
            </div>

            {/* Filter Badge Display */}
            {(selectedProvinsiName || selectedKabupatenName || selectedKecamatanName || selectedTipeAdministrasi) && (
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-gray-50 text-xs">
                <span className="text-gray-400 font-medium">Filter Aktif:</span>
                {selectedProvinsiName && (
                  <span className="bg-green-50 text-[#0B8457] px-2.5 py-1 rounded-lg font-bold border border-green-100">
                    Provinsi: {selectedProvinsiName}
                  </span>
                )}
                {selectedKabupatenName && (
                  <span className="bg-green-50 text-[#0B8457] px-2.5 py-1 rounded-lg font-bold border border-green-100">
                    Kabupaten: {selectedKabupatenName}
                  </span>
                )}
                {selectedKecamatanName && (
                  <span className="bg-green-50 text-[#0B8457] px-2.5 py-1 rounded-lg font-bold border border-green-100">
                    Kecamatan: {selectedKecamatanName}
                  </span>
                )}
                {selectedTipeAdministrasi && (
                  <span className="bg-green-50 text-[#0B8457] px-2.5 py-1 rounded-lg font-bold border border-green-100">
                    Tipe: {selectedTipeAdministrasi}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Loading / Error Handle States for Main Statistics */}
          {isLoadingInfo ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] mb-8">
              <Loader2 size={48} className="text-[#0B8457] animate-spin mb-4" />
              <p className="text-gray-500 font-semibold text-sm">Mengambil Data Statistik Spasial...</p>
            </div>
          ) : isErrorInfo ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-red-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] text-center px-6 mb-8">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-4">
                <RefreshCw size={28} className="animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Gagal Memuat Data</h3>
              <p className="text-sm text-gray-500 max-w-md mb-6">
                Terjadi kendala saat menghubungi server data. Silakan periksa koneksi internet Anda atau coba lagi.
              </p>
              <button
                onClick={() => refetchInfo()}
                className="bg-[#0B8457] hover:bg-[#0B6E48] text-white text-sm font-bold py-2.5 px-6 rounded-xl transition-all shadow-md active:scale-95"
              >
                Coba Lagi
              </button>
            </div>
          ) : (
            <>
              {/* Section: Summary Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* 1. Total Desa / Kelurahan */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-[#0284c7]"></div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total {labelTipeAdmin}</p>
                      <h3 className="text-3xl font-extrabold text-gray-900">{formatNumber(totalDesa)}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#0284c7] flex items-center justify-center">
                      <Home size={22} strokeWidth={2.5} />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 font-medium">Seluruh {labelTipeAdmin.toLowerCase()} di wilayah terfilter</p>
                </div>

                {/* 2. Total Desa Hutan (Terdapat Kawasan Hutan) */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-[#d97706]"></div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total {labelTipeAdmin} Terdapat Kawasan Hutan</p>
                      <h3 className="text-3xl font-extrabold text-gray-900">{formatNumber(totalDesaHutan)}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#d97706] flex items-center justify-center">
                      <TreePine size={22} strokeWidth={2.5} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold px-3 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200/50">
                      {getPercentage(totalDesaHutan, totalDesa)} dari total {labelTipeAdmin.toLowerCase()}
                    </span>
                  </div>
                </div>

                {/* 3. Total Desa Tidak Memiliki Kawasan Hutan */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-[#059669]"></div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{labelTipeAdmin} Tidak Terdapat Kawasan Hutan</p>
                      <h3 className="text-3xl font-extrabold text-gray-900">{formatNumber(totalDesaLuar)}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#059669] flex items-center justify-center">
                      <Leaf size={22} strokeWidth={2.5} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                      {getPercentage(totalDesaLuar, totalDesa)} dari total {labelTipeAdmin.toLowerCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section: Acreage & Land Overlap Statistics */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] p-6 mb-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
                  <div className="w-10 h-10 rounded-2xl bg-green-50 flex items-center justify-center text-[#0B8457] shrink-0 shadow-inner">
                    <LandPlot size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 tracking-tight">Ringkasan Luas Wilayah</h2>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Statistik Luas Desa Hutan</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {/* Luas Desa */}
                  <div className="bg-[#FAFBFC] rounded-2xl p-5 border border-gray-100">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Total Luas Administrasi Desa</span>
                    <span className="text-2xl font-extrabold text-gray-900 block">{formatHa(totalLuasDesa)}</span>
                    <span className="text-xs text-gray-400 mt-2 block font-medium">Berdasarkan total luas wilayah desa terdaftar</span>
                  </div>

                  {/* Luas Hutan */}
                  <div className="bg-[#FAFBFC] rounded-2xl p-5 border border-gray-100">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Total Luas Kawasan Hutan</span>
                    <span className="text-2xl font-extrabold text-gray-900 block">{formatHa(totalLuasHutan)}</span>
                    <span className="text-xs text-gray-400 mt-2 block font-medium">Luas total spasial kawasan hutan</span>
                  </div>

                  {/* Luas Irisan */}
                  <div className="bg-[#FAFBFC] rounded-2xl p-5 border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full -mr-8 -mt-8 pointer-events-none"></div>
                    <span className="text-xs font-bold text-[#0B8457] uppercase tracking-wider block mb-1">Luas Irisan </span>
                    <span className="text-2xl font-extrabold text-[#0B8457] block">{formatHa(totalLuasIrisan)}</span>
                    <span className="text-xs text-gray-400 mt-2 block font-medium">Luas wilayah desa yang terdapat kawasan hutan</span>
                  </div>
                </div>

                {/* Overlap Progress Bar Visualizer */}
                {totalLuasDesa > 0 && (
                  <div className="bg-green-50/30 rounded-2xl p-5 border border-green-100/30">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <span className="text-sm font-bold text-gray-700">Rasio Luas Kawasan Hutan Terhadap Wilayah Administrasi Desa</span>
                      <span className="text-sm font-black text-[#0B8457]">
                        {((totalLuasIrisan / totalLuasDesa) * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                      <div
                        className="bg-gradient-to-r from-[#E5B82A] to-[#0B8457] h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${Math.min(((totalLuasIrisan / totalLuasDesa) * 100), 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-3 leading-relaxed font-semibold">
                      Analisis spasial menunjukkan bahwa sekitar <span className="text-[#0B8457] font-extrabold">{((totalLuasIrisan / totalLuasDesa) * 100).toFixed(2)}%</span> dari seluruh wilayah administrasi desa merupakan kawasan hutan.
                    </p>
                  </div>
                )}
              </div>



              {/* Section: Detailed Table */}


              {/* Section: Sumber Data & Metode Pengolahan Spasial */}
              <div className="mt-8 bg-white rounded-3xl border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-[#0B8457] shrink-0 shadow-inner">
                    <Database size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 tracking-tight">Sumber Data &amp; Teknologi Pengolahan Spasial</h2>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Referensi sumber data peta dan teknologi komputasi GIS</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Card 1: Sumber Data */}
                  <div className="bg-[#FAFBFC] rounded-2xl p-5 border border-gray-100 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="p-1.5 bg-emerald-100/60 text-[#0B8457] rounded-lg">
                          <Globe size={16} />
                        </span>
                        <h3 className="font-extrabold text-gray-900 text-sm">Sumber Data Spasial &amp; Administrasi</h3>
                      </div>
                      <ul className="space-y-3 text-xs text-gray-600 font-medium">
                        <li className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0B8457] mt-1.5 shrink-0"></span>
                          <div>
                            <strong className="text-gray-800 font-bold block">Peta Kawasan Hutan Indonesia</strong>
                            <span> Kementerian Kehutanan (Desember 2025)</span>
                          </div>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0B8457] mt-1.5 shrink-0"></span>
                          <div>
                            <strong className="text-gray-800 font-bold block">Peta Batas Wilayah Desa Indonesia</strong>
                            <span>Peta Rupabumi Indonesia (RBI)</span><br/>
                            <span>Badan Informasi Geospasial (BIG) 2026</span>
                          </div>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0B8457] mt-1.5 shrink-0"></span>
                          <div>
                            <strong className="text-gray-800 font-bold block">Kode &amp; Nama Wilayah Administrasi</strong>
                            <span>Kementerian Dalam Negeri (Keputusan Menteri Dalam Negeri Nomor Nomor 300.2.2-2138 Tahun 2025 tentang Pemberian dan Pemutakhiran Kode, Data Wilayah Administrasi Pemerintahan, dan Pulau)</span>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Card 2: Metode & Teknologi */}
                  <div className="bg-[#FAFBFC] rounded-2xl p-5 border border-gray-100 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="p-1.5 bg-blue-100/60 text-blue-700 rounded-lg">
                          <Cpu size={16} />
                        </span>
                        <h3 className="font-extrabold text-gray-900 text-sm">Teknologi Pengolahan</h3>
                      </div>
                      <ul className="space-y-3 text-xs text-gray-600 font-medium">
                        <li className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
                          <div>
                            <strong className="text-gray-800 font-bold block">PostGIS (Spatial Database Engine)</strong>
                          </div>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
                          <div>
                            <strong className="text-gray-800 font-bold block">GeoServer (WMS / Web Map Service)</strong>
                          </div>
                        </li>
                        {/* <li className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
                          <div>
                            <strong className="text-gray-800 font-bold block">React Map GL / Mapbox</strong>
                          </div>
                        </li> */}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

        </main>
      </div>
    </HomeLayout>
  );
}
