import React, { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import {
  Search,
  Filter,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize,
  Eye,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  Maximize2,
  TreePine,
  MapPin,
  Leaf,
  Activity,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { analystSpatialService } from "../../services/master/analystSpatialService";
import { useNavigate } from "react-router-dom";

// Komponen Loading Sederhana
const Loading = () => (
  <div className="text-sm text-gray-500 animate-pulse text-center py-4">
    Memuat data...
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Ringkasan");

  const { data: provinces, isLoading } = useQuery({
    queryKey: ["provinces"],
    queryFn: analystSpatialService.getAllProvinces,
  });

  console.log(provinces);

  const handleGoToDetail = (provinsiName) => {
    navigate(`/dashboard/provinsi/${encodeURIComponent(provinsiName)}`);
  };

  return (
    <DashboardLayout activeMenu={"Dashboard"}>
      {/* 1. HERO MAP SECTION */}
      <div className="relative w-full h-[300px] md:h-[420px] rounded-[24px] overflow-hidden mb-8 shadow-sm border border-gray-100 group">
        {/* Gambar Peta (Ganti dengan komponen Peta interaktif seperti Leaflet/Mapbox jika ada) */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.02]"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2000&auto=format&fit=crop')`,
          }}
        />
        <div className="absolute inset-0 bg-black/10 transition-opacity duration-500 group-hover:bg-black/5" />

        {/* Legend Overlay (Kiri Bawah) */}
        <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md px-5 py-3 rounded-full shadow-lg border border-white/50 flex items-center gap-4 text-xs font-semibold text-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>KHDTK
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>HK
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>HL
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>HP
          </div>
        </div>

        {/* Controls Overlay (Kanan Atas) */}
        <div className="absolute top-6 right-6 flex items-center gap-2">
          <div className="bg-white/90 backdrop-blur-md rounded-full shadow-sm flex items-center border border-white/50 text-gray-600">
            <button className="p-2.5 hover:bg-gray-100 transition-colors rounded-l-full">
              <ZoomIn size={16} />
            </button>
            <div className="w-[1px] h-4 bg-gray-200"></div>
            <button className="p-2.5 hover:bg-gray-100 transition-colors rounded-r-full">
              <ZoomOut size={16} />
            </button>
          </div>
          <button className="bg-white/90 backdrop-blur-md p-2.5 rounded-full shadow-sm text-gray-600 hover:bg-gray-100 transition-colors border border-white/50">
            <Maximize2 size={16} />
          </button>
        </div>
      </div>

      {/* 2. FILTER & SEARCH SECTION */}
      <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col lg:flex-row items-center gap-3">
        <div className="relative w-full lg:w-96 flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Cari nama desa..."
            className="w-full bg-[#F8FAFC] border-none text-gray-700 py-3 pl-11 pr-4 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
          />
        </div>

        {/* Dropdown Placeholders (sesuaikan di mobile agar horizontal scroll/grid) */}
        <div className="flex gap-2 w-full lg:w-auto overflow-x-auto custom-scrollbar pb-1 lg:pb-0">
          {[
            "Pilih Provinsi",
            "Pilih Kabupaten",
            "Pilih Kecamatan",
            "Pilih Fungsi",
          ].map((item, i) => (
            <select
              key={i}
              className="bg-[#F8FAFC] border-none text-gray-500 py-3 px-4 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none cursor-pointer whitespace-nowrap min-w-[140px]"
            >
              <option>{item}</option>
            </select>
          ))}
        </div>

        <div className="flex w-full lg:w-auto gap-2">
          <button className="flex items-center justify-center gap-2 bg-[#F8FAFC] hover:bg-gray-100 text-gray-600 py-3 px-5 rounded-xl text-sm font-semibold transition-colors border border-gray-100/50">
            <RotateCcw size={16} /> Reset
          </button>
          <button className="flex items-center justify-center gap-2 bg-[#00B67A] hover:bg-[#009b68] text-white py-3 px-6 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40">
            <Filter size={16} /> Filter
          </button>
        </div>
      </div>

      {/* 3. TABS NAVIGASI */}
      <div className="flex items-center gap-2 mb-6">
        {["Ringkasan", "Distribusi", "Performa"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
              activeTab === tab
                ? "bg-white text-gray-800 shadow-sm border border-gray-200"
                : "text-gray-500 hover:bg-white/60 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 4. MAIN STATS (GRID BENTO) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Big Green Card */}
        <div className="col-span-1 lg:col-span-7 bg-[#0C2F21] rounded-[24px] p-8 text-white relative overflow-hidden shadow-lg shadow-emerald-900/10 flex flex-col justify-between">
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-emerald-400/80 text-xs font-bold tracking-wider mb-2 uppercase">
              <Activity size={14} /> Total Desa Hutan
            </div>
            <div className="flex items-end gap-4 mb-4">
              <h2 className="text-6xl font-bold tracking-tight">268</h2>
              <div className="bg-white/10 text-emerald-300 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border border-white/5 mb-2">
                ↗ +12% bulan ini
              </div>
            </div>
            <p className="text-gray-400 text-sm max-w-sm font-medium leading-relaxed mb-8">
              Desa hutan terdaftar dan terkelola dalam sistem informasi kawasan
              hutan Indonesia.
            </p>
          </div>

          <div className="flex gap-4 relative z-10">
            {/* Status Mini Badges */}
            {[
              { label: "Aktif", count: 243, color: "bg-emerald-500" },
              { label: "Pending", count: 25, color: "bg-orange-400" },
              { label: "Baru", count: 18, color: "bg-blue-400" },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-3 px-5 flex items-center gap-3"
              >
                <div className={`w-2 h-2 rounded-full ${stat.color}`}></div>
                <div>
                  <div className="text-gray-400 text-[10px] uppercase tracking-wider font-semibold">
                    {stat.label}
                  </div>
                  <div className="text-lg font-bold">{stat.count}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Aksesoris Garis Chart Background */}
          <div className="absolute right-0 bottom-0 w-1/2 h-full opacity-30 pointer-events-none flex items-end">
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
                strokeWidth="2"
              />
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#0C2F21" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute top-8 right-8 text-[10px] text-emerald-500/50 font-semibold tracking-wider">
              TREN 10 BULAN TERAKHIR
            </div>
          </div>
        </div>

        {/* 4 Small Cards Grid */}
        <div className="col-span-1 lg:col-span-5 grid grid-cols-2 gap-4">
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col justify-center transition-all hover:shadow-md">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4">
              <TrendingUp size={20} />
            </div>
            <div className="text-2xl font-bold text-gray-800">+12%</div>
            <div className="text-xs text-gray-500 font-medium mt-1">
              Pertumbuhan Bulan Ini <br />
              <span className="text-gray-400 text-[10px]">vs bulan lalu</span>
            </div>
          </div>
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col justify-center transition-all hover:shadow-md">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-4">
              <Users size={20} />
            </div>
            <div className="text-2xl font-bold text-gray-800">1,847</div>
            <div className="text-xs text-gray-500 font-medium mt-1">
              Pengguna Aktif <br />
              <span className="text-gray-400 text-[10px]">pengguna sistem</span>
            </div>
          </div>
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col justify-center transition-all hover:shadow-md">
            <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mb-4">
              <MapPin size={20} />
            </div>
            <div className="text-2xl font-bold text-gray-800">148.5K</div>
            <div className="text-xs text-gray-500 font-medium mt-1">
              Total Luas <br />
              <span className="text-gray-400 text-[10px]">
                hektar terkelola
              </span>
            </div>
          </div>
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col justify-center transition-all hover:shadow-md">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mb-4">
              <Clock size={20} />
            </div>
            <div className="text-2xl font-bold text-gray-800">2 jam</div>
            <div className="text-xs text-gray-500 font-medium mt-1">
              Data Diperbarui <br />
              <span className="text-gray-400 text-[10px]">yang lalu</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. KATEGORI STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            icon: <TreePine size={18} />,
            title: "KHDTK",
            desc: "Kawasan Hutan Dengan Tujuan Khusus",
            count: 42,
            color: "text-emerald-500",
            bg: "bg-emerald-50",
            trend: "+5.2%",
          },
          {
            icon: <Activity size={18} />,
            title: "HK",
            desc: "Hutan Konservasi",
            count: 87,
            color: "text-blue-500",
            bg: "bg-blue-50",
            trend: "+2.1%",
          },
          {
            icon: <Leaf size={18} />,
            title: "HL",
            desc: "Hutan Lindung",
            count: 64,
            color: "text-orange-500",
            bg: "bg-orange-50",
            trend: "-1.3%",
            isDown: true,
          },
          {
            icon: <MapPin size={18} />,
            title: "HP",
            desc: "Hutan Produksi",
            count: 75,
            color: "text-purple-500",
            bg: "bg-purple-50",
            trend: "+3.8%",
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 transition-all hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex justify-between items-start mb-4">
              <div
                className={`w-10 h-10 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center`}
              >
                {item.icon}
              </div>
              <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${item.isDown ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600"}`}
              >
                {item.trend}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">
              {item.count}
            </h3>
            <div className="font-bold text-sm text-gray-700">{item.title}</div>
            <div className="text-[10px] text-gray-400 mt-1 line-clamp-1">
              {item.desc}
            </div>

            {/* Mini visual indicator di bawah card */}
            <div className="flex gap-1 mt-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full ${item.bg} ${i < 4 ? item.color.replace("text", "bg").replace("500", "400") : ""} opacity-80`}
                ></div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 6. TABEL DATA */}
      <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-gray-800">Data Desa Hutan</h3>
            <span className="bg-emerald-50 text-emerald-600 text-[11px] font-bold px-3 py-1 rounded-full border border-emerald-100">
              268 Total
            </span>
          </div>
          <button className="bg-[#00B67A] hover:bg-[#009b68] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm">
            Export
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-[#FAFAFA] text-[10px] uppercase tracking-wider font-bold text-gray-400 border-b border-gray-100">
                <th className="py-4 px-6 w-16">NO</th>
                <th className="py-4 px-4">PROVINSI</th>
                <th className="py-4 px-4">TOTAL DESA HUTAN</th>
                <th className="py-4 px-4">AKSI</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium text-gray-600">
              {/* === CONTOH MOCK DATA VISUAL (Sesuai Gambar) === */}
              {isLoading ? (
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
                    <td className="py-4 px-6 text-gray-400 font-medium">
                      {idx + 1}
                    </td>
                    <td className="py-4 px-4 text-gray-800 font-bold flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                        <TreePine size={12} className="text-emerald-600" />
                      </div>
                      {row.provinsi}
                    </td>
                    <td className="py-4 px-4 text-gray-500">
                      {row.totalDesaHutan}
                    </td>

                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() =>
                          handleGoToDetail(decodeURIComponent(row.provinsi))
                        }
                        className="text-emerald-600 hover:text-white bg-emerald-50 hover:bg-emerald-500 p-2 rounded-xl transition-all shadow-sm opacity-0 group-hover:opacity-100"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Dummy Sesuai Desain */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
          <div>Menampilkan 1-7 dari 268 data</div>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
              &lt;
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#00B67A] text-white shadow-sm font-bold">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
              2
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
              3
            </button>
            <span className="px-2">...</span>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
              39
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
              &gt;
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
