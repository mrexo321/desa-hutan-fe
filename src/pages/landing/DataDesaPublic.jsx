import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Database, Mail, Calendar, MapPin, Loader2, CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import HomeLayout from "../../components/HomeLayout";
import { masterWilayahService } from "../../services/master/masterWilayahService";
import { indikatorService } from "../../services/master/indikatorService";
import { requestDataService } from "../../services/master/requestDataService";

export default function DataDesaPublic() {
  const [email, setEmail] = useState("");
  const [selectedTahunId, setSelectedTahunId] = useState("");
  const [selectedProvinsiId, setSelectedProvinsiId] = useState("");
  const [selectedKabupatenId, setSelectedKabupatenId] = useState("");
  const [selectedKecamatanId, setSelectedKecamatanId] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

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
    enabled: !!selectedTahunId,
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
    enabled: !!selectedProvinsiId,
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
    enabled: !!selectedKabupatenId,
    retry: 1,
  });
  const kecamatans = Array.isArray(kecamatansRes) ? kecamatansRes : [];

  // Reset downstream selections when selections change
  useEffect(() => {
    if (!selectedTahunId) {
      setSelectedProvinsiId("");
      setSelectedKabupatenId("");
      setSelectedKecamatanId("");
    }
  }, [selectedTahunId]);

  useEffect(() => {
    if (!selectedProvinsiId) {
      setSelectedKabupatenId("");
      setSelectedKecamatanId("");
    }
  }, [selectedProvinsiId]);

  useEffect(() => {
    if (!selectedKabupatenId) {
      setSelectedKecamatanId("");
    }
  }, [selectedKabupatenId]);

  // Submit request
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTahunId || !selectedProvinsiId || !selectedKabupatenId || !selectedKecamatanId || !email) {
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

    // Get names for storage fallback
    const selectedTahunObj = years.find((y) => String(y.id) === String(selectedTahunId));
    const selectedProvObj = provinces.find((p) => String(p.id) === String(selectedProvinsiId));
    const selectedKabObj = kabupatens.find((k) => String(k.id) === String(selectedKabupatenId));
    const selectedKecObj = kecamatans.find((kc) => String(kc.id) === String(selectedKecamatanId));

    const payload = {
      email,
      tahun_id: selectedTahunId,
      tahun: selectedTahunObj?.tahun || selectedTahunId,
      provinsi_id: selectedProvinsiId,
      provinsi_nama: selectedProvObj?.name || selectedProvObj?.nama || selectedProvObj?.provinsi || "",
      kabupaten_id: selectedKabupatenId,
      kabupaten_nama: selectedKabObj?.name || selectedKabObj?.nama || selectedKabObj?.kabupaten || "",
      kecamatan_id: selectedKecamatanId,
      kecamatan_nama: selectedKecObj?.name || selectedKecObj?.nama || selectedKecObj?.kecamatan || "",
    };

    try {
      const response = await requestDataService.createRequest(payload);
      if (response.success || response.id) {
        toast.success("Permintaan data berhasil dikirim!", {
          description: "Anda dapat memantau status permohonan ini di dashboard dengan email tersebut.",
        });
        // Clear fields
        setSelectedTahunId("");
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
      <div className="bg-[#FAFBFC] font-sans text-gray-800 min-h-screen">
        {/* Banner Hero */}
        <section className="bg-gradient-to-r from-[#0B8457] via-[#0B6E48] to-[#0B5C3C] py-16 px-6 text-white text-center relative overflow-hidden shadow-inner">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
            <div className="absolute -top-[50%] -left-[20%] w-[80%] h-[150%] bg-white rounded-full blur-3xl"></div>
          </div>
          <div className="max-w-4xl mx-auto z-10 relative">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 animate-fade-in">
              Layanan Permintaan Data Desa
            </h1>
            <p className="text-sm sm:text-base text-green-100 max-w-2xl mx-auto leading-relaxed">
              Dapatkan data desa hutan lengkap berformat Excel (xls/xlsx) dengan memfilter wilayah dan tahun sesuai kebutuhan analisis Anda.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <main className="max-w-3xl mx-auto px-6 py-12 md:py-16 -mt-8">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="w-full h-2 bg-gradient-to-r from-[#0B8457] to-[#E5B82A]"></div>

            <div className="p-8 sm:p-10">
              <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-50">
                <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-[#0B8457] shrink-0 shadow-inner">
                  <Database size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight">Formulir Permohonan Ekspor Data</h2>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Silakan isi filter wilayah secara berurutan</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">

                {/* FILTER 1: TAHUN */}
                <div className="space-y-2">
                  <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-widest flex items-center gap-1">
                    <Calendar size={14} className="text-[#0B8457]" />
                    Tahun Indikator
                  </label>
                  <div className="relative">
                    <select
                      id="select-tahun"
                      value={selectedTahunId}
                      onChange={(e) => setSelectedTahunId(e.target.value)}
                      disabled={isLoadingYears}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 font-medium focus:bg-white focus:outline-none focus:border-[#0B8457] focus:ring-4 focus:ring-green-500/10 transition-all cursor-pointer disabled:bg-gray-100 disabled:opacity-75 disabled:cursor-not-allowed"
                      required
                    >
                      <option value="">{isLoadingYears ? "Memuat Tahun..." : "-- Pilih Tahun --"}</option>
                      {years && Array.isArray(years) && years.map((y) => (
                        <option key={y.id} value={y.id}>
                          {y.tahun}
                        </option>
                      ))}
                    </select>
                    {isLoadingYears && (
                      <div className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400">
                        <Loader2 size={16} className="animate-spin" />
                      </div>
                    )}
                  </div>
                </div>

                {/* FILTER 2: PROVINSI */}
                <div className="space-y-2">
                  <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-widest flex items-center gap-1">
                    <MapPin size={14} className="text-[#0B8457]" />
                    Provinsi
                  </label>
                  <div className="relative">
                    <select
                      id="select-provinsi"
                      value={selectedProvinsiId}
                      onChange={(e) => setSelectedProvinsiId(e.target.value)}
                      disabled={!selectedTahunId || isLoadingProvinces}
                      className="w-full px-4 py-3 bg-gray-50 disabled:bg-gray-100 disabled:opacity-75 disabled:cursor-not-allowed border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 font-medium focus:bg-white focus:outline-none focus:border-[#0B8457] focus:ring-4 focus:ring-green-500/10 transition-all cursor-pointer"
                      required
                    >
                      <option value="">
                        {isLoadingProvinces
                          ? "Memuat Provinsi..."
                          : !selectedTahunId
                          ? "Pilih Tahun terlebih dahulu"
                          : "-- Pilih Provinsi --"}
                      </option>
                      {provinces && Array.isArray(provinces) && provinces.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name || p.nama || p.provinsi}
                        </option>
                      ))}
                    </select>
                    {isLoadingProvinces && (
                      <div className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400">
                        <Loader2 size={16} className="animate-spin" />
                      </div>
                    )}
                  </div>
                </div>

                {/* FILTER 3: KABUPATEN */}
                <div className="space-y-2">
                  <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-widest flex items-center gap-1">
                    <MapPin size={14} className="text-[#0B8457]" />
                    Kabupaten
                  </label>
                  <div className="relative">
                    <select
                      id="select-kabupaten"
                      value={selectedKabupatenId}
                      onChange={(e) => setSelectedKabupatenId(e.target.value)}
                      disabled={!selectedProvinsiId || isLoadingKabupatens}
                      className="w-full px-4 py-3 bg-gray-50 disabled:bg-gray-100 disabled:opacity-75 disabled:cursor-not-allowed border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 font-medium focus:bg-white focus:outline-none focus:border-[#0B8457] focus:ring-4 focus:ring-green-500/10 transition-all cursor-pointer"
                      required
                    >
                      <option value="">
                        {isLoadingKabupatens
                          ? "Memuat Kabupaten..."
                          : !selectedProvinsiId
                          ? "Pilih Provinsi terlebih dahulu"
                          : "-- Pilih Kabupaten --"}
                      </option>
                      {kabupatens && Array.isArray(kabupatens) && kabupatens.map((k) => (
                        <option key={k.id} value={k.id}>
                          {k.name || k.nama || k.kabupaten}
                        </option>
                      ))}
                    </select>
                    {isLoadingKabupatens && (
                      <div className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400">
                        <Loader2 size={16} className="animate-spin" />
                      </div>
                    )}
                  </div>
                </div>

                {/* FILTER 4: KECAMATAN */}
                <div className="space-y-2">
                  <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-widest flex items-center gap-1">
                    <MapPin size={14} className="text-[#0B8457]" />
                    Kecamatan
                  </label>
                  <div className="relative">
                    <select
                      id="select-kecamatan"
                      value={selectedKecamatanId}
                      onChange={(e) => setSelectedKecamatanId(e.target.value)}
                      disabled={!selectedKabupatenId || isLoadingKecamatans}
                      className="w-full px-4 py-3 bg-gray-50 disabled:bg-gray-100 disabled:opacity-75 disabled:cursor-not-allowed border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 font-medium focus:bg-white focus:outline-none focus:border-[#0B8457] focus:ring-4 focus:ring-green-500/10 transition-all cursor-pointer"
                      required
                    >
                      <option value="">
                        {isLoadingKecamatans
                          ? "Memuat Kecamatan..."
                          : !selectedKabupatenId
                          ? "Pilih Kabupaten terlebih dahulu"
                          : "-- Pilih Kecamatan --"}
                      </option>
                      {kecamatans && Array.isArray(kecamatans) && kecamatans.map((kc) => (
                        <option key={kc.id} value={kc.id}>
                          {kc.name || kc.nama || kc.kecamatan}
                        </option>
                      ))}
                    </select>
                    {isLoadingKecamatans && (
                      <div className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400">
                        <Loader2 size={16} className="animate-spin" />
                      </div>
                    )}
                  </div>
                </div>

                {/* EMAIL INPUT */}
                <div className="space-y-2">
                  <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-widest flex items-center gap-1">
                    <Mail size={14} className="text-[#0B8457]" />
                    Email Penerima
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#0B8457] transition-colors">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      id="input-email"
                      placeholder="Masukkan alamat email Anda"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 font-semibold focus:bg-white focus:outline-none focus:border-[#0B8457] focus:ring-4 focus:ring-green-500/10 transition-all"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium ml-1">
                    Status dan hasil permohonan data akan ditautkan ke email ini di dashboard.
                  </p>
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  id="submit-request"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 text-white bg-[#0B8457] hover:bg-[#0B6E48] text-sm font-bold py-4 rounded-2xl transition-all shadow-md shadow-green-900/10 hover:shadow-green-900/20 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-4"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Mengirim Permintaan...
                    </>
                  ) : (
                    <>
                      Kirim Permintaan Data
                      <CheckCircle2 size={18} />
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
