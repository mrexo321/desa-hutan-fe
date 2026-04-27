import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Loader2,
  Target,
  BarChart2,
  Hash,
  Type,
  CheckCircle,
  AlertTriangle,
  Layers,
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { indikatorService } from "../../services/master/indikatorService";

const DetailMainIndikator = () => {
  // Ambil ID dari URL params
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetching Data Detail
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["main-indicator-detail", id],
    queryFn: () => indikatorService.getMainIndicatorById(id), // Pastikan endpoint ini didefinisikan di service Anda
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  // Ambil objek datanya
  const detail = data?.data || data;

  const handleBack = () => {
    navigate(-1); // Kembali ke halaman sebelumnya
  };

  return (
    <DashboardLayout activeMenu="Indikator">
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#FAFBFC]">
        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8 custom-scrollbar">
          {/* Header Action */}
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-semibold bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm hover:shadow-md"
            >
              <ArrowLeft size={18} />
              Kembali
            </button>
          </div>

          {/* Loading & Error States */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-[#2D7344] mb-4" />
              <p className="text-slate-500 font-medium text-lg">
                Memuat detail indikator...
              </p>
            </div>
          )}

          {isError && (
            <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 flex flex-col items-center text-center">
              <AlertTriangle className="w-12 h-12 mb-3 opacity-80" />
              <h3 className="font-bold text-lg">Gagal Memuat Data</h3>
              <p className="text-sm mt-1">
                {error?.message ||
                  "Terjadi kesalahan saat mengambil data dari server."}
              </p>
            </div>
          )}

          {/* Konten Detail */}
          {!isLoading && !isError && detail && (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Header Title Section */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-[100px] -z-0 opacity-50"></div>

                <div className="flex items-start gap-5 relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#2D7344] to-[#1e5230] rounded-2xl flex items-center justify-center text-white shadow-lg flex-shrink-0">
                    <Target size={32} strokeWidth={2} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-sm font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-lg border border-slate-200 uppercase tracking-wider">
                        {detail.kode}
                      </span>
                      {detail.tipe && (
                        <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2.5 py-1 rounded-md border border-blue-100">
                          Tipe: {detail.tipe}
                        </span>
                      )}
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                      {detail.nama}
                    </h1>
                  </div>
                </div>
              </div>

              {/* Grid Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Block 1: Kategori Info */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Layers size={16} /> Informasi Kategori
                  </h3>

                  {detail.kategoriIndikator ? (
                    <div className="space-y-5">
                      <div>
                        <p className="text-xs text-slate-500 font-medium mb-1">
                          ID Relasi
                        </p>
                        <p className="text-sm font-mono text-slate-800 break-all bg-slate-50 p-2 rounded-lg border border-slate-100">
                          {detail.kategoriIndikatorId}
                        </p>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-1 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                          <p className="text-xs text-blue-500 font-bold uppercase tracking-wider mb-1">
                            Kode Kategori
                          </p>
                          <p className="text-lg font-mono font-bold text-blue-700">
                            {detail.kategoriIndikator.kode}
                          </p>
                        </div>
                        <div className="flex-[2] bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50">
                          <p className="text-xs text-[#2D7344] font-bold uppercase tracking-wider mb-1">
                            Nama Kategori
                          </p>
                          <p className="text-lg font-bold text-emerald-800">
                            {detail.kategoriIndikator.nama}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-slate-400 italic">
                      Tidak ada relasi kategori untuk indikator ini.
                    </div>
                  )}
                </div>

                {/* Block 2: Konfigurasi Penilaian */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <BarChart2 size={16} /> Konfigurasi Penilaian
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400">
                          <Type size={18} />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium">
                            Satuan Input
                          </p>
                          <p className="text-base font-bold text-slate-800 capitalize">
                            {detail.satuan || "Tidak diatur"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400">
                          <Hash size={18} />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium">
                            Arah Penilaian
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {detail.arahPenilaian === "asc" ? (
                              <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold border border-emerald-200 uppercase">
                                Ascending (Naik)
                              </span>
                            ) : detail.arahPenilaian === "desc" ? (
                              <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs font-bold border border-amber-200 uppercase">
                                Descending (Turun)
                              </span>
                            ) : (
                              <span className="text-base font-bold text-slate-800 capitalize">
                                {detail.arahPenilaian || "Tidak diatur"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Block 3: Logika Penilaian (Tabel Empty State / Data Array) */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <CheckCircle size={16} /> Daftar Logika Penilaian
                </h3>

                {detail.penilaianIndikator &&
                detail.penilaianIndikator.length > 0 ? (
                  <div className="overflow-hidden border border-slate-200 rounded-2xl">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4 w-12 text-center">No</th>
                          <th className="py-3 px-4">Kriteria / Variabel</th>
                          <th className="py-3 px-4 text-center">Skor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                        {detail.penilaianIndikator.map((item, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="py-3 px-4 text-center text-slate-400">
                              {i + 1}
                            </td>
                            <td className="py-3 px-4">
                              {/* Render property dari item. Sesuaikan struktur API-mu */}{" "}
                              Item Penilaian
                            </td>
                            <td className="py-3 px-4 text-center font-bold text-[#2D7344]">
                              100
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-300 mb-3">
                      <CheckCircle size={24} />
                    </div>
                    <h4 className="font-bold text-slate-700">
                      Belum Ada Penilaian
                    </h4>
                    <p className="text-sm text-slate-500 mt-1 max-w-sm">
                      Indikator utama ini belum memiliki skema atau batas
                      penilaian (threshold) yang dikonfigurasi.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
};

export default DetailMainIndikator;
