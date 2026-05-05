import React, { useState, useMemo, useCallback, useRef } from "react";
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
import "mapbox-gl/dist/mapbox-gl.css";
import {
  Search,
  Globe,
  Map as MapIcon,
  Moon,
  Sun,
  MapPin,
  Layers,
  Trees,
  Home,
  Crosshair,
  X,
  Activity,
  Info,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import environment from "./config/environment";
import { analystSpatialService } from "./services/master/analystSpatialService";
// --- IMPORT SERVICE DESA ---
// Pastikan path ini sesuai dengan struktur folder Anda
import { wilayahDesaService } from "./services/master/wilayahDesaService";
import { useNavigate } from "react-router-dom";

export default function MapPage() {
  const MAPBOX_TOKEN = environment.MAPBOX_URL;

  // --- REFERENSI PETA UNTUK FLY-TO ---
  const mapRef = useRef(null);

  // 1. State Posisi Peta
  const [initialViewState] = useState({
    longitude: 106.8229,
    latitude: -6.2088,
    zoom: 13,
    pitch: 0,
    bearing: 0,
  });

  const [displayCoords, setDisplayCoords] = useState({
    longitude: 106.8229,
    latitude: -6.2088,
  });

  // --- STATE INTERAKSI KLIK PETA ---
  const [clickedLocation, setClickedLocation] = useState(null);
  const navigate = useNavigate();

  // --- STATE PENCARIAN (LOKAL) ---
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // --- FETCHING SEMUA DATA DESA DARI API INTERNAL UNTUK PENCARIAN ---
  const { data: responseDesa, isLoading: isFetchingDesaData } = useQuery({
    queryKey: ["allVillagesMap"],
    queryFn: () => wilayahDesaService.getAllDesa(1, 1000), // Ambil banyak data sekaligus
    staleTime: 60000,
  });

  const listDesa = responseDesa?.items || [];

  console.log(listDesa);

  // --- FILTERING LOKAL BERDASARKAN INPUT ---
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
      .slice(0, 8); // Batasi maksimal 8 hasil agar dropdown tidak terlalu panjang
  }, [searchQuery, listDesa]);

  // 2. State Tema Peta
  const [mapStyle, setMapStyle] = useState(
    "mapbox://styles/mapbox/streets-v12",
  );
  const [activeMenu, setActiveMenu] = useState(null);

  // 3. State Visibilitas Layer WMS (ON/OFF)
  const [showLayerHutan, setShowLayerHutan] = useState(true);
  const [showLayerDesa, setShowLayerDesa] = useState(true);

  // 4. State Opacity Layer WMS (0 - 100)
  const [opacityHutan, setOpacityHutan] = useState(80);
  const [opacityDesa, setOpacityDesa] = useState(80);

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

  // --- URL WMS GEOSERVER ---
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
    setDisplayCoords({ longitude, latitude });
  }, []);

  const handleMapClick = useCallback((evt) => {
    const { lngLat } = evt;
    setClickedLocation({
      longitude: lngLat.lng,
      latitude: lngLat.lat,
    });
    // Tutup dropdown jika peta diklik
    setShowDropdown(false);
  }, []);

  const closePopup = () => {
    setClickedLocation(null);
  };

  // --- FUNGSI SAAT LOKASI DESA DIPILIH ---
  const handleSelectLocation = (desa) => {
    setSearchQuery(desa.nama);
    setShowDropdown(false);

    // Ambil koordinat dari data desa (sesuaikan dengan nama properti dari API Anda)
    // Jika API tidak mengirimkan coord, fallback ke posisi saat ini agar tidak error
    const lng = Number(desa.longitude) || Number(desa.lng) || 106.8229;
    const lat = Number(desa.latitude) || Number(desa.lat) || -6.2088;

    // Animasi terbang ke lokasi
    mapRef.current?.flyTo({
      center: [lng, lat],
      zoom: 15,
      duration: 2500,
      essential: true,
    });

    // Otomatis pasang marker popup di lokasi desa
    setClickedLocation({
      longitude: lng,
      latitude: lat,
    });
  };

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex items-center justify-center w-screen h-screen bg-[#F0F2F5] p-4">
        {/* Error UI Tetap Sama */}
      </div>
    );
  }

  console.log(detailData);

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
        style={{ width: "100%", height: "100%" }}
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
          >
            <Layer
              id="layer-hutan"
              type="raster"
              paint={{
                "raster-opacity": opacityHutan / 100,
                "raster-fade-duration": 0,
                "raster-resampling": "linear",
              }}
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
          >
            <Layer
              id="layer-desa"
              type="raster"
              paint={{
                "raster-opacity": opacityDesa / 100,
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
                <div className="bg-gray-900 text-white p-2 rounded-full shadow-lg border-2 border-white z-10">
                  <Crosshair size={16} strokeWidth={2.5} />
                </div>
                <div className="w-1 h-3 bg-gray-900 mt-0.5"></div>
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
              <div className="bg-white/95 backdrop-blur-xl border border-white rounded-[20px] shadow-[0_20px_40px_rgb(0,0,0,0.12)] overflow-hidden w-[280px] sm:w-[320px]">
                <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100 bg-gray-50/50">
                  <div className="flex items-center gap-2 text-[#2D7344]">
                    <Activity size={16} strokeWidth={2.5} />
                    <span className="font-bold text-xs uppercase tracking-widest">
                      Detail Spasial
                    </span>
                  </div>
                  <button
                    onClick={closePopup}
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-md transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="p-4 max-h-[350px] overflow-y-auto custom-scrollbar text-sm text-gray-700">
                  {isFetchingDetail ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-3">
                      <div className="w-6 h-6 border-2 border-[#2D7344] border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs text-gray-500 font-medium">
                        Menganalisis titik koordinat...
                      </span>
                    </div>
                  ) : detailData ? (
                    <div className="flex flex-col gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-emerald-50 text-[#2D7344] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-emerald-100">
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
                                <span className="font-bold text-[#2D7344] capitalize text-sm">
                                  {detailData.status || "-"}
                                </span>
                                <span className="text-gray-400 text-[10px] uppercase tracking-wider font-semibold">
                                  {detailData.jenis_interaksi?.replace(
                                    "_",
                                    " ",
                                  ) || "-"}
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
                              className="h-full bg-gradient-to-r from-emerald-400 to-[#2D7344] rounded-full transition-all duration-1000 ease-out"
                              style={{
                                width: `${Math.min(Number(detailData.luas_persen) || 0, 100)}%`,
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
                    <div className="text-center py-8 flex flex-col items-center gap-2">
                      <Info size={24} className="text-gray-300" />
                      <span className="text-gray-500 text-xs">
                        Tidak ada data desa/hutan pada titik koordinat ini.
                      </span>
                    </div>
                  )}
                </div>

                <div className="px-4 py-2.5 bg-gray-900 text-center border-t border-gray-800">
                  <span className="font-mono text-[10px] text-gray-400 tracking-wider">
                    {clickedLocation.longitude.toFixed(5)},{" "}
                    {clickedLocation.latitude.toFixed(5)}
                  </span>
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
                Sistem Tata Ruang
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
              placeholder="Cari Database Desa..."
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

          {/* HASIL PENCARIAN LOKAL */}
          {showDropdown && searchQuery.length >= 2 && (
            <div className="absolute top-[110%] left-0 w-full bg-white/95 backdrop-blur-xl border border-white shadow-[0_15px_40px_rgb(0,0,0,0.12)] rounded-[16px] overflow-hidden z-10 animate-in fade-in slide-in-from-top-2 duration-200">
              {isFetchingDesaData ? (
                <div className="text-center py-5 text-xs text-gray-500 flex flex-col items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-[#2D7344]" />
                  <span>Memuat database desa...</span>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
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
                          Kec. {desa.kecamatan} • Kode: {desa.kodeKemendagri}
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
            {(showLayerHutan || showLayerDesa) && (
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
                          GeoServer WMS
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
                          GeoServer WMS
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
            <span className="font-mono text-emerald-50 text-sm font-semibold w-20">
              {displayCoords.longitude.toFixed(5)}°
            </span>
          </div>
          <div className="w-px h-4 bg-gray-700"></div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              LAT
            </span>
            <span className="font-mono text-emerald-50 text-sm font-semibold w-20">
              {displayCoords.latitude.toFixed(5)}°
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
