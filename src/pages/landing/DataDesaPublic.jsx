import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  Database, 
  Mail, 
  Calendar, 
  MapPin, 
  Globe, 
  Loader2, 
  CheckCircle2, 
  ChevronDown, 
  ArrowRight,
  Info,
  Layers,
  FileSpreadsheet
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import HomeLayout from "../../components/HomeLayout";
import { masterWilayahService } from "../../services/master/masterWilayahService";
import { indikatorService } from "../../services/master/indikatorService";
import { performaDesaService } from "../../services/master/performaDesaService";

const WILAYAH_LEVELS = [
  { value: "nasional", label: "Nasional" },
  { value: "provinsi", label: "Provinsi" },
  { value: "kabupaten", label: "Kabupaten" },
  { value: "kecamatan", label: "Kecamatan" },
];

export default function DataDesaPublic() {
  const [email, setEmail] = useState("");
  const [selectedTahunId, setSelectedTahunId] = useState("");
  const [selectedWilayahLevel, setSelectedWilayahLevel] = useState("");
  const [selectedProvinsiId, setSelectedProvinsiId] = useState("");
  const [selectedKabupatenId, setSelectedKabupatenId] = useState("");
  const [selectedKecamatanId, setSelectedKecamatanId] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derived flags for which sub-fields to show
  const showProvinsi = ["provinsi", "kabupaten", "kecamatan"].includes(selectedWilayahLevel);
  const showKabupaten = ["kabupaten", "kecamatan"].includes(selectedWilayahLevel);
  const showKecamatan = selectedWilayahLevel === "kecamatan";

  // ── Fetch Years via useQuery ──
  const { data: yearsRes, isLoading: isLoadingYears } = useQuery({
    queryKey: ["years-public"],
    queryFn: async () => {
      try {
        const res = await indikatorService.getAllYearIndicatorPublic();
        return res?.data || res || [];
      } catch (err) {
        console.error("Gagal mengambil data tahun:", err);
        return [];
      }
    },
    retry: 1,
  });
  const years = Array.isArray(yearsRes) ? yearsRes : [];

  // ── Fetch Provinces via useQuery ──
  const { data: provincesRes, isLoading: isLoadingProvinces } = useQuery({
    queryKey: ["provinces-public"],
    queryFn: async () => {
      try {
        const data = await masterWilayahService.getAllProvinsiPublic();
        return data || [];
      } catch (err) {
        console.error("Gagal mengambil data provinsi:", err);
        return [];
      }
    },
    enabled: !!selectedTahunId && showProvinsi,
    retry: 1,
  });
  const provinces = Array.isArray(provincesRes) ? provincesRes : [];

  // ── Fetch Kabupatens via useQuery ──
  const { data: kabupatensRes, isLoading: isLoadingKabupatens } = useQuery({
    queryKey: ["kabupatens-public", selectedProvinsiId],
    queryFn: async () => {
      try {
        const data = await masterWilayahService.getAllKabupatenPublic(null, null, "", selectedProvinsiId);
        return data || [];
      } catch (err) {
        console.error("Gagal mengambil data kabupaten:", err);
        return [];
      }
    },
    enabled: !!selectedProvinsiId && showKabupaten,
    retry: 1,
  });
  const kabupatens = Array.isArray(kabupatensRes) ? kabupatensRes : [];

  // ── Fetch Kecamatans via useQuery ──
  const { data: kecamatansRes, isLoading: isLoadingKecamatans } = useQuery({
    queryKey: ["kecamatans-public", selectedKabupatenId],
    queryFn: async () => {
      try {
        const data = await masterWilayahService.getAllKecamatanPublic(null, null, "", selectedKabupatenId);
        return data || [];
      } catch (err) {
        console.error("Gagal mengambil data kecamatan:", err);
        return [];
      }
    },
    enabled: !!selectedKabupatenId && showKecamatan,
    retry: 1,
  });
  const kecamatans = Array.isArray(kecamatansRes) ? kecamatansRes : [];

  // Reset downstream when tahun changes
  useEffect(() => {
    if (!selectedTahunId) {
      setSelectedWilayahLevel("");
      setSelectedProvinsiId("");
      setSelectedKabupatenId("");
      setSelectedKecamatanId("");
    }
  }, [selectedTahunId]);

  // Reset downstream when wilayah level changes
  useEffect(() => {
    setSelectedProvinsiId("");
    setSelectedKabupatenId("");
    setSelectedKecamatanId("");
  }, [selectedWilayahLevel]);

  // Reset downstream when provinsi changes
  useEffect(() => {
    if (!selectedProvinsiId) {
      setSelectedKabupatenId("");
      setSelectedKecamatanId("");
    }
  }, [selectedProvinsiId]);

  // Reset kecamatan when kabupaten changes
  useEffect(() => {
    if (!selectedKabupatenId) {
      setSelectedKecamatanId("");
    }
  }, [selectedKabupatenId]);

  // Submit request
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate based on wilayah level
    const missingBasic = !selectedTahunId || !selectedWilayahLevel || !email;
    const missingProvinsi = showProvinsi && !selectedProvinsiId;
    const missingKabupaten = showKabupaten && !selectedKabupatenId;
    const missingKecamatan = showKecamatan && !selectedKecamatanId;

    if (missingBasic || missingProvinsi || missingKabupaten || missingKecamatan) {
      toast.warning("Harap lengkapi semua field formulir!");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Format email tidak valid!");
      return;
    }

    setIsSubmitting(true);

    // Get names for payload
    const selectedTahunObj = years.find((y) => String(y.id) === String(selectedTahunId));
    const selectedProvObj = provinces.find((p) => String(p.id) === String(selectedProvinsiId));
    const selectedKabObj = kabupatens.find((k) => String(k.id) === String(selectedKabupatenId));
    const selectedKecObj = kecamatans.find((kc) => String(kc.id) === String(selectedKecamatanId));

    const payload = {
      tahun: Number(selectedTahunObj?.tahun || selectedTahunId),
      email,
      provinsi: selectedWilayahLevel === "nasional" ? "Nasional" : (selectedProvObj?.name || selectedProvObj?.nama || selectedProvObj?.provinsi || ""),
      kabupaten: ["kabupaten", "kecamatan"].includes(selectedWilayahLevel) ? (selectedKabObj?.name || selectedKabObj?.nama || selectedKabObj?.kabupaten || null) : null,
      kecamatan: selectedWilayahLevel === "kecamatan" ? (selectedKecObj?.name || selectedKecObj?.nama || selectedKecObj?.kecamatan || null) : null,
    };

    try {
      const response = await performaDesaService.createRequestExcel(payload);
      if (response.success || response.id || response.data) {
        toast.success("Permintaan ekspor Excel performa berhasil dikirim!", {
          description: "Anda dapat memantau status permohonan ini di dashboard dengan email tersebut.",
        });
        // Clear fields
        setSelectedTahunId("");
        setSelectedWilayahLevel("");
        setSelectedProvinsiId("");
        setSelectedKabupatenId("");
        setSelectedKecamatanId("");
        setEmail("");
      }
    } catch (err) {
      console.error("Gagal mengirim permintaan:", err);
      toast.error(err.response?.data?.message || "Gagal mengirim permohonan data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <HomeLayout>
      <div className="bg-slate-50/50 font-sans text-slate-800 min-h-screen pb-20">
        
        {/* Banner Hero */}
        <section className="bg-gradient-to-tr from-[#0C2A18] to-[#164E2A] py-16 px-6 text-white text-center relative overflow-hidden shadow-md">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="max-w-4xl mx-auto z-10 relative">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest bg-emerald-900/40 border border-emerald-700/50 px-3.5 py-1.5 rounded-full inline-block mb-3.5 leading-none">
              Portal Layanan Data
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-4 uppercase">
              Permintaan Data Performa Desa
            </h1>
            <p className="text-sm sm:text-base text-emerald-100/80 max-w-2xl mx-auto leading-relaxed font-medium">
              Unduh data indikator performa pembangunan desa hutan terlengkap berformat Microsoft Excel (xlsx) untuk analisis kebijakan daerah Anda.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <main className="max-w-3xl mx-auto px-6 py-12 md:py-16 -mt-10">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_15px_50px_rgba(15,118,110,0.04)] overflow-hidden">
            {/* Elegant Brand Top Bar Accent */}
            <div className="w-full h-2 bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-400"></div>

            <div className="p-8 sm:p-12">
              <div className="flex items-center gap-4 mb-8 pb-5 border-b border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 shadow-sm">
                  <FileSpreadsheet size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 tracking-tight">Formulir Permohonan Data</h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Filter data spasial &amp; administratif</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">

                {/* 2-COLUMN GRID: TAHUN & TINGKAT WILAYAH */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* FILTER 1: TAHUN */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                      <Calendar size={14} className="text-emerald-600" />
                      Tahun Indikator
                    </label>
                    <div className="relative">
                      <select
                        id="select-tahun"
                        value={selectedTahunId}
                        onChange={(e) => setSelectedTahunId(e.target.value)}
                        disabled={isLoadingYears}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 font-semibold focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-pointer disabled:bg-slate-100 disabled:opacity-75 disabled:cursor-not-allowed appearance-none"
                        required
                      >
                        <option value="" disabled>
                          {isLoadingYears ? "Memuat Tahun..." : "-- Pilih Tahun --"}
                        </option>
                        {years && Array.isArray(years) && years.map((y) => (
                          <option key={y.id} value={y.id}>
                            Tahun {y.tahun}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        {isLoadingYears ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* FILTER 2: WILAYAH LEVEL */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                      <Globe size={14} className="text-emerald-600" />
                      Tingkat Administrasi
                    </label>
                    <div className="relative">
                      <select
                        id="select-wilayah"
                        value={selectedWilayahLevel}
                        onChange={(e) => setSelectedWilayahLevel(e.target.value)}
                        disabled={!selectedTahunId}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 font-semibold focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-pointer disabled:bg-slate-100 disabled:opacity-75 disabled:cursor-not-allowed appearance-none"
                        required
                      >
                        <option value="" disabled>
                          {!selectedTahunId ? "Pilih Tahun Dahulu" : "-- Pilih Tingkat --"}
                        </option>
                        {WILAYAH_LEVELS.map((w) => (
                          <option key={w.value} value={w.value}>
                            {w.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <ChevronDown size={16} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* INFO BADGES BY SELECTION */}
                {selectedWilayahLevel && (
                  <div className="animate-in fade-in duration-300">
                    {selectedWilayahLevel === "nasional" && (
                      <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-100/50 rounded-2xl p-4 flex gap-3 items-start">
                        <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block mb-0.5">Lingkup Nasional Terpilih</span>
                          <p className="opacity-90 font-medium">Data ekspor akan memuat rekapitulasi data performa seluruh desa di seluruh wilayah Indonesia.</p>
                        </div>
                      </div>
                    )}
                    {selectedWilayahLevel === "provinsi" && (
                      <div className="text-xs text-blue-800 bg-blue-50 border border-blue-100/50 rounded-2xl p-4 flex gap-3 items-start">
                        <MapPin size={18} className="text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block mb-0.5">Lingkup Provinsi Terpilih</span>
                          <p className="opacity-90 font-medium">Silakan tentukan provinsi spesifik di bawah untuk memfilter wilayah data desa.</p>
                        </div>
                      </div>
                    )}
                    {selectedWilayahLevel === "kabupaten" && (
                      <div className="text-xs text-blue-800 bg-blue-50 border border-blue-100/50 rounded-2xl p-4 flex gap-3 items-start">
                        <MapPin size={18} className="text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block mb-0.5">Lingkup Kabupaten Terpilih</span>
                          <p className="opacity-90 font-medium">Silakan tentukan provinsi lalu pilih kabupaten yang dituju.</p>
                        </div>
                      </div>
                    )}
                    {selectedWilayahLevel === "kecamatan" && (
                      <div className="text-xs text-blue-800 bg-blue-50 border border-blue-100/50 rounded-2xl p-4 flex gap-3 items-start">
                        <MapPin size={18} className="text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block mb-0.5">Lingkup Kecamatan Terpilih</span>
                          <p className="opacity-90 font-medium">Penyaringan data mendalam tingkat kecamatan memerlukan data hierarki provinsi dan kabupaten induk.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* CASCADING FILTER DROPDOWNS */}
                <div className="space-y-4">
                  {/* FILTER 3: PROVINSI */}
                  {showProvinsi && (
                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                        <MapPin size={14} className="text-emerald-600" />
                        Pilih Provinsi
                      </label>
                      <div className="relative">
                        <select
                          id="select-provinsi"
                          value={selectedProvinsiId}
                          onChange={(e) => setSelectedProvinsiId(e.target.value)}
                          disabled={isLoadingProvinces}
                          className="w-full px-4 py-3 bg-slate-50 disabled:bg-slate-100 disabled:opacity-75 disabled:cursor-not-allowed border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 font-semibold focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-pointer appearance-none"
                          required
                        >
                          <option value="" disabled>
                            {isLoadingProvinces ? "Memuat Provinsi..." : "-- Pilih Provinsi --"}
                          </option>
                          {provinces && Array.isArray(provinces) && provinces.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name || p.nama || p.provinsi}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                          {isLoadingProvinces ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FILTER 4: KABUPATEN */}
                  {showKabupaten && (
                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                        <MapPin size={14} className="text-emerald-600" />
                        Pilih Kabupaten / Kota
                      </label>
                      <div className="relative">
                        <select
                          id="select-kabupaten"
                          value={selectedKabupatenId}
                          onChange={(e) => setSelectedKabupatenId(e.target.value)}
                          disabled={!selectedProvinsiId || isLoadingKabupatens}
                          className="w-full px-4 py-3 bg-slate-50 disabled:bg-slate-100 disabled:opacity-75 disabled:cursor-not-allowed border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 font-semibold focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-pointer appearance-none"
                          required
                        >
                          <option value="" disabled>
                            {isLoadingKabupatens
                              ? "Memuat Kabupaten..."
                              : !selectedProvinsiId
                              ? "Pilih Provinsi Terlebih Dahulu"
                              : "-- Pilih Kabupaten --"}
                          </option>
                          {kabupatens && Array.isArray(kabupatens) && kabupatens.map((k) => (
                            <option key={k.id} value={k.id}>
                              {k.name || k.nama || k.kabupaten}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                          {isLoadingKabupatens ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FILTER 5: KECAMATAN */}
                  {showKecamatan && (
                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                        <MapPin size={14} className="text-emerald-600" />
                        Pilih Kecamatan
                      </label>
                      <div className="relative">
                        <select
                          id="select-kecamatan"
                          value={selectedKecamatanId}
                          onChange={(e) => setSelectedKecamatanId(e.target.value)}
                          disabled={!selectedKabupatenId || isLoadingKecamatans}
                          className="w-full px-4 py-3 bg-slate-50 disabled:bg-slate-100 disabled:opacity-75 disabled:cursor-not-allowed border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 font-semibold focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-pointer appearance-none"
                          required
                        >
                          <option value="" disabled>
                            {isLoadingKecamatans
                              ? "Memuat Kecamatan..."
                              : !selectedKabupatenId
                              ? "Pilih Kabupaten Terlebih Dahulu"
                              : "-- Pilih Kecamatan --"}
                          </option>
                          {kecamatans && Array.isArray(kecamatans) && kecamatans.map((kc) => (
                            <option key={kc.id} value={kc.id}>
                              {kc.name || kc.nama || kc.kecamatan}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                          {isLoadingKecamatans ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <hr className="border-slate-100" />

                {/* EMAIL INPUT */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                    <Mail size={14} className="text-emerald-600" />
                    Email Penerima Data
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      id="input-email"
                      placeholder="contoh: nama@instansi.go.id"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 font-bold focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                      required
                    />
                  </div>
                  <div className="flex gap-1.5 items-start text-[11px] text-slate-400 font-semibold pl-1.5 mt-1 leading-normal">
                    <Info size={12} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>Status verifikasi admin dan tautan unduh berkas xlsx akan dikirimkan serta tercatat pada email ini.</span>
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  id="submit-request"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 text-white bg-gradient-to-r from-emerald-600 to-[#10B981] hover:from-emerald-700 hover:to-emerald-600 text-sm font-extrabold py-4 rounded-2xl transition-all shadow-md shadow-emerald-900/10 hover:shadow-emerald-900/20 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-6"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Memproses Permintaan Data...
                    </>
                  ) : (
                    <>
                      Kirim Permintaan Data Excel
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

              </form>
            </div>
          </div>
        </main>
      </div>
    </HomeLayout>
  );
}
