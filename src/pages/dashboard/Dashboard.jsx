import React from "react";
import DashboardLayout from "../components/DashboardLayout";

const Dashboard = () => {
  // --- MOCK DATA UNTUK TABEL ---
  const tableData = [
    { id: 11, provinsi: "Aceh", jumlah: 18 },
    { id: 12, provinsi: "Sumatera Utara", jumlah: 90 },
    { id: 13, provinsi: "Sumatera Barat", jumlah: 42 },
    { id: 14, provinsi: "Riau", jumlah: 10 },
    { id: 15, provinsi: "Jambi", jumlah: 48 },
    { id: 16, provinsi: "Sumatera Selatan", jumlah: 20 },
    { id: 17, provinsi: "Bengkulu", jumlah: 15 },
    { id: 18, provinsi: "Lampung", jumlah: 11 },
    { id: 19, provinsi: "Kepulauan Bangka Belitung", jumlah: 47 },
    { id: 20, provinsi: "Kepulauan Riau", jumlah: 4 },
    { id: 31, provinsi: "DKI Jakarta", jumlah: 0 },
    { id: 32, provinsi: "Jawa Barat", jumlah: 10 },
    { id: 35, provinsi: "Jawa Timur", jumlah: 23 },
  ];

  return (
    <DashboardLayout activeMenu={"Dashboard"}>
      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* SCROLLABLE KONTEN */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
          {/* 1. BAGIAN PETA */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
            <h2 className="text-sm font-bold text-gray-800 mb-3 ml-2">
              Peta Sebaran Desa Hutan
            </h2>
            <div
              className="w-full h-[250px] md:h-[350px] bg-gray-200 rounded-lg overflow-hidden relative"
              style={{
                // Ganti URL ini dengan API Mapbox asli Anda atau gambar yang sesuai
                backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2000&auto=format&fit=crop')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* Mockup UI Peta */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <div className="bg-white rounded shadow text-gray-600 flex flex-col">
                  <button className="px-2 py-1 border-b border-gray-200 hover:bg-gray-100 font-bold">
                    +
                  </button>
                  <button className="px-2 py-1 hover:bg-gray-100 font-bold">
                    -
                  </button>
                </div>
              </div>
              <div className="absolute top-4 left-14 bg-[#1A252E] text-white text-xs px-3 py-1.5 rounded-md flex items-center gap-2 shadow">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <span className="text-gray-300">Pencarian data layer...</span>
              </div>
            </div>
          </div>

          {/* 2. BAGIAN FILTER */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col lg:flex-row gap-4 items-center">
            <select className="flex-1 w-full bg-white border border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg text-sm focus:outline-none focus:border-[#2D7344] appearance-none cursor-pointer">
              <option>Status</option>
            </select>
            <select className="flex-1 w-full bg-white border border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg text-sm focus:outline-none focus:border-[#2D7344] appearance-none cursor-pointer">
              <option>Tahun</option>
            </select>
            <select className="flex-1 w-full bg-white border border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg text-sm focus:outline-none focus:border-[#2D7344] appearance-none cursor-pointer">
              <option>Kawasan</option>
            </select>

            <div className="flex-1 w-full relative">
              <input
                type="text"
                placeholder="Search"
                className="w-full bg-white border border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg text-sm focus:outline-none focus:border-[#2D7344]"
              />
              <svg
                className="absolute right-3 top-2.5 text-gray-400"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>

            <button className="flex items-center justify-center gap-2 bg-[#E2E8F0] hover:bg-gray-300 text-gray-700 py-2.5 px-6 rounded-lg text-sm font-bold transition-colors">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <polyline points="3 3 3 8 8 8"></polyline>
              </svg>
              RESET
            </button>
            <button className="flex items-center justify-center gap-2 bg-[#3A8353] hover:bg-[#2D7344] text-white py-2.5 px-6 rounded-lg text-sm font-bold transition-colors shadow-md shadow-green-900/10">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
              FILTER
            </button>
          </div>

          {/* 3. GRID UTAMA (KARTU KECIL, TABEL, KARTU BESAR) */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Baris Atas: 4 Kartu Kecil (Akan mengisi 4 kolom pada lg) */}
            <div className="col-span-1 lg:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {["KHDTK", "HK", "HL", "HP"].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-[#3A8353] rounded-xl p-5 relative shadow-md shadow-green-900/10 hover:-translate-y-1 transition-transform cursor-pointer"
                >
                  <div className="absolute top-4 right-4 bg-white rounded-full w-6 h-6 flex items-center justify-center text-[#3A8353]">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="7" y1="17" x2="17" y2="7"></line>
                      <polyline points="7 7 17 7 17 17"></polyline>
                    </svg>
                  </div>
                  <h4 className="text-[#A4D6B5] text-sm font-medium mb-1">
                    Desa di {item}
                  </h4>
                  <p className="text-white text-3xl font-bold">24</p>
                </div>
              ))}
            </div>

            {/* Baris Bawah: Tabel (3 Kolom) & Kartu Besar (1 Kolom) */}
            <div className="col-span-1 lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 p-5 overflow-hidden flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-gray-800">
                  Rekapitulasi Desa Hutan per Provinsi
                </h3>
                <button className="flex items-center gap-2 bg-[#3A8353] hover:bg-[#2D7344] text-white px-4 py-2 rounded-md text-xs font-bold transition-colors">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  EXPORT DATA
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-200 text-xs font-bold text-gray-800">
                      <th className="py-3 px-2">Kode Provinsi</th>
                      <th className="py-3 px-2">Provinsi</th>
                      <th className="py-3 px-2 text-center">Jumlah Unit</th>
                      <th className="py-3 px-2 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs text-gray-700">
                    {tableData.map((row, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-2">{row.id}</td>
                        <td className="py-3 px-2">{row.provinsi}</td>
                        <td className="py-3 px-2 text-center">{row.jumlah}</td>
                        <td className="py-3 px-2 flex justify-center">
                          <button className="text-[#3A8353] hover:text-[#2D7344] bg-[#E8F2EC] p-1.5 rounded-full transition-colors">
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Minimalis */}
              <div className="flex justify-end items-center gap-4 mt-4 text-xs text-gray-400">
                <span>Rows 1-15 of 36</span>
                <div className="flex gap-2">
                  <button className="text-gray-300 hover:text-gray-600">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
                    </svg>
                  </button>
                  <button className="text-gray-600 hover:text-black">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Kartu Besar (Sebelah Kanan Tabel) */}
            <div className="col-span-1 bg-[#3A8353] rounded-xl shadow-md shadow-green-900/10 flex flex-col items-center justify-center py-12 px-6 min-h-[300px]">
              <h2 className="text-white text-5xl md:text-6xl font-bold mb-3 tracking-tight">
                268
              </h2>
              <p className="text-[#B9E0C4] text-lg font-medium text-center">
                Total Jumlah Unit Desa
              </p>
            </div>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default Dashboard;
