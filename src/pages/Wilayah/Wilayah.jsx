import React, { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Map,
  Download,
  UploadCloud,
  MapPin,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { wilayahDesaService } from "../../services/master/wilayahDesaService";
// Pastikan service ini sudah di-import
import { wilayahHutanService } from "../../services/master/wilayahHutanService";
import { Loading } from "../../components/Loading";
import Pagination from "../../components/Pagination";

const Wilayah = () => {
  const [activeTab, setActiveTab] = useState("desa");
  const [searchTerm, setSearchTerm] = useState("");

  // --- STATE PAGINATION DESA ---
  const [pageDesa, setPageDesa] = useState(1);
  const [sizeDesa, setSizeDesa] = useState(10);

  // --- STATE PAGINATION HUTAN ---
  const [pageHutan, setPageHutan] = useState(1);
  const [sizeHutan, setSizeHutan] = useState(10);

  // --- FETCHING DATA WILAYAH DESA ---
  const { data: desaResponse, isLoading: isLoadingDesa } = useQuery({
    queryKey: ["villages", pageDesa, sizeDesa],
    queryFn: () => wilayahDesaService.getAllDesa(pageDesa, sizeDesa),
    enabled: activeTab === "desa",
    keepPreviousData: true,
  });

  // --- FETCHING DATA WILAYAH HUTAN ---
  const { data: hutanResponse, isLoading: isLoadingHutan } = useQuery({
    queryKey: ["forests", pageHutan, sizeHutan],
    queryFn: () => wilayahHutanService.getAllHutan(pageHutan, sizeHutan),
    enabled: activeTab === "hutan",
    keepPreviousData: true,
  });

  console.log(hutanResponse);

  // Helper untuk data Desa
  const listDesa = desaResponse?.items || [];
  const paginateDesa = desaResponse?.pagination || {
    total: 0,
    perPage: sizeDesa,
    currentPage: 1,
    totalPage: 1,
  };

  // Helper untuk data Hutan (Berdasarkan JSON response yang Anda berikan)
  const listHutan = hutanResponse?.items || [];
  const paginateHutan = hutanResponse?.pagination || {
    total: 0,
    perPage: sizeHutan,
    currentPage: 1,
    totalPage: 1,
  };

  return (
    <DashboardLayout activeMenu="Wilayah">
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#FAFBFC]">
        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8 custom-scrollbar">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Manajemen Wilayah
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Kelola data spasial wilayah hutan dan desa.
            </p>
          </div>

          {/* TABS */}
          <div className="flex justify-between w-full p-1 bg-gray-100/80 backdrop-blur-sm rounded-xl mb-6 border border-gray-200/50">
            {["hutan", "desa", "khdtk"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSearchTerm("");
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

          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 flex flex-col min-h-[500px]">
            {/* TOOLBAR */}
            <div className="p-6 border-b border-gray-50 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-[#2D7344] shrink-0">
                    <Map size={20} strokeWidth={2} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-800 capitalize">
                    Data {activeTab}
                  </h2>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-full sm:w-56 group">
                  <Search
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Cari wilayah..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#2D7344]"
                  />
                </div>
                <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#2D7344] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#1E5230]">
                  <Plus size={18} /> Tambah Data
                </button>
              </div>
            </div>

            {/* AREA TABEL */}
            <div className="overflow-x-auto w-full flex-1">
              {/* --- TABEL WILAYAH HUTAN --- */}
              {activeTab === "hutan" && (
                <table className="w-full text-left border-collapse whitespace-nowrap min-w-[1000px]">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100 text-[11px] uppercase tracking-wider font-bold text-gray-500">
                      <th className="py-4 px-6 w-16 text-center">No</th>
                      <th className="py-4 px-6">Nama Kawasan / SK</th>
                      <th className="py-4 px-6">Fungsi / Kode</th>
                      <th className="py-4 px-6">Sumber Spasial</th>
                      <th className="py-4 px-6 text-right">Luas (Ha)</th>
                      <th className="py-4 px-6 text-center w-36">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-medium text-gray-700">
                    {isLoadingHutan ? (
                      <tr>
                        <td colSpan="6" className="py-20 text-center">
                          <Loading />
                        </td>
                      </tr>
                    ) : listHutan.length > 0 ? (
                      listHutan.map((hutan, idx) => (
                        <tr
                          key={hutan.id}
                          className="border-b border-gray-50/80 hover:bg-[#F4FBF7] transition-colors group"
                        >
                          <td className="py-4 px-6 text-gray-500 text-center">
                            {(paginateHutan.currentPage - 1) *
                              paginateHutan.perPage +
                              idx +
                              1}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex flex-col">
                              <span className="text-gray-900 font-bold group-hover:text-[#2D7344]">
                                {hutan.nama === "-" ? "Tanpa Nama" : hutan.nama}
                              </span>
                              <span className="text-[11px] text-gray-400 font-mono italic">
                                SK: {hutan.no_sk_penetapan}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex flex-col">
                              <span className="text-gray-700">
                                {hutan.klasifikasi_hutan || "N/A"}
                              </span>
                              <span className="text-[11px] text-gray-400 uppercase tracking-tighter">
                                ID: {hutan.fungsi_kawasan_hutan_kode}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            {hutan.wilayah_hutan_geom ? (
                              <div className="flex flex-col">
                                <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-100 w-fit uppercase">
                                  {hutan.wilayah_hutan_geom.sumber}
                                </span>
                                <span className="text-[10px] text-gray-400 truncate max-w-[150px]">
                                  {hutan.wilayah_hutan_geom.file_name}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-300 italic text-xs">
                                Tanpa Spasial
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-right font-mono text-gray-800 font-bold">
                            {new Intl.NumberFormat("id-ID").format(
                              hutan.luas_ha,
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center justify-center gap-2">
                              <button className="p-1.5 text-gray-400 hover:text-[#0A66C2]">
                                <MapPin size={16} />
                              </button>
                              <button className="p-1.5 text-gray-400 hover:text-[#2D7344]">
                                <Edit2 size={16} />
                              </button>
                              <button className="p-1.5 text-gray-400 hover:text-red-600">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="6"
                          className="py-12 text-center text-gray-500"
                        >
                          Data tidak ditemukan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

              {/* --- TABEL WILAYAH DESA --- */}
              {activeTab === "desa" && (
                <table className="w-full text-left border-collapse whitespace-nowrap min-w-[1000px]">
                  {/* ... Header & Body Desa sama seperti kode awal Anda ... */}
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
                    ) : (
                      listDesa.map((desa, idx) => (
                        <tr
                          key={desa.id}
                          className="border-b border-gray-50/80 hover:bg-[#F4FBF7] transition-colors group"
                        >
                          <td className="py-4 px-6 text-gray-500 text-center">
                            {(paginateDesa.currentPage - 1) *
                              paginateDesa.perPage +
                              idx +
                              1}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex flex-col">
                              <span className="text-gray-900 font-bold">
                                {desa.nama}
                              </span>
                              <span className="text-[11px] text-gray-400 font-mono">
                                {desa.kodeKemendagri}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">{desa.kecamatan}</td>
                          <td className="py-4 px-6">{desa.kabupaten}</td>
                          <td className="py-4 px-6">
                            <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md text-xs font-bold border border-blue-100 uppercase">
                              {desa.wilayah_desa_geom?.sumber || "N/A"}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right font-mono font-bold">
                            {desa.luasHa}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center justify-center gap-2">
                              <button className="p-1.5 text-gray-400 hover:text-[#0A66C2]">
                                <MapPin size={16} />
                              </button>
                              <button className="p-1.5 text-gray-400 hover:text-[#2D7344]">
                                <Edit2 size={16} />
                              </button>
                              <button className="p-1.5 text-gray-400 hover:text-red-600">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* PAGINATION HUTAN */}
            {activeTab === "hutan" && !isLoadingHutan && (
              <Pagination
                currentPage={paginateHutan.currentPage}
                totalPage={paginateHutan.totalPage}
                perPage={paginateHutan.perPage}
                total={paginateHutan.total}
                onPageChange={setPageHutan}
                onSizeChange={setSizeHutan}
              />
            )}

            {/* PAGINATION DESA */}
            {activeTab === "desa" && !isLoadingDesa && (
              <Pagination
                currentPage={paginateDesa.currentPage}
                totalPage={paginateDesa.totalPage}
                perPage={paginateDesa.perPage}
                total={paginateDesa.total}
                onPageChange={setPageDesa}
                onSizeChange={setSizeDesa}
              />
            )}
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default Wilayah;
