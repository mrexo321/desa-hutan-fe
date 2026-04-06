import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import {
  ChevronLeft,
  ChevronRight, // Tambahan icon untuk Next Page
  Search,
  MapPin,
  TreePine,
  Eye,
  X,
  Map,
  Maximize,
  PieChart,
  Activity,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { analystSpatialService } from "../../services/master/analystSpatialService";
import { Loading } from "../../components/Loading";

const ProvinceDetail = () => {
  const { provinceName } = useParams();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);

  // State untuk Modal
  const [selectedDesa, setSelectedDesa] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetching Data Detail (Menambahkan page & limit ke query dan service)
  const { data: detailResponse, isLoading } = useQuery({
    queryKey: ["provinceDetail", provinceName, page, size],
    queryFn: () =>
      analystSpatialService.getProvinceDetail(provinceName, page, size),
    enabled: !!provinceName,
    keepPreviousData: true, // Mencegah tabel kosong/berkedip saat ganti halaman
  });

  // Ekstraksi Data dan Metadata Pagination
  const rawData = detailResponse?.items || detailResponse || [];
  const meta = detailResponse?.pagination || {
    total: 0,
    perPage: size,
    currentPage: 1,
    totalPage: 1,
  };

  // Logika Filter Pencarian
  const filteredData = rawData.filter((desa) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      desa.nama?.toLowerCase().includes(searchLower) ||
      desa.kecamatan?.toLowerCase().includes(searchLower) ||
      desa.kabupaten?.toLowerCase().includes(searchLower) ||
      desa.kode_kemendagri?.toLowerCase().includes(searchLower)
    );
  });

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  // Fungsi Kontrol Modal
  const openModal = (desa) => {
    setSelectedDesa(desa);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = "auto";
    setTimeout(() => setSelectedDesa(null), 300);
  };

  return (
    <DashboardLayout activeMenu={"Dashboard"}>
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#F8FAFC]">
        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8 custom-scrollbar">
          {/* --- HEADER SECTION --- */}
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-500 hover:text-emerald-700 font-medium text-sm mb-4 transition-colors w-fit px-3 py-1.5 -ml-3 rounded-xl hover:bg-emerald-50"
            >
              <ChevronLeft size={18} />
              Kembali ke Dashboard
            </button>

            <div className="flex items-center gap-4">
              <div className="bg-white p-3.5 rounded-2xl text-emerald-600 shadow-sm border border-emerald-100">
                <MapPin size={28} strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                  Wilayah: {decodeURIComponent(provinceName)}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Rincian interaksi desa dan kawasan hutan secara spesifik.
                </p>
              </div>
            </div>
          </div>

          {/* --- MAIN CARD (SEARCH, TABLE & PAGINATION) --- */}
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 flex flex-col min-h-[500px] overflow-hidden mb-8">
            {/* Toolbar: Title & Search */}
            <div className="px-6 py-5 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-gray-800">Daftar Desa</h3>
                {!isLoading && (
                  <span className="bg-emerald-50 text-emerald-600 text-xs font-bold py-1 px-3 rounded-full border border-emerald-100">
                    {meta.total} Total Data
                  </span>
                )}
              </div>

              <div className="relative w-full lg:w-96">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Cari desa, kecamatan, atau kode..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full bg-[#F8FAFC] border-none text-gray-700 py-3 pl-11 pr-4 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all font-medium"
                />
              </div>
            </div>

            {/* Table Area */}
            <div className="flex-1 overflow-x-auto custom-scrollbar">
              {isLoading ? (
                <div className="py-32 flex justify-center">
                  <Loading />
                </div>
              ) : filteredData.length > 0 ? (
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="bg-[#FAFAFA] text-[11px] uppercase tracking-wider font-bold text-gray-400 border-b border-gray-100">
                      <th className="py-4 px-6 w-16 text-center">No</th>
                      <th className="py-4 px-4">Nama Desa</th>
                      <th className="py-4 px-4">Kode Wilayah</th>
                      <th className="py-4 px-4">Kecamatan</th>
                      <th className="py-4 px-4">Kabupaten</th>
                      <th className="py-4 px-4 text-right">Luas (Ha)</th>
                      <th className="py-4 px-4 text-center">Klasifikasi</th>
                      <th className="py-4 px-6 text-center w-24">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-medium text-gray-600">
                    {filteredData.map((desa, idx) => {
                      const isMayoritas =
                        desa.ringkasan_interaksi?.klasifikasi?.toLowerCase() ===
                        "mayoritas";

                      // Penomoran berlanjut berdasarkan halaman
                      const rowNumber =
                        (meta.currentPage - 1) * meta.perPage + idx + 1;

                      return (
                        <tr
                          key={desa.id || idx}
                          className="border-b border-gray-50/50 hover:bg-[#F4FBF7] transition-colors group"
                        >
                          <td className="py-4 px-6 text-center text-gray-400 font-medium">
                            {rowNumber}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                <TreePine
                                  size={14}
                                  className="text-emerald-600"
                                />
                              </div>
                              <span className="font-bold text-gray-800">
                                {desa.nama}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-500 font-mono text-xs">
                            {desa.kode_kemendagri || "-"}
                          </td>
                          <td className="py-4 px-4 text-gray-500">
                            {desa.kecamatan || "-"}
                          </td>
                          <td className="py-4 px-4 text-gray-500">
                            {desa.kabupaten || "-"}
                          </td>
                          <td className="py-4 px-4 text-right text-gray-700 font-semibold">
                            {desa.luas_desa_ha?.toLocaleString() || "0"}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                                isMayoritas
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                  : "bg-amber-50 text-amber-600 border-amber-200"
                              }`}
                            >
                              {desa.ringkasan_interaksi?.klasifikasi ||
                                "Minoritas"}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <button
                              onClick={() => openModal(desa)}
                              className="text-emerald-600 hover:text-white bg-emerald-50 hover:bg-emerald-500 p-2.5 rounded-xl transition-all shadow-sm opacity-0 group-hover:opacity-100 flex items-center justify-center mx-auto"
                              title="Lihat Detail Desa"
                            >
                              <Eye size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="py-32 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Search size={24} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-base font-medium">
                    {searchTerm
                      ? `Tidak ada desa yang cocok dengan "${searchTerm}"`
                      : "Belum ada data desa untuk provinsi ini."}
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="mt-4 text-sm font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl transition-colors"
                    >
                      Hapus Filter Pencarian
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* --- PAGINATION FOOTER --- */}
            {!isLoading && meta.total > 0 && (
              <div className="p-4 sm:px-6 border-t border-gray-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Select Baris Per Halaman */}
                <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                  <span>Tampilkan</span>
                  <select
                    value={size}
                    onChange={(e) => {
                      setSize(Number(e.target.value));
                      setPage(1); // Reset ke halaman pertama setiap ganti size
                    }}
                    className="bg-gray-50 border border-gray-200 text-gray-700 py-1.5 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer transition-all"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span>data</span>
                </div>

                {/* Info dan Navigasi Halaman */}
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500 font-medium hidden md:block">
                    {Math.min(
                      (meta.currentPage - 1) * meta.perPage + 1,
                      meta.total,
                    )}{" "}
                    - {Math.min(meta.currentPage * meta.perPage, meta.total)}{" "}
                    dari {meta.total} data
                  </span>

                  <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-xl border border-gray-100">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={meta.currentPage === 1}
                      className="p-1.5 rounded-lg text-gray-500 hover:bg-white hover:shadow-sm disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all cursor-pointer"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    <span className="text-sm font-bold text-gray-700 px-3">
                      {meta.currentPage}{" "}
                      <span className="text-gray-400 font-medium mx-1">/</span>{" "}
                      {meta.totalPage}
                    </span>

                    <button
                      onClick={() =>
                        setPage((p) => Math.min(meta.totalPage, p + 1))
                      }
                      disabled={meta.currentPage === meta.totalPage}
                      className="p-1.5 rounded-lg text-gray-500 hover:bg-white hover:shadow-sm disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all cursor-pointer"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* --- MODAL OVERLAY & CONTENT --- */}
      <div
        className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ${
          isModalOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <div
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
          onClick={closeModal}
        />

        <div
          className={`relative bg-[#F8FAFC] w-full max-w-2xl rounded-[24px] shadow-2xl overflow-hidden transition-all duration-300 ease-out transform ${
            isModalOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
          }`}
        >
          {selectedDesa && (
            <>
              {/* Header Modal */}
              <div className="bg-white px-6 py-5 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                    <TreePine size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 leading-tight">
                      {selectedDesa.nama}
                    </h2>
                    <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mt-0.5">
                      {selectedDesa.kode_kemendagri || "KODE TIDAK TERSEDIA"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body Modal */}
              <div className="p-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
                <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-4 shadow-sm flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                      <Map size={20} />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 font-bold uppercase">
                        Kecamatan
                      </p>
                      <p className="text-sm font-semibold text-gray-800">
                        {selectedDesa.kecamatan}
                      </p>
                    </div>
                  </div>
                  <div className="hidden sm:block w-px h-10 bg-gray-100"></div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 font-bold uppercase">
                        Kabupaten
                      </p>
                      <p className="text-sm font-semibold text-gray-800">
                        {selectedDesa.kabupaten}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-3 text-gray-500">
                      <Maximize size={16} className="text-emerald-500" />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Total Luas Desa
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-gray-800">
                      {selectedDesa.luas_desa_ha?.toLocaleString() || "0"}{" "}
                      <span className="text-sm text-gray-500 font-medium">
                        Hektar
                      </span>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-0 opacity-50"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-3 text-gray-500">
                        <PieChart size={16} className="text-amber-500" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                          Total Irisan Hutan
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-gray-800">
                        {selectedDesa.ringkasan_interaksi?.total_luas_irisan_ha?.toLocaleString() ||
                          "0"}{" "}
                        <span className="text-sm text-gray-500 font-medium">
                          Hektar
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                        <Activity size={16} className="text-emerald-500" />
                        Rasio Kawasan Hutan
                      </h4>
                      <p className="text-xs text-gray-400 mt-1">
                        Persentase wilayah desa yang beririsan dengan hutan.
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-[11px] font-bold px-3 py-1.5 rounded-lg capitalize ${
                          selectedDesa.ringkasan_interaksi?.klasifikasi?.toLowerCase() ===
                          "mayoritas"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {selectedDesa.ringkasan_interaksi?.klasifikasi ||
                          "Minoritas"}
                      </span>
                    </div>
                  </div>

                  <div className="relative w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${Math.min(
                          selectedDesa.ringkasan_interaksi
                            ?.total_persen_irisan || 0,
                          100,
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs font-bold">
                    <span className="text-emerald-600">
                      {selectedDesa.ringkasan_interaksi?.total_persen_irisan ||
                        0}
                      % Tercover
                    </span>
                    <span className="text-gray-400">100% Total</span>
                  </div>
                </div>
              </div>

              {/* Footer Modal */}
              <div className="bg-white p-4 border-t border-gray-100 flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition-colors shadow-md cursor-pointer"
                >
                  Tutup Detail
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProvinceDetail;
