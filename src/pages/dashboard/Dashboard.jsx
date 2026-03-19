import React from "react";
import DashboardLayout from "../../components/DashboardLayout";
import {
  Search,
  Filter,
  RotateCcw,
  Map as MapIcon,
  Layers,
  Plus,
  Minus,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
  TreePine,
  TrendingUp,
} from "lucide-react";

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
  ];

  return (
    <DashboardLayout activeMenu={"Dashboard"}>
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#FAFBFC]">
        {/* SCROLLABLE KONTEN */}
        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8 custom-scrollbar">
          {/* HEADER DASHBOARD */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Overview Desa Hutan
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Pantau dan kelola sebaran data desa hutan di seluruh Indonesia.
              </p>
            </div>
            <div className="text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Data Real-time Update
            </div>
          </div>

          {/* 1. BAGIAN PETA (Mewah dengan Glassmorphism) */}
          <div className="bg-white p-2 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 mb-8">
            <div
              className="w-full h-[300px] md:h-[400px] rounded-2xl overflow-hidden relative"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2000&auto=format&fit=crop')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* Overlay Gradient Halus */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10"></div>

              {/* Kontrol Peta */}
              <div className="absolute top-5 left-5 flex flex-col gap-2">
                <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg text-gray-700 flex flex-col overflow-hidden border border-white/20">
                  <button className="p-2.5 hover:bg-gray-100/80 transition-colors border-b border-gray-200/50">
                    <Plus size={18} strokeWidth={2.5} />
                  </button>
                  <button className="p-2.5 hover:bg-gray-100/80 transition-colors">
                    <Minus size={18} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* Badge Glassmorphism */}
              <div className="absolute top-5 right-5 bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-medium px-4 py-2.5 rounded-full flex items-center gap-2.5 shadow-lg">
                <Layers size={14} className="text-green-300" />
                <span>Memuat data spasial...</span>
              </div>
            </div>
          </div>

          {/* 2. BAGIAN FILTER (Sleek & Clean) */}
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 p-3 mb-8 flex flex-col lg:flex-row gap-3 items-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full lg:w-auto flex-1">
              <select className="w-full bg-gray-50 border-none text-gray-700 py-3 px-4 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:outline-none appearance-none cursor-pointer font-medium">
                <option>Semua Status</option>
              </select>
              <select className="w-full bg-gray-50 border-none text-gray-700 py-3 px-4 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:outline-none appearance-none cursor-pointer font-medium">
                <option>Tahun 2026</option>
              </select>
              <select className="w-full bg-gray-50 border-none text-gray-700 py-3 px-4 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:outline-none appearance-none cursor-pointer font-medium">
                <option>Semua Kawasan</option>
              </select>
            </div>

            <div className="w-full lg:w-80 relative">
              <input
                type="text"
                placeholder="Cari desa atau wilayah..."
                className="w-full bg-gray-50 border-none text-gray-700 py-3 pl-11 pr-4 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:outline-none font-medium"
              />
              <Search
                className="absolute left-4 top-3 text-gray-400"
                size={18}
              />
            </div>

            <div className="flex w-full lg:w-auto gap-3">
              <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-600 py-3 px-5 rounded-xl text-sm font-semibold transition-colors">
                <RotateCcw size={16} />
                <span className="hidden md:inline">Reset</span>
              </button>
              <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-[#2D7344] hover:bg-[#235e36] text-white py-3 px-6 rounded-xl text-sm font-semibold transition-all shadow-md shadow-green-900/20 hover:shadow-lg hover:shadow-green-900/30">
                <Filter size={16} />
                Filter
              </button>
            </div>
          </div>

          {/* 3. GRID UTAMA */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Baris Atas: 4 Kartu Kecil (Putih, Elegan) */}
            <div className="col-span-1 lg:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {["KHDTK", "HK", "HL", "HP"].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 relative shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group cursor-pointer overflow-hidden"
                >
                  {/* Aksen Dekoratif Halus */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-green-50 to-transparent rounded-bl-full opacity-50 transition-transform group-hover:scale-110"></div>

                  <div className="flex justify-between items-start mb-6 relative">
                    <div className="bg-[#F3FBF5] w-12 h-12 rounded-2xl flex items-center justify-center text-[#2D7344] shadow-sm">
                      <TreePine size={24} strokeWidth={1.5} />
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">
                      <TrendingUp size={12} />
                      +4%
                    </div>
                  </div>
                  <div className="relative">
                    <h4 className="text-gray-500 text-sm font-medium mb-1">
                      Desa di {item}
                    </h4>
                    <p className="text-gray-900 text-3xl font-bold tracking-tight">
                      24
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Baris Bawah: Tabel (3 Kolom) & Kartu Besar (1 Kolom) */}
            <div className="col-span-1 lg:col-span-3 bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 p-6 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-base font-bold text-gray-900 tracking-tight">
                    Rekapitulasi per Provinsi
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Daftar jumlah unit desa hutan aktif.
                  </p>
                </div>
                <button className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold transition-colors">
                  <Download size={14} />
                  Export Data
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-[11px] uppercase tracking-wider font-bold text-gray-400">
                      <th className="py-3 px-4">Kode</th>
                      <th className="py-3 px-4">Provinsi</th>
                      <th className="py-3 px-4 text-center">Jumlah Unit</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-medium text-gray-700">
                    {tableData.map((row, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-gray-50/50 hover:bg-[#F9FBFA] transition-colors"
                      >
                        <td className="py-4 px-4 text-gray-500">#{row.id}</td>
                        <td className="py-4 px-4">{row.provinsi}</td>
                        <td className="py-4 px-4 text-center">
                          <span className="bg-gray-100 text-gray-700 py-1 px-3 rounded-full text-xs font-bold">
                            {row.jumlah}
                          </span>
                        </td>
                        <td className="py-4 px-4 flex justify-center">
                          <button className="text-[#2D7344] hover:text-white bg-[#EAFBF0] hover:bg-[#2D7344] p-2 rounded-xl transition-all shadow-sm">
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Minimalis & Modern */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-50 text-xs font-medium text-gray-500">
                <span>Menampilkan 1-10 dari 36 data</span>
                <div className="flex gap-2">
                  <button className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors">
                    <ChevronLeft size={16} />
                  </button>
                  <button className="p-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Kartu Besar (Gradient Mewah) */}
            <div className="col-span-1 relative rounded-2xl shadow-xl overflow-hidden flex flex-col items-center justify-center py-12 px-6 min-h-[300px] bg-gradient-to-br from-[#2D7344] to-[#154023]">
              {/* Efek Lingkaran Abstrak */}
              <div className="absolute -top-20 -right-20 w-48 h-48 bg-white opacity-5 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#A4D6B5] opacity-10 rounded-full blur-xl"></div>

              <div className="relative z-10 text-center">
                <div className="bg-white/10 backdrop-blur-sm w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/20">
                  <MapIcon size={30} className="text-white" strokeWidth={1.5} />
                </div>
                <h2 className="text-white text-6xl font-black mb-2 tracking-tighter drop-shadow-md">
                  268
                </h2>
                <p className="text-[#B9E0C4] text-sm font-semibold tracking-wide uppercase">
                  Total Unit Desa
                </p>

                <div className="mt-8 pt-6 border-t border-white/10 flex flex-col gap-1">
                  <span className="text-white/60 text-xs font-medium">
                    Diperbarui
                  </span>
                  <span className="text-white text-sm">
                    Hari ini, 09:40 WIB
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default Dashboard;
