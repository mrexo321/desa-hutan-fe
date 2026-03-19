import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";

export default function PotensiDesa() {
  const navigate = useNavigate();

  // State untuk mengontrol Modal (Konsisten dengan halaman sebelumnya)
  const [isTambahModalOpen, setIsTambahModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Mock data untuk baris pertama
  const firstRow = {
    kode: "2001",
    nama: "Desa Sukamaju",
    provinsi: "Kalimantan Barat",
    kabupaten: "Sambas",
    kecamatan: "Lorem",
    isData: true, // Penanda bahwa ini data asli, bukan baris kosong
  };

  // Membuat baris kosong (...)
  const emptyRows = Array(8).fill({
    kode: "...",
    nama: "...",
    provinsi: "...",
    kabupaten: "...",
    kecamatan: "...",
    isData: false,
  });

  const tableData = [firstRow, ...emptyRows];

  // Fungsi untuk aksi tombol
  const handleDetail = (nama) => alert(`Membuka detail potensi untuk: ${nama}`);
  const handleEdit = (nama) => alert(`Mengedit potensi desa: ${nama}`);
  const handleDelete = (nama) => alert(`Menghapus potensi desa: ${nama}`);

  return (
    <DashboardLayout activeMenu="Potensi Desa">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col min-h-[calc(100vh-120px)] overflow-hidden">
        
        {/* JUDUL HALAMAN & GARIS BAWAH */}
        <div className="flex flex-col items-center mb-6">
          <h2 className="text-xl font-bold text-[#2D7344] tracking-widest mb-3 uppercase">
            Potensi Desa
          </h2>
          <div className="w-full h-[2px] bg-[#2D7344]"></div>
        </div>

        {/* FILTER BAR (3 Filter Sejajar) */}
        <div className="flex flex-wrap gap-6 mb-6">
          {/* Filter Wilayah */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex items-center px-4 py-2.5 transition-shadow hover:shadow-md w-[220px]">
            <span className="text-xs text-[#2D7344] font-bold whitespace-nowrap mr-3">Wilayah</span>
            <select className="flex-1 w-full bg-transparent text-gray-500 text-xs focus:outline-none appearance-none cursor-pointer">
              <option>Kabupaten/Kota</option>
            </select>
            <div className="pointer-events-none text-gray-500 ml-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z" /></svg>
            </div>
          </div>

          {/* Filter Provinsi */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex items-center px-4 py-2.5 transition-shadow hover:shadow-md w-[220px]">
            <span className="text-xs text-[#2D7344] font-bold whitespace-nowrap mr-3">Provinsi</span>
            <select className="flex-1 w-full bg-transparent text-gray-500 text-xs focus:outline-none appearance-none cursor-pointer">
              <option>--Pilih Provinsi--</option>
            </select>
            <div className="pointer-events-none text-gray-500 ml-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z" /></svg>
            </div>
          </div>

          {/* Filter Kab/Kota */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex items-center px-4 py-2.5 transition-shadow hover:shadow-md w-[220px]">
            <span className="text-xs text-[#2D7344] font-bold whitespace-nowrap mr-3">Kab/Kota</span>
            <select className="flex-1 w-full bg-transparent text-gray-500 text-xs focus:outline-none appearance-none cursor-pointer">
              <option>--Pilih Kab/Kota--</option>
            </select>
            <div className="pointer-events-none text-gray-500 ml-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z" /></svg>
            </div>
          </div>
        </div>

        {/* AREA TABEL */}
        <div className="flex-1 bg-white rounded-xl flex flex-col border border-gray-100 shadow-sm overflow-hidden">
          
          {/* HEADER TABEL & 3 TOMBOL AKSI */}
          <div className="p-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
            <h3 className="text-sm font-bold text-gray-800">Tabel Data Wilayah Desa</h3>
            
            <div className="flex flex-wrap gap-2">
              <button className="flex items-center gap-2 bg-[#2D7344] hover:bg-[#1d4d2b] text-white px-4 py-2 rounded-md text-xs font-semibold transition-colors shadow-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download Template
              </button>
              
              <button 
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-2 bg-[#2D7344] hover:bg-[#1d4d2b] text-white px-4 py-2 rounded-md text-xs font-semibold transition-colors shadow-sm"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                Upload
              </button>
              
              <button 
                onClick={() => setIsTambahModalOpen(true)}
                className="flex items-center gap-2 bg-[#1d4d2b] hover:bg-[#153a20] text-white px-4 py-2 rounded-md text-xs font-semibold transition-colors shadow-sm"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Tambah Data
              </button>
            </div>
          </div>
          
          {/* PEMBUNGKUS TABEL */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-[#2D7344] text-white text-xs font-bold leading-tight">
                  <th className="py-4 px-6 border-r border-[#3A8353] w-24">KODE</th>
                  <th className="py-4 px-6 border-r border-[#3A8353]">Nama Desa</th>
                  <th className="py-4 px-6 border-r border-[#3A8353]">Provinsi</th>
                  <th className="py-4 px-6 border-r border-[#3A8353]">Kabupaten/Kota</th>
                  <th className="py-4 px-6 border-r border-[#3A8353]">Kecamatan</th>
                  <th className="py-4 px-6 border-r border-[#3A8353] text-center w-32">Potensi Desa</th>
                  <th className="py-4 px-6 text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-xs text-gray-700 font-medium">
                {tableData.map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-100 even:bg-[#E8EEF2] hover:bg-green-50 transition-colors">
                    {/* Menggunakan class underline jika isData true (sesuai Figma) */}
                    <td className={`py-4 px-6 ${row.isData ? 'underline decoration-gray-400 underline-offset-2' : ''}`}>{row.kode}</td>
                    <td className={`py-4 px-6 ${row.isData ? 'underline decoration-gray-400 underline-offset-2' : ''}`}>{row.nama}</td>
                    <td className={`py-4 px-6 ${row.isData ? 'underline decoration-gray-400 underline-offset-2' : ''}`}>{row.provinsi}</td>
                    <td className={`py-4 px-6 ${row.isData ? 'underline decoration-gray-400 underline-offset-2' : ''}`}>{row.kabupaten}</td>
                    <td className={`py-4 px-6 ${row.isData ? 'underline decoration-gray-400 underline-offset-2' : ''}`}>{row.kecamatan}</td>
                    
                    {/* Kolom Potensi Desa dengan Button Detail */}
                    <td className="py-4 px-6 text-center">
                      {row.isData && (
                        <button 
                          onClick={() => handleDetail(row.nama)}
                          className="bg-[#2D7344] hover:bg-[#1d4d2b] text-white px-4 py-1.5 rounded text-xs font-bold transition-colors shadow-sm"
                        >
                          Detail
                        </button>
                      )}
                    </td>

                    <td className="py-4 px-6 flex justify-center gap-4">
                      {/* Tombol Edit */}
                      <button 
                        type="button"
                        onClick={() => handleEdit(row.nama)}
                        className="text-[#3A8353] hover:text-[#1d4d2b] transition-transform hover:scale-125 cursor-pointer outline-none"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                      </button>

                      {/* Tombol Delete */}
                      <button 
                        type="button"
                        onClick={() => handleDelete(row.nama)}
                        className="text-red-500 hover:text-red-700 transition-transform hover:scale-125 cursor-pointer outline-none"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="mt-auto flex justify-end items-center gap-4 p-4 text-xs text-gray-500 bg-white border-t border-gray-100">
            <span className="underline decoration-gray-400 underline-offset-2">Rows 1-24 of first 2000</span>
            <div className="flex gap-2">
              <button className="text-gray-400 hover:text-gray-800 transition-colors cursor-pointer p-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" /></svg>
              </button>
              <button className="text-gray-800 hover:text-[#2D7344] transition-colors cursor-pointer p-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" /></svg>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ================= MODAL OVERLAY (Konsisten dengan sebelumnya) ================= */}
      {(isTambahModalOpen || isUploadModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-[600px] overflow-hidden">
            <div className="w-full h-2 bg-[#4CAF50]"></div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-1">
                {isTambahModalOpen ? "Tambah Potensi Desa" : "Upload"}
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Data Wilayah Desa
              </p>
              
              <div className="flex justify-end gap-3 mt-8">
                <button onClick={() => { setIsTambahModalOpen(false); setIsUploadModalOpen(false); }} className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                  Batal
                </button>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-[#8bc34a] hover:bg-[#7cb342] text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
                  {isTambahModalOpen ? "Tambah" : "Upload"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}