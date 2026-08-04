import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import Map, {
  Marker,
  NavigationControl,
  FullscreenControl,
  GeolocateControl,
  ScaleControl,
  Source,
  Layer,
  Popup,
} from "react-map-gl/mapbox";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Nonaktifkan pengiriman telemetry ke events.mapbox.com untuk mempercepat koneksi
mapboxgl.config.SEND_EVENTS = false;
import {
  Search,
  Globe,
  Map as MapIcon,
  Moon,
  Sun,
  MapPin,
  Layers,
  Trees,
  TreePine,
  Home,
  Crosshair,
  X,
  Activity,
  Info,
  Loader2,
  ArrowLeft,
  Zap,
  Download,
  ChevronRight
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import environment from "./config/environment";
import { analystSpatialService } from "./services/master/analystSpatialService";
import { wilayahDesaService } from "./services/master/wilayahDesaService";
import masterInstance from "./api/masterInstance";
import { useNavigate } from "react-router-dom";

export default function MapPage() {
  const MAPBOX_TOKEN = environment.MAPBOX_URL;

  // --- REFERENSI PETA UNTUK FLY-TO ---
  const mapRef = useRef(null);

  const [initialViewState] = useState({
    longitude: 118.0149,
    latitude: -2.5489,
    zoom: 4.8,
    pitch: 0,
    bearing: 0,
  });

  const lngRef = useRef(null);
  const latRef = useRef(null);

  // --- STATE INTERAKSI KLIK PETA ---
  const [clickedLocation, setClickedLocation] = useState(null);
  const [popupActiveTab, setPopupActiveTab] = useState("spasial"); // "spasial" | "potensi"
  const [isDownloading, setIsDownloading] = useState(false);
  const navigate = useNavigate();

  const handleDownloadExcel = async (desaId, namaDesa) => {
    if (!desaId) return;
    try {
      setIsDownloading(true);
      const res = await masterInstance.get(`/public/export/desa/${desaId}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      const safeNama = (namaDesa || "Desa").replace(/[^a-zA-Z0-9_-]/g, "_");
      link.setAttribute("download", `Data_Desa_${safeNama}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Gagal mendownload data desa:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  // --- STATE PENCARIAN (API SEARCH-MAP) ---
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

  // --- FETCHING SEARCH-MAP DARI API ---
  const { data: searchResponse, isFetching: isFetchingSearch } = useQuery({
    queryKey: ["searchMapDesa", debouncedQuery],
    queryFn: () => wilayahDesaService.searchMapPublic(debouncedQuery, 50),
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 30000,
  });

  const searchResults = searchResponse?.data || [];

  // 2. State Tema Peta
  const [mapStyle, setMapStyle] = useState(
    "mapbox://styles/mapbox/streets-v12",
  );
  const [activeMenu, setActiveMenu] = useState(null);

  // 3. State Visibilitas Layer WMS (ON/OFF)
  const [showLayerHutan, setShowLayerHutan] = useState(false);
  const [showLayerDesa, setShowLayerDesa] = useState(false);
  const [showLayerDesaHutan, setShowLayerDesaHutan] = useState(false);
  const [showLayerPsn, setShowLayerPsn] = useState(false);

  // 4. State Opacity Layer WMS (0 - 100)
  const [opacityHutan, setOpacityHutan] = useState(80);
  const [opacityDesa, setOpacityDesa] = useState(80);
  const [opacityDesaHutan, setOpacityDesaHutan] = useState(80);
  const [opacityPsn, setOpacityPsn] = useState(80);

  // 5. State Filter Tahun WMS PSN
  const [tahunPsn, setTahunPsn] = useState(2025);

  // State hutan refresh tile
  const [hutanVersion, setHutanVersion] = useState(Date.now());


  // --- FETCHING DATA DETAIL KLIK ---
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

  const WMS_BASE = import.meta.env.VITE_GEOSERVER_GWC_BASE;

  const WMS_DIRECT = import.meta.env.VITE_GEOSERVER_WMS_BASE;

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

  const WMS_DESA_HUTAN = useMemo(
    () =>
      `${WMS_DIRECT}?bbox={bbox-epsg-3857}&format=image/png8&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&layers=desa-gis:mv_desa_hutan&styles=&TILED=true`,
    [WMS_DIRECT],
  );

  const WMS_PSN = useMemo(
    () =>
      `${WMS_DIRECT}?bbox={bbox-epsg-3857}&format=image/png8&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&layers=desa-gis:mv_desa_psn&styles=desa-gis:desa_psn_style&TILED=true&CQL_FILTER=tahun=${tahunPsn}`,
    [WMS_DIRECT, tahunPsn],
  );

  const paintHutan = useMemo(() => ({
    "raster-opacity": opacityHutan / 100,
    "raster-fade-duration": 0,
    "raster-resampling": "linear",
  }), [opacityHutan]);

  const paintDesa = useMemo(() => ({
    "raster-opacity": opacityDesa / 100,
    "raster-fade-duration": 0,
    "raster-resampling": "linear",
  }), [opacityDesa]);

  const paintDesaHutan = useMemo(() => ({
    "raster-opacity": opacityDesaHutan / 100,
    "raster-fade-duration": 0,
    "raster-resampling": "linear",
  }), [opacityDesaHutan]);

  const mapContainerStyle = useMemo(() => ({ width: "100%", height: "100%" }), []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'hutan_style_updated') {
        setHutanVersion(Date.now());
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);
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
    if (lngRef.current) lngRef.current.innerText = `${longitude.toFixed(5)}°`;
    if (latRef.current) latRef.current.innerText = `${latitude.toFixed(5)}°`;
  }, []);

  const handleMapClick = useCallback((evt) => {
    const { lngLat } = evt;
    setClickedLocation({
      longitude: lngLat.lng,
      latitude: lngLat.lat,
    });
    // Tutup dropdown jika peta diklik
    setShowDropdown(false);

    // Pusatkan peta dengan offset vertikal agar card popup berada lebih ke bawah dan terlihat sepenuhnya
    mapRef.current?.flyTo({
      center: [lngLat.lng, lngLat.lat],
      offset: [0, -140],
      duration: 1000,
      essential: true,
    });
  }, []);


  const closePopup = () => {
    setClickedLocation(null);
  };

  // --- FUNGSI SAAT LOKASI DESA DIPILIH ---
  const handleSelectLocation = (desa) => {
    setSearchQuery(desa.nama);
    setShowDropdown(false);

    // Ambil koordinat dari centroid response API search-map
    const lat = desa.centroid?.lat;
    const lng = desa.centroid?.lng;

    if (lat && lng) {
      // Animasi terbang ke lokasi desa dengan offset vertikal ke bawah
      mapRef.current?.flyTo({
        center: [lng, lat],
        offset: [0, -140],
        zoom: 14,
        duration: 2500,
        essential: true,
      });

      // Otomatis pasang marker popup di lokasi desa
      setClickedLocation({
        longitude: lng,
        latitude: lat,
      });
    }
  };



  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex items-center justify-center w-screen h-screen bg-[#F0F2F5] p-4">
        {/* Error UI Tetap Sama */}
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#E8EDE9] font-sans selection:bg-[#2D7344]/30">
      {/* =========================================
          1. KANVAS PETA
      ========================================= */}
      <Map
        ref={mapRef} // WAJIB untuk fitur flyTo
        initialViewState={initialViewState}
        onMove={handleMapMove}
        onClick={handleMapClick}
        mapStyle={mapStyle}
        mapboxAccessToken={MAPBOX_TOKEN}
        style={mapContainerStyle}
        reuseMaps
        attributionControl={false}
        cursor={activeMenu ? "default" : "crosshair"}
      >
        <GeolocateControl position="bottom-right" />
        <FullscreenControl position="bottom-right" />
        <NavigationControl
          position="bottom-right"
          showCompass={true}
          visualizePitch={true}
        />
        <ScaleControl position="bottom-left" />

        {/* --- LAYER WMS: HUTAN --- */}
        {showLayerHutan && (
          <Source
            id="geoserver-hutan"
            type="raster"
            tiles={[WMS_HUTAN]}
            tileSize={256}
            scheme="xyz"
          >
            <Layer
              id="layer-hutan"
              type="raster"
              paint={paintHutan}
            />
          </Source>
        )}

        {/* --- LAYER WMS: DESA --- */}
        {showLayerDesa && (
          <Source
            id="geoserver-desa"
            type="raster"
            tiles={[WMS_DESA]}
            tileSize={256}
            scheme="xyz"
          >
            <Layer
              id="layer-desa"
              type="raster"
              paint={paintDesa}
            />
          </Source>
        )}

        {/* --- LAYER WMS: DESA HUTAN --- */}
        {showLayerDesaHutan && (
          <Source
            id="geoserver-desa-hutan"
            type="raster"
            tiles={[WMS_DESA_HUTAN]}
            tileSize={256}
            scheme="xyz"
          >
            <Layer
              id="layer-desa-hutan"
              type="raster"
              paint={paintDesaHutan}
            />
          </Source>
        )}

        {/* --- LAYER WMS: DESA PSN --- */}
        {showLayerPsn && (
          <Source
            id="geoserver-psn"
            type="raster"
            tiles={[WMS_PSN]}
            tileSize={256}
            scheme="xyz"
          >
            <Layer
              id="layer-psn"
              type="raster"
              paint={{
                "raster-opacity": opacityPsn / 100,
                "raster-fade-duration": 0,
                "raster-resampling": "linear",
              }}
            />
          </Source>
        )}

        {/* --- MARKER & POPUP INTERAKTIF --- */}
        {clickedLocation && (
          <>
            <Marker
              longitude={clickedLocation.longitude}
              latitude={clickedLocation.latitude}
              anchor="bottom"
            >
              <div className="relative flex flex-col items-center justify-center animate-in zoom-in duration-200">
                <div className="bg-[#2D7344] text-white p-2 rounded-full shadow-lg border-2 border-white z-10">
                  <Crosshair size={16} strokeWidth={2.5} />
                </div>
                <div className="w-1 h-3 bg-[#2D7344] mt-0.5"></div>
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
              maxWidth="360px"
            >
              <div className="bg-white/95 backdrop-blur-xl border border-white rounded-[20px] shadow-2xl overflow-hidden w-[300px] sm:w-[360px]">
                {/* Header Tab Bar */}
                <div className="px-3 py-2 flex items-center justify-between border-b border-gray-100 bg-gray-50/70">
                  <div className="flex items-center gap-1 bg-gray-200/60 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setPopupActiveTab("spasial")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${popupActiveTab === "spasial"
                        ? "bg-white text-[#2D7344] shadow-sm"
                        : "text-gray-500 hover:text-gray-800"
                        }`}
                    >
                      <Activity size={14} strokeWidth={2.5} />
                      <span>Detail Spasial</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPopupActiveTab("potensi")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${popupActiveTab === "potensi"
                        ? "bg-white text-[#2D7344] shadow-sm"
                        : "text-gray-500 hover:text-gray-800"
                        }`}
                    >
                      <Zap size={14} strokeWidth={2.5} />
                      <span>Potensi</span>
                    </button>
                    {detailData?.desa?.id && (
                      <button
                        type="button"
                        onClick={() => handleDownloadExcel(detailData.desa.id, detailData.desa.nama)}
                        disabled={isDownloading}
                        title="Download Data Desa (.xlsx)"
                        className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 text-emerald-700 bg-emerald-100/80 hover:bg-emerald-200/90 cursor-pointer disabled:opacity-50"
                      >
                        {isDownloading ? (
                          <Loader2 size={14} className="animate-spin text-emerald-700" />
                        ) : (
                          <Download size={14} strokeWidth={2.5} />
                        )}
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => setClickedLocation(null)}
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-md transition-colors ml-1"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="p-4 max-h-[350px] overflow-y-auto custom-scrollbar text-sm text-gray-700">
                  {isFetchingDetail ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-3">
                      <div className="w-6 h-6 border-2 border-[#2D7344] border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs text-gray-500 font-medium">
                        Menganalisis koordinat...
                      </span>
                    </div>
                  ) : detailData ? (
                    <div className="flex flex-col gap-3">
                      {popupActiveTab === "spasial" ? (
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
                            {detailData.desa && (
                              <p className="text-xs text-gray-500 font-medium mt-1 leading-snug">
                                {[
                                  detailData.desa.kecamatan && (typeof detailData.desa.kecamatan === 'object' ? detailData.desa.kecamatan.nama : detailData.desa.kecamatan),
                                  detailData.desa.kabupaten && (typeof detailData.desa.kabupaten === 'object' ? detailData.desa.kabupaten.nama : detailData.desa.kabupaten),
                                  detailData.desa.provinsi && (typeof detailData.desa.provinsi === 'object' ? detailData.desa.provinsi.nama : detailData.desa.provinsi),
                                ]
                                  .filter(Boolean)
                                  .join(" • ")}
                              </p>
                            )}
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
                                Nama Kawasan (Sesuai titik)
                              </p>
                              <p
                                className="font-bold text-gray-800 text-sm"
                                title={detailData.hutan?.fungsiKawasan?.nama}
                              >
                                {detailData.hutan?.fungsiKawasan?.nama || 'Tidak terdata'}
                              </p>
                            </div>
                          </div>

                          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
                            <div className="absolute right-0 top-0 w-16 h-16 bg-emerald-50 rounded-bl-full -z-0 opacity-60 pointer-events-none"></div>
                            <div className="relative z-10">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                                    Luas Kawasan
                                  </p>
                                  <div className="text-left shrink-0 flex justify-between items-center">
                                    <span className="text-xl font-extrabold text-gray-800 block leading-none">
                                      {detailData.irisan?.luasPersen ?? 0}%
                                    </span>
                                    {detailData.irisan?.luasHa != null && (
                                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 mt-1 inline-block">
                                        {Number(detailData.irisan.luasHa).toLocaleString("id-ID")} Ha
                                      </span>
                                    )}
                                  </div>
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
                            </div>
                          </div>
                        </div>
                      ) : detailData.desa?.potensi && detailData.desa.potensi.length > 0 ? (
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                            <span className="text-xs font-bold text-gray-800">
                              Data Potensi Desa {detailData.desa.nama ? `(${detailData.desa.nama})` : ""}
                            </span>
                            <span className="text-[10px] font-bold text-[#2D7344] bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded font-mono">
                              {detailData.desa.potensi.length} Kategori
                            </span>
                          </div>

                          <div className="space-y-3 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                            {detailData.desa.potensi.map((cat, catIdx) => (
                              <div
                                key={catIdx}
                                className="bg-gray-50/80 p-3 rounded-xl border border-gray-100 space-y-2"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-extrabold text-[#2D7344] uppercase tracking-wide">
                                    {cat.kategori || cat.header || `Kategori ${catIdx + 1}`}
                                  </span>
                                  <span className="text-[9px] font-bold text-gray-400 font-mono">
                                    {cat.sub?.length || 0} sub
                                  </span>
                                </div>

                                {cat.sub && cat.sub.length > 0 ? (
                                  <div className="space-y-1.5 pt-1">
                                    {cat.sub.map((item, itemIdx) => (
                                      <div
                                        key={itemIdx}
                                        className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-gray-100 shadow-2xs"
                                      >
                                        <span className="font-semibold text-gray-700 truncate pr-2">
                                          {item.nama}
                                        </span>
                                        <span className="font-bold text-gray-900 shrink-0 font-mono text-[11px]">
                                          {item.nilai ?? "-"} {item.unit || ""}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-[10px] text-gray-400 italic">
                                    Tidak ada rincian sub-potensi
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 px-3 text-center">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#2D7344] flex items-center justify-center mb-3 border border-emerald-100 shadow-inner">
                            <Zap size={22} strokeWidth={2} />
                          </div>
                          <h4 className="font-extrabold text-gray-800 text-sm mb-1">
                            Potensi Desa
                          </h4>
                          <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-[240px]">
                            Belum terdapat data potensi desa pada desa ini
                          </p>
                        </div>
                      )}
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
      </Map>

      {/* =========================================
          2. FLOATING UI (HUD) - SEARCH INTERNAL
      ========================================= */}

      <div className="absolute top-6 left-6 z-10 flex flex-col gap-4 w-full max-w-[340px] pointer-events-none">
        {/* Row: Tombol Back & Brand */}
        <div className="flex items-stretch gap-3 pointer-events-auto">
          {/* Tombol Kembali ke Beranda */}
          <button
            onClick={() => navigate("/")}
            className="group px-4 bg-white/70 hover:bg-white backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-[20px] flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#2D7344]/40"
            title="Kembali ke Beranda"
          >
            <ArrowLeft
              size={22}
              className="text-gray-600 group-hover:text-[#2D7344] group-hover:-translate-x-1 transition-all duration-300"
              strokeWidth={2.5}
            />
          </button>

          {/* Brand */}
          <div className="flex-1 bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-[20px] p-3 flex items-center gap-4">
            <div className="w-11 h-11 bg-gradient-to-br from-[#1e5230] to-[#2D7344] rounded-[14px] flex items-center justify-center shadow-inner shrink-0">
              <MapIcon className="text-white" size={24} strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="font-extrabold text-gray-800 tracking-wide text-lg leading-tight">
                GEO<span className="text-[#2D7344]">DASHBOARD</span>
              </h1>
              <p className="text-[9px] text-gray-500 uppercase tracking-[0.25em] font-bold">
                GEODASHBOARD SISTEM GRAWANA
              </p>
            </div>
          </div>
        </div>

        {/* INPUT PENCARIAN & DROPDOWN LOKAL */}
        <div className="relative pointer-events-auto w-full">
          <div className="bg-white/90 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-[16px] p-1.5 flex items-center gap-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#2D7344]/40 transition-all duration-300 z-20 relative">
            <div className="pl-3 text-gray-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Cari Data Desa..."
              value={searchQuery}

              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => {
                if (searchResults.length > 0) setShowDropdown(true);
              }}
              className="w-full bg-transparent border-none text-sm text-gray-700 font-medium placeholder-gray-400 focus:outline-none py-2.5"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setShowDropdown(false);
                }}
                className="p-1 mr-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={16} />
              </button>
            )}
            <button className="bg-[#2D7344] hover:bg-[#1e5230] text-white p-2.5 rounded-xl transition-colors shadow-md flex items-center justify-center">
              <Search size={16} strokeWidth={3} />
            </button>
          </div>

          {/* HASIL PENCARIAN API */}
          {showDropdown && searchQuery.length >= 2 && (
            <div className="absolute top-[110%] left-0 w-full bg-white/95 backdrop-blur-xl border border-white shadow-[0_15px_40px_rgb(0,0,0,0.12)] rounded-[16px] overflow-hidden z-10 animate-in fade-in slide-in-from-top-2 duration-200">
              {isFetchingSearch ? (
                <div className="text-center py-5 text-xs text-gray-500 flex flex-col items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-[#2D7344]" />
                  <span>Mencari desa...</span>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                  {searchResults.map((desa) => (
                    <button
                      key={desa.id}
                      onClick={() => handleSelectLocation(desa)}
                      className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors"
                    >
                      <Home
                        size={16}
                        className="text-[#2D7344] mt-0.5 shrink-0"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-800 line-clamp-1">
                          {desa.nama}
                        </span>
                        <span className="text-[11px] text-gray-500 line-clamp-1">
                          {desa.kecamatan}, {desa.kabupaten} • {desa.provinsi}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {desa.kode_kemendagri}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-xs text-gray-500 font-medium">
                  Data desa tidak ditemukan.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Panel Kanan Atas (Base Map & Data Layers) */}
      <div className="absolute top-6 right-6 z-10 flex flex-col gap-3 items-end pointer-events-none">
        {/* Toggle Base Map */}
        <div className="relative pointer-events-auto">
          <button
            onClick={() => toggleMenu("style")}
            className={`flex items-center justify-center w-12 h-12 rounded-[16px] backdrop-blur-xl border shadow-[0_8px_20px_rgb(0,0,0,0.08)] transition-all duration-300 focus:outline-none ${activeMenu === "style" ? "bg-white border-[#2D7344]/50 text-[#2D7344] scale-105" : "bg-white/70 border-white/50 text-gray-600 hover:bg-white hover:text-[#2D7344]"}`}
          >
            <Globe size={22} strokeWidth={1.5} />
          </button>
          {activeMenu === "style" && (
            <div className="absolute right-14 top-0 w-52 bg-white/80 backdrop-blur-2xl border border-white/60 shadow-[0_10px_40px_rgb(0,0,0,0.1)] rounded-[20px] overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="px-5 py-3 border-b border-gray-100/50 bg-white/50">
                <h4 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                  Base Map
                </h4>
              </div>
              <div className="p-2 flex flex-col gap-1">
                {mapStyleOptions.map((option) => (
                  <button
                    key={option.name}
                    onClick={() => {
                      setMapStyle(option.value);
                      setActiveMenu(null);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-[12px] text-sm font-semibold transition-all ${mapStyle === option.value ? "bg-[#2D7344]/10 text-[#2D7344]" : "text-gray-600 hover:bg-gray-100/80 hover:text-gray-900"}`}
                  >
                    <span
                      className={
                        mapStyle === option.value
                          ? "text-[#2D7344]"
                          : "text-gray-400"
                      }
                    >
                      {option.icon}
                    </span>
                    {option.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Toggle & Opacity Slider Layer WMS */}
        <div className="relative pointer-events-auto">
          <button
            onClick={() => toggleMenu("layer")}
            className={`flex items-center justify-center w-12 h-12 rounded-[16px] backdrop-blur-xl border shadow-[0_8px_20px_rgb(0,0,0,0.08)] transition-all duration-300 focus:outline-none ${activeMenu === "layer" ? "bg-white border-[#2D7344]/50 text-[#2D7344] scale-105" : "bg-white/70 border-white/50 text-gray-600 hover:bg-white hover:text-[#2D7344]"}`}
          >
            <Layers size={22} strokeWidth={1.5} />
            {(showLayerHutan || showLayerDesa || showLayerDesaHutan || showLayerPsn) && (
              <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm"></div>
            )}
          </button>

          {activeMenu === "layer" && (
            <div className="absolute right-14 top-0 w-[300px] bg-white/80 backdrop-blur-2xl border border-white/60 shadow-[0_10px_40px_rgb(0,0,0,0.1)] rounded-[24px] overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="px-5 py-4 border-b border-gray-100/50 bg-white/50">
                <h4 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                  Kontrol Layer Spasial
                </h4>
              </div>
              <div className="p-3 flex flex-col gap-3">
                {/* --- KONTROL: LAYER HUTAN --- */}
                <div
                  className={`p-4 rounded-[16px] border transition-all duration-300 ${showLayerHutan ? "bg-white/90 border-emerald-100 shadow-sm" : "bg-gray-50/50 border-transparent opacity-70 grayscale"}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-xl transition-colors ${showLayerHutan ? "bg-emerald-100 text-emerald-600" : "bg-gray-200 text-gray-400"}`}
                      >
                        <Trees size={16} strokeWidth={2} />
                      </div>
                      <div>
                        <div
                          className={`text-sm font-bold transition-colors ${showLayerHutan ? "text-gray-800" : "text-gray-500"}`}
                        >
                          Kawasan Hutan
                        </div>
                        <div className="text-[10px] text-gray-400 font-medium">
                          Kemenhut Desember 2025
                        </div>
                      </div>
                    </div>
                    <label className="cursor-pointer">
                      <div
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ease-in-out shadow-inner ${showLayerHutan ? "bg-[#2D7344]" : "bg-gray-300"}`}
                      >
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={showLayerHutan}
                          onChange={() => setShowLayerHutan(!showLayerHutan)}
                        />
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-spring ${showLayerHutan ? "translate-x-5" : "translate-x-0"}`}
                        />
                      </div>
                    </label>
                  </div>

                  {showLayerHutan && (
                    <div className="pt-2 border-t border-gray-100/80 animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          Transparansi
                        </span>
                        <span className="font-mono text-xs font-bold text-emerald-600">
                          {opacityHutan}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={opacityHutan}
                        onChange={(e) =>
                          setOpacityHutan(parseInt(e.target.value))
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                      />
                    </div>
                  )}
                </div>

                {/* --- KONTROL: LAYER DESA --- */}
                <div
                  className={`p-4 rounded-[16px] border transition-all duration-300 ${showLayerDesa ? "bg-white/90 border-blue-100 shadow-sm" : "bg-gray-50/50 border-transparent opacity-70 grayscale"}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-xl transition-colors ${showLayerDesa ? "bg-blue-100 text-blue-600" : "bg-gray-200 text-gray-400"}`}
                      >
                        <Home size={16} strokeWidth={2} />
                      </div>
                      <div>
                        <div
                          className={`text-sm font-bold transition-colors ${showLayerDesa ? "text-gray-800" : "text-gray-500"}`}
                        >
                          Batas Desa
                        </div>
                        <div className="text-[10px] text-gray-400 font-medium">
                          PETA RBI 2026 (BIG)
                        </div>
                      </div>
                    </div>
                    <label className="cursor-pointer">
                      <div
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ease-in-out shadow-inner ${showLayerDesa ? "bg-blue-600" : "bg-gray-300"}`}
                      >
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={showLayerDesa}
                          onChange={() => setShowLayerDesa(!showLayerDesa)}
                        />
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-spring ${showLayerDesa ? "translate-x-5" : "translate-x-0"}`}
                        />
                      </div>
                    </label>
                  </div>

                  {showLayerDesa && (
                    <div className="pt-2 border-t border-gray-100/80 animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          Transparansi
                        </span>
                        <span className="font-mono text-xs font-bold text-blue-600">
                          {opacityDesa}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={opacityDesa}
                        onChange={(e) =>
                          setOpacityDesa(parseInt(e.target.value))
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                  )}
                </div>

                {/* --- KONTROL: LAYER DESA HUTAN --- */}
                <div
                  className={`p-4 rounded-[16px] border transition-all duration-300 ${showLayerDesaHutan ? "bg-white/90 border-teal-100 shadow-sm" : "bg-gray-50/50 border-transparent opacity-70 grayscale"}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-xl transition-colors ${showLayerDesaHutan ? "bg-teal-100 text-teal-600" : "bg-gray-200 text-gray-400"}`}
                      >
                        <TreePine size={16} strokeWidth={2} />
                      </div>
                      <div>
                        <div
                          className={`text-sm font-bold transition-colors ${showLayerDesaHutan ? "text-gray-800" : "text-gray-500"}`}
                        >
                          Desa Hutan
                        </div>
                        <div className="text-[10px] text-gray-400 font-medium">
                          PETA DESA HUTAN
                        </div>
                      </div>
                    </div>
                    <label className="cursor-pointer">
                      <div
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ease-in-out shadow-inner ${showLayerDesaHutan ? "bg-teal-600" : "bg-gray-300"}`}
                      >
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={showLayerDesaHutan}
                          onChange={() => setShowLayerDesaHutan(!showLayerDesaHutan)}
                        />
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-spring ${showLayerDesaHutan ? "translate-x-5" : "translate-x-0"}`}
                        />
                      </div>
                    </label>
                  </div>

                  {showLayerDesaHutan && (
                    <div className="pt-2 border-t border-gray-100/80 animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          Transparansi
                        </span>
                        <span className="font-mono text-xs font-bold text-teal-600">
                          {opacityDesaHutan}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={opacityDesaHutan}
                        onChange={(e) =>
                          setOpacityDesaHutan(parseInt(e.target.value))
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                      />
                    </div>
                  )}
                </div>

                {/* --- KONTROL: LAYER DESA PSN --- */}
                <div
                  className={`p-4 rounded-[16px] border transition-all duration-300 ${showLayerPsn ? "bg-white/90 border-purple-100 shadow-sm" : "bg-gray-50/50 border-transparent opacity-70 grayscale"}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-xl transition-colors ${showLayerPsn ? "bg-purple-100 text-purple-600" : "bg-gray-200 text-gray-400"}`}
                      >
                        <Zap size={16} strokeWidth={2} />
                      </div>
                      <div>
                        <div
                          className={`text-sm font-bold transition-colors ${showLayerPsn ? "text-gray-800" : "text-gray-500"}`}
                        >
                          Desa PSN
                        </div>
                        <div className="text-[10px] text-gray-400 font-medium">
                          KETAHANAN PANGAN
                        </div>
                      </div>
                    </div>
                    <label className="cursor-pointer">
                      <div
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ease-in-out shadow-inner ${showLayerPsn ? "bg-purple-600" : "bg-gray-300"}`}
                      >
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={showLayerPsn}
                          onChange={() => setShowLayerPsn(!showLayerPsn)}
                        />
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-spring ${showLayerPsn ? "translate-x-5" : "translate-x-0"}`}
                        />
                      </div>
                    </label>
                  </div>

                  {showLayerPsn && (
                    <div className="pt-2 border-t border-gray-100/80 animate-in fade-in zoom-in-95 duration-200 flex flex-col gap-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Transparansi
                          </span>
                          <span className="font-mono text-xs font-bold text-purple-600">
                            {opacityPsn}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={opacityPsn}
                          onChange={(e) =>
                            setOpacityPsn(parseInt(e.target.value))
                          }
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Tahun Target
                          </span>
                          <span className="font-mono text-xs font-bold text-purple-600">
                            {tahunPsn}
                          </span>
                        </div>
                        <div className="grid grid-cols-5 gap-1 bg-gray-100 p-1 rounded-xl">
                          {[2025, 2026, 2027, 2028, 2029].map((yr) => (
                            <button
                              key={yr}
                              type="button"
                              onClick={() => setTahunPsn(yr)}
                              className={`py-1 text-center font-bold text-xs rounded-lg transition-all ${tahunPsn === yr ? "bg-purple-600 text-white shadow-sm scale-105" : "text-gray-500 hover:text-gray-800 hover:bg-gray-200"}`}
                            >
                              {yr}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* --- PANEL BAWAH TENGAH (Koordinat Console) --- */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <div className="bg-gray-900/80 backdrop-blur-md border border-gray-700 shadow-2xl rounded-full px-6 py-3 flex items-center gap-6 pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              LNG
            </span>
            <span ref={lngRef} className="font-mono text-emerald-50 text-sm font-semibold w-20">
              118.01490°
            </span>
          </div>
          <div className="w-px h-4 bg-gray-700"></div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              LAT
            </span>
            <span ref={latRef} className="font-mono text-emerald-50 text-sm font-semibold w-20">
              -2.54890°
            </span>

          </div>
        </div>
      </div>

      {/* CSS Override */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-popup .mapboxgl-popup-content { background: transparent !important; padding: 0 !important; box-shadow: none !important; }
        .custom-popup .mapboxgl-popup-tip { border-top-color: white !important; }

        /* Styling Thumb Slider */
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          background: white;
          border: 2.5px solid currentColor;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `,
        }}
      />
    </div>
  );
}
