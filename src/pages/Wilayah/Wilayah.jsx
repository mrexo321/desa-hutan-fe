import React, { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout"; // Sesuaikan path
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Map,
  Download,
  UploadCloud,
  Eye,
} from "lucide-react";

const Wilayah = () => {
  // State untuk Tab Aktif
  const [activeTab, setActiveTab] = useState("hutan");

  // Mock Data untuk Wilayah Hutan
  const dataHutan = [
    {
      id: 1,
      no: 1,
      nama: "TN Baluran",
      jenis: "Taman Nasional",
      fungsi: "Hutan Lindung",
      luas: "102,23",
    },
    {
      id: 2,
      no: 2,
      nama: "TN Ujung Kulon",
      jenis: "Taman Nasional",
      fungsi: "Hutan Konservasi",
      luas: "1205,00",
    },
    {
      id: 3,
      no: 3,
      nama: "Hutan Pinus Mangunan",
      jenis: "Tahura",
      fungsi: "Hutan Produksi",
      luas: "45,50",
    },
  ];

  // Mock Data untuk Wilayah Desa
  const dataDesa = [
    {
      id: 1,
      no: 1,
      nama: "Desa Wonorejo",
      jenis: "Desa Penyangga",
      fungsi: "Swadaya",
      luas: "12,40",
    },
    {
      id: 2,
      no: 2,
      nama: "Desa Sukamaju",
      jenis: "Desa Hutan",
      fungsi: "Swakarya",
      luas: "8,25",
    },
  ];

  const currentData = activeTab === "hutan" ? dataHutan : dataDesa;

  return (
    <DashboardLayout activeMenu="Wilayah">
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#FAFBFC]">
        {/* SCROLLABLE KONTEN */}
        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8 custom-scrollbar">
          {/* HEADER HALAMAN */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Manajemen Wilayah
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Kelola data spasial dan administratif untuk wilayah hutan dan
              wilayah desa.
            </p>
          </div>

          {/* TABS (Modern Segmented Control) */}
          <div className="flex p-1 bg-gray-100/80 backdrop-blur-sm rounded-xl w-max mb-6 border border-gray-200/50">
            <button
              onClick={() => setActiveTab("hutan")}
              className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                activeTab === "hutan"
                  ? "bg-white text-[#2D7344] shadow-[0_2px_8px_rgb(0,0,0,0.06)]"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
              }`}
            >
              Wilayah Hutan
            </button>
            <button
              onClick={() => setActiveTab("desa")}
              className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                activeTab === "desa"
                  ? "bg-white text-[#2D7344] shadow-[0_2px_8px_rgb(0,0,0,0.06)]"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
              }`}
            >
              Wilayah Desa
            </button>
          </div>

          {/* CARD KONTEN UTAMA */}
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 flex flex-col">
            {/* Header Toolbar (Filter, Search, Actions) */}
            <div className="p-6 border-b border-gray-50 flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-6">
              {/* Kiri: Judul & Filter Dropdown */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-[#2D7344] shrink-0">
                    <Map size={20} strokeWidth={2} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-800 whitespace-nowrap hidden sm:block">
                    Data {activeTab === "hutan" ? "Hutan" : "Desa"}
                  </h2>
                </div>

                {/* Garis pemisah untuk desktop */}
                <div className="hidden sm:block w-px h-8 bg-gray-200 mx-2"></div>

                {/* Filter Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-500 whitespace-nowrap">
                    Jenis Kawasan:
                  </span>
                  <select className="bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-[#2D7344] cursor-pointer font-medium min-w-[180px]">
                    <option>-- Pilih Fungsi Kawasan --</option>
                    <option>Hutan Lindung</option>
                    <option>Hutan Produksi</option>
                    <option>Hutan Konservasi</option>
                  </select>
                </div>
              </div>

              {/* Kanan: Search & Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Search Bar Modern */}
                <div className="relative w-full sm:w-56 group">
                  <Search
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2D7344] transition-colors"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Cari wilayah..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-[#2D7344] transition-all font-medium"
                  />
                </div>

                {/* Group Tombol Aksi (Outline) */}
                <div className="flex w-full sm:w-auto gap-2">
                  <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-600 hover:text-[#2D7344] hover:border-[#2D7344] hover:bg-green-50 px-4 py-2 rounded-lg text-sm font-semibold transition-all">
                    <Download size={16} />
                    <span className="hidden xl:inline">Template</span>
                  </button>
                  <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-600 hover:text-[#2D7344] hover:border-[#2D7344] hover:bg-green-50 px-4 py-2 rounded-lg text-sm font-semibold transition-all">
                    <UploadCloud size={16} />
                    <span className="hidden xl:inline">Upload</span>
                  </button>
                </div>

                {/* Tombol Tambah Data (Primary) */}
                <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#2D7344] hover:bg-[#1E5230] text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm active:scale-[0.98]">
                  <Plus size={18} strokeWidth={2.5} />
                  Tambah Data
                </button>
              </div>
            </div>

            {/* TABEL DATA */}
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-[11px] uppercase tracking-wider font-bold text-gray-500">
                    <th className="py-4 px-6 w-16 text-center">No</th>
                    <th className="py-4 px-6">
                      Nama {activeTab === "hutan" ? "Hutan" : "Desa"}
                    </th>
                    <th className="py-4 px-6">
                      {activeTab === "hutan" ? "Jenis KHDTK" : "Status Desa"}
                    </th>
                    <th className="py-4 px-6">Fungsi Kawasan</th>
                    <th className="py-4 px-6 text-right">Luas (Ha)</th>
                    <th className="py-4 px-6 text-center w-36">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium text-gray-700">
                  {currentData.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-gray-50/80 hover:bg-[#F9FBFA] transition-colors group"
                    >
                      <td className="py-4 px-6 text-gray-500 font-semibold text-center">
                        {row.no}
                      </td>
                      <td className="py-4 px-6 text-gray-900 font-bold hover:text-[#2D7344] cursor-pointer underline-offset-4 hover:underline">
                        {row.nama}
                      </td>
                      <td className="py-4 px-6 text-gray-600">{row.jenis}</td>
                      <td className="py-4 px-6">
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-md text-xs font-semibold">
                          {row.fungsi}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-mono text-gray-600">
                        {row.luas}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            className="p-1.5 text-gray-400 hover:text-[#0A66C2] hover:bg-blue-50 rounded-md transition-all"
                            title="Lihat Detail"
                          >
                            <Eye size={16} strokeWidth={2} />
                          </button>
                          <button
                            className="p-1.5 text-gray-400 hover:text-[#2D7344] hover:bg-[#EAFBF0] rounded-md transition-all"
                            title="Edit"
                          >
                            <Edit2 size={16} strokeWidth={2} />
                          </button>
                          <button
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                            title="Hapus"
                          >
                            <Trash2 size={16} strokeWidth={2} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {/* State Kosong */}
                  {currentData.length === 0 && (
                    <tr>
                      <td
                        colSpan="6"
                        className="py-12 text-center text-gray-500"
                      >
                        Belum ada data wilayah yang ditambahkan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div className="p-4 md:p-6 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/30 rounded-b-2xl">
              <p className="text-xs font-medium text-gray-500">
                Menampilkan baris{" "}
                <span className="font-bold text-gray-900">
                  1 - {currentData.length}
                </span>{" "}
                dari <span className="font-bold text-gray-900">2000</span>
              </p>

              <div className="flex items-center gap-2">
                <button className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                  <ChevronLeft size={18} />
                </button>

                <div className="flex items-center gap-1 px-2">
                  <button className="w-8 h-8 rounded-lg bg-[#2D7344] text-white text-xs font-bold shadow-md">
                    1
                  </button>
                  <button className="w-8 h-8 rounded-lg text-gray-600 hover:bg-gray-100 text-xs font-bold transition-colors">
                    2
                  </button>
                  <button className="w-8 h-8 rounded-lg text-gray-600 hover:bg-gray-100 text-xs font-bold transition-colors">
                    3
                  </button>
                  <span className="text-gray-400 text-xs">...</span>
                  <button className="w-8 h-8 rounded-lg text-gray-600 hover:bg-gray-100 text-xs font-bold transition-colors">
                    400
                  </button>
                </div>

                <button className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default Wilayah;
