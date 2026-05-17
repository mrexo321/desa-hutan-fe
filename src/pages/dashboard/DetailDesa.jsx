import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import {
  ChevronLeft,
  MapPin,
  Map,
  TreePine,
  Maximize,
  PieChart,
  Activity,
  Layers,
  MapPinned,
  AlertCircle,
  Tag,
  Info,
  CheckCircle,
} from "lucide-react";

// Helper formatting dipindah keluar dari komponen agar tidak di-recreate setiap kali render
const formatJenisInteraksi = (jenis) => {
  if (!jenis) return "-";
  return jenis
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const DetailDesa = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Mengambil data yang dilempar dari halaman ProvinceDetail
  const desa = location.state?.desaData;
  const provinceName = location.state?.provinceName || "Provinsi";

  console.log(desa);


  // Jika user refresh halaman secara langsung, state akan hilang.
  // Ini adalah fallback UI yang mengarahkan mereka kembali.
  if (!desa) {
    return (
      <DashboardLayout activeMenu={"Dashboard"}>
        <div className="flex flex-col items-center justify-center h-full">
          <AlertCircle size={48} className="text-amber-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Data Tidak Ditemukan
          </h2>
          <p className="text-gray-500 mb-6">
            Silakan kembali dan pilih desa dari daftar tabel.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition"
          >
            Kembali ke Daftar
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const isMayoritas =
    desa.ringkasanInteraksi?.klasifikasi?.toLowerCase() === "mayoritas";

  return (
    <DashboardLayout activeMenu={"Dashboard"}>
      <main className="flex-1 flex flex-col h-full overflow-y-auto bg-[#F8FAFC] custom-scrollbar">
        <div className="px-6 md:px-10 py-8 max-w-7xl mx-auto w-full space-y-8">
          {/* --- BREADCRUMB & BACK BUTTON --- */}
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-500 hover:text-emerald-700 font-medium text-sm transition-colors w-fit px-3 py-1.5 -ml-3 rounded-xl hover:bg-emerald-50"
            >
              <ChevronLeft size={18} />
              Kembali ke Daftar Desa {decodeURIComponent(provinceName)}
            </button>
          </div>

          {/* --- HERO HEADER --- */}
          <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
            {/* Background aksen */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-50/80 to-transparent rounded-bl-[100px] pointer-events-none"></div>

            <div className="flex items-start gap-6 relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 shrink-0">
                <TreePine size={36} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                    Desa {typeof desa.nama === 'object' && desa.nama !== null ? desa.nama.nama : desa.nama}
                  </h1>
                  <span className="text-xs font-bold px-3 py-1 bg-gray-100 text-gray-600 rounded-lg border border-gray-200 uppercase tracking-wider">
                    {desa.kodeKemendagri || "NO CODE"}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-500 mt-3">
                  <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100">
                    <Map size={16} />
                    <span>Kec. {typeof desa.kecamatan === 'object' && desa.kecamatan !== null ? desa.kecamatan.nama : desa.kecamatan}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg border border-purple-100">
                    <MapPin size={16} />
                    <span>Kab. {typeof desa.kabupaten === 'object' && desa.kabupaten !== null ? desa.kabupaten.nama : desa.kabupaten}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 text-right hidden md:block">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Status Interaksi
              </p>
              <div
                className={`inline-flex items-center px-4 py-2 rounded-xl border ${
                  isMayoritas
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-amber-50 border-amber-200 text-amber-700"
                }`}
              >
                <span className="font-bold capitalize text-lg">
                  {desa.ringkasanInteraksi?.klasifikasi || "Minoritas"}
                </span>
              </div>
            </div>
          </div>

          {/* --- STATISTICS CARDS --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center transition-transform hover:-translate-y-1 duration-300 relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 rounded-full blur-2xl group-hover:bg-emerald-100 transition-colors"></div>
              <div className="flex items-center gap-3 mb-4 text-gray-500 relative z-10">
                <div className="p-2.5 bg-emerald-50 rounded-xl">
                  <Maximize size={20} className="text-emerald-600" />
                </div>
                <span className="text-sm font-bold uppercase tracking-wider">
                  Total Luas Desa
                </span>
              </div>
              <div className="text-3xl xl:text-4xl font-black text-gray-800 relative z-10">
                {desa.luas_desa_ha?.toLocaleString() || "0"}
                <span className="text-base xl:text-lg text-gray-400 font-medium ml-1">
                  Ha
                </span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center transition-transform hover:-translate-y-1 duration-300 relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-50 rounded-full blur-2xl group-hover:bg-amber-100 transition-colors"></div>
              <div className="flex items-center gap-3 mb-4 text-gray-500 relative z-10">
                <div className="p-2.5 bg-amber-50 rounded-xl">
                  <PieChart size={20} className="text-amber-600" />
                </div>
                <span className="text-sm font-bold uppercase tracking-wider">
                  Luas Irisan Hutan
                </span>
              </div>
              <div className="text-3xl xl:text-4xl font-black text-gray-800 relative z-10">
                {desa.ringkasanInteraksi?.totalLuasIrisanHa?.toLocaleString() || "0"}
                <span className="text-base xl:text-lg text-gray-400 font-medium ml-1">
                  Ha
                </span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center transition-transform hover:-translate-y-1 duration-300 relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-50 rounded-full blur-2xl group-hover:bg-indigo-100 transition-colors"></div>
              <div className="flex items-center gap-3 mb-4 text-gray-500 relative z-10">
                <div className="p-2.5 bg-indigo-50 rounded-xl">
                  <Layers size={20} className="text-indigo-600" />
                </div>
                <span className="text-sm font-bold uppercase tracking-wider">
                  Total Kawasan
                </span>
              </div>
              <div className="text-3xl xl:text-4xl font-black text-gray-800 relative z-10">
                {desa.ringkasanInteraksi?.totalHutan || "0"}
                <span className="text-base xl:text-lg text-gray-400 font-medium ml-1">
                  Titik
                </span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center transition-transform hover:-translate-y-1 duration-300 relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full blur-2xl group-hover:bg-blue-100 transition-colors"></div>
              <div className="flex items-center gap-3 mb-5 text-gray-500 relative z-10">
                <div className="p-2.5 bg-blue-50 rounded-xl">
                  <Activity size={20} className="text-blue-600" />
                </div>
                <span className="text-sm font-bold uppercase tracking-wider">
                  Rasio Tutupan
                </span>
              </div>

              <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-3 z-10">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${Math.min(desa.ringkasanInteraksi?.totalPersenIrisan || 0, 100)}%`,
                  }}
                />
              </div>
              <div className="flex justify-between items-center text-sm font-bold z-10 relative">
                <span className="text-emerald-600">
                  {desa.ringkasanInteraksi?.totalPersenIrisan || 0}%
                </span>
                <span className="text-gray-400">100%</span>
              </div>
            </div>
          </div>

          {/* --- DETAILED DATA (HUTAN ARRAY) --- */}
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden mb-10">
            <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-50 p-3 rounded-2xl">
                  <Layers size={24} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Rincian Area Hutan
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Penjabaran spesifik fungsi kawasan hutan yang beririsan
                    dengan desa.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2">
                <span className="text-sm font-bold text-gray-700">
                  Total: {desa.detailHutan?.length || 0} Titik
                </span>
              </div>
            </div>

            <div className="p-6 md:p-8 bg-[#FAFAFA]">
              {desa.detailHutan && desa.detailHutan.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {desa.detailHutan.map((hutan, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-6 rounded-[20px] border border-gray-100 shadow-sm hover:border-emerald-300 hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-50/50 to-transparent rounded-bl-[100px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      
                      <div className="flex justify-between items-start mb-6 relative z-10">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center shrink-0 border border-emerald-100/50 shadow-sm">
                            <MapPinned size={22} className="text-emerald-600" />
                          </div>
                          <div className="pt-1">
                            <h4 className="font-bold text-gray-900 text-[17px] leading-tight mb-2">
                              {typeof hutan.fungsiKawasan === 'object' && hutan.fungsiKawasan !== null
                                ? hutan.fungsiKawasan.nama
                                : hutan.fungsiKawasan || "Kawasan Tidak Diketahui / APL"}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[11px] font-bold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md border border-gray-200 flex items-center gap-1">
                                <Tag size={10} />
                                {typeof hutan.fungsiKawasan === 'object' && hutan.fungsiKawasan !== null ? hutan.fungsiKawasan.kode : "N/A"}
                              </span>
                              {hutan.namaHutan && (
                                <span className="text-[11px] font-bold px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md border border-blue-100 flex items-center gap-1">
                                  <Info size={10} />
                                  {hutan.namaHutan}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 relative z-10">
                        <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
                          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            Jenis Interaksi
                          </span>
                          <span className="text-[11px] font-bold px-2.5 py-1 bg-gray-50 text-gray-700 rounded-lg border border-gray-100">
                            {formatJenisInteraksi(hutan.jenisInteraksi)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
                          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            Klasifikasi
                          </span>
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${hutan.klasifikasi?.toLowerCase() === 'mayoritas' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                            {hutan.klasifikasi ? hutan.klasifikasi.charAt(0).toUpperCase() + hutan.klasifikasi.slice(1) : "-"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
                          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            Luas Irisan
                          </span>
                          <span className="text-sm font-black text-gray-800">
                            {hutan.luasIrisanHa?.toLocaleString() || "0"}{" "}
                            <span className="text-gray-400 font-medium">
                              Ha
                            </span>
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            Persentase
                          </span>
                          <span className="text-sm font-black text-emerald-600 flex items-center gap-1">
                            <CheckCircle size={14} className="text-emerald-500" />
                            {hutan.persenIrisan || 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-dashed border-gray-200">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-5">
                    <TreePine size={40} className="text-gray-300" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    Tidak Ada Data Rincian
                  </h3>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto">
                    Tidak ditemukan data rincian spesifik mengenai kawasan hutan
                    untuk desa ini.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default DetailDesa;
