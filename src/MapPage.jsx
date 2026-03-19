import { useState } from "react";
import Map, {
  Marker,
  NavigationControl,
  FullscreenControl,
  GeolocateControl,
  ScaleControl,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  Search,
  Layers,
  Globe,
  Map as MapIcon,
  Moon,
  Sun,
  MapPin,
} from "lucide-react";

export default function MapPage() {
  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

  // 1. State view posisi peta
  const [viewState, setViewState] = useState({
    longitude: 106.8229,
    latitude: -6.2088,
    zoom: 13,
    pitch: 45,
    bearing: -17.6,
  });

  // 2. State untuk Tema Peta (Default: Streets/Jalan biasa)
  const [mapStyle, setMapStyle] = useState(
    "mapbox://styles/mapbox/streets-v12",
  );

  // 3. State untuk buka/tutup menu pilihan peta
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);

  // Daftar Pilihan Gaya Peta
  const mapStyleOptions = [
    {
      name: "Satelit",
      value: "mapbox://styles/mapbox/satellite-streets-v12",
      icon: <Globe size={16} />,
    },
    {
      name: "Jalan (Default)",
      value: "mapbox://styles/mapbox/streets-v12",
      icon: <MapIcon size={16} />,
    },
    {
      name: "Terang",
      value: "mapbox://styles/mapbox/light-v11",
      icon: <Sun size={16} />,
    },
    {
      name: "Gelap",
      value: "mapbox://styles/mapbox/dark-v11",
      icon: <Moon size={16} />,
    },
  ];

  // Error State jika token tidak ada
  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex items-center justify-center w-screen h-screen bg-[#FAFAFA] p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-200 max-w-md text-center">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl border border-red-100 shadow-sm">
            ⚠️
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3 tracking-wide">
            Akses Ditolak
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Sistem tidak dapat menemukan Mapbox Token. Tambahkan{" "}
            <code className="bg-gray-100 text-[#2D7344] px-2 py-1 rounded font-mono text-xs font-bold">
              VITE_MAPBOX_TOKEN
            </code>{" "}
            ke dalam file .env.
          </p>
        </div>
      </div>
    );
  }

  return (
    // Wrapper Full Screen dengan background terang
    <div className="relative w-screen h-screen overflow-hidden bg-[#E8EDE9] font-sans selection:bg-[#2D7344]/30">
      {/* --- KANVAS PETA --- */}
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle={mapStyle} // Dinamis berdasarkan pilihan user
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: "100%", height: "100%" }}
      >
        {/* Kontrol Peta */}
        <GeolocateControl position="bottom-right" />
        <FullscreenControl position="bottom-right" />
        <NavigationControl position="bottom-right" showCompass={true} />
        <ScaleControl position="bottom-left" />

        {/* Custom Marker Premium (Tema Hijau) */}
        <Marker longitude={106.8229} latitude={-6.2088} anchor="center">
          <div className="relative flex items-center justify-center cursor-pointer group">
            <div className="absolute w-12 h-12 bg-[#2D7344]/20 rounded-full animate-ping"></div>
            <div className="absolute w-8 h-8 bg-[#2D7344]/40 rounded-full animate-pulse"></div>
            <div className="relative w-4 h-4 bg-[#2D7344] border-[2px] border-white rounded-full shadow-[0_0_10px_rgba(45,115,68,0.6)] group-hover:bg-[#205e46] transition-colors"></div>
          </div>
        </Marker>
      </Map>

      {/* --- FLOATING UI ELEMENTS --- */}

      {/* 1. Header Navigation Bar (Kaca Terang) */}
      <header className="absolute top-0 left-0 right-0 z-10 px-6 py-4 flex items-center justify-between pointer-events-none">
        <div className="bg-white/80 backdrop-blur-md border border-white shadow-lg rounded-2xl px-5 py-2.5 flex items-center gap-4 pointer-events-auto transition-all hover:bg-white">
          <div className="w-9 h-9 bg-gradient-to-tr from-[#205e46] to-[#2D7344] rounded-lg shadow-md flex items-center justify-center">
            <MapPin className="text-white" size={18} />
          </div>
          <div>
            <h1 className="text-gray-800 font-bold tracking-wider text-sm md:text-base">
              GEO<span className="text-[#2D7344]">DASHBOARD</span>
            </h1>
            <p className="text-gray-500 text-[10px] uppercase tracking-widest font-semibold">
              Desa Hutan Interaktif
            </p>
          </div>
        </div>
      </header>

      {/* 2. Search Bar (Kiri Atas) */}
      <div className="absolute top-24 left-6 z-10 w-full max-w-sm pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md border border-gray-100 shadow-lg rounded-2xl p-2 flex items-center gap-2 pointer-events-auto focus-within:ring-2 focus-within:ring-[#2D7344]/50 transition-all">
          <div className="pl-3 text-gray-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Cari lokasi atau desa..."
            className="w-full bg-transparent border-none text-gray-700 text-sm focus:outline-none placeholder-gray-400 py-2"
          />
          <button className="bg-[#2D7344] hover:bg-[#205e46] text-white p-2 rounded-xl transition-colors shadow-md">
            <Search size={18} />
          </button>
        </div>
      </div>

      {/* 3. Toggler Tipe Peta (Kanan Atas) */}
      <div className="absolute top-24 right-6 z-10 pointer-events-auto flex flex-col items-end">
        {/* Tombol Layer */}
        <button
          onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
          className="bg-white/90 backdrop-blur-md border border-gray-100 shadow-lg p-3 rounded-2xl text-gray-600 hover:text-[#2D7344] hover:bg-white transition-all focus:outline-none"
          title="Ubah Tipe Peta"
        >
          <Layers size={22} />
        </button>

        {/* Dropdown Pilihan Peta */}
        {isLayerMenuOpen && (
          <div className="mt-2 w-48 bg-white/95 backdrop-blur-xl border border-gray-100 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Tipe Peta
              </h4>
            </div>
            <div className="p-2 flex flex-col gap-1">
              {mapStyleOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={() => {
                    setMapStyle(option.value);
                    setIsLayerMenuOpen(false); // Tutup menu setelah memilih
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    mapStyle === option.value
                      ? "bg-[#2D7344]/10 text-[#2D7344]"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {option.icon}
                  {option.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. Panel Info Kordinat (Kiri Bawah) */}
      <div className="absolute bottom-10 left-6 z-10 pointer-events-none">
        <div className="bg-white/90 backdrop-blur-lg border border-gray-200 shadow-2xl rounded-3xl p-5 w-64 md:w-80 pointer-events-auto group">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-[#F0F5F2] border border-[#2D7344]/20 flex items-center justify-center shadow-sm group-hover:border-[#2D7344]/50 transition-colors">
              <MapPin className="text-[#2D7344]" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-base tracking-wide">
                Lokasi Aktif
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="flex w-2 h-2 bg-[#2D7344] rounded-full animate-pulse"></span>
                <p className="text-xs text-gray-500 font-medium tracking-wide">
                  Titik Pemantauan
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
              <span className="block text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">
                Longitude
              </span>
              <span className="font-mono font-bold text-gray-700 text-sm">
                {viewState.longitude.toFixed(5)}°
              </span>
            </div>
            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
              <span className="block text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">
                Latitude
              </span>
              <span className="font-mono font-bold text-gray-700 text-sm">
                {viewState.latitude.toFixed(5)}°
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
