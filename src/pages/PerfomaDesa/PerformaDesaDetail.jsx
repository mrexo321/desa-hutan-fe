import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { performaDesaService } from "../../services/master/performaDesaService";
import DashboardLayout from "../../components/DashboardLayout";
import {
  ArrowLeft,
  MapPin,
  Calculator,
  Activity,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  TrendingUp,
  Award,
  ShieldCheck
} from "lucide-react";

export default function PerformaDesaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["performaDesaDetail", id],
    queryFn: () => performaDesaService.getDetailPerformaDesa(id),
  });

  const detailData = data?.data || data;

  if (isLoading) {
    return (
      <DashboardLayout activeMenu="Performa Desa">
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-emerald-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-emerald-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-slate-500 font-bold mt-6 text-sm tracking-widest uppercase">Memuat Data...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !detailData) {
    return (
      <DashboardLayout activeMenu="Performa Desa">
        <div className="flex flex-col items-center justify-center min-h-[70vh] bg-white rounded-[2rem] m-6 border border-slate-100 shadow-sm">
          <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-6">
            <AlertCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Oops, Terjadi Kesalahan</h2>
          <p className="text-slate-500 mt-2 text-center max-w-md">Data performa desa tidak dapat ditemukan atau terjadi gangguan pada server saat mengambil data.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-8 px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Kembali ke Daftar
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const { desa, formulaIndikatorPerhitungan, nilaiIndikator } = detailData;

  const getStyleTheme = (label) => {
    if (!label) return { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", bar: "bg-slate-300", icon: <ShieldCheck size={20} /> };
    const text = label.toLowerCase();
    if (text.includes("tinggi") || text.includes("baik") || text.includes("sangat"))
      return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", bar: "bg-emerald-500", icon: <TrendingUp size={24} /> };
    if (text.includes("sedang") || text.includes("cukup"))
      return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", bar: "bg-amber-500", icon: <Activity size={24} /> };
    if (text.includes("rendah") || text.includes("buruk"))
      return { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", bar: "bg-rose-500", icon: <AlertCircle size={24} /> };
    return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", bar: "bg-blue-500", icon: <Award size={24} /> };
  };

  const totalIndicators = nilaiIndikator?.length || 0;
  const allScores = nilaiIndikator?.map(i => parseFloat(i.nilai) || 0) || [];
  // Dynamic max score, ensuring it's at least 5 for scale-based visual logic
  const maxScore = Math.max(...allScores, 5);

  return (
    <DashboardLayout activeMenu="Performa Desa">
      <div className="flex flex-col gap-10 min-h-[calc(100vh-120px)] p-2 md:p-6 lg:px-8 max-w-7xl mx-auto w-full">

        {/* HERO HEADER */}
        <div className="relative w-full rounded-[2.5rem] overflow-hidden bg-slate-900 shadow-xl">
          {/* Decorative background shapes */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-500/20 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4"></div>

          <div className="relative z-10 p-8 md:p-12 lg:p-16 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
            <div className="flex flex-col items-start gap-8">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white backdrop-blur-md transition-all font-bold text-sm hover:-translate-x-1"
              >
                <ArrowLeft size={18} strokeWidth={2.5} />
                Kembali
              </button>

              <div>
                <div className="inline-flex text-white items-center gap-2 px-4 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-black uppercase tracking-[0.2em] mb-5">
                  <MapPin size={14} />
                  Laporan Evaluasi Desa
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
                  Desa {desa?.nama || "Tidak Bernama"}
                </h1>
                <p className="text-slate-300 mt-5 max-w-2xl text-sm md:text-base leading-relaxed font-medium">
                  Laporan analitik performa desa yang mengkalkulasi ketahanan sosial, ekonomi, dan kerentanan lingkungan berdasarkan indikator terbaru.
                </p>
              </div>
            </div>

            {/* Score Summary Badge */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-[2rem] text-white p-8 flex items-center gap-8 shadow-2xl shrink-0">
              <div>
                <p className="text-white/60 text-xs font-black uppercase tracking-widest mb-2 ">Total Indikator</p>
                <p className="text-4xl font-black text-white">{totalIndicators}</p>
              </div>
              <div className="w-px h-16 bg-white/10"></div>
              <div>
                <p className="text-white/60 text-xs font-black uppercase tracking-widest mb-2">Status</p>
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
                  </span>
                  <span className="text-emerald-400 font-bold text-lg">Selesai</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FORMULA CARD */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col lg:flex-row gap-10 items-center hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-shadow duration-500">
          <div className="lg:w-1/3 w-full space-y-5">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6  shadow-sm border border-blue-100/50">
              <Calculator size={32} strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Formula Penilaian</h2>
            <p className="text-slate-500 text-[15px] leading-relaxed font-medium">
              Kalkulasi akhir dari performa desa ini menggunakan rumusan standar yang telah ditetapkan dalam sistem indeks untuk periode penilaian ini.
            </p>
          </div>

          <div className="lg:w-2/3 w-full bg-[#0B1120] rounded-[2rem] p-10 relative overflow-hidden group shadow-inner">
            {/* Minimalist code window look */}
            <div className="absolute top-5 left-5 flex gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-rose-500 border border-rose-600"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-amber-500 border border-amber-600"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 border border-emerald-600"></div>
            </div>
            <div className="absolute right-5 top-5 text-slate-700">
              <FileSpreadsheet color="#fff" size={24} />
            </div>

            <div className="mt-10 flex items-center justify-center min-h-[120px]">
              <code className="text-3xl md:text-4xl lg:text-5xl font-mono text-emerald-400 tracking-wider text-center break-all font-bold">
                {formulaIndikatorPerhitungan?.formula || "Tidak ada formula"}
              </code>
            </div>
          </div>
        </div>

        {/* INDICATORS SECTION */}
        <div className="mb-12 mt-4">
          <div className="flex items-center gap-5 mb-10 px-2">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm">
              <CheckCircle2 size={26} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Rincian Indikator Performa</h2>
              <p className="text-slate-500 font-medium mt-1">Daftar evaluasi rinci untuk masing-masing kriteria di desa ini.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {nilaiIndikator && nilaiIndikator.length > 0 ? (
              nilaiIndikator.map((item, idx) => {
                const theme = getStyleTheme(item.label);
                const percentage = Math.min((parseFloat(item.nilai) / maxScore) * 100, 100) || 0;

                return (
                  <div
                    key={idx}
                    className="group bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-slate-100 hover:border-emerald-200/60 transition-all duration-300 flex flex-col hover:-translate-y-1.5 cursor-default relative overflow-hidden"
                  >
                    {/* Subtle background glow effect on hover */}
                    <div className={`absolute top-0 right-0 w-32 h-32 ${theme.bg} rounded-full blur-[50px] -mr-10 -mt-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                    {/* Header: Code & Label */}
                    <div className="flex justify-between items-start mb-8 relative z-10">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center shadow-sm border ${theme.bg} ${theme.text} ${theme.border}`}>
                          {theme.icon}
                        </div>
                        <span className="text-xl font-black text-slate-800 tracking-widest">
                          #{item.kode}
                        </span>
                      </div>
                      <span className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border shadow-sm ${theme.bg} ${theme.text} ${theme.border}`}>
                        {item.label}
                      </span>
                    </div>

                    {/* Body: Title */}
                    <div className="flex-1 mb-10 relative z-10">
                      <h4 className="text-2xl font-bold text-slate-800 leading-snug">
                        {item.indikator}
                      </h4>
                    </div>

                    {/* Footer: Score & Progress */}
                    <div className="mt-auto relative z-10">
                      <div className="flex justify-between items-end mb-4">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Skor Penilaian</span>
                        <div className="flex items-baseline gap-1.5">
                          <span className={`text-5xl font-black ${theme.text} leading-none tracking-tighter`}>
                            {item.nilai}
                          </span>
                          <span className="text-slate-400 font-bold text-lg">/ {maxScore}</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                        <div
                          className={`h-full rounded-full ${theme.bar} transition-all duration-1000 ease-out`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                <div className="w-28 h-28 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-6 shadow-sm">
                  <AlertCircle size={48} strokeWidth={1.5} />
                </div>
                <h4 className="text-2xl font-bold text-slate-800 mb-3">Belum Ada Indikator</h4>
                <p className="text-slate-500 max-w-lg text-[15px] font-medium leading-relaxed">Data performa desa ini belum memiliki indikator penilaian yang tercatat di dalam sistem.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
