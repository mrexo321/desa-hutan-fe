import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { indikatorService } from "../../services/master/indikatorService";
import {
  ChevronLeft,
  Calculator,
  CalendarDays,
  Hash,
  Database,
  Info,
  CheckCircle2,
  Copy,
  Check,
  BookOpen,
  Sparkles,
  Link as LinkIcon,
  Activity,
  TrendingUp,
  TrendingDown,
  Layers,
  Scale
} from "lucide-react";

const DetailFormulaIndicator = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isCopied, setIsCopied] = useState(false);

  const {
    data: detailData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["detailFormula", id],
    queryFn: () => indikatorService.getDetailFormula(id),
    enabled: !!id,
  });

  const formula = detailData?.data || detailData;

  console.log(formula);


  // Fitur Copy Formula
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Fungsi untuk menerjemahkan formula teknis (ex: {{B_BB}}) ke bahasa manusia (ex: [Bencana Banjir])
  const getHumanReadableFormula = () => {
    if (!formula?.formula) return "";
    let humanFormula = formula.formula;

    if (formula.indikatorUtama && formula.indikatorUtama.length > 0) {
      formula.indikatorUtama.forEach((item) => {
        // Replace format {{KODE}} dengan [Nama Indikator]
        const regex = new RegExp(`\\{\\{${item.kode}\\}\\}`, "g");
        humanFormula = humanFormula.replace(regex, `[${item.nama}]`);

        // Replace format KODE (tanpa kurung kurawal) jika ada
        const regex2 = new RegExp(`\\b${item.kode}\\b`, "g");
        humanFormula = humanFormula.replace(regex2, `[${item.nama}]`);
      });
    }
    return humanFormula;
  };

  if (isLoading) {
    return (
      <DashboardLayout activeMenu="Indikator Perhitungan">
        <div className="flex-1 flex flex-col items-center justify-center h-full gap-4">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <div className="text-slate-500 font-medium animate-pulse">
            Menyiapkan Detail Formula...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !formula) {
    return (
      <DashboardLayout activeMenu="Indikator Perhitungan">
        <div className="flex-1 flex flex-col items-center justify-center h-full text-center p-6">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
            <Info size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Gagal Memuat Detail
          </h2>
          <p className="text-slate-500 mb-8 max-w-md">
            Data formula tidak ditemukan atau terjadi kesalahan pada server saat
            mengambil data.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 transition-colors text-white font-bold rounded-xl shadow-lg"
          >
            Kembali ke Daftar
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="Indikator Perhitungan">
      <main className="flex-1 flex flex-col h-full overflow-y-auto bg-[#FAFBFC] custom-scrollbar">
        <div className="px-4 md:px-8 py-8 max-w-7xl mx-auto w-full space-y-6">
          {/* BREADCRUMB */}
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-500 hover:text-emerald-700 font-bold text-sm transition-colors w-fit px-3 py-2 -ml-3 rounded-xl hover:bg-emerald-50"
            >
              <ChevronLeft size={18} />
              Kembali
            </button>
          </div>

          {/* HERO HEADER - Informatif & Menyambut */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
            {/* Dekorasi Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-50 to-transparent rounded-bl-full pointer-events-none opacity-60"></div>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-[#2D7344] to-[#1a4528] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-900/20 shrink-0">
                <Calculator size={36} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-2">
                  {formula.nama}
                </h1>
                <p className="text-sm text-slate-500 max-w-2xl leading-relaxed mb-4">
                  Formula ini adalah rumus matematika yang digunakan sistem
                  untuk menghitung nilai akhir berdasarkan beberapa indikator.
                </p>
                <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
                  <div className="flex items-center gap-1.5 text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                    <CalendarDays size={16} />
                    <span>
                      Tahun Referensi:{" "}
                      <strong className="font-bold">
                        {formula.tahunIndikator?.tahun || "-"}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-mono text-xs">
                    <Hash size={14} />
                    <span>ID: {formula.id}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* KONTEN UTAMA - Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* KIRI (2 Kolom): Cara Kerja (Formula) & Kamus */}
            <div className="lg:col-span-2 space-y-6">
              {/* Card Formula Terjemahan (Orang Awam Friendly) */}
              <div className="bg-slate-900 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-900/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                  <Sparkles size={120} />
                </div>

                <div className="flex justify-between items-center mb-6 relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-800 rounded-lg text-emerald-400">
                      <Calculator size={20} />
                    </div>
                    <h3 className="text-white font-bold text-lg">
                      Rumus Perhitungan
                    </h3>
                  </div>
                  <button
                    onClick={() => handleCopy(formula.formula)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all text-sm font-bold"
                  >
                    {isCopied ? (
                      <>
                        <Check size={16} className="text-emerald-400" />{" "}
                        Tersalin
                      </>
                    ) : (
                      <>
                        <Copy size={16} /> Salin Rumus Asli
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-4 relative z-10">
                  {/* Human Readable Version */}
                  <div>
                    <p className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-2 flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      Versi Mudah Dibaca
                    </p>
                    <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl">
                      <p className="text-white text-lg md:text-xl font-medium leading-relaxed">
                        {getHumanReadableFormula()}
                      </p>
                    </div>
                  </div>

                  {/* Raw System Code */}
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-widest font-bold mb-2 flex items-center gap-2 mt-6">
                      <Database size={14} />
                      Kode Sistem Asli
                    </p>
                    <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-xl">
                      <code className="text-emerald-500 font-mono text-sm break-all">
                        {formula.formula}
                      </code>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Kamus Variabel */}
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">
                      Kamus Singkatan
                    </h3>
                    <p className="text-sm text-slate-500">
                      Penjelasan kode singkatan yang ada di dalam rumus.
                    </p>
                  </div>
                </div>

                {formula.variables && formula.variables.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {formula.variables.map((variable, idx) => {
                      // Mencoba mencari nama indikator dari kode ini
                      const matchIndicator = formula.indikatorUtama?.find(
                        (ind) => ind.kode === variable,
                      );

                      return (
                        <div
                          key={idx}
                          className="flex flex-col p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all group"
                        >
                          <span className="text-slate-400 font-mono text-xs font-bold mb-1 uppercase">
                            Kode Variabel
                          </span>
                          <span className="text-slate-800 font-black text-lg font-mono mb-2 bg-white px-3 py-1 rounded-lg border border-slate-200 w-fit shadow-sm">
                            {variable}
                          </span>

                          <div className="flex items-start gap-2 mt-2 pt-3 border-t border-slate-200/60">
                            <LinkIcon
                              size={14}
                              className="text-slate-400 mt-0.5"
                            />
                            <span className="text-sm font-semibold text-slate-700">
                              {matchIndicator
                                ? matchIndicator.nama
                                : "Parameter Eksternal / Konstanta"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-400 italic">
                      Rumus ini tidak menggunakan variabel dinamis.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* KANAN (1 Kolom): Indikator Terkait */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm h-full flex flex-col overflow-hidden sticky top-6">
                <div className="p-6 border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">
                      Indikator Terkait
                    </h3>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">
                    Daftar metrik utama yang menyuplai angka untuk rumus ini.
                  </p>
                </div>

                <div className="p-4 flex-1 overflow-y-auto max-h-[600px] custom-scrollbar bg-slate-50/50">
                  {formula.indikatorUtama &&
                  formula.indikatorUtama.length > 0 ? (
                    <div className="space-y-4">
                      {formula.indikatorUtama.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden"
                        >
                          {/* Aksen garis di sebelah kiri */}
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                          {/* Header Indikator */}
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md inline-block mb-2 font-mono border border-emerald-100 uppercase">
                                {item.kode}
                              </p>
                              <h4 className="font-bold text-slate-800 text-base leading-snug">
                                {item.nama}
                              </h4>
                            </div>
                            <div className="bg-slate-50 text-slate-500 p-1.5 rounded-lg border border-slate-100">
                              <Activity size={16} />
                            </div>
                          </div>

                          {/* Metadata Indikator */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 text-slate-600 rounded-md text-xs font-semibold border border-slate-100">
                              <Layers size={12} /> Tipe: {item.tipe}
                            </span>
                            <span className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-semibold border border-blue-100">
                              <Scale size={12} /> Satuan: {item.satuan}
                            </span>
                            {item.arahPenilaian && (
                              <span className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold border ${item.arahPenilaian === 'positif' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                                {item.arahPenilaian === 'positif' ? <TrendingUp size={12} /> : <TrendingDown size={12} />} 
                                Arah: {item.arahPenilaian}
                              </span>
                            )}
                          </div>

                          {/* Skala Penilaian */}
                          {item.penilaianIndikator && item.penilaianIndikator.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-slate-100/80">
                              <p className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-2">
                                Skala Penilaian ({item.penilaianIndikator.length})
                              </p>
                              <div className="flex flex-col gap-2">
                                {item.penilaianIndikator.map((skala) => (
                                  <div key={skala.id} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-100 group-hover:bg-white group-hover:border-slate-200 transition-colors">
                                    <span className="text-sm font-medium text-slate-700 capitalize">
                                      {skala.label || skala.nama}
                                    </span>
                                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100/50 px-2 py-1 rounded-md font-mono">
                                      {skala.nilai}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center py-16 text-center opacity-70">
                      <Database size={48} className="text-slate-300 mb-4" />
                      <p className="text-base font-bold text-slate-600">
                        Belum Ada Relasi
                      </p>
                      <p className="text-sm text-slate-500 mt-1 px-4">
                        Formula ini berdiri sendiri atau belum dikaitkan dengan
                        indikator manapun.
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer status kard */}
                <div className="bg-slate-50 p-4 border-t border-slate-100 text-center">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Total {formula.indikatorUtama?.length || 0} Indikator
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default DetailFormulaIndicator;
