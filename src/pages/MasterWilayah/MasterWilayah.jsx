import React, { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout"; // Sesuaikan path
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Filter,
  MapPin
} from "lucide-react";

const MasterWilayah = () => {
  // --- STATE UNTUK EKSPANSI HIERARKI (TREE TABLE) ---
  // State ini menyimpan kode induk yang sedang diperluas/ekspansi
  const [expandedCodes, setExpandedCodes] = useState(new Set());

  // State untuk Tab Aktif Hierarki (Pill Shape Filter)
  const [activeTab, setActiveTab] = useState("semua");

  // --- MOCK DATA HIERARKI (TREE DATA) SINGLE ARRAY ---
  // Level 0: Provinsi, Level 1: Kab/Kota, Level 2: Kecamatan
  // isParent: true jika memiliki anak.
  const rawData = [
    // --- PROVINSI ACEH ---
    { id: 1, kode: "11", nama: "Aceh", level: 0, isParent: true, parentKode: null },
    { id: 2, kode: "11.01", nama: "Kab. Aceh Barat", level: 1, isParent: true, parentKode: "11" },
    { id: 3, kode: "11.01.01", nama: "Kec. Meureubo", level: 2, isParent: false, parentKode: "11.01" },
    { id: 4, kode: "11.01.02", nama: "Kec. Samatiga", level: 2, isParent: false, parentKode: "11.01" },
    { id: 5, kode: "11.71", nama: "Kota Banda Aceh", level: 1, isParent: true, parentKode: "11" },
    { id: 6, kode: "11.71.01", nama: "Kec. Syiah Kuala", level: 2, isParent: false, parentKode: "11.71" },

    // --- PROVINSI JAWA BARAT ---
    { id: 7, kode: "32", nama: "Jawa Barat", level: 0, isParent: true, parentKode: null },
    { id: 8, kode: "32.01", nama: "Kab. Bogor", level: 1, isParent: true, parentKode: "32" },
    { id: 9, kode: "32.01.01", nama: "Kec. Cibinong", level: 2, isParent: false, parentKode: "32.01" },
    { id: 10, kode: "32.01.02", nama: "Kec. Bojong Gede", level: 2, isParent: false, parentKode: "32.01" },
    { id: 11, kode: "32.71", nama: "Kota Bogor", level: 1, isParent: true, parentKode: "32" },
    { id: 12, kode: "32.71.01", nama: "Kec. Bogor Selatan", level: 2, isParent: false, parentKode: "32.71" },
    { id: 13, kode: "32.71.02", nama: "Kec. Bogor Tengah", level: 2, isParent: false, parentKode: "32.71" },
  ];

  // Fungsi untuk toggle ekspansi baris hierarki
  const toggleExpand = (kode) => {
    const newExpandedCodes = new Set(expandedCodes);
    if (newExpandedCodes.has(kode)) {
      newExpandedCodes.delete(kode); // Sembunyikan anak
    } else {
      newExpandedCodes.add(kode); // Tampilkan anak
    }
    setExpandedCodes(newExpandedCodes);
  };

  // --- LOGIKA FILTERING DATA (TREE LOGIC) ---
  // Fungsi rekursif untuk menyembunyikan item anak jika induknya tidak diekspansi
  const shouldRender = (item) => {
    // Selalu render Level 0 (Provinsi)
    if (item.level === 0) return true;

    // Periksa apakah induk langsungnya diperluas
    if (expandedCodes.has(item.parentKode)) {
      // Jika diperluas, periksa apakah induk dari induk juga diperluas (jika ada)
      // Ini wajib untuk hierarki 3 level (seperti Kecamatan)
      if (item.level === 2) {
        // Cari data induk Level 1
        const parentLvl1 = rawData.find(parent => parent.kode === item.parentKode);
        // Periksa apakah induk Level 0 diperluas
        return parentLvl1 && expandedCodes.has(parentLvl1.parentKode);
      }
      return true; // Untuk Level 1 yang induk Level 0-nya diperluas
    }

    return false; // Jika induk tidak diperluas
  };

  // Filter data hierarki mentah menjadi data tabel yang akan dirender
  const tableDataToRender = rawData.filter(shouldRender);

  // Map level ke Badge Color (Pewarnaan konsisten dengan Manajemen User)
  const getLevelBadge = (level) => {
    if (level === 0) return { text: "Provinsi", color: "bg-purple-50 text-purple-700 border-purple-200" };
    if (level === 1) return { text: "Kab/Kota", color: "bg-blue-50 text-blue-700 border-blue-200" };
    return { text: "Kecamatan", color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  };

  return (
    <DashboardLayout activeMenu="Master Wilayah">
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#FAFBFC]">
        {/* SCROLLABLE KONTEN */}
        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8 custom-scrollbar">

          {/* HEADER HALAMAN */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manajemen Master Wilayah</h1>
            <p className="text-sm text-gray-500 mt-1">Kelola data hierarki administratif wilayah (Provinsi > Kabupaten/Kota > Kecamatan) dalam satu tabel tunggal.</p>
          </div>

          {/* TABS (Modern Segmented Control sebagai Level Filter Akar) */}
          <div className="flex p-1 bg-gray-100/80 backdrop-blur-sm rounded-xl w-max mb-6 border border-gray-200/50">
            <button
              onClick={() => setActiveTab("semua")}
              className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                activeTab === "semua"
                  ? "bg-white text-[#2D7344] shadow-[0_2px_8px_rgb(0,0,0,0.06)] uppercase tracking-wider"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
              }`}
            >
              Semua Wilayah
            </button>
            <button
              onClick={() => setActiveTab("provinsi")}
              className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                activeTab === "provinsi"
                  ? "bg-white text-[#2D7344] shadow-[0_2px_8px_rgb(0,0,0,0.06)] uppercase tracking-wider"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
              }`}
            >
              Akar Provinsi
            </button>
          </div>

          {/* CARD KONTEN UTAMA */}
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 flex flex-col">

            {/* Header Toolbar (Title, Search, Add Button) */}
            <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-[#2D7344] shrink-0">
                    <MapPin size={20} strokeWidth={2} />
                 </div>
                 <h2 className="text-lg font-bold text-gray-800">
                   Tabel Hierarki Wilayah
                 </h2>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Search Bar Modern */}
                <div className="relative w-full sm:w-64 group">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2D7344] transition-colors" size={16} />
                  <input
                    type="text"
                    placeholder="Cari kode atau nama..."
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-[#2D7344] transition-all font-medium"
                  />
                </div>

                <button className="hidden sm:flex items-center justify-center p-2.5 text-gray-500 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 hover:text-gray-700 transition-colors">
                  <Filter size={18} />
                </button>

                {/* Tombol Tambah Data */}
                <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#2D7344] hover:bg-[#1E5230] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-[0.98]">
                  <Plus size={18} strokeWidth={2.5} />
                  Tambah Data
                </button>
              </div>
            </div>

            {/* TABEL DATA (TREE TABLE MODERN) */}
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-[11px] uppercase tracking-wider font-bold text-gray-500">
                    <th className="py-4 px-6 w-32">Kode Wilayah</th>
                    <th className="py-4 px-6">Nama Wilayah (Hierarki)</th>
                    <th className="py-4 px-6">Tingkat</th>
                    <th className="py-4 px-6 text-center w-36">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium text-gray-700">
                  {tableDataToRender.map((row, idx) => {
                    const levelInfo = getLevelBadge(row.level);
                    const isExpanded = expandedCodes.has(row.kode);

                    // Indentasi dinamis berdasarkan level (Pill shape indent)
                    // Level 0: no indent, Level 1: 32px indent, Level 2: 64px indent
                    const indentationClass = row.level === 0 ? "pl-0" : row.level === 1 ? "pl-8" : "pl-16";

                    return (
                      <tr
                        key={row.id}
                        className={`border-b border-gray-50/80 transition-colors hover:bg-[#F9FBFA] group ${row.level === 0 ? "font-bold" : ""}`}
                      >
                        <td className="py-4 px-6">
                           <span className="font-mono text-gray-500 font-semibold text-xs tracking-wider">
                              {row.kode}
                           </span>
                        </td>
                        <td className={`py-4 px-6 ${indentationClass}`}>
                          {/* UI Hierarki Modern (Ikon Ekspansi & Nama) */}
                          <div className="flex items-center gap-2">
                             {/* Ikon Ekspansi hanya tampil jika memiliki anak */}
                             {row.isParent ? (
                                <button
                                  onClick={() => toggleExpand(row.kode)}
                                  className={`p-1 text-gray-400 hover:text-[#2D7344] hover:bg-green-50 rounded-lg transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                >
                                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                </button>
                             ) : (
                                // Spacer untuk menyelaraskan item tanpa anak (Kecamatan)
                                <div className="w-6 h-6 shrink-0"></div>
                             )}

                             {/* Nama Wilayah */}
                             <span className={row.level === 0 ? "text-[#2D7344]" : "text-gray-900"}>
                                {row.nama}
                             </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                           {/* Sistem Badge Mewah (Pewarnaan konsisten) */}
                           <span className={`px-3 py-1.5 rounded-md text-xs font-bold border ${levelInfo.color}`}>
                              {levelInfo.text}
                           </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
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
                    );
                  })}

                  {/* State Kosong */}
                  {tableDataToRender.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-12 text-center text-gray-500">
                        Belum ada data wilayah yang ditambahkan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION (Standar Premium) */}
            <div className="p-4 md:p-6 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/30 rounded-b-2xl">
              <p className="text-xs font-medium text-gray-500">
                Menampilkan baris <span className="font-bold text-gray-900">1 - {tableDataToRender.length}</span> dari <span className="font-bold text-gray-900">2000 Provinsi</span>
              </p>

              <div className="flex items-center gap-2">
                <button className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                  <ChevronLeft size={18} />
                </button>

                {/* Indikator Halaman */}
                <div className="flex items-center gap-1 px-2">
                  <button className="w-8 h-8 rounded-lg bg-[#2D7344] text-white text-xs font-bold shadow-md">1</button>
                  <button className="w-8 h-8 rounded-lg text-gray-600 hover:bg-gray-100 text-xs font-bold transition-colors">2</button>
                  <button className="w-8 h-8 rounded-lg text-gray-600 hover:bg-gray-100 text-xs font-bold transition-colors">3</button>
                  <span className="text-gray-400 text-xs">...</span>
                  <button className="w-8 h-8 rounded-lg text-gray-600 hover:bg-gray-100 text-xs font-bold transition-colors">400 Provinsi</button>
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

export default MasterWilayah;
