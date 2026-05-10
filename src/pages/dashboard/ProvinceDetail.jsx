import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  MapPin,
  TreePine,
  Eye,
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

  // Fetching Data Detail
  const { data: detailResponse, isLoading } = useQuery({
    queryKey: ["provinceDetail", provinceName, page, size],
    queryFn: () =>
      analystSpatialService.getProvinceDetail(provinceName, page, size),
    enabled: !!provinceName,
    keepPreviousData: true,
  });

  // Ekstraksi Data
  const rawData =
    detailResponse?.data || detailResponse?.items || detailResponse || [];
  const meta = detailResponse?.pagination || {
    total: rawData.length || 0,
    perPage: size,
    currentPage: 1,
    totalPage: Math.ceil((rawData.length || 0) / size) || 1,
  };

  // Logika Filter Pencarian
  const filteredData = rawData.filter((desa) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      desa.nama?.toLowerCase().includes(searchLower) ||
      desa.kecamatan?.toLowerCase().includes(searchLower) ||
      desa.kabupaten?.toLowerCase().includes(searchLower) ||
      desa.kodeKemendagri?.toLowerCase().includes(searchLower)
    );
  });

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  // FUNGSI BARU: Pindah Halaman ke Detail Desa
  const handleViewDetail = (desa) => {
    // Sesuaikan path '/desa-detail/' dengan routing di App.jsx Anda
    // Kita mengirimkan object 'desa' melalui state agar tidak perlu fetch ulang di halaman sebelah
    navigate(`/desa-detail/${desa.id}`, {
      state: {
        desaData: desa,
        provinceName: provinceName, // Kirim juga nama provinsi untuk breadcrumb
      },
    });
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
                  Rincian interaksi spasial desa dan kawasan hutan secara
                  spesifik.
                </p>
              </div>
            </div>
          </div>

          {/* --- MAIN CARD --- */}
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 flex flex-col min-h-[500px] overflow-hidden mb-8">
            {/* Toolbar */}
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
                        desa.ringkasanInteraksi?.klasifikasi?.toLowerCase() ===
                        "mayoritas";
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
                            {desa.kodeKemendagri || "-"}
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
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${isMayoritas
                                ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                : "bg-amber-50 text-amber-600 border-amber-200"
                                }`}
                            >
                              {desa.ringkasanInteraksi?.klasifikasi ||
                                "Minoritas"}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <button
                              onClick={() => handleViewDetail(desa)}
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
                </div>
              )}
            </div>

            {/* Pagination Footer (Sama seperti sebelumnya) */}
            {/* ... */}
          </div>
        </div>
      </main>

    </DashboardLayout>
  );
};

export default ProvinceDetail;
