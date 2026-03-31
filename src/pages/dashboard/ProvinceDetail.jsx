import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { ChevronLeft, Search, MapPin, TreePine } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { analystSpatialService } from "../../services/master/analystSpatialService";
import { Loading } from "../../components/Loading";

const ProvinceDetail = () => {
  const { provinceName } = useParams(); // Mengambil nama provinsi dari URL
  const navigate = useNavigate();

  // State hanya untuk Search
  const [searchTerm, setSearchTerm] = useState("");

  // Fetching Data Detail
  const { data: detailResponse, isLoading } = useQuery({
    queryKey: ["provinceDetail", provinceName],
    queryFn: () => analystSpatialService.getProvinceDetail(provinceName),
    enabled: !!provinceName,
  });

  // Logika Filter
  const rawData = detailResponse?.data || detailResponse || [];

  const filteredData = rawData.filter((desa) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      desa.nama?.toLowerCase().includes(searchLower) ||
      desa.kecamatan?.toLowerCase().includes(searchLower) ||
      desa.kabupaten?.toLowerCase().includes(searchLower)
    );
  });

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <DashboardLayout activeMenu={"Dashboard"}>
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#FAFBFC]">
        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8 custom-scrollbar">
          {/* --- TOMBOL KEMBALI & HEADER --- */}
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)} // Kembali ke halaman sebelumnya
              className="flex items-center gap-2 text-gray-500 hover:text-[#2D7344] font-medium text-sm mb-4 transition-colors w-fit px-3 py-1.5 -ml-3 rounded-lg hover:bg-green-50"
            >
              <ChevronLeft size={18} />
              Kembali ke Dashboard
            </button>

            <div className="flex items-center gap-4">
              <div className="bg-[#EAFBF0] p-3 rounded-2xl text-[#2D7344] shadow-sm">
                <MapPin size={28} strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                  Wilayah: {provinceName}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Rincian interaksi desa dan kawasan hutan secara spesifik.
                </p>
              </div>
            </div>
          </div>

          {/* --- KONTEN UTAMA HALAMAN DETAIL --- */}
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 flex flex-col min-h-[500px] overflow-hidden mb-8">
            {/* Search Bar & Header Area */}
            <div className="px-6 py-5 border-b border-gray-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-bold text-gray-900 tracking-tight">
                  Daftar Desa
                </h3>
                {/* Badge Jumlah Data pengganti informasi pagination */}
                {!isLoading && (
                  <span className="bg-gray-100 text-gray-600 text-xs font-bold py-1 px-2.5 rounded-lg">
                    {filteredData.length} Data
                  </span>
                )}
              </div>

              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder="Cari desa, kecamatan, kabupaten..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-700 py-2.5 pl-10 pr-4 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 focus:outline-none font-medium transition-all"
                />
                <Search
                  className="absolute left-3.5 top-3 text-gray-400"
                  size={16}
                />
              </div>
            </div>

            {/* List Data (Scrollable Area di dalam Card) */}
            <div className="flex-1 p-6 bg-[#FAFBFC] max-h-[600px] overflow-y-auto custom-scrollbar">
              {isLoading ? (
                <div className="py-32 flex justify-center">
                  <Loading />
                </div>
              ) : filteredData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                  {/* Mapping langsung dari filteredData */}
                  {filteredData.map((desa) => (
                    <div
                      key={desa.id}
                      className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col xl:flex-row gap-4 xl:items-center justify-between group"
                    >
                      {/* Info Lokasi */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-gray-900 group-hover:text-[#2D7344] transition-colors">
                            {desa.nama}
                          </h4>
                          <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                            {desa.kode_kemendagri}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          Kec. {desa.kecamatan}, {desa.kabupaten}
                        </p>
                      </div>

                      {/* Statistik Singkat */}
                      <div className="flex flex-wrap xl:flex-nowrap items-center gap-4 sm:gap-6 xl:pl-6 xl:border-l xl:border-gray-100 mt-2 xl:mt-0">
                        <div>
                          <p className="text-[11px] text-gray-400 font-bold uppercase mb-1">
                            Luas Desa
                          </p>
                          <p className="text-sm font-semibold text-gray-800">
                            {desa.luas_desa_ha?.toLocaleString() || 0} Ha
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] text-gray-400 font-bold uppercase mb-1">
                            Irisan Hutan
                          </p>
                          <p className="text-sm font-semibold text-gray-800">
                            {desa.ringkasan_interaksi?.total_luas_irisan_ha?.toLocaleString() ||
                              0}{" "}
                            Ha
                            <span className="text-green-600 ml-1 font-bold text-xs bg-green-50 px-1.5 py-0.5 rounded">
                              {desa.ringkasan_interaksi?.total_persen_irisan ||
                                0}
                              %
                            </span>
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] text-gray-400 font-bold uppercase mb-1">
                            Klasifikasi
                          </p>
                          <span
                            className={`text-[11px] font-bold px-3 py-1.5 rounded-lg capitalize inline-block ${
                              desa.ringkasan_interaksi?.klasifikasi ===
                              "mayoritas"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {desa.ringkasan_interaksi?.klasifikasi || "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-32 text-center flex flex-col items-center">
                  <TreePine size={48} className="text-gray-300 mb-4" />
                  <p className="text-gray-500 text-base font-medium">
                    {searchTerm
                      ? `Tidak ada desa yang cocok dengan pencarian "${searchTerm}"`
                      : "Tidak ada detail desa yang ditemukan."}
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="mt-4 text-sm font-bold text-[#2D7344] hover:underline"
                    >
                      Hapus Pencarian
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default ProvinceDetail;
