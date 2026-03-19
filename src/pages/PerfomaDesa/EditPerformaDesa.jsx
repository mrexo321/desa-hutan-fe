import React from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";

export default function EditPerformaDesa() {
  const navigate = useNavigate();

  // Kumpulan field untuk memperpendek kode render
  const formFields = [
    { label: "Provinsi", value: "Kalimantan Barat" },
    { label: "Kabupaten/Kota", value: "Sanggau" },
    { label: "Kecamatan", value: "Tayan Hilir" },
    { label: "Nama Desa", value: "Desa Sukamaju" },
    { label: "Indeks Desa Membangun (IDM)", value: "0.7" },
    { label: "Indeks Ketahanan Pangan (IKP)", value: "0.4" },
    { label: "Rawan Banjir", value: "Pilih Skala Penilaian", isPlaceholder: true },
    { label: "Rawan Longsor", value: "Pilih Skala Penilaian", isPlaceholder: true },
    { label: "Rawan Kekeringan", value: "Pilih Skala Penilaian", isPlaceholder: true },
    { label: "Rawan Gempabumi", value: "Pilih Skala Penilaian", isPlaceholder: true },
    { label: "Rawan Tsunami", value: "Pilih Skala Penilaian", isPlaceholder: true },
    { label: "Rawan Erupsi Gunungapi", value: "Pilih Skala Penilaian", isPlaceholder: true },
  ];

  return (
    <DashboardLayout activeMenu="Performa Desa Hutan">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col mb-4">
        
        {/* Garis Hijau Header & Judul */}
        <div className="w-full h-2 bg-[#2D7344]"></div>
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 mb-1">Tambah Data Performa Desa Hutan</h3>
          <p className="text-xs text-gray-500">Data Performa Desa Hutan</p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 flex-1 overflow-y-auto">
          {formFields.map((field, idx) => (
            <div key={idx}>
              <label className="block text-xs font-bold text-gray-800 mb-2">{field.label}</label>
              <div className="relative">
                <select 
                  className={`w-full border border-gray-300 rounded-lg p-2.5 text-xs appearance-none focus:outline-none focus:border-[#2D7344] cursor-pointer ${field.isPlaceholder ? "text-gray-400" : "text-gray-700"}`}
                >
                  <option>{field.value}</option>
                </select>
                <div className="absolute right-4 top-3 pointer-events-none text-gray-500">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z" /></svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Form Footer / Action Buttons */}
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-white">
          <button 
            onClick={() => navigate(-1)} // Kembali ke halaman sebelumnya
            className="flex items-center gap-2 px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-xs font-medium transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            Batal
          </button>
          <button 
            onClick={() => navigate("/performa-desa")}
            className="flex items-center gap-2 px-6 py-2 bg-[#2D7344] hover:bg-[#1d4d2b] text-white rounded-md text-xs font-medium transition-colors shadow-sm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Simpan
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
}