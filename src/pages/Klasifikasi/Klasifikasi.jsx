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
  Layers,
} from "lucide-react";

const Klasifikasi = () => {
  // State untuk Tab Aktif
  const [activeTab, setActiveTab] = useState("hutan");

  // Mock Data untuk Klasifikasi Hutan
  const dataHutan = [
    { id: 1, kode: "1", jenis: "Hutan Lindung", warna: "#4342FF" },
    { id: 2, kode: "2", jenis: "Hutan Produksi", warna: "#00F340" },
    { id: 3, kode: "3", jenis: "Hutan Konservasi", warna: "#FF0324" },
  ];

  // Mock Data untuk Klasifikasi Desa (Contoh struktur)
  const dataDesa = [
    { id: 1, kode: "1", jenis: "Desa Swadaya", warna: "#F59E0B" },
    { id: 2, kode: "2", jenis: "Desa Swakarya", warna: "#3B82F6" },
    { id: 3, kode: "3", jenis: "Desa Swasembada", warna: "#10B981" },
  ];

  // Menentukan data mana yang akan dirender berdasarkan tab aktif
  const currentData = activeTab === "hutan" ? dataHutan : dataDesa;

  return (
    <DashboardLayout activeMenu="Klasifikasi">
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#FAFBFC]">
        {/* SCROLLABLE KONTEN */}
        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8 custom-scrollbar">
          {/* HEADER HALAMAN */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Manajemen Klasifikasi
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Kelola data master klasifikasi hutan dan klasifikasi desa.
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
              Klasifikasi Hutan
            </button>
            <button
              onClick={() => setActiveTab("desa")}
              className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                activeTab === "desa"
                  ? "bg-white text-[#2D7344] shadow-[0_2px_8px_rgb(0,0,0,0.06)]"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
              }`}
            >
              Klasifikasi Desa
            </button>
          </div>

          {/* CARD KONTEN UTAMA */}
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 flex flex-col">
            {/* Header Toolbar (Title, Search, Add Button) */}
            <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-[#2D7344]">
                  <Layers size={20} strokeWidth={2} />
                </div>
                <h2 className="text-lg font-bold text-gray-800">
                  Tabel Data Klasifikasi{" "}
                  {activeTab === "hutan" ? "Hutan" : "Desa"}
                </h2>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Search Bar Modern */}
                <div className="relative w-full sm:w-64 group">
                  <Search
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2D7344] transition-colors"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Cari klasifikasi..."
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-[#2D7344] transition-all font-medium"
                  />
                </div>

                <button className="hidden sm:flex items-center justify-center p-2.5 text-gray-500 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 hover:text-gray-700 transition-colors">
                  <Filter size={18} />
                </button>

                {/* Tombol Tambah Data */}
                <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#2D7344] hover:bg-[#1E5230] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-green-900/10 hover:shadow-lg hover:shadow-green-900/20 active:scale-[0.98]">
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
                    <th className="py-4 px-6 w-24 text-center">Kode</th>
                    <th className="py-4 px-6">
                      Jenis {activeTab === "hutan" ? "Hutan" : "Desa"}
                    </th>
                    <th className="py-4 px-6">Warna Peta</th>
                    <th className="py-4 px-6 text-center w-32">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium text-gray-700">
                  {currentData.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-gray-50/80 hover:bg-[#F9FBFA] transition-colors group"
                    >
                      <td className="py-4 px-6 text-gray-500 font-semibold text-center">
                        {row.kode}
                      </td>
                      <td className="py-4 px-6 text-gray-900 font-bold">
                        {row.jenis}
                      </td>
                      <td className="py-4 px-6">
                        {/* UI Warna Peta yang Premium */}
                        <div className="flex items-center gap-3">
                          <div
                            className="w-6 h-6 rounded-md shadow-inner border border-black/10"
                            style={{ backgroundColor: row.warna }}
                          ></div>
                          <span className="font-mono text-xs text-gray-500 uppercase">
                            {row.warna}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            className="p-2 text-gray-400 hover:text-[#2D7344] hover:bg-[#EAFBF0] rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit2 size={16} strokeWidth={2} />
                          </button>
                          <button
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
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
                        colSpan="4"
                        className="py-12 text-center text-gray-500"
                      >
                        Belum ada data klasifikasi yang ditambahkan.
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

                {/* Indikator Halaman */}
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

export default Klasifikasi;
