import React, { useState } from "react";
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
  MapPin,
  X,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { analystSpatialService } from "../../services/master/analystSpatialService";
import { Loading } from "../../components/Loading";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const { data: provinces, isLoading } = useQuery({
    queryKey: ["provinces"],
    queryFn: analystSpatialService.getAllProvinces,
  });

  const handleGoToDetail = (provinsiName) => {
    // Contoh: /dashboard/provinsi/Jawa%20Barat
    navigate(`/dashboard/provinsi/${encodeURIComponent(provinsiName)}`);
  };

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

          {/* 1. BAGIAN PETA */}
          <div className="bg-white p-2 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 mb-8">
            <div
              className="w-full h-[300px] md:h-[400px] rounded-2xl overflow-hidden relative"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2000&auto=format&fit=crop')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10"></div>

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

              <div className="absolute top-5 right-5 bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-medium px-4 py-2.5 rounded-full flex items-center gap-2.5 shadow-lg">
                <Layers size={14} className="text-green-300" />
                <span>Memuat data spasial...</span>
              </div>
            </div>
          </div>

          {/* 2. BAGIAN FILTER */}
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 p-3 mb-8 flex flex-col lg:flex-row gap-3 items-center">
            {/* ... (Kode Filter Anda Tetap Sama) ... */}
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <div className="col-span-1 lg:col-span-3 bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 p-6 flex flex-col min-h-[400px]">
              {/* ... Header Tabel ... */}
              <div className="overflow-x-auto flex-1 mt-6">
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
                    {isLoading ? (
                      <tr>
                        <td colSpan={4}>
                          <Loading />
                        </td>
                      </tr>
                    ) : provinces?.length > 0 ? (
                      provinces.map((province, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-gray-50/50 hover:bg-[#F9FBFA] transition-colors"
                        >
                          <td className="py-4 px-4 text-gray-500">
                            #{idx + 1}
                          </td>
                          <td className="py-4 px-4">{province.provinsi}</td>
                          <td className="py-4 px-4 text-center">
                            <span className="bg-gray-100 text-gray-700 py-1 px-3 rounded-full text-xs font-bold">
                              {province.total_desa_hutan}
                            </span>
                          </td>
                          <td className="py-4 px-4 flex justify-center">
                            {/* --- TOMBOL TRIGGER REDIRECT --- */}
                            <button
                              onClick={() =>
                                handleGoToDetail(province.provinsi)
                              }
                              className="text-[#2D7344] hover:text-white bg-[#EAFBF0] hover:bg-[#2D7344] p-2 rounded-xl transition-all shadow-sm"
                              title="Lihat Detail Provinsi"
                            >
                              <Eye size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-12 text-center text-gray-500 text-sm"
                        >
                          Tidak ada data.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {/* ... Kartu Besar ... */}
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default Dashboard;
