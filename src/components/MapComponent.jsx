import { useState } from "react";
import Map, { NavigationControl, Marker } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export default function MapComponent() {
  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  // 2. Gunakan state untuk mengontrol posisi peta (Controlled Component)
  const [viewState, setViewState] = useState({
    longitude: 106.8229, // Titik tengah (misal: Jakarta)
    latitude: -6.2088,
    zoom: 11,
    pitch: 0,
    bearing: 0,
  });

  // 3. Error Handling: Cegah aplikasi crash jika token kosong
  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex items-center justify-center w-full h-[500px] bg-gray-100 rounded-xl border border-red-300">
        <p className="text-red-500 font-semibold text-center px-4">
          ⚠️ Mapbox token tidak ditemukan.
          <br />
          Pastikan kamu sudah mengaturnya di file .env
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center py-8">
      {/* Container peta dengan styling Tailwind */}
      <div className="w-full max-w-5xl h-[600px] rounded-2xl overflow-hidden shadow-xl border border-gray-200 relative">
        <Map
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: "100%", height: "100%" }}
        >
          {/* Kontrol Navigasi (Zoom In/Out, Compass) */}
          <NavigationControl position="top-right" />

          {/* Marker Contoh */}
          <Marker
            longitude={106.8229}
            latitude={-6.2088}
            color="#3b82f6"
            anchor="bottom"
          />
        </Map>
      </div>
    </div>
  );
}
