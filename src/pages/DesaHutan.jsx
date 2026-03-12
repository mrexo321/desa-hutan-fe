import React from "react";
import DashboardLayout from "../components/DashboardLayout";

export default function DesaHutan() {
  // Mock data tabel baris pertama
  const firstRow = { 
    kode: "2001", 
    nama: "Desa Sukamaju", 
    fungsi: "Hutan Lindung", 
    khdtk: "Hutan Gunung Salak", 
    indeks: "Desa Maju", 
    luas: "102,23" 
  };

  // Membuat baris kosong (...) agar visualnya penuh seperti di Figma
  const emptyRows = Array(6).fill({
    kode: "...", nama: "...", fungsi: "...", khdtk: "...", indeks: "...", luas: "..."
  });
  
  const tableData = [firstRow, ...emptyRows];

  // Fungsi untuk menangani klik tombol
  const handleView = (nama) => alert(`Membuka detail untuk: ${nama}`);
  const handleEdit = (nama) => alert(`Mengedit data: ${nama}`);

  return (
    <DashboardLayout activeMenu="Desa Hutan">
      {/* Wrapper Kartu Putih Besar (Mengikuti Figma) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col min-h-[calc(100vh-120px)]">
        
        {/* JUDUL HALAMAN & GARIS */}
        <div className="flex flex-col items-center mb-6">
          <h2 className="text-xl font-bold text-[#2D7344] tracking-widest mb-3 uppercase">
            Desa Hutan
          </h2>
          <div className="w-full h-[2px] bg-[#2D7344]"></div>
        </div>

        {/* FILTER BAR */}
        <div className="flex flex-wrap gap-4 mb-8">
          {["Tahun", "Provinsi", "Fungsi Kawasan", "Indeks Desa Hutan"].map((filter, idx) => (
            // Menggunakan Flexbox agar label dan select bersebelahan rapi, tidak menumpuk
            <div key={idx} className="flex-1 min-w-[220px] bg-white rounded-lg border border-gray-200 shadow-sm flex items-center px-4 py-2.5 transition-shadow hover:shadow-md">
              <span className="text-xs text-[#2D7344] font-bold whitespace-nowrap mr-3">
                {filter}
              </span>
              <select className="flex-1 w-full bg-transparent text-gray-500 text-xs focus:outline-none appearance-none cursor-pointer">
                <option>--Pilih {filter === "Indeks Desa Hutan" ? "Indeks Desa" : filter}--</option>
              </select>
              {/* Custom Arrow */}
              <div className="pointer-events-none text-gray-500 ml-2">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* AREA TABEL */}
        <div className="flex-1 bg-white rounded-xl overflow-hidden flex flex-col border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-800">Tabel Data Desa Tahun 2025</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-[#2D7344] text-white text-xs font-bold tracking-wide">
                  <th className="py-4 px-6 whitespace-nowrap">KODE</th>
                  <th className="py-4 px-6 whitespace-nowrap">Nama Desa</th>
                  <th className="py-4 px-6 whitespace-nowrap">Fungsi Kawasan</th>
                  <th className="py-4 px-6 whitespace-nowrap">KHDTK</th>
                  <th className="py-4 px-6 whitespace-nowrap">Indeks Desa Hutan</th>
                  <th className="py-4 px-6 whitespace-nowrap">Luas Desa (Ha)</th>
                  <th className="py-4 px-6 text-center whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-xs text-gray-600 font-medium">
                {tableData.map((row, idx) => (
                  <tr 
                    key={idx} 
                    // Pewarnaan selang-seling (zebra) dengan warna biru keabu-abuan khas Figma
                    className="border-b border-gray-100 even:bg-[#E8EEF2] hover:bg-green-50 transition-colors"
                  >
                    <td className="py-4 px-6">{row.kode}</td>
                    <td className="py-4 px-6">{row.nama}</td>
                    <td className="py-4 px-6">{row.fungsi}</td>
                    <td className="py-4 px-6">{row.khdtk}</td>
                    <td className="py-4 px-6">{row.indeks}</td>
                    <td className="py-4 px-6">{row.luas}</td>
                    <td className="py-4 px-6 flex justify-center gap-4">
                      
                      {/* Tombol Lihat (Eye) */}
                      <button 
                        type="button"
                        onClick={() => handleView(row.nama)}
                        className="text-[#3A8353] hover:text-[#1d4d2b] transition-transform hover:scale-125 cursor-pointer outline-none"
                        title="Lihat Detail"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      </button>

                      {/* Tombol Edit (Pencil) */}
                      <button 
                        type="button"
                        onClick={() => handleEdit(row.nama)}
                        className="text-[#3A8353] hover:text-[#1d4d2b] transition-transform hover:scale-125 cursor-pointer outline-none"
                        title="Edit Data"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                      </button>

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="mt-auto flex justify-end items-center gap-4 p-5 text-xs text-gray-500 bg-white">
            <span>Rows 1-24 of first 2000</span>
            <div className="flex gap-2">
              <button className="text-gray-400 hover:text-gray-800 transition-colors cursor-pointer p-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
                </svg>
              </button>
              <button className="text-gray-800 hover:text-[#2D7344] transition-colors cursor-pointer p-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}