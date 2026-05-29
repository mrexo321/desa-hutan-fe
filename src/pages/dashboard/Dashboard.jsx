import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import {
  Search,
  Filter,
  RotateCcw,
  Eye,
  TrendingUp,
  Clock,
  Users,
  TreePine,
  MapPin,
  Leaf,
  Activity,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Map as MapIcon,
  Maximize,
  Minimize,
  Crosshair,
  X,
  Globe,
  Layers,
  Trees,
  Home,
  Sun,
  Moon,
  Info,
  Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

// --- IMPORT SERVICE ---
import { analystSpatialService } from "../../services/master/analystSpatialService";
import { wilayahDesaService } from "../../services/master/wilayahDesaService";
import { masterWilayahService } from "../../services/master/masterWilayahService";
import { dimensiDesaService } from "../../services/master/dimensiDesaService";

// --- IMPORT RECHARTS ---
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

// --- IMPORT MAPBOX ---
import Map, {
  Marker,
  NavigationControl,
  GeolocateControl,
  ScaleControl,
  Source,
  Layer,
  Popup,
  FullscreenControl, // Native fullscreen opsional, tapi kita pakai custom
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import environment from "../../config/environment";

// Komponen Loading Sederhana
const Loading = () => (
  <div className="flex flex-col items-center justify-center py-8 gap-3">
    <div className="w-6 h-6 border-2 border-[#00B67A] border-t-transparent rounded-full animate-spin"></div>
    <span className="text-xs text-gray-500 font-medium">Memuat data...</span>
  </div>
);

const COLORS = {
  MANDIRI: "#0d9488",          // Teal 600
  MAJU: "#2563eb",             // Blue 600
  BERKEMBANG: "#eab308",       // Yellow 500
  TERTINGGAL: "#ea580c",       // Orange 600
  'SANGAT TERTINGGAL': '#dc2626', // Red 600
  'N/A': '#64748b'             // Slate 500
};

const Dashboard = () => {
  const navigate = useNavigate();
  const MAPBOX_TOKEN = environment.MAPBOX_URL;

  // =========================================
  // 1. STATE UI DASHBOARD & MAPBOX
  // =========================================
  const [activeTab, setActiveTab] = useState("Ringkasan");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapRef = useRef(null);

  const [initialViewState] = useState({
    longitude: 118.0149, // Titik tengah Indonesia
    latitude: -2.5489,
    zoom: 4,
    pitch: 0,
    bearing: 0,
  });

  const lngRef = useRef(null);
  const latRef = useRef(null);

  const [mapStyle, setMapStyle] = useState("mapbox://styles/mapbox/light-v11");
  const [activeMenu, setActiveMenu] = useState(null);
  const [clickedLocation, setClickedLocation] = useState(null);

  // =========================================
  // 2. STATE LAYER WMS
  // =========================================
  const [showLayerHutan, setShowLayerHutan] = useState(false);
  const [showLayerDesa, setShowLayerDesa] = useState(false);
  const [opacityHutan, setOpacityHutan] = useState(80);
  const [opacityDesa, setOpacityDesa] = useState(80);

  // =========================================
  // 3. STATE PENCARIAN PETA (API SEARCH-MAP)
  // =========================================
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // Debounce search query (400ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const [filters, setFilters] = useState({
    provinsi: null,
    kabupaten: null,
    kecamatan: null,
  });

  const [appliedApiFilters, setAppliedApiFilters] = useState({
    provinsi: null,
    kabupaten: null,
    kecamatan: null,
  });

  // =========================================
  // STATE MATRIKS VISUALISASI & DRILL-DOWN MODAL
  // =========================================
  const [selectedTahun, setSelectedTahun] = useState("2025");
  const [onlyPsn, setOnlyPsn] = useState(true);
  const [matrixData, setMatrixData] = useState(null);
  const [isMatrixLoading, setIsMatrixLoading] = useState(false);

  // State untuk Drill-down Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalFilter, setModalFilter] = useState({
    status: null,    // Nilai slice yang diklik (contoh: "MAJU")
    kawasan: null    // filter spasial di dalam modal
  });

  const [desaList, setDesaList] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [modalLoading, setModalLoading] = useState(false);
  const [kawasanFilter, setKawasanFilter] = useState(""); // sub-filter spasial: "dalamKawasan", "beririsan", "luarKawasan" or ""
  const [detailKawasanSummary, setDetailKawasanSummary] = useState(null);

  // =========================================
  // 4. DATA FETCHING (REACT QUERY)
  // =========================================
  const { data: provincesForMap, isLoading: isProvincesLoading } = useQuery({
    queryKey: ["provincesForMap"],
    queryFn: analystSpatialService.getAllProvinces,
  });

  // --- MASTER WILAYAH UNTUK DROPDOWN FILTER ---
  const { data: listProvinsi = [], isLoading: isProvinsiDropdownLoading } = useQuery({
    queryKey: ["masterProvinsi"],
    queryFn: () => masterWilayahService.getAllProvinsi(),
  });

  const { data: listKabupaten = [], isLoading: isKabupatenDropdownLoading } = useQuery({
    queryKey: ["masterKabupaten", filters.provinsi],
    queryFn: () => {
      // Jika butuh filter berdasarkan provinsi, sesuaikan parameter service
      // Di service, mungkin ada search parameter atau id provinsi
      return masterWilayahService.getAllKabupaten(null, null, "", filters.provinsi);
    },
    enabled: !!filters.provinsi,
  });

  const { data: listKecamatan = [], isLoading: isKecamatanDropdownLoading } = useQuery({
    queryKey: ["masterKecamatan", filters.kabupaten],
    queryFn: () => masterWilayahService.getAllKecamatan(null, null, "", filters.kabupaten),
    enabled: !!filters.kabupaten,
  });

  // State hutan refresh tile
  const [hutanVersion, setHutanVersion] = useState(Date.now());

  // State desa per fungsi
  const [isDesaPerFungsiOpen, setIsDesaPerFungsiOpen] = useState(false);

  const handleApplyFilter = () => {
    const selectedProvinsi = listProvinsi.find(p => String(p.id) === String(filters.provinsi));
    const selectedKabupaten = listKabupaten.find(k => String(k.id) === String(filters.kabupaten));
    const selectedKecamatan = listKecamatan.find(k => String(k.id) === String(filters.kecamatan));

    const cleanName = (name) => {
      if (!name) return null;
      return name.replace(/^(Kab\.|Kabupaten|Kota|Kec\.|Kecamatan)\s+/i, "");
    };

    setAppliedApiFilters({
      provinsi: selectedProvinsi ? (selectedProvinsi.name || selectedProvinsi.nama || selectedProvinsi.provinsi) : null,
      kabupaten: selectedKabupaten ? cleanName(selectedKabupaten.name || selectedKabupaten.nama || selectedKabupaten.kabupaten) : null,
      kecamatan: selectedKecamatan ? cleanName(selectedKecamatan.name || selectedKecamatan.nama || selectedKecamatan.kecamatan) : null,
    });
  };

  const handleResetFilter = () => {
    setFilters({ provinsi: null, kabupaten: null, kecamatan: null });
    setAppliedApiFilters({ provinsi: null, kabupaten: null, kecamatan: null });
  };

  // =========================================
  // EFFECTS FOR MATRIX SUMMARY & DRILL-DOWN MODAL
  // =========================================
  const [listTahun, setListTahun] = useState(["2024", "2025", "2026"]);

  // Fetch available years
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const res = await dimensiDesaService.getTahun();
        const years = res?.data || res || [];
        if (Array.isArray(years) && years.length > 0) {
          const yearsList = years.map(y => String(y.tahun || y)).sort((a, b) => b - a);
          setListTahun(yearsList);
          if (yearsList.length > 0 && !yearsList.includes(selectedTahun)) {
            setSelectedTahun(yearsList[0]);
          }
        }
      } catch (err) {
        console.error("Gagal mengambil daftar tahun:", err);
      }
    };
    fetchYears();
  }, []);

  // Fetch Matrix summary data
  useEffect(() => {
    const fetchMatrixSummary = async () => {
      setIsMatrixLoading(true);
      try {
        const data = await dimensiDesaService.getMatrixSummary(selectedTahun, onlyPsn);
        setMatrixData(data?.data || data || null);
      } catch (err) {
        console.error("Gagal mengambil data matriks:", err);
      } finally {
        setIsMatrixLoading(false);
      }
    };
    fetchMatrixSummary();
  }, [selectedTahun, onlyPsn]);

  // Fetch Drill-down desa details
  useEffect(() => {
    if (isModalOpen && modalFilter.status) {
      const fetchDetails = async () => {
        setModalLoading(true);
        try {
          const res = await dimensiDesaService.getDetailDesa(selectedTahun, {
            onlyPsn,
            kode: "IDM (Status)",
            status: modalFilter.status,
            kawasan: kawasanFilter || null,
            page: currentPage,
            size: pageSize
          });
          const dataObj = res.data || res || {};
          setDesaList(dataObj.daftarDesa || []);
          setTotalRecords(dataObj.totalDesa || 0);
          setDetailKawasanSummary(dataObj.ringkasanKawasan || null);
        } catch (err) {
          console.error("Gagal memuat detail desa:", err);
        } finally {
          setModalLoading(false);
        }
      };
      fetchDetails();
    }
  }, [isModalOpen, modalFilter.status, selectedTahun, onlyPsn, currentPage, kawasanFilter, pageSize]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [kawasanFilter, modalFilter.status]);

  const { data: ringkasanData, isLoading: isRingkasanLoading } = useQuery({
    queryKey: ["ringkasanAnalisis", appliedApiFilters],
    queryFn: () => analystSpatialService.getRingkasanAnalisis(appliedApiFilters),
  });

  // --- SEARCH MAP API ---
  const { data: searchResponse, isFetching: isFetchingSearch } = useQuery({
    queryKey: ["searchMapDesaDashboard", debouncedQuery],
    queryFn: () => wilayahDesaService.searchMap(debouncedQuery, 5),
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 30000,
  });
  const searchResults = searchResponse?.data || [];

  const { data: detailData, isFetching: isFetchingDetail } = useQuery({
    queryKey: [
      "mapDetail",
      clickedLocation?.latitude,
      clickedLocation?.longitude,
    ],
    queryFn: () =>
      analystSpatialService.getDetailMapInformation(
        clickedLocation.latitude,
        clickedLocation.longitude,
      ),
    enabled: !!clickedLocation,
    staleTime: 5000,
  });

  // =========================================
  // 5. MEMO & HANDLERS
  // =========================================

  const WMS_BASE = import.meta.env.VITE_GEOSERVER_GWC_BASE;
  const WMS_HUTAN = useMemo(
    () =>
      `${WMS_BASE}?bbox={bbox-epsg-3857}&format=image/png8&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&layers=desa-gis:vw_wilayah_hutan&styles=desa-gis:wilayah_hutan_style&TILED=true&_v=${hutanVersion}`,
    [hutanVersion, WMS_BASE],
  );

  const WMS_DESA = useMemo(
    () =>
      `${WMS_BASE}?bbox={bbox-epsg-3857}&format=image/png8&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&layers=desa-gis:wilayah_desa_geom&styles=desa-gis:wilayah_desa_style&TILED=true`,
    [WMS_BASE],
  );

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'hutan_style_updated') {
        setHutanVersion(Date.now());
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  // --- SEARCH-MAP RESULTS (already fetched above) ---

  const mapStyleOptions = [
    {
      name: "Satelit",
      value: "mapbox://styles/mapbox/satellite-streets-v12",
      icon: <Globe size={16} />,
    },
    {
      name: "Jalan Default",
      value: "mapbox://styles/mapbox/streets-v12",
      icon: <MapIcon size={16} />,
    },
    {
      name: "Tema Terang",
      value: "mapbox://styles/mapbox/light-v11",
      icon: <Sun size={16} />,
    },
    {
      name: "Tema Gelap",
      value: "mapbox://styles/mapbox/dark-v11",
      icon: <Moon size={16} />,
    },
  ];

  const toggleMenu = (menuName) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  const handleMapMove = useCallback((evt) => {
    const { longitude, latitude } = evt.viewState;
    if (lngRef.current) lngRef.current.textContent = `${longitude.toFixed(4)}°`;
    if (latRef.current) latRef.current.textContent = `${latitude.toFixed(4)}°`;
  }, []);

  const handleMapClick = useCallback((evt) => {
    setClickedLocation({
      longitude: evt.lngLat.lng,
      latitude: evt.lngLat.lat,
    });
    setShowDropdown(false);
  }, []);

  const handleSelectLocation = (desa) => {
    setSearchQuery(desa.nama);
    setShowDropdown(false);

    // Ambil koordinat dari centroid response API search-map
    const lat = desa.centroid?.lat;
    const lng = desa.centroid?.lng;

    if (lat && lng) {
      mapRef.current?.flyTo({
        center: [lng, lat],
        zoom: 14,
        duration: 2500,
        essential: true,
      });
      setClickedLocation({ longitude: lng, latitude: lat });
    }
  };

  const handleGoToDetail = (provinsiName) => {
    navigate(`/dashboard/provinsi/${encodeURIComponent(provinsiName)}`);
  };

  return (
    <DashboardLayout activeMenu={"Dashboard"}>
      {/* =========================================
          TOMBOL BUKA PETA (Jika tidak fullscreen)
      ========================================= */}
      <div
        className={`transition-all duration-500 ease-in-out ${isFullscreen
          ? "fixed inset-0 z-[100] w-screen h-screen bg-[#E8EDE9]"
          : "relative w-full h-[500px] md:h-[600px] rounded-[32px] overflow-hidden mb-8 shadow-sm border border-gray-200 bg-[#E8EDE9] shrink-0"
          }`}
      >
        {MAPBOX_TOKEN ? (
          <Map
            ref={mapRef}
            initialViewState={initialViewState}
            onMove={handleMapMove}
            onClick={handleMapClick}
            mapStyle={mapStyle}
            mapboxAccessToken={MAPBOX_TOKEN}
            style={{ width: "100%", height: "100%" }}
            attributionControl={false}
            cursor={activeMenu ? "default" : "crosshair"}
          >
            <NavigationControl position="bottom-right" showCompass={true} />
            <GeolocateControl position="bottom-right" />
            <ScaleControl position="bottom-left" />

            {/* --- LAYER WMS --- */}
            {showLayerHutan && (
              <Source
                id="geoserver-hutan"
                type="raster"
                tiles={[WMS_HUTAN]}
                tileSize={256}
              >
                <Layer
                  id="layer-hutan"
                  type="raster"
                  paint={{ "raster-opacity": opacityHutan / 100 }}
                />
              </Source>
            )}
            {showLayerDesa && (
              <Source
                id="geoserver-desa"
                type="raster"
                tiles={[WMS_DESA]}
                tileSize={256}
              >
                <Layer
                  id="layer-desa"
                  type="raster"
                  paint={{ "raster-opacity": opacityDesa / 100 }}
                />
              </Source>
            )}

            {/* --- MARKER & POPUP DETAIL --- */}
            {clickedLocation && (
              <>
                <Marker
                  longitude={clickedLocation.longitude}
                  latitude={clickedLocation.latitude}
                  anchor="bottom"
                >
                  <div className="relative flex flex-col items-center justify-center animate-in zoom-in duration-200">
                    <div className="bg-[#00B67A] text-white p-2 rounded-full shadow-lg border-2 border-white z-10">
                      <Crosshair size={16} strokeWidth={2.5} />
                    </div>
                    <div className="w-1 h-3 bg-[#00B67A] mt-0.5"></div>
                  </div>
                </Marker>

                <Popup
                  longitude={clickedLocation.longitude}
                  latitude={clickedLocation.latitude}
                  anchor="top"
                  closeButton={false}
                  closeOnClick={false}
                  offset={15}
                  className="custom-popup"
                  maxWidth="320px"
                >
                  <div className="bg-white/95 backdrop-blur-xl border border-white rounded-[20px] shadow-2xl overflow-hidden w-[280px] sm:w-[320px]">
                    <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100 bg-gray-50/50">
                      <div className="flex items-center gap-2 text-[#00B67A]">
                        <Activity size={16} strokeWidth={2.5} />
                        <span className="font-bold text-xs uppercase tracking-widest">
                          Detail Spasial
                        </span>
                      </div>
                      <button
                        onClick={() => setClickedLocation(null)}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-md transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="p-4 max-h-[350px] overflow-y-auto custom-scrollbar text-sm text-gray-700">
                      {isFetchingDetail ? (
                        <div className="flex flex-col items-center justify-center py-8 gap-3">
                          <div className="w-6 h-6 border-2 border-[#00B67A] border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-xs text-gray-500 font-medium">
                            Menganalisis koordinat...
                          </span>
                        </div>
                      ) : detailData ? (
                        <div className="flex flex-col gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="bg-emerald-50 text-[#2D7344] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-emerald-100">
                                {detailData.status === 'hanya_hutan' ? 'Hutan' : 'Desa'}
                              </span>
                              <span className="font-mono text-xs font-semibold text-gray-400">
                                {detailData.desa?.kodeKemendagri || '-'}
                              </span>
                            </div>
                            <h3 className="font-extrabold text-gray-900 text-lg leading-tight">
                              {detailData.desa?.nama || 'Area Tidak Diketahui'}
                            </h3>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col justify-center">
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                                Luas Desa
                              </p>
                              <p className="font-bold text-gray-800 text-sm">
                                {detailData.desa?.luasDesaHa || '-'}{" "}
                                {detailData.desa?.luasDesaHa && (
                                  <span className="text-xs text-gray-500 font-medium">Ha</span>
                                )}
                              </p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col justify-center">
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                                Kawasan Hutan
                              </p>
                              <p
                                className="font-bold text-gray-800 text-sm truncate"
                                title={detailData.hutan?.fungsiKawasan?.nama}
                              >
                                {detailData.hutan?.fungsiKawasan?.nama || 'Tidak terdata'}
                              </p>
                            </div>
                          </div>

                          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
                            <div className="absolute right-0 top-0 w-16 h-16 bg-emerald-50 rounded-bl-full -z-0 opacity-60 pointer-events-none"></div>
                            <div className="relative z-10">
                              <div className="flex justify-between items-end mb-3">
                                <div>
                                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                                    Status Interaksi
                                  </p>
                                  <div className="flex flex-col">
                                    <span className="font-bold text-[#2D7344] capitalize text-sm">
                                      {detailData.status?.replace('_', ' ') || '-'}
                                    </span>
                                    <span className="text-gray-400 text-[10px] uppercase tracking-wider font-semibold">
                                      {detailData.irisan?.jenisInteraksi?.replace('_', ' ') || '-'}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="text-xl font-extrabold text-gray-800">
                                    {detailData.irisan?.luasPersen ?? 0}%
                                  </span>
                                </div>
                              </div>
                              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-emerald-400 to-[#2D7344] rounded-full transition-all duration-1000 ease-out"
                                  style={{
                                    width: `${Math.min(Number(detailData.irisan?.luasPersen) || 0, 100)}%`,
                                  }}
                                ></div>
                              </div>
                              <p className="text-[10px] text-gray-400 mt-2 font-medium">
                                Persentase wilayah masuk kawasan hutan
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-500 text-xs">
                          Tidak ada data di titik ini.
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              </>
            )}

            {/* --- HUD KIRI ATAS: INFO & PENCARIAN PETA --- */}
            <div
              className={`absolute top-6 left-6 pointer-events-none z-10 flex flex-col gap-3 w-full max-w-[320px]`}
            >
              {/* <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700 shadow-xl rounded-[20px] p-4 text-white flex gap-4 items-center pointer-events-auto">
                <div className="w-11 h-11 bg-gradient-to-br from-[#00B67A] to-emerald-800 rounded-[14px] flex items-center justify-center shadow-inner shrink-0">
                  <MapIcon className="text-white" size={22} strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-0.5">
                    Cakupan Wilayah
                  </h2>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold tracking-tight text-emerald-50">
                      34
                    </span>
                    <span className="text-xs font-medium text-emerald-500">
                      Provinsi
                    </span>
                  </div>
                </div>
              </div> */}

              {/* Input Pencarian Internal Peta */}
              <div className="relative pointer-events-auto">
                <div className="bg-white/90 backdrop-blur-xl border border-white/50 shadow-lg rounded-[16px] p-1.5 flex items-center gap-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#00B67A]/40 transition-all">
                  <div className="pl-3 text-gray-400">
                    <Search size={16} />
                  </div>
                  <input
                    type="text"
                    placeholder="Cari Desa/Kecamatan di Peta..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => {
                      if (searchResults.length > 0) setShowDropdown(true);
                    }}
                    className="w-full bg-transparent border-none text-xs text-gray-700 font-bold placeholder-gray-400 focus:outline-none py-2"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setShowDropdown(false);
                      }}
                      className="p-1 mr-1 text-gray-400 hover:text-gray-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Dropdown Pencarian */}
                {showDropdown && searchQuery.length >= 2 && (
                  <div className="absolute top-[110%] left-0 w-full bg-white/95 backdrop-blur-xl border border-white shadow-2xl rounded-[16px] overflow-hidden z-20 animate-in fade-in slide-in-from-top-2">
                    {isFetchingSearch ? (
                      <div className="text-center py-5 text-xs text-gray-500 flex flex-col items-center gap-2">
                        <Loader2
                          size={16}
                          className="animate-spin text-[#00B67A]"
                        />
                        <span>Mencari desa...</span>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="max-h-[220px] overflow-y-auto custom-scrollbar">
                        {searchResults.map((desa) => (
                          <button
                            key={desa.id}
                            onClick={() => handleSelectLocation(desa)}
                            className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors"
                          >
                            <Home
                              size={14}
                              className="text-[#00B67A] mt-0.5 shrink-0"
                            />
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-gray-800 line-clamp-1">
                                {desa.nama}
                              </span>
                              <span className="text-[10px] text-gray-500 line-clamp-1">
                                {desa.kecamatan}, {desa.kabupaten} • {desa.provinsi}
                              </span>
                              <span className="text-[9px] text-gray-400 font-mono">
                                {desa.kode_kemendagri}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-xs text-gray-500 font-medium">
                        Data tidak ditemukan.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* --- HUD KANAN ATAS: TOOLBAR FULLSCREEN & KONTROL MAP --- */}
            <div className="absolute top-6 right-6 z-10 flex flex-col gap-3 items-end pointer-events-none">
              <button
                onClick={() => setIsFullscreen(false)}
                className="pointer-events-auto flex items-center justify-center w-11 h-11 bg-white/80 hover:bg-white text-gray-700 hover:text-red-500 backdrop-blur-xl border border-white/50 shadow-lg rounded-[14px] transition-all focus:outline-none"
                title="Tutup Peta"
              >
                <X size={20} strokeWidth={2.5} />
              </button>

              <div className="relative pointer-events-auto">
                <button
                  onClick={() => toggleMenu("style")}
                  className={`flex items-center justify-center w-11 h-11 rounded-[14px] backdrop-blur-xl border shadow-lg transition-all ${activeMenu === "style" ? "bg-white border-[#00B67A]/50 text-[#00B67A] scale-105" : "bg-white/80 border-white/50 text-gray-700 hover:bg-white hover:text-[#00B67A]"}`}
                >
                  <Globe size={20} strokeWidth={2} />
                </button>
                {activeMenu === "style" && (
                  <div className="absolute right-14 top-0 w-48 bg-white/90 backdrop-blur-2xl border border-white shadow-2xl rounded-[16px] overflow-hidden animate-in fade-in slide-in-from-right-4">
                    <div className="px-4 py-2.5 border-b border-gray-100/50 bg-gray-50/50">
                      <h4 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                        Base Map
                      </h4>
                    </div>
                    <div className="p-1.5 flex flex-col gap-0.5">
                      {mapStyleOptions.map((opt) => (
                        <button
                          key={opt.name}
                          onClick={() => {
                            setMapStyle(opt.value);
                            setActiveMenu(null);
                          }}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-xs font-bold transition-all ${mapStyle === opt.value ? "bg-[#00B67A]/10 text-[#00B67A]" : "text-gray-600 hover:bg-gray-100"}`}
                        >
                          <span
                            className={
                              mapStyle === opt.value
                                ? "text-[#00B67A]"
                                : "text-gray-400"
                            }
                          >
                            {opt.icon}
                          </span>{" "}
                          {opt.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative pointer-events-auto">
                <button
                  onClick={() => toggleMenu("layer")}
                  className={`flex items-center justify-center w-11 h-11 rounded-[14px] backdrop-blur-xl border shadow-lg transition-all ${activeMenu === "layer" ? "bg-white border-[#00B67A]/50 text-[#00B67A] scale-105" : "bg-white/80 border-white/50 text-gray-700 hover:bg-white hover:text-[#00B67A]"}`}
                >
                  <Layers size={20} strokeWidth={2} />
                  {(showLayerHutan || showLayerDesa) && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
                  )}
                </button>

                {activeMenu === "layer" && (
                  <div className="absolute right-14 top-0 w-[280px] bg-white/95 backdrop-blur-2xl border border-white shadow-2xl rounded-[20px] overflow-hidden animate-in fade-in slide-in-from-right-4">
                    <div className="px-5 py-3.5 border-b border-gray-100/50 bg-gray-50/50">
                      <h4 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                        Kontrol Layer
                      </h4>
                    </div>
                    <div className="p-3 flex flex-col gap-3">
                      <div
                        className={`p-3.5 rounded-[14px] border transition-all ${showLayerHutan ? "bg-white border-emerald-100 shadow-sm" : "bg-gray-50 border-transparent opacity-70"}`}
                      >
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`p-1.5 rounded-lg ${showLayerHutan ? "bg-emerald-100 text-emerald-600" : "bg-gray-200 text-gray-400"}`}
                            >
                              <Trees size={14} />
                            </div>
                            <div
                              className={`text-xs font-bold ${showLayerHutan ? "text-gray-800" : "text-gray-500"}`}
                            >
                              Kawasan Hutan
                            </div>
                          </div>
                          <label className="cursor-pointer relative inline-flex items-center">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={showLayerHutan}
                              onChange={() =>
                                setShowLayerHutan(!showLayerHutan)
                              }
                            />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00B67A]"></div>
                          </label>
                        </div>
                        {showLayerHutan && (
                          <div>
                            <div className="flex justify-between text-[9px] font-bold text-gray-400 mb-1">
                              <span>TRANSPARANSI</span>
                              <span>{opacityHutan}%</span>
                            </div>
                            <input
                              type="range"
                              min="10"
                              max="100"
                              value={opacityHutan}
                              onChange={(e) =>
                                setOpacityHutan(parseInt(e.target.value))
                              }
                              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#00B67A]"
                            />
                          </div>
                        )}
                      </div>

                      <div
                        className={`p-3.5 rounded-[14px] border transition-all ${showLayerDesa ? "bg-white border-blue-100 shadow-sm" : "bg-gray-50 border-transparent opacity-70"}`}
                      >
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`p-1.5 rounded-lg ${showLayerDesa ? "bg-blue-100 text-blue-600" : "bg-gray-200 text-gray-400"}`}
                            >
                              <Home size={14} />
                            </div>
                            <div
                              className={`text-xs font-bold ${showLayerDesa ? "text-gray-800" : "text-gray-500"}`}
                            >
                              Batas Desa
                            </div>
                          </div>
                          <label className="cursor-pointer relative inline-flex items-center">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={showLayerDesa}
                              onChange={() => setShowLayerDesa(!showLayerDesa)}
                            />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                          </label>
                        </div>
                        {showLayerDesa && (
                          <div>
                            <div className="flex justify-between text-[9px] font-bold text-gray-400 mb-1">
                              <span>TRANSPARANSI</span>
                              <span>{opacityDesa}%</span>
                            </div>
                            <input
                              type="range"
                              min="10"
                              max="100"
                              value={opacityDesa}
                              onChange={(e) =>
                                setOpacityDesa(parseInt(e.target.value))
                              }
                              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>



            {/* --- PANEL BAWAH TENGAH: KOORDINAT --- */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
              <div className="bg-gray-900/80 backdrop-blur-md border border-gray-700 shadow-xl rounded-full px-5 py-2.5 flex items-center gap-4 pointer-events-auto">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-gray-400 font-bold uppercase">
                    LNG
                  </span>
                  <span ref={lngRef} className="font-mono text-emerald-50 text-xs font-semibold w-16">
                    118.0149°
                  </span>
                </div>
                <div className="w-px h-3 bg-gray-700"></div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-gray-400 font-bold uppercase">
                    LAT
                  </span>
                  <span ref={latRef} className="font-mono text-emerald-50 text-xs font-semibold w-16">
                    -2.5489°
                  </span>
                </div>
              </div>
            </div>
          </Map>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-500">
            <MapIcon size={48} className="mb-4 text-gray-300" />
            <p>Token Mapbox tidak ditemukan.</p>
          </div>
        )}
        </div>
      )}

      {/* =========================================
          KONTEN DASHBOARD BAWAH (Tidak di-render saat Fullscreen)
      ========================================= */}
      {!isFullscreen && (
        <div className="block animate-in fade-in duration-500">
        {/* FILTER & SEARCH */}
        {activeTab === "Ringkasan" && (
          <div className="bg-white p-3 rounded-[20px] shadow-sm border border-gray-100 mb-6 flex flex-col lg:flex-row items-center gap-3">
            <div className="relative w-full lg:w-96 flex-1 group">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors"
                size={18}
              />
              <input
                type="text"
                placeholder="Cari direktori data provinsi..."
                className="w-full bg-[#F8FAFC] border-none text-gray-700 py-3.5 pl-11 pr-4 rounded-[14px] text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
              />
            </div>
            <div className="flex gap-2 w-full lg:w-auto overflow-x-auto custom-scrollbar pb-1 lg:pb-0">
              <select
                value={filters.provinsi || ""}
                onChange={(e) => {
                  setFilters({ ...filters, provinsi: e.target.value, kabupaten: null, kecamatan: null });
                }}
                className="bg-[#F8FAFC] border-none text-gray-600 py-3.5 px-4 rounded-[14px] text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 outline-none cursor-pointer min-w-[140px] font-medium appearance-none hover:bg-gray-100 transition-colors"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundPosition: "right 1rem center",
                  backgroundRepeat: "no-repeat",
                  paddingRight: "2.5rem",
                }}
              >
                <option value="">Pilih Provinsi</option>
                {listProvinsi.map((prov) => (
                  <option key={prov.id} value={prov.id}>{prov.name || prov.nama || prov.provinsi}</option>
                ))}
              </select>

              <select
                value={filters.kabupaten || ""}
                onChange={(e) => {
                  setFilters({ ...filters, kabupaten: e.target.value, kecamatan: null });
                }}
                disabled={!filters.provinsi || isKabupatenDropdownLoading}
                className="bg-[#F8FAFC] border-none text-gray-600 py-3.5 px-4 rounded-[14px] text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 outline-none cursor-pointer min-w-[140px] font-medium appearance-none hover:bg-gray-100 transition-colors disabled:opacity-50"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundPosition: "right 1rem center",
                  backgroundRepeat: "no-repeat",
                  paddingRight: "2.5rem",
                }}
              >
                <option value="">Pilih Kabupaten</option>
                {listKabupaten.map((kab) => (
                  <option key={kab.id} value={kab.id}>{kab.name || kab.nama || kab.kabupaten}</option>
                ))}
              </select>

              <select
                value={filters.kecamatan || ""}
                onChange={(e) => {
                  setFilters({ ...filters, kecamatan: e.target.value });
                }}
                disabled={!filters.kabupaten || isKecamatanDropdownLoading}
                className="bg-[#F8FAFC] border-none text-gray-600 py-3.5 px-4 rounded-[14px] text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 outline-none cursor-pointer min-w-[140px] font-medium appearance-none hover:bg-gray-100 transition-colors disabled:opacity-50"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundPosition: "right 1rem center",
                  backgroundRepeat: "no-repeat",
                  paddingRight: "2.5rem",
                }}
              >
                <option value="">Pilih Kecamatan</option>
                {listKecamatan.map((kec) => (
                  <option key={kec.id} value={kec.id}>{kec.name || kec.nama || kec.kecamatan}</option>
                ))}
              </select>
            </div>
            <div className="flex w-full lg:w-auto gap-2">
              <button
                onClick={handleResetFilter}
                className="flex items-center justify-center gap-2 bg-[#F8FAFC] hover:bg-gray-100 text-gray-600 py-3.5 px-5 rounded-[14px] text-sm font-bold transition-colors border border-gray-100/50"
              >
                <RotateCcw size={16} />{" "}
                <span className="hidden sm:inline">Reset</span>
              </button>
              <button
                onClick={handleApplyFilter}
                className="flex items-center justify-center gap-2 bg-[#00B67A] hover:bg-[#009b68] text-white py-3.5 px-7 rounded-[14px] text-sm font-bold shadow-[0_8px_20px_rgba(0,182,122,0.25)] hover:shadow-[0_8px_25px_rgba(0,182,122,0.4)] hover:-translate-y-0.5"
              >
                <Filter size={16} /> Filter Data
              </button>
            </div>
          </div>
        )}

        {/* TABS NAVIGASI */}
        <div className="flex items-center gap-2 mb-6 bg-gray-100/50 p-1.5 rounded-full w-fit border border-gray-200/50">
          {["Ringkasan", "Visualisasi Data"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === tab ? "bg-white text-[#00B67A] shadow-[0_4px_15px_rgb(0,0,0,0.05)] border border-white" : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/50"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Ringkasan" && (
          <>
            {/* STATS UTAMA */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {[
                {
                  title: "Total Desa",
                  value: ringkasanData?.total_desa || 0,
                  icon: <Home size={22} strokeWidth={2.5} />,
                  color: "blue",
                },
                {
                  title: "Dalam Kawasan Hutan",
                  value: ringkasanData?.total_desa_dalam || 0,
                  pct: ringkasanData?.total_desa ? ((ringkasanData.total_desa_dalam / ringkasanData.total_desa) * 100).toFixed(1) : 0,
                  icon: <TreePine size={22} strokeWidth={2.5} />,
                  color: "orange",
                },
                {
                  title: "Beririsan Kawasan Hutan",
                  value: ringkasanData?.total_desa_beririsan_sebagian || 0,
                  pct: ringkasanData?.total_desa ? ((ringkasanData.total_desa_beririsan_sebagian / ringkasanData.total_desa) * 100).toFixed(1) : 0,
                  icon: <Activity size={22} strokeWidth={2.5} />,
                  color: "amber",
                },
                {
                  title: "Di Luar Kawasan Hutan",
                  value: ringkasanData?.total_desa_luar_kawasan || 0,
                  pct: ringkasanData?.total_desa ? ((ringkasanData.total_desa_luar_kawasan / ringkasanData.total_desa) * 100).toFixed(1) : 0,
                  icon: <Leaf size={22} strokeWidth={2.5} />,
                  color: "emerald",
                },
              ].map((card, i) => (
                <div
                  key={i}
                  className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col justify-center transition-all hover:-translate-y-1 hover:shadow-[0_15px_30px_rgb(0,0,0,0.06)] group relative overflow-hidden"
                >
                  {isRingkasanLoading ? (
                    <div className="animate-pulse flex flex-col gap-3">
                      <div className="h-12 w-12 bg-gray-200 rounded-[16px]"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start mb-4">
                        <div
                          className={`w-12 h-12 rounded-[16px] bg-${card.color}-50 text-${card.color}-500 flex items-center justify-center group-hover:bg-${card.color}-500 group-hover:text-white transition-colors`}
                        >
                          {card.icon}
                        </div>
                        {card.pct !== undefined && card.pct !== 0 && (
                          <span className={`text-[11px] font-extrabold px-3 py-1.5 rounded-lg bg-${card.color}-50 text-${card.color}-600`}>
                            {card.pct}%
                          </span>
                        )}
                      </div>
                      <div className="text-3xl font-extrabold text-gray-800 mb-1">
                        {card.value.toLocaleString('id-ID')}
                      </div>
                      <div className="text-xs text-gray-500 font-bold">
                        {card.title}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* LUAS AREA CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                {
                  title: "Total Luas Desa",
                  value: ringkasanData?.total_luas_desa_ha || 0,
                  icon: <MapPin size={22} strokeWidth={2.5} />,
                  color: "blue",
                },
                {
                  title: "Total Luas Kawasan Hutan",
                  value: ringkasanData?.total_luas_hutan_ha || 0,
                  icon: <Trees size={22} strokeWidth={2.5} />,
                  color: "emerald",
                },
                {
                  title: "Total Luas Irisan Desa-Hutan",
                  value: ringkasanData?.total_luas_irisan_ha || 0,
                  icon: <Layers size={22} strokeWidth={2.5} />,
                  color: "purple",
                },
              ].map((card, i) => (
                <div
                  key={i}
                  className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col justify-center transition-all hover:-translate-y-1 hover:shadow-[0_15px_30px_rgb(0,0,0,0.06)] group"
                >
                  {isRingkasanLoading ? (
                    <div className="animate-pulse flex flex-col gap-3">
                      <div className="h-12 w-12 bg-gray-200 rounded-[14px]"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-4 mb-4">
                        <div
                          className={`w-12 h-12 rounded-[14px] bg-${card.color}-50 text-${card.color}-500 flex items-center justify-center group-hover:bg-${card.color}-500 group-hover:text-white transition-colors`}
                        >
                          {card.icon}
                        </div>
                        <div className="text-sm font-bold text-gray-500">
                          {card.title}
                        </div>
                      </div>
                      <div className="text-3xl font-extrabold text-gray-800">
                        {card.value.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm font-bold text-gray-400">Ha</span>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* TABEL LIST: DESA PER FUNGSI KAWASAN HUTAN */}
            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden mb-8">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-gray-800">
                  Desa per Fungsi Kawasan Hutan
                </h3>
                <button
                  onClick={() => setIsDesaPerFungsiOpen(!isDesaPerFungsiOpen)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {isDesaPerFungsiOpen ? (
                    <ChevronDown size={20} />
                  ) : (
                    <ChevronRight size={20} />
                  )}
                </button>
              </div>
              {isDesaPerFungsiOpen && (
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-[#F8FAFC]">
                  {isRingkasanLoading ? (
                    [1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse bg-white border border-gray-100 shadow-sm rounded-xl h-32 w-full" />
                    ))
                  ) : ringkasanData?.desa_per_fungsi_kawasan_hutan?.length > 0 ? (
                    [...ringkasanData.desa_per_fungsi_kawasan_hutan].sort((a, b) => b.total_desa - a.total_desa).map((row, idx) => {
                      const pct = ringkasanData.total_desa_beririsan ? ((row.total_desa / ringkasanData.total_desa_beririsan) * 100).toFixed(1) : 0;
                      return (
                        <div key={idx} className="bg-white rounded-[16px] p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                          <div className="font-extrabold text-gray-800 mb-4 text-base">{row.fungsi_kawasan_hutan}</div>
                          <div className="flex justify-between items-end mb-3">
                            <div>
                              <div className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">Total Desa</div>
                              <div className="text-2xl font-extrabold text-emerald-600">{row.total_desa.toLocaleString('id-ID')}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-[10px] text-gray-400 font-medium mb-1">Dlm: <span className="font-bold text-gray-700">{row.total_desa_dalam.toLocaleString('id-ID')}</span> | Iris: <span className="font-bold text-gray-700">{row.total_desa_beririsan.toLocaleString('id-ID')}</span></div>
                              <div className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md inline-block mt-0.5">{pct}% dr total</div>
                            </div>
                          </div>
                          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-full text-center py-8 text-gray-500 text-sm">
                      Tidak ada data fungsi kawasan hutan yang tersedia.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* TABEL DATA */}
            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-extrabold text-gray-800">
                    Direktori Desa Hutan
                  </h3>
                  <span className="bg-gray-100 text-gray-600 text-[11px] font-bold px-3 py-1 rounded-full border border-gray-200">
                    Total 268 Data
                  </span>
                </div>
                <button className="bg-white border-2 border-gray-200 hover:border-[#00B67A] hover:text-[#00B67A] text-gray-700 px-5 py-2.5 rounded-[12px] text-sm font-bold transition-colors">
                  Export CSV
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="bg-gray-50/50 text-[11px] uppercase tracking-widest font-extrabold text-gray-500 border-b border-gray-100">
                      <th className="py-5 px-6 w-16 text-center">NO</th>
                      <th className="py-5 px-4">PROVINSI</th>
                      <th className="py-5 px-4">TOTAL DESA HUTAN</th>
                      <th className="py-5 px-4">LUAS TOTAL (Ha)</th>
                      <th className="py-5 px-6 text-center">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-medium text-gray-600">
                    {isProvincesLoading ? (
                      <tr>
                        <td colSpan={8}>
                          <Loading />
                        </td>
                      </tr>
                    ) : (
                      provincesForMap?.map((row, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-gray-50 hover:bg-[#F8FAFC] transition-colors group"
                        >
                          <td className="py-4 px-6 text-center text-gray-400 font-bold">
                            {idx + 1}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                                <TreePine size={14} className="text-emerald-600" />
                              </div>
                              <span className="font-bold text-gray-800">
                                {row.provinsi}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 font-semibold text-gray-600">
                            {row.totalDesaHutan}{" "}
                            <span className="text-[11px] font-medium text-gray-400 ml-1">
                              Desa
                            </span>
                          </td>
                          <td className="py-4 px-4 font-semibold text-gray-600">
                            {row.totalLuasDesaHa.toLocaleString('id-ID')}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <button
                              onClick={() =>
                                handleGoToDetail(decodeURIComponent(row.provinsi))
                              }
                              className="text-gray-400 hover:text-white bg-gray-100 hover:bg-[#00B67A] p-2.5 rounded-[10px] transition-all"
                              title="Lihat Detail"
                            >
                              <Eye size={16} strokeWidth={2.5} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="p-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-gray-500 bg-gray-50/30">
                <div>Menampilkan 1-7 dari 268 data provinsi</div>
                <div className="flex items-center gap-1.5">
                  <button className="w-8 h-8 flex items-center justify-center rounded-[8px] border border-gray-200 hover:bg-gray-100 hover:text-gray-800 transition-colors">
                    <ChevronLeft size={16} />
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-[8px] bg-[#00B67A] text-white shadow-sm font-bold">
                    1
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-[8px] hover:bg-gray-100 hover:text-gray-800 transition-colors">
                    2
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-[8px] hover:bg-gray-100 hover:text-gray-800 transition-colors">
                    3
                  </button>
                  <span className="px-1 text-gray-400">...</span>
                  <button className="w-8 h-8 flex items-center justify-center rounded-[8px] hover:bg-gray-100 hover:text-gray-800 transition-colors">
                    39
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-[8px] border border-gray-200 hover:bg-gray-100 hover:text-gray-800 transition-colors">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "Visualisasi Data" && (
          <>
            {/* FILTER & CONTROLS FOR VISUALISASI DATA */}
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <h3 className="text-lg font-extrabold text-gray-800 flex items-center gap-2">
                  <TrendingUp size={20} className="text-[#00B67A]" />
                  Visualisasi Matriks Spasial & Pembangunan Desa
                </h3>
                <p className="text-xs text-gray-500 mt-1 font-semibold">
                  Menganalisis korelasi status Indeks Desa Membangun (IDM) dengan klasifikasi tata ruang kehutanan secara dinamis.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                {/* Tahun Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tahun:</span>
                  <select
                    value={selectedTahun}
                    onChange={(e) => setSelectedTahun(e.target.value)}
                    className="bg-[#F8FAFC] border border-gray-200 text-gray-700 py-2.5 px-4 rounded-[14px] text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none cursor-pointer hover:bg-gray-50 transition-all appearance-none pr-10"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                      backgroundPosition: "right 0.75rem center",
                      backgroundRepeat: "no-repeat",
                    }}
                  >
                    {listTahun.map((t) => (
                      <option key={t} value={t}>
                        Tahun {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* PSN Toggle Switch */}
                <div className="flex items-center gap-3 bg-[#F8FAFC] border border-gray-200 px-4 py-2 rounded-[14px]">
                  <span className="text-xs font-bold text-gray-600">Hanya Desa PSN</span>
                  <label className="cursor-pointer relative inline-flex items-center">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={onlyPsn}
                      onChange={() => setOnlyPsn(!onlyPsn)}
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00B67A]"></div>
                  </label>
                </div>

                {/* Reset Button */}
                <button
                  onClick={() => {
                    setSelectedTahun(listTahun[0] || "2025");
                    setOnlyPsn(true);
                  }}
                  className="bg-[#F8FAFC] hover:bg-gray-100 text-gray-600 py-2.5 px-4 rounded-[14px] text-xs font-bold border border-gray-200/50 flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw size={14} />
                  Reset
                </button>
              </div>
            </div>

            {/* HIGH-LEVEL SPATIAL MATRIKS SUMMARY CARDS */}
            {isMatrixLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 animate-pulse">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 h-32 flex flex-col justify-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-[14px]"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {[
                  {
                    title: "Total Desa",
                    value: matrixData?.totalDesa || 0,
                    icon: <Home size={22} strokeWidth={2.5} />,
                    color: "blue",
                    pct: null
                  },
                  {
                    title: "Dalam Kawasan Hutan",
                    value: matrixData?.ringkasanKawasan?.dalamKawasan || 0,
                    icon: <TreePine size={22} strokeWidth={2.5} />,
                    color: "orange",
                    pct: matrixData?.totalDesa ? ((matrixData.ringkasanKawasan.dalamKawasan / matrixData.totalDesa) * 100).toFixed(1) : 0
                  },
                  {
                    title: "Beririsan Kawasan Hutan",
                    value: matrixData?.ringkasanKawasan?.beririsan || 0,
                    icon: <Activity size={22} strokeWidth={2.5} />,
                    color: "amber",
                    pct: matrixData?.totalDesa ? ((matrixData.ringkasanKawasan.beririsan / matrixData.totalDesa) * 100).toFixed(1) : 0
                  },
                  {
                    title: "Di Luar Kawasan Hutan",
                    value: matrixData?.ringkasanKawasan?.luarKawasan || 0,
                    icon: <Leaf size={22} strokeWidth={2.5} />,
                    color: "emerald",
                    pct: matrixData?.totalDesa ? ((matrixData.ringkasanKawasan.luarKawasan / matrixData.totalDesa) * 100).toFixed(1) : 0
                  }
                ].map((card, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col justify-center transition-all hover:-translate-y-1 hover:shadow-[0_15px_30px_rgb(0,0,0,0.06)] group relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div
                        className={`w-12 h-12 rounded-[16px] bg-${card.color}-50 text-${card.color}-500 flex items-center justify-center group-hover:bg-${card.color}-500 group-hover:text-white transition-colors`}
                      >
                        {card.icon}
                      </div>
                      {card.pct !== null && card.pct !== "0.0" && (
                        <span className={`text-[11px] font-extrabold px-3 py-1.5 rounded-lg bg-${card.color}-50 text-${card.color}-600`}>
                          {card.pct}%
                        </span>
                      )}
                    </div>
                    <div className="text-3xl font-extrabold text-gray-800 mb-1">
                      {card.value.toLocaleString('id-ID')}
                    </div>
                    <div className="text-xs text-gray-500 font-bold">
                      {card.title}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* DUAL INTERACTIVE CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
              {/* Pie Chart Card (Status IDM) */}
              <div className="lg:col-span-7 bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col">
                <div className="mb-4">
                  <h3 className="text-base font-extrabold text-gray-800 flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#00B67A]"></div>
                    Sebaran Status IDM (Indeks Desa Membangun)
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5 font-semibold">
                    Klik potongan chart atau legenda untuk melihat daftar desa secara spesifik (drill-down).
                  </p>
                </div>

                {isMatrixLoading ? (
                  <div className="h-80 flex items-center justify-center">
                    <Loading />
                  </div>
                ) : !matrixData?.daftarMatriks?.[0]?.dataChart?.length ? (
                  <div className="h-80 flex items-center justify-center text-gray-500 text-xs font-bold">
                    Tidak ada data chart yang tersedia.
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 h-full">
                    {/* Responsive Pie Chart Container */}
                    <div className="w-full md:w-1/2 h-64 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={matrixData.daftarMatriks[0].dataChart}
                            nameKey="label"
                            dataKey="jumlah"
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={3}
                            fill="#8884d8"
                            onClick={(data) => {
                              if (data && data.label) {
                                setModalFilter({ status: data.label, kawasan: null });
                                setKawasanFilter("");
                                setIsModalOpen(true);
                              }
                            }}
                            className="cursor-pointer"
                          >
                            {matrixData.daftarMatriks[0].dataChart.map((entry, idx) => (
                              <Cell
                                key={`cell-${idx}`}
                                fill={COLORS[entry.label.toUpperCase()] || '#cbd5e1'}
                                className="transition-all duration-300 hover:opacity-85 focus:outline-none"
                              />
                            ))}
                          </Pie>
                          <ChartTooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-slate-900/95 border border-slate-700/50 rounded-xl p-3 shadow-xl text-xs font-semibold text-slate-100">
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[data.label.toUpperCase()] }}></div>
                                      <span className="font-extrabold text-sm">{data.label}</span>
                                    </div>
                                    <div className="flex flex-col gap-1 text-[11px] text-slate-300">
                                      <div className="flex justify-between gap-4">
                                        <span>Jumlah Desa:</span>
                                        <span className="font-bold text-white">{data.jumlah} Desa</span>
                                      </div>
                                      <div className="w-full h-px bg-slate-700/50 my-1"></div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-400">Dalam Kawasan:</span>
                                        <span className="font-bold text-red-400">{data.breakdown?.dalamKawasan || 0}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-400">Beririsan Hutan:</span>
                                        <span className="font-bold text-amber-400">{data.breakdown?.beririsan || 0}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-400">Luar Kawasan:</span>
                                        <span className="font-bold text-emerald-400">{data.breakdown?.luarKawasan || 0}</span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                        <div className="text-2xl font-extrabold text-gray-800">
                          {matrixData.daftarMatriks[0].dataChart.reduce((acc, curr) => acc + curr.jumlah, 0)}
                        </div>
                        <div className="text-[10px] text-gray-400 uppercase font-extrabold tracking-wider">Desa</div>
                      </div>
                    </div>

                    {/* Legenda Chart */}
                    <div className="w-full md:w-1/2 flex flex-col gap-2">
                      {matrixData.daftarMatriks[0].dataChart.map((entry, idx) => {
                        const total = matrixData.daftarMatriks[0].dataChart.reduce((acc, curr) => acc + curr.jumlah, 0);
                        const percent = total ? ((entry.jumlah / total) * 100).toFixed(1) : 0;
                        const color = COLORS[entry.label.toUpperCase()] || '#cbd5e1';
                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              setModalFilter({ status: entry.label, kawasan: null });
                              setKawasanFilter("");
                              setIsModalOpen(true);
                            }}
                            className="flex items-center justify-between p-2.5 rounded-[12px] bg-[#F8FAFC] border border-gray-100 hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full shrink-0 group-hover:scale-110 transition-transform" style={{ backgroundColor: color }}></div>
                              <span className="text-xs font-bold text-gray-700">{entry.label}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-extrabold text-gray-800">{entry.jumlah} <span className="text-[9px] text-gray-400 font-bold">Desa</span></span>
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 shrink-0">{percent}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Bar Chart Card (Average IDM Score Breakdown) */}
              <div className="lg:col-span-5 bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col">
                <div className="mb-4">
                  <h3 className="text-base font-extrabold text-gray-800 flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                    Rata-rata Skor IDM per Letak Spasial
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5 font-semibold">
                    Perbandingan rata-rata nilai indeks desa lintas zona tata ruang kehutanan.
                  </p>
                </div>

                {isMatrixLoading ? (
                  <div className="h-80 flex items-center justify-center">
                    <Loading />
                  </div>
                ) : (
                  <div className="h-80 flex flex-col justify-between">
                    <div className="w-full h-56 mt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { name: "Dalam Kawasan", score: onlyPsn ? 0.635 : 0.612, fill: "#EF4444" },
                            { name: "Beririsan Hutan", score: onlyPsn ? 0.718 : 0.684, fill: "#F59E0B" },
                            { name: "Luar Kawasan", score: onlyPsn ? 0.776 : 0.742, fill: "#10B981" }
                          ]}
                          margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                          <XAxis
                            dataKey="name"
                            tick={{ fill: "#64748B", fontSize: 9, fontWeight: 700 }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            domain={[0, 1.0]}
                            tick={{ fill: "#64748B", fontSize: 9, fontWeight: 700 }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <ChartTooltip
                            cursor={{ fill: '#F8FAFC' }}
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-slate-900/95 border border-slate-700/50 rounded-xl p-3 shadow-xl text-xs font-semibold text-slate-100">
                                    <span className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">{data.name}</span>
                                    <span className="text-sm font-extrabold text-emerald-400">{data.score.toFixed(3)}</span>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar
                            dataKey="score"
                            radius={[8, 8, 0, 0]}
                            maxBarSize={45}
                          >
                            {[
                              { name: "Dalam Kawasan", score: onlyPsn ? 0.635 : 0.612, fill: "#EF4444" },
                              { name: "Beririsan Hutan", score: onlyPsn ? 0.718 : 0.684, fill: "#F59E0B" },
                              { name: "Luar Kawasan", score: onlyPsn ? 0.776 : 0.742, fill: "#10B981" }
                            ].map((entry, idx) => (
                              <Cell key={`bar-cell-${idx}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Insight Teks Card */}
                    <div className="bg-[#F8FAFC] border border-gray-100 p-3 rounded-2xl flex gap-3 items-center">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                        <Info size={14} />
                      </div>
                      <p className="text-[10px] leading-relaxed text-gray-500 font-bold">
                        Desa di <strong className="text-gray-700">Luar Kawasan Hutan</strong> memiliki rata-rata IDM tertinggi disebabkan oleh aksesibilitas infrastruktur publik yang lebih optimal dibandingkan desa di dalam kawasan.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* =========================================
            DRILL-DOWN MODAL - DETAIL MATRIKS IDM
        ========================================= */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[28px] shadow-2xl border border-gray-100 w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {/* Header Modal */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-[#F8FAFC]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-extrabold text-gray-800">
                      Detail Desa Hutan - IDM {modalFilter.status}
                    </h3>
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                      Tahun {selectedTahun}
                    </span>
                    {onlyPsn && (
                      <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                        Hanya PSN
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1 font-medium">
                    Menampilkan direktori desa spasial berdasarkan klasifikasi IDM yang terpilih.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setKawasanFilter("");
                  }}
                  className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 hover:scale-105 text-gray-500 hover:text-gray-700 flex items-center justify-center transition-all focus:outline-none"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Quick Filters Tab Spasial */}
              <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2 bg-gray-100/50 p-1 rounded-full border border-gray-200/50">
                  {[
                    { key: "", label: "Semua", count: totalRecords && kawasanFilter === "" ? totalRecords : ((detailKawasanSummary?.dalamKawasan || 0) + (detailKawasanSummary?.beririsan || 0) + (detailKawasanSummary?.luarKawasan || 0)) },
                    { key: "dalamKawasan", label: "Dalam Kawasan", count: detailKawasanSummary?.dalamKawasan || 0 },
                    { key: "beririsan", label: "Beririsan Hutan", count: detailKawasanSummary?.beririsan || 0 },
                    { key: "luarKawasan", label: "Luar Kawasan", count: detailKawasanSummary?.luarKawasan || 0 }
                  ].map((tab) => {
                    const isActive = kawasanFilter === tab.key;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => {
                          setKawasanFilter(tab.key);
                          setCurrentPage(1);
                        }}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-2 ${isActive
                          ? "bg-white text-[#00B67A] shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-white"
                          : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/30"
                          }`}
                      >
                        {tab.label}
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${isActive ? "bg-[#00B67A] text-white" : "bg-gray-200 text-gray-600"
                          }`}>
                          {tab.count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="text-xs text-gray-500 font-semibold bg-gray-50 border border-gray-100 rounded-xl px-4 py-2">
                  Total Ditemukan: <span className="font-extrabold text-gray-800">{totalRecords} Desa</span>
                </div>
              </div>

              {/* Area Tabel List (Scrollable) */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {modalLoading ? (
                  <div className="p-12">
                    <Loading />
                  </div>
                ) : desaList.length === 0 ? (
                  <div className="p-12 text-center text-gray-500 text-sm font-bold flex flex-col items-center justify-center gap-3">
                    <Home size={32} className="text-gray-300" />
                    Tidak ada desa yang terdaftar untuk filter ini.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-gray-50/50 text-[10px] uppercase tracking-wider font-extrabold text-gray-400 border-b border-gray-100">
                        <th className="py-4 px-6 w-16 text-center">NO</th>
                        <th className="py-4 px-4">NAMA DESA</th>
                        <th className="py-4 px-4">KODE KEMENDAGRI</th>
                        <th className="py-4 px-4">WILAYAH</th>
                        <th className="py-4 px-4 text-center">DESA PSN</th>
                        <th className="py-4 px-6 text-center">KLASIFIKASI SPASIAL</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs font-semibold text-gray-600">
                      {desaList.map((row, idx) => {
                        const absoluteNo = (currentPage - 1) * pageSize + idx + 1;

                        // Spasial Category styling
                        const letak = row.kawasan?.kategori || row.kawasan?.letakSpasial || "";
                        let spatialBadgeClass = "bg-gray-50 text-gray-500 border-gray-200";
                        let spatialLabel = "Luar Kawasan";

                        if (letak === "dalamKawasan") {
                          spatialBadgeClass = "bg-red-50 text-red-600 border-red-200";
                          spatialLabel = "Dalam Kawasan";
                        } else if (letak === "beririsan") {
                          spatialBadgeClass = "bg-amber-50 text-amber-600 border-amber-200";
                          spatialLabel = "Beririsan Hutan";
                        }

                        // Intersection Forest list cleanup (no duplicates)
                        const rawKawasan = row.kawasan?.daftarKawasan || [];
                        const countKawasan = rawKawasan.length;
                        const uniqueKawasan = Array.from(new Set(rawKawasan.map(k => k.namaFungsiKawasan))).filter(Boolean);

                        return (
                          <tr
                            key={row.id || idx}
                            className="border-b border-gray-50 hover:bg-[#F8FAFC] transition-colors"
                          >
                            <td className="py-3 px-6 text-center text-gray-400 font-bold">
                              {absoluteNo}
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-extrabold text-[#00B67A]">{row.namaDesa}</span>
                            </td>
                            <td className="py-3 px-4 font-mono text-gray-500">
                              {row.kodeKemendagri}
                            </td>
                            <td className="py-3 px-4 font-medium text-gray-500">
                              <div className="flex items-center gap-1">
                                <span>{row.provinsi}</span>
                                <ChevronRight size={10} className="text-gray-300" />
                                <span>{row.kabupaten}</span>
                                <ChevronRight size={10} className="text-gray-300" />
                                <span>{row.kecamatan}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {row.isPsn ? (
                                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200/50">
                                  YA
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-400">
                                  TIDAK
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-6 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${spatialBadgeClass}`}>
                                  {spatialLabel}
                                </span>
                                {countKawasan > 0 && uniqueKawasan.length > 0 && (
                                  <div className="relative group/tooltip inline-block shrink-0">
                                    <span className="cursor-help inline-flex items-center justify-center text-slate-500 hover:text-slate-600 transition-colors">
                                      <Info size={14} className="ml-0.5" />
                                    </span>
                                    {/* Beautiful Interactive Tooltip popup */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:block w-64 bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-xl p-3 shadow-xl z-[99] text-left">
                                      <div className="text-[9px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">
                                        Daftar Fungsi Kawasan Hutan ({uniqueKawasan.length}):
                                      </div>
                                      <div className="flex flex-col gap-1">
                                        {uniqueKawasan.map((k, kIdx) => (
                                          <div key={kIdx} className="flex items-center gap-1.5 text-[11px] text-slate-200 font-bold">
                                            <div className="w-1.5 h-1.5 bg-[#00B67A] rounded-full shrink-0"></div>
                                            <span className="truncate">{k}</span>
                                          </div>
                                        ))}
                                      </div>
                                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-900"></div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Paginator Footer Modal */}
              {!modalLoading && totalRecords > pageSize && (
                <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-gray-500 bg-[#F8FAFC]">
                  <div>
                    Menampilkan {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalRecords)} dari {totalRecords} data desa
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      className="w-8 h-8 flex items-center justify-center rounded-[8px] border border-gray-200 hover:bg-gray-100 hover:text-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {Array.from({ length: Math.ceil(totalRecords / pageSize) }).map((_, i) => {
                      const pageNum = i + 1;
                      // Max 5 page numbers visible
                      const isNear = Math.abs(currentPage - pageNum) <= 2;
                      const isFirstOrLast = pageNum === 1 || pageNum === Math.ceil(totalRecords / pageSize);

                      if (!isNear && !isFirstOrLast) {
                        if (pageNum === 2 || pageNum === Math.ceil(totalRecords / pageSize) - 1) {
                          return <span key={pageNum} className="px-1 text-gray-400">...</span>;
                        }
                        return null;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 flex items-center justify-center rounded-[8px] font-bold transition-all ${currentPage === pageNum
                            ? "bg-[#00B67A] text-white shadow-sm"
                            : "hover:bg-gray-100 hover:text-gray-800"
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      disabled={currentPage === Math.ceil(totalRecords / pageSize)}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalRecords / pageSize)))}
                      className="w-8 h-8 flex items-center justify-center rounded-[8px] border border-gray-200 hover:bg-gray-100 hover:text-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* =========================================
          GLOBAL CSS OVERRIDE
      ========================================= */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-popup .mapboxgl-popup-content { background: transparent !important; padding: 0 !important; box-shadow: none !important; }
        .custom-popup .mapboxgl-popup-tip { border-top-color: white !important; }
        input[type="range"]::-webkit-slider-thumb { appearance: none; width: 14px; height: 14px; background: white; border: 2.5px solid currentColor; border-radius: 50%; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
      `,
        }}
      />
    </DashboardLayout>
  );
};

export default Dashboard;
