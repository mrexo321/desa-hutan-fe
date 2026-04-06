import React, { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
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
  MapPin, // Tambahan Icon
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { wilayahDesaService } from "../../services/master/wilayahDesaService";
import { Loading } from "../../components/Loading";
import Pagination from "../../components/Pagination";

const Wilayah = () => {
  const [activeTab, setActiveTab] = useState("desa"); // Default ke 'desa' agar API langsung jalan
  const [searchTerm, setSearchTerm] = useState("");

  // State Pagination khusus untuk Desa
  const [pageDesa, setPageDesa] = useState(1);
  const [sizeDesa, setSizeDesa] = useState(10);

  // --- FETCHING DATA WILAYAH DESA ---
  const { data: desaResponse, isLoading: isLoadingDesa } = useQuery({
    queryKey: ["villages", pageDesa, sizeDesa],
    // Asumsi service Anda mendukung pagination
    queryFn: () => wilayahDesaService.getAllDesa(pageDesa, sizeDesa),
    enabled: activeTab === "desa", // Hanya fetch jika tab Desa aktif
    keepPreviousData: true,
  });

  const listDesa = desaResponse?.items || desaResponse || [];
  const paginate = desaResponse?.pagination || {
    total: 0,
    perPage: sizeDesa,
    currentPage: 1,
    totalPage: 1,
  };

  // Filter Lokal Sementara (Jika API belum dukung search server-side)
  const filteredDesa = listDesa.filter(
    (desa) =>
      desa.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      desa.kecamatan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      desa.kabupaten?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <DashboardLayout activeMenu="Wilayah">
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#FAFBFC]">
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
          <div className="flex justify-between w-full p-1 bg-gray-100/80 backdrop-blur-sm rounded-xl mb-6 border border-gray-200/50">
            {["hutan", "desa", "khdtk"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSearchTerm(""); // Reset search saat ganti tab
                }}
                className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 w-full capitalize ${
                  activeTab === tab
                    ? "bg-white text-[#2D7344] shadow-[0_2px_8px_rgb(0,0,0,0.06)]"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                }`}
              >
                Wilayah {tab.toUpperCase()}
              </button>
            ))}
          </div>

          {/* CARD KONTEN UTAMA */}
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 flex flex-col min-h-[500px]">
            {/* Header Toolbar (Filter, Search, Actions) */}
            <div className="p-6 border-b border-gray-50 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
              {/* Kiri: Judul & Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-[#2D7344] shrink-0">
                    <Map size={20} strokeWidth={2} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-800 whitespace-nowrap hidden sm:block capitalize">
                    Data {activeTab}
                  </h2>
                </div>

                <div className="hidden sm:block w-px h-8 bg-gray-200 mx-2"></div>

                <div className="flex items-center gap-2">
                  <select className="bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-[#2D7344] cursor-pointer font-medium min-w-[180px]">
                    <option>-- Filter Regional --</option>
                    <option>Sumatera Utara</option>
                    <option>Jawa Barat</option>
                    <option>Jawa Timur</option>
                  </select>
                </div>
              </div>

              {/* Kanan: Search & Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-full sm:w-56 group">
                  <Search
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2D7344] transition-colors"
                    size={16}
                  />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari wilayah..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-[#2D7344] transition-all font-medium"
                  />
                </div>

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

                <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#2D7344] hover:bg-[#1E5230] text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm active:scale-[0.98]">
                  <Plus size={18} strokeWidth={2.5} />
                  Tambah Data
                </button>
              </div>
            </div>

            {/* AREA TABEL (Conditional Rendering Berdasarkan Tab) */}
            <div className="overflow-x-auto w-full flex-1">
              {/* --- TABEL WILAYAH DESA (Menggunakan Data API) --- */}
              {activeTab === "desa" && (
                <table className="w-full text-left border-collapse whitespace-nowrap min-w-[1000px]">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100 text-[11px] uppercase tracking-wider font-bold text-gray-500">
                      <th className="py-4 px-6 w-16 text-center">No</th>
                      <th className="py-4 px-6">Nama Desa & Kode</th>
                      <th className="py-4 px-6">Kecamatan</th>
                      <th className="py-4 px-6">Kabupaten / Provinsi</th>
                      <th className="py-4 px-6">Sumber Data Spasial</th>
                      <th className="py-4 px-6 text-right">Luas (Ha)</th>
                      <th className="py-4 px-6 text-center w-36">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-medium text-gray-700">
                    {isLoadingDesa ? (
                      <tr>
                        <td colSpan="7" className="py-20 text-center">
                          <Loading />
                        </td>
                      </tr>
                    ) : filteredDesa.length > 0 ? (
                      filteredDesa.map((desa, idx) => {
                        const rowNumber =
                          (paginate.currentPage - 1) * paginate.perPage +
                          idx +
                          1;
                        return (
                          <tr
                            key={desa.id}
                            className="border-b border-gray-50/80 hover:bg-[#F4FBF7] transition-colors group"
                          >
                            <td className="py-4 px-6 text-gray-500 font-semibold text-center">
                              {rowNumber}
                            </td>

                            <td className="py-4 px-6">
                              <div className="flex flex-col">
                                <span className="text-gray-900 font-bold group-hover:text-[#2D7344] transition-colors">
                                  {desa.nama}
                                </span>
                                <span className="text-[11px] text-gray-400 font-mono tracking-widest">
                                  {desa.kodeKemendagri}
                                </span>
                              </div>
                            </td>

                            <td className="py-4 px-6 text-gray-600">
                              {desa.kecamatan}
                            </td>

                            <td className="py-4 px-6">
                              <div className="flex flex-col">
                                <span className="text-gray-700 font-semibold">
                                  {desa.kabupaten}
                                </span>
                                <span className="text-[11px] text-gray-500">
                                  {desa.provinsi}
                                </span>
                              </div>
                            </td>

                            <td className="py-4 px-6">
                              {desa.wilayah_desa_geom ? (
                                <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md text-xs font-bold border border-blue-100 uppercase">
                                  {desa.wilayah_desa_geom.sumber}
                                </span>
                              ) : (
                                <span className="text-gray-300 italic text-xs">
                                  Belum ada spasial
                                </span>
                              )}
                            </td>

                            <td className="py-4 px-6 text-right font-mono text-gray-800 font-bold">
                              {desa.luasHa}
                            </td>

                            <td className="py-4 px-6">
                              <div className="flex items-center justify-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                <button
                                  className="p-1.5 text-gray-400 hover:text-[#0A66C2] hover:bg-blue-50 rounded-md transition-all"
                                  title="Lihat Peta"
                                >
                                  <MapPin size={16} strokeWidth={2} />
                                </button>
                                <button
                                  className="p-1.5 text-gray-400 hover:text-[#2D7344] hover:bg-[#EAFBF0] rounded-md transition-all"
                                  title="Edit Data"
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
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan="7"
                          className="py-12 text-center text-gray-500"
                        >
                          Tidak ada data desa ditemukan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

              {/* --- TABEL WILAYAH HUTAN & KHDTK (Mockup/Placeholder) --- */}
              {activeTab !== "desa" && (
                <div className="py-24 text-center flex flex-col items-center justify-center bg-gray-50/30 h-full">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                    <Map size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-700">
                    Modul Wilayah {activeTab.toUpperCase()}
                  </h3>
                  <p className="text-sm text-gray-500 mt-2">
                    Endpoint API sedang dalam tahap integrasi.
                  </p>
                </div>
              )}
            </div>

            {/* PAGINATION KHUSUS DESA */}
            {activeTab === "desa" && !isLoadingDesa && (
              <Pagination
                currentPage={paginate.currentPage}
                totalPage={paginate.totalPage}
                perPage={paginate.perPage}
                total={paginate.total}
                onPageChange={setPageDesa} // Lempar fungsi setter halaman
                onSizeChange={setSizeDesa} // Lempar fungsi setter ukuran
              />
            )}
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default Wilayah;
