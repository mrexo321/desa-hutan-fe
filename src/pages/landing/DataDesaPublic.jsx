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
  FileSpreadsheet,
  User,
  Phone,
  CheckSquare,
  Square
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import HomeLayout from "../../components/HomeLayout";
import { masterWilayahService } from "../../services/master/masterWilayahService";
import { indikatorService } from "../../services/master/indikatorService";
import { performaDesaService } from "../../services/master/performaDesaService";
import SearchableSelect from "../../components/SearchableSelect";
import AltchaCaptcha from "../../components/AltchaCaptcha";

const WILAYAH_LEVELS = [
  { value: "nasional", label: "Nasional" },
  { value: "provinsi", label: "Provinsi" },
  { value: "kabupaten", label: "Kabupaten" },
  { value: "kecamatan", label: "Kecamatan" },
];

export default function DataDesaPublic() {
  const [nama, setNama] = useState("");
  const [noHp, setNoHp] = useState("");
  const [email, setEmail] = useState("");
  const [selectedTahunId, setSelectedTahunId] = useState("");
  const [selectedWilayahLevel, setSelectedWilayahLevel] = useState("");
  const [selectedProvinsiId, setSelectedProvinsiId] = useState("");
  const [selectedKabupatenId, setSelectedKabupatenId] = useState("");
  const [selectedKecamatanId, setSelectedKecamatanId] = useState("");
  const [selectedJenisData, setSelectedJenisData] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Captcha State & Ref
  const [altchaPayload, setAltchaPayload] = useState("");
  const altchaRef = React.useRef(null);

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

  // Get numerical tahun value for label query
  const selectedTahunObj = years.find((y) => String(y.id) === String(selectedTahunId));
  const selectedTahunVal = selectedTahunObj?.tahun
    ? Number(selectedTahunObj.tahun)
    : (selectedTahunId && !isNaN(Number(selectedTahunId)) ? Number(selectedTahunId) : null);

  // ── Fetch Labels (Indikator & Dimensi) via Endpoint #2 ──
  const { data: labelOptionsRes, isLoading: isLoadingLabels } = useQuery({
    queryKey: ["request-excel-labels", selectedTahunVal],
    queryFn: async () => {
      if (!selectedTahunVal) return [];
      try {
        const res = await performaDesaService.getRequestExcelLabels(selectedTahunVal);
        return res?.data?.data || res?.data || res || [];
      } catch (err) {
        console.error("Gagal mengambil label indikator/dimensi:", err);
        return [];
      }
    },
    enabled: !!selectedTahunVal,
    retry: 1,
  });
  const labelOptions = Array.isArray(labelOptionsRes)
    ? labelOptionsRes
    : (Array.isArray(labelOptionsRes?.data) ? labelOptionsRes.data : []);

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

  // Reset downstream & jenisData when tahun changes
  useEffect(() => {
    setSelectedJenisData([]);
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

  // Handle Checkbox Toggles
  const handleToggleJenisData = (item) => {
    const exists = selectedJenisData.some(
      (j) => String(j.id) === String(item.id) && j.tipe === item.tipe
    );
    if (exists) {
      setSelectedJenisData(
        selectedJenisData.filter(
          (j) => !(String(j.id) === String(item.id) && j.tipe === item.tipe)
        )
      );
    } else {
      setSelectedJenisData([
        ...selectedJenisData,
        { id: item.id, tipe: item.tipe },
      ]);
    }
  };

  const isJenisDataChecked = (item) => {
    return selectedJenisData.some(
      (j) => String(j.id) === String(item.id) && j.tipe === item.tipe
    );
  };

  const handleSelectAllJenisData = () => {
    if (selectedJenisData.length === labelOptions.length) {
      setSelectedJenisData([]);
    } else {
      setSelectedJenisData(
        labelOptions.map((opt) => ({ id: opt.id, tipe: opt.tipe }))
      );
    }
  };

  // Submit request (Endpoint #3)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate based on basic requirements
    if (!selectedTahunId || !selectedWilayahLevel) {
      toast.warning("Harap pilih Tahun Data dan Tingkat Administrasi!");
      return;
    }

    const missingProvinsi = showProvinsi && !selectedProvinsiId;
    const missingKabupaten = showKabupaten && !selectedKabupatenId;
    const missingKecamatan = showKecamatan && !selectedKecamatanId;

    if (missingProvinsi || missingKabupaten || missingKecamatan) {
      toast.warning("Harap lengkapi seluruh pilihan wilayah!");
      return;
    }

    if (!selectedJenisData || selectedJenisData.length === 0) {
      toast.warning("Harap pilih minimal 1 Indikator / Dimensi Data (Jenis Data)!");
      return;
    }

    if (!nama.trim()) {
      toast.warning("Harap isi Nama Pemohon!");
      return;
    }

    if (!noHp.trim()) {
      toast.warning("Harap isi No. Handphone / WhatsApp!");
      return;
    }

    if (!email.trim()) {
      toast.warning("Harap isi Email Penerima Data!");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error("Format email tidak valid!");
      return;
    }

    if (!altchaPayload) {
      toast.warning("Harap selesaikan verifikasi captcha terlebih dahulu!");
      return;
    }

    setIsSubmitting(true);

    const selectedProvObj = showProvinsi && selectedProvinsiId
      ? provinces.find((p) => String(p.id) === String(selectedProvinsiId))
      : null;
    const selectedKabObj = showKabupaten && selectedKabupatenId
      ? kabupatens.find((k) => String(k.id) === String(selectedKabupatenId))
      : null;
    const selectedKecObj = showKecamatan && selectedKecamatanId
      ? kecamatans.find((k) => String(k.id) === String(selectedKecamatanId))
      : null;

    const payload = {
      tahun: Number(selectedTahunVal),
      tingkatAdministrasi: selectedWilayahLevel,
      provinsi: selectedProvObj
        ? { id: selectedProvObj.id, nama: selectedProvObj.nama || selectedProvObj.name }
        : null,
      kabupaten: selectedKabObj
        ? { id: selectedKabObj.id, nama: selectedKabObj.nama || selectedKabObj.name }
        : null,
      kecamatan: selectedKecObj
        ? { id: selectedKecObj.id, nama: selectedKecObj.nama || selectedKecObj.name }
        : null,
      jenisData: selectedJenisData,
      email: email.trim(),
      nama: nama.trim(),
      noHp: noHp.trim(),
      // instansi: "nama instansi",
      // tujuan: "tujuan",
      altcha: altchaPayload,
    };

    try {
      const response = await performaDesaService.createPublicRequestExcel(payload);

      if (response?.success === false) {
        toast.error(response?.message || "Gagal mengirim permohonan data.");
        setAltchaPayload("");
        altchaRef.current?.reset();
        return;
      }

      toast.success(
        response?.message || "Berhasil mengirim permintaan data, mohon tunggu persetujuan Admin",
        {
          description: "Anda dapat memantau status permohonan ini di dashboard dengan email tersebut.",
        }
      );

      // Clear fields
      setSelectedTahunId("");
      setSelectedWilayahLevel("");
      setSelectedProvinsiId("");
      setSelectedKabupatenId("");
      setSelectedKecamatanId("");
      setSelectedJenisData([]);
      setNama("");
      setNoHp("");
      setEmail("");
      setAltchaPayload("");
      altchaRef.current?.reset();
    } catch (err) {
      console.error("Gagal mengirim permintaan:", err);
      toast.error(
        err.response?.data?.message || err?.message || "Gagal mengirim permohonan data."
      );
      setAltchaPayload("");
      altchaRef.current?.reset();
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
              Permintaan Data Desa Hutan
            </h1>
            <p className="text-sm sm:text-base text-emerald-100/80 max-w-2xl mx-auto leading-relaxed font-medium">
              Silahkan diisi formulir berikut untuk permintaan data desa hutan
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
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Mohon diisi sesuai dengan kebutuhan anda</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">

                {/* 2-COLUMN GRID: TAHUN & TINGKAT WILAYAH */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* FILTER 1: TAHUN */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                      <Calendar size={14} className="text-emerald-600" />
                      Tahun Data <span className="text-rose-500">*</span>
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
                      Tingkat Administrasi <span className="text-rose-500">*</span>
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
                        Pilih Provinsi <span className="text-rose-500">*</span>
                      </label>
                      <SearchableSelect
                        id="select-provinsi"
                        value={selectedProvinsiId}
                        onChange={(val) => setSelectedProvinsiId(val)}
                        options={provinces}
                        placeholder="-- Pilih Provinsi --"
                        searchPlaceholder="Cari nama provinsi..."
                        isLoading={isLoadingProvinces}
                        noOptionsText="Provinsi tidak ditemukan."
                      />
                    </div>
                  )}

                  {/* FILTER 4: KABUPATEN */}
                  {showKabupaten && (
                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                        <MapPin size={14} className="text-emerald-600" />
                        Pilih Kabupaten / Kota <span className="text-rose-500">*</span>
                      </label>
                      <SearchableSelect
                        id="select-kabupaten"
                        value={selectedKabupatenId}
                        onChange={(val) => setSelectedKabupatenId(val)}
                        options={kabupatens}
                        placeholder="-- Pilih Kabupaten --"
                        searchPlaceholder="Cari nama kabupaten..."
                        disabled={!selectedProvinsiId}
                        disabledText="Pilih Provinsi Terlebih Dahulu"
                        isLoading={isLoadingKabupatens}
                        noOptionsText="Kabupaten tidak ditemukan."
                      />
                    </div>
                  )}

                  {/* FILTER 5: KECAMATAN */}
                  {showKecamatan && (
                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                        <MapPin size={14} className="text-emerald-600" />
                        Pilih Kecamatan <span className="text-rose-500">*</span>
                      </label>
                      <SearchableSelect
                        id="select-kecamatan"
                        value={selectedKecamatanId}
                        onChange={(val) => setSelectedKecamatanId(val)}
                        options={kecamatans}
                        placeholder="-- Pilih Kecamatan --"
                        searchPlaceholder="Cari nama kecamatan..."
                        disabled={!selectedKabupatenId}
                        disabledText="Pilih Kabupaten Terlebih Dahulu"
                        isLoading={isLoadingKecamatans}
                        noOptionsText="Kecamatan tidak ditemukan."
                      />
                    </div>
                  )}
                </div>

                {/* CHECKBOXES: JENIS DATA (INDIKATOR / DIMENSI) */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                      <Layers size={14} className="text-emerald-600" />
                      Jenis Data (Indikator / Dimensi) <span className="text-rose-500">*</span>
                    </label>
                    {labelOptions.length > 0 && (
                      <button
                        type="button"
                        onClick={handleSelectAllJenisData}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer transition-colors"
                      >
                        {selectedJenisData.length === labelOptions.length ? "Batal Pilih Semua" : "Pilih Semua"}
                      </button>
                    )}
                  </div>

                  {!selectedTahunId ? (
                    <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200/60 rounded-xl p-3.5 flex items-center gap-2 font-medium">
                      <Info size={16} className="text-amber-600 shrink-0" />
                      <span>Pilih <strong>Tahun Data</strong> terlebih dahulu untuk memuat pilihan indikator dan dimensi.</span>
                    </div>
                  ) : isLoadingLabels ? (
                    <div className="flex items-center gap-2 p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-xs font-semibold">
                      <Loader2 size={16} className="animate-spin text-emerald-600" />
                      Memuat daftar Indikator / Dimensi...
                    </div>
                  ) : labelOptions.length === 0 ? (
                    <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-4 text-center font-medium">
                      Tidak ada data indikator atau dimensi tersedia untuk tahun yang dipilih.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                      {labelOptions.map((item) => {
                        const checked = isJenisDataChecked(item);
                        return (
                          <label
                            key={`${item.tipe}-${item.id}`}
                            onClick={(e) => {
                              e.preventDefault();
                              handleToggleJenisData(item);
                            }}
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                              checked
                                ? "bg-emerald-50/70 border-emerald-500 text-slate-800 shadow-sm"
                                : "bg-slate-50/80 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {}}
                              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer pointer-events-none"
                            />
                            <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                              <span className="text-xs font-bold truncate text-slate-800">{item.nama}</span>
                              <span
                                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${
                                  item.tipe === "indexDesa"
                                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                    : "bg-blue-100 text-blue-700 border border-blue-200"
                                }`}
                              >
                                {item.tipe === "indexDesa" ? "Index Desa" : "Indikator Desa"}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                <hr className="border-slate-100" />

                {/* PEMOHON DATA SECTION */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <User size={14} className="text-emerald-600" />
                    Informasi Pemohon Data
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* NAMA PEMOHON */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                        Nama Pemohon <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                          <User size={16} />
                        </div>
                        <input
                          type="text"
                          id="input-nama"
                          placeholder="Masukkan nama lengkap"
                          value={nama}
                          onChange={(e) => setNama(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 font-semibold focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                          required
                        />
                      </div>
                    </div>

                    {/* NO HP */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                        No. Handphone / WA <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                          <Phone size={16} />
                        </div>
                        <input
                          type="tel"
                          id="input-nohp"
                          placeholder="081234567890"
                          value={noHp}
                          onChange={(e) => setNoHp(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 font-semibold focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* EMAIL INPUT */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                      Email Penerima Data <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                        <Mail size={16} />
                      </div>
                      <input
                        type="email"
                        id="input-email"
                        placeholder="contoh: nama@instansi.go.id"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 font-semibold focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                        required
                      />
                    </div>
                    <div className="flex gap-1.5 items-start text-[11px] text-slate-400 font-semibold pl-1.5 mt-1 leading-normal">
                      <Info size={12} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span>Permintaan data akan dikirimkan melalui email setelah proses persetujuan Admin</span>
                    </div>
                  </div>
                </div>

                {/* ALTCHA CAPTCHA */}
                <AltchaCaptcha
                  ref={altchaRef}
                  onVerify={(payload) => setAltchaPayload(payload)}
                  onExpire={() => setAltchaPayload("")}
                />

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  id="submit-request"
                  disabled={isSubmitting || !altchaPayload}
                  className={`w-full flex items-center justify-center gap-2 text-white text-sm font-extrabold py-4 rounded-2xl transition-all shadow-md ${
                    isSubmitting || !altchaPayload
                      ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                      : "bg-gradient-to-r from-emerald-600 to-[#10B981] hover:from-emerald-700 hover:to-emerald-600 shadow-emerald-900/10 hover:shadow-emerald-900/20 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                  } mt-6`}
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

