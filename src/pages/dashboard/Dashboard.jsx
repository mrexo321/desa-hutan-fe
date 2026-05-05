import React, { useState, useMemo, useCallback, useRef } from "react";
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

const Dashboard = () => {
  const navigate = useNavigate();
  const MAPBOX_TOKEN = environment.MAPBOX_URL;

  // =========================================
  // 1. STATE UI DASHBOARD & MAPBOX
  // =========================================
  const [activeTab, setActiveTab] = useState("Ringkasan");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapRef = useRef(null);

  const [viewState, setViewState] = useState({
    longitude: 118.0149, // Titik tengah Indonesia
    latitude: -2.5489,
    zoom: 4,
    pitch: 0,
    bearing: 0,
  });

  const [displayCoords, setDisplayCoords] = useState({
    longitude: 118.0149,
    latitude: -2.5489,
  });

  const [mapStyle, setMapStyle] = useState("mapbox://styles/mapbox/light-v11");
  const [activeMenu, setActiveMenu] = useState(null);
  const [clickedLocation, setClickedLocation] = useState(null);

  // =========================================
  // 2. STATE LAYER WMS
  // =========================================
  const [showLayerHutan, setShowLayerHutan] = useState(true);
  const [showLayerDesa, setShowLayerDesa] = useState(true);
  const [opacityHutan, setOpacityHutan] = useState(80);
  const [opacityDesa, setOpacityDesa] = useState(80);

  // =========================================
  // 3. STATE PENCARIAN PETA
  // =========================================
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // =========================================
  // 4. DATA FETCHING (REACT QUERY)
  // =========================================
  const { data: provinces, isLoading: isProvincesLoading } = useQuery({
    queryKey: ["provinces"],
    queryFn: analystSpatialService.getAllProvinces,
  });

  const { data: responseDesa, isLoading: isFetchingDesaData } = useQuery({
    queryKey: ["allVillagesMap"],
    queryFn: () => wilayahDesaService.getAllDesa(1, 1000),
    staleTime: 60000,
  });
  const listDesa = responseDesa?.items || [];

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
  const WMS_HUTAN = useMemo(
    () =>
      `https://api-simpeg.uika-bogor.ac.id/geoserver/desa_gis/wms?bbox={bbox-epsg-3857}&format=image/png8&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&transparent=true&width=512&height=512&layers=desa_gis:wilayah_hutan_geom`,
    [],
  );

  const WMS_DESA = useMemo(
    () =>
      `https://api-simpeg.uika-bogor.ac.id/geoserver/desa_gis/wms?bbox={bbox-epsg-3857}&format=image/png8&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&transparent=true&width=512&height=512&layers=desa_gis:wilayah_desa_geom`,
    [],
  );

  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];
    const query = searchQuery.toLowerCase();
    return listDesa
      .filter(
        (desa) =>
          desa.nama?.toLowerCase().includes(query) ||
          desa.kecamatan?.toLowerCase().includes(query) ||
          desa.kodeKemendagri?.toLowerCase().includes(query),
      )
      .slice(0, 6);
  }, [searchQuery, listDesa]);

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
    setViewState(evt.viewState);
    setDisplayCoords({
      longitude: evt.viewState.longitude,
      latitude: evt.viewState.latitude,
    });
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
    const lng = Number(desa.longitude) || Number(desa.lng) || 106.8229;
    const lat = Number(desa.latitude) || Number(desa.lat) || -6.2088;

    mapRef.current?.flyTo({
      center: [lng, lat],
      zoom: 14,
      duration: 2500,
      essential: true,
    });
    setClickedLocation({ longitude: lng, latitude: lat });
  };

  const handleGoToDetail = (provinsiName) => {
    navigate(`/dashboard/provinsi/${encodeURIComponent(provinsiName)}`);
  };

  return (
    <DashboardLayout activeMenu={"Dashboard"}>
      {/* =========================================
          HERO MAP SECTION (BISA FULLSCREEN)
      ========================================= */}
      <div
        className={`transition-all duration-500 ease-in-out ${
          isFullscreen
            ? "fixed inset-0 z-[100] w-screen h-screen bg-[#E8EDE9]"
            : "relative w-full h-[500px] md:h-[600px] rounded-[32px] overflow-hidden mb-8 shadow-sm border border-gray-200 bg-[#E8EDE9] shrink-0"
        }`}
      >
        {MAPBOX_TOKEN ? (
          <Map
            ref={mapRef}
            {...viewState}
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
                              <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-emerald-100">
                                Desa
                              </span>
                              <span className="font-mono text-xs font-semibold text-gray-400">
                                {detailData.kode_kemendagri || "-"}
                              </span>
                            </div>
                            <h3 className="font-extrabold text-gray-900 text-lg leading-tight">
                              {detailData.nama_desa || "Area Tidak Diketahui"}
                            </h3>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col justify-center">
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                                Luas Tercatat
                              </p>
                              <p className="font-bold text-gray-800 text-sm">
                                {detailData.luas_ha || "0"}{" "}
                                <span className="text-xs text-gray-500 font-medium">
                                  Ha
                                </span>
                              </p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col justify-center">
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                                Kawasan Hutan
                              </p>
                              <p
                                className="font-bold text-gray-800 text-sm truncate"
                                title={detailData.nama_hutan}
                              >
                                {detailData.nama_hutan !== "-"
                                  ? detailData.nama_hutan
                                  : "Tidak terdata"}
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
                                    <span className="font-bold text-emerald-600 capitalize text-sm">
                                      {detailData.status || "-"}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="text-xl font-extrabold text-gray-800">
                                    {detailData.luas_persen}%
                                  </span>
                                </div>
                              </div>
                              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#00B67A] rounded-full transition-all duration-1000"
                                  style={{
                                    width: `${Math.min(Number(detailData.luas_persen) || 0, 100)}%`,
                                  }}
                                ></div>
                              </div>
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
              <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700 shadow-xl rounded-[20px] p-4 text-white flex gap-4 items-center pointer-events-auto">
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
              </div>

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
                    {isFetchingDesaData ? (
                      <div className="text-center py-5 text-xs text-gray-500 flex flex-col items-center gap-2">
                        <Loader2
                          size={16}
                          className="animate-spin text-[#00B67A]"
                        />
                        <span>Memuat database...</span>
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
                                Kec. {desa.kecamatan} • Kode:{" "}
                                {desa.kodeKemendagri}
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
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="pointer-events-auto flex items-center justify-center w-11 h-11 bg-white/80 hover:bg-white text-gray-700 hover:text-[#00B67A] backdrop-blur-xl border border-white/50 shadow-lg rounded-[14px] transition-all focus:outline-none"
                title={isFullscreen ? "Keluar Fullscreen" : "Mode Layar Penuh"}
              >
                {isFullscreen ? (
                  <Minimize size={20} strokeWidth={2} />
                ) : (
                  <Maximize size={20} strokeWidth={2} />
                )}
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

            {/* --- HUD KIRI BAWAH: LEGENDA --- */}
            <div
              className={`absolute bottom-6 left-6 bg-white/90 backdrop-blur-xl px-5 py-3.5 rounded-[16px] shadow-lg border border-white z-10 transition-opacity ${isFullscreen ? "hidden sm:block" : "block"}`}
            >
              <h4 className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mb-2.5">
                Legenda Kawasan
              </h4>
              <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold text-gray-700">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  KHDTK
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>HK
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
                  HL
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
                  HP
                </div>
              </div>
            </div>

            {/* --- PANEL BAWAH TENGAH: KOORDINAT --- */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
              <div className="bg-gray-900/80 backdrop-blur-md border border-gray-700 shadow-xl rounded-full px-5 py-2.5 flex items-center gap-4 pointer-events-auto">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-gray-400 font-bold uppercase">
                    LNG
                  </span>
                  <span className="font-mono text-emerald-50 text-xs font-semibold w-16">
                    {displayCoords.longitude.toFixed(4)}°
                  </span>
                </div>
                <div className="w-px h-3 bg-gray-700"></div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-gray-400 font-bold uppercase">
                    LAT
                  </span>
                  <span className="font-mono text-emerald-50 text-xs font-semibold w-16">
                    {displayCoords.latitude.toFixed(4)}°
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

      {/* =========================================
          KONTEN DASHBOARD BAWAH (Disembunyikan saat Fullscreen)
      ========================================= */}
      <div className={isFullscreen ? "hidden" : "block"}>
        {/* FILTER & SEARCH */}
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
            {[
              "Pilih Provinsi",
              "Pilih Kabupaten",
              "Pilih Kecamatan",
              "Pilih Fungsi",
            ].map((item, i) => (
              <select
                key={i}
                className="bg-[#F8FAFC] border-none text-gray-600 py-3.5 px-4 rounded-[14px] text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 outline-none cursor-pointer min-w-[140px] font-medium appearance-none hover:bg-gray-100 transition-colors"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundPosition: "right 1rem center",
                  backgroundRepeat: "no-repeat",
                  paddingRight: "2.5rem",
                }}
              >
                <option>{item}</option>
              </select>
            ))}
          </div>
          <div className="flex w-full lg:w-auto gap-2">
            <button className="flex items-center justify-center gap-2 bg-[#F8FAFC] hover:bg-gray-100 text-gray-600 py-3.5 px-5 rounded-[14px] text-sm font-bold transition-colors border border-gray-100/50">
              <RotateCcw size={16} />{" "}
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button className="flex items-center justify-center gap-2 bg-[#00B67A] hover:bg-[#009b68] text-white py-3.5 px-7 rounded-[14px] text-sm font-bold shadow-[0_8px_20px_rgba(0,182,122,0.25)] hover:shadow-[0_8px_25px_rgba(0,182,122,0.4)] hover:-translate-y-0.5">
              <Filter size={16} /> Filter Data
            </button>
          </div>
        </div>

        {/* TABS NAVIGASI */}
        <div className="flex items-center gap-2 mb-6 bg-gray-100/50 p-1.5 rounded-full w-fit border border-gray-200/50">
          {["Ringkasan", "Distribusi", "Performa", "Laporan"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === tab ? "bg-white text-[#00B67A] shadow-[0_4px_15px_rgb(0,0,0,0.05)] border border-white" : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/50"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* MAIN STATS (GRID BENTO) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          <div className="col-span-1 lg:col-span-7 bg-gradient-to-br from-[#0C2F21] to-[#124230] rounded-[32px] p-8 text-white relative overflow-hidden shadow-xl shadow-emerald-900/10 flex flex-col justify-between group">
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-emerald-400/90 text-xs font-bold tracking-widest mb-3 uppercase">
                <Activity size={14} /> Total Desa Hutan
              </div>
              <div className="flex items-end gap-4 mb-4">
                <h2 className="text-6xl md:text-7xl font-extrabold tracking-tight">
                  268
                </h2>
                <div className="bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-lg text-xs font-bold backdrop-blur-md border border-emerald-400/20 mb-3 flex items-center gap-1">
                  <TrendingUp size={12} /> +12% bulan ini
                </div>
              </div>
              <p className="text-gray-300/90 text-sm max-w-sm font-medium leading-relaxed mb-8">
                Desa hutan terdaftar dan terkelola dalam sistem informasi tata
                ruang kawasan hutan Indonesia.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 relative z-10">
              {[
                { label: "Terverifikasi", count: 243, color: "bg-emerald-400" },
                { label: "Diproses", count: 25, color: "bg-orange-400" },
                { label: "Data Baru", count: 18, color: "bg-blue-400" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[16px] p-3.5 px-5 flex items-center gap-4 cursor-default"
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${stat.color} shadow-[0_0_10px_currentColor]`}
                  ></div>
                  <div>
                    <div className="text-gray-400 text-[10px] uppercase tracking-widest font-bold mb-0.5">
                      {stat.label}
                    </div>
                    <div className="text-xl font-extrabold text-white leading-none">
                      {stat.count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="absolute right-0 bottom-0 w-2/3 h-full opacity-40 pointer-events-none flex items-end transition-transform duration-700 group-hover:scale-105 group-hover:opacity-50 origin-bottom-right">
              <svg
                viewBox="0 0 200 100"
                className="w-full h-auto"
                preserveAspectRatio="none"
              >
                <path
                  d="M0,80 C40,70 60,90 100,50 C140,10 160,40 200,20 L200,100 L0,100 Z"
                  fill="url(#grad1)"
                />
                <path
                  d="M0,80 C40,70 60,90 100,50 C140,10 160,40 200,20"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#0C2F21" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          <div className="col-span-1 lg:col-span-5 grid grid-cols-2 gap-5">
            {[
              {
                title: "Pertumbuhan",
                desc: "/ bulan lalu",
                value: "+12%",
                icon: <TrendingUp size={22} strokeWidth={2.5} />,
                color: "emerald",
              },
              {
                title: "Pengguna",
                desc: "/ sistem aktif",
                value: "1,847",
                icon: <Users size={22} strokeWidth={2.5} />,
                color: "blue",
              },
              {
                title: "Total Luas",
                desc: "/ hektar",
                value: "148.5K",
                icon: <MapPin size={22} strokeWidth={2.5} />,
                color: "orange",
              },
              {
                title: "Sinkronisasi",
                desc: "/ terakhir",
                value: "2 jam",
                icon: <Clock size={22} strokeWidth={2.5} />,
                color: "amber",
              },
            ].map((card, i) => (
              <div
                key={i}
                className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col justify-center transition-all hover:-translate-y-1 hover:shadow-[0_15px_30px_rgb(0,0,0,0.06)] group"
              >
                <div
                  className={`w-12 h-12 rounded-[16px] bg-${card.color}-50 text-${card.color}-500 flex items-center justify-center mb-4 group-hover:bg-${card.color}-500 group-hover:text-white transition-colors`}
                >
                  {card.icon}
                </div>
                <div className="text-3xl font-extrabold text-gray-800 mb-1">
                  {card.value}
                </div>
                <div className="text-xs text-gray-500 font-bold">
                  {card.title}{" "}
                  <span className="text-gray-400 font-medium">{card.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* KATEGORI STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              icon: <TreePine size={20} />,
              title: "KHDTK",
              desc: "Kawasan Tujuan Khusus",
              count: 42,
              color: "text-emerald-600",
              bg: "bg-emerald-50",
              bar: "bg-emerald-500",
              trend: "+5.2%",
            },
            {
              icon: <Activity size={20} />,
              title: "HK",
              desc: "Hutan Konservasi",
              count: 87,
              color: "text-blue-600",
              bg: "bg-blue-50",
              bar: "bg-blue-500",
              trend: "+2.1%",
            },
            {
              icon: <Leaf size={20} />,
              title: "HL",
              desc: "Hutan Lindung",
              count: 64,
              color: "text-orange-600",
              bg: "bg-orange-50",
              bar: "bg-orange-500",
              trend: "-1.3%",
              isDown: true,
            },
            {
              icon: <MapPin size={20} />,
              title: "HP",
              desc: "Hutan Produksi",
              count: 75,
              color: "text-purple-600",
              bg: "bg-purple-50",
              bar: "bg-purple-500",
              trend: "+3.8%",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 transition-all hover:-translate-y-1 hover:shadow-lg relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-5">
                <div
                  className={`w-12 h-12 rounded-[14px] ${item.bg} ${item.color} flex items-center justify-center`}
                >
                  {item.icon}
                </div>
                <span
                  className={`text-[11px] font-extrabold px-3 py-1.5 rounded-lg ${item.isDown ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}
                >
                  {item.trend}
                </span>
              </div>
              <h3 className="text-3xl font-extrabold text-gray-800 mb-1">
                {item.count}
              </h3>
              <div className="font-bold text-sm text-gray-800">
                {item.title}
              </div>
              <div className="text-[11px] font-medium text-gray-500 mt-0.5 line-clamp-1">
                {item.desc}
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full mt-5 overflow-hidden">
                <div
                  className={`h-full ${item.bar} rounded-full`}
                  style={{ width: `${Math.min(item.count + 20, 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
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
                  <th className="py-5 px-4">STATUS</th>
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
                  provinces?.map((row, idx) => (
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
                      <td className="py-4 px-4">
                        <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md">
                          Terdata
                        </span>
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
