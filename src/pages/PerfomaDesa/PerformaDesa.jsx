import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";

export default function PerformaDesa() {
  const navigate = useNavigate();

  // State untuk mengontrol Modal
  const [isTambahModalOpen, setIsTambahModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Mock data untuk baris pertama sesuai Figma
  const firstRow = {
    no: "1",
    nama: "Desa Sukamaju",
    idm: "0,7",
    ikp: "0,7",
    banjir: "Sangat Tinggi",
    longsor: "Sangat Tinggi",
    kekeringan: "Sedang",
    gempa: "Sedang",
    tsunami: "Rendah",
    erupsi: "Sangat Rendah",
  };

  // Membuat baris kosong (...) agar visual tabel penuh
  const emptyRows = Array(6).fill({
    no: "...",
    nama: "...",
    idm: "...",
    ikp: "...",
    banjir: "...",
    longsor: "...",
    kekeringan: "...",
    gempa: "...",
    tsunami: "...",
    erupsi: "...",
  });

  const tableData = [firstRow, ...emptyRows];

  // Fungsi untuk aksi tombol
  const handleEdit = (nama) => {
    // Pindah ke halaman form edit
    navigate("/performa-desa/edit");
  };
  const handleDelete = (nama) => alert(`Menghapus performa: ${nama}`);

  return (
    <DashboardLayout activeMenu="Performa Desa Hutan">
      {/* Wrapper Kartu Putih Besar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col min-h-[calc(100vh-120px)] overflow-hidden">
        
        {/* JUDUL HALAMAN & GARIS BAWAH */}
        <div className="flex flex-col items-center mb-6">
          <h2 className="text-xl font-bold text-[#2D7344] tracking-widest mb-3">
            Performa Desa Hutan
          </h2>
          <div className="w-full h-[2px] bg-[#2D7344]"></div>
        </div>

        {/* FILTER BAR (Hanya 1 Filter: Wilayah) */}
        <div className="flex mb-6">
          <div className="w-[250px] bg-white rounded-lg border border-gray-200 shadow-sm flex items-center px-4 py-2.5 transition-shadow hover:shadow-md">
            <span className="text-xs text-[#2D7344] font-bold whitespace-nowrap mr-3">
              Wilayah
            </span>
            <select className="flex-1 w-full bg-transparent text-gray-500 text-xs focus:outline-none appearance-none cursor-pointer">
              <option>--Pilih Tahun--</option>
            </select>
            <div className="pointer-events-none text-gray-500 ml-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 10l5 5 5-5z" />
              </svg>
            </div>
          </div>
        </div>

        {/* AREA TABEL */}
        <div className="flex-1 bg-white rounded-xl flex flex-col border border-gray-100 shadow-sm overflow-hidden">
          
          {/* HEADER TABEL & 3 TOMBOL AKSI */}
          <div className="p-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
            <h3 className="text-sm font-bold text-gray-800">Tabel Data Desa Tahun 2025</h3>
            
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
                className="flex items-center gap-2 bg-[#2D7344] hover:bg-[#1d4d2b] text-white px-4 py-2 rounded-md text-xs font-semibold transition-colors shadow-sm"
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
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-[#2D7344] text-white text-xs font-bold leading-tight">
                  <th className="py-3 px-4 text-center w-12 border-r border-[#3A8353]">No</th>
                  <th className="py-3 px-4 border-r border-[#3A8353] min-w-[150px]">Nama Desa</th>
                  <th className="py-3 px-4 border-r border-[#3A8353] w-28">Indeks Desa Membangun (IDM)</th>
                  <th className="py-3 px-4 border-r border-[#3A8353] w-28">Indeks Ketahanan Pangan (IKP)</th>
                  <th className="py-3 px-4 border-r border-[#3A8353]">Rawan Banjir</th>
                  <th className="py-3 px-4 border-r border-[#3A8353]">Rawan Longsor</th>
                  <th className="py-3 px-4 border-r border-[#3A8353]">Rawan Kekeringan</th>
                  <th className="py-3 px-4 border-r border-[#3A8353]">Rawan Gempabumi</th>
                  <th className="py-3 px-4 border-r border-[#3A8353]">Rawan Tsunami</th>
                  <th className="py-3 px-4 border-r border-[#3A8353]">Rawan Erupsi Gunungapi</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-xs text-gray-600 font-medium">
                {tableData.map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-100 even:bg-[#E8EEF2] hover:bg-green-50 transition-colors">
                    <td className="py-4 px-4 text-center">{row.no}</td>
                    <td className="py-4 px-4">{row.nama}</td>
                    <td className="py-4 px-4">{row.idm}</td>
                    <td className="py-4 px-4">{row.ikp}</td>
                    <td className="py-4 px-4">{row.banjir}</td>
                    <td className="py-4 px-4">{row.longsor}</td>
                    <td className="py-4 px-4">{row.kekeringan}</td>
                    <td className="py-4 px-4">{row.gempa}</td>
                    <td className="py-4 px-4">{row.tsunami}</td>
                    <td className="py-4 px-4">{row.erupsi}</td>
                    <td className="py-4 px-4 flex justify-center gap-3">
                      
                      {/* Tombol Edit */}
                      <button 
                        type="button"
                        onClick={() => handleEdit(row.nama)}
                        className="text-[#3A8353] hover:text-[#1d4d2b] transition-transform hover:scale-125 cursor-pointer outline-none"
                        title="Edit Data"
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
                        title="Hapus Data"
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

      {/* ================= MODAL OVERLAY ================= */}
      {(isTambahModalOpen || isUploadModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          
          <div className="bg-white rounded-xl shadow-xl w-[600px] overflow-hidden">
            <div className="w-full h-2 bg-[#4CAF50]"></div>
            
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-1">
                {isTambahModalOpen ? "Tambah Performa Desa Hutan" : "Upload"}
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {isTambahModalOpen ? "Performa Desa Hutan" : "Klasifikasi Hutan"}
              </p>

              <div className="mb-5">
                <label className="block text-sm font-bold text-gray-800 mb-2">Tahun</label>
                <input type="text" defaultValue="2025" className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-700 focus:outline-none focus:border-[#4CAF50]" />
              </div>

              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-800 mb-2">Rumus</label>
                <div className="relative">
                  <select className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-700 appearance-none focus:outline-none focus:border-[#4CAF50] cursor-pointer">
                    <option>Rumus Indeks Desa Hutan 2025</option>
                  </select>
                  <div className="absolute right-4 top-4 pointer-events-none">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z" /></svg>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={() => { setIsTambahModalOpen(false); setIsUploadModalOpen(false); }} className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  Batal
                </button>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-[#8bc34a] hover:bg-[#7cb342] text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
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