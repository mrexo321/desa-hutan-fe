import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { indikatorService } from "../../services/master/indikatorService";
import {
  ChevronLeft,
  Calculator,
  Save,
  AlertCircle,
  Database,
  X,
  Search,
  BookOpen,
  MousePointerClick,
  FunctionSquare,
  Calendar,
  CheckCircle2,
  PlusCircle,
  Eraser,
} from "lucide-react";

const FormFormulaIndicator = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const tahunIdParam = searchParams.get("tahunId");
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  const textareaRef = useRef(null);

  const [formData, setFormData] = useState({
    nama: "",
    formula: "",
    tahunIndikatorPerhitunganId: tahunIdParam || "",
  });

  const [selectedIndicators, setSelectedIndicators] = useState([]);
  const [searchIndikator, setSearchIndikator] = useState("");

  // Fetch Data Formula (Edit Mode)
  const { data: detailDataRes, isLoading: isFetchingDetail } = useQuery({
    queryKey: ["detailFormula", id],
    queryFn: () => indikatorService.getDetailFormula(id),
    enabled: isEditMode,
  });

  useEffect(() => {
    if (isEditMode && detailDataRes) {
      const detail = detailDataRes?.data || detailDataRes;

      setFormData({
        nama: detail.nama || "",
        formula: detail.formula || "",
        tahunIndikatorPerhitunganId:
          detail.tahunIndikatorPerhitunganId || detail.tahunIndikator?.id || "",
      });

      if (detail.indikatorUtama && Array.isArray(detail.indikatorUtama)) {
        setSelectedIndicators(detail.indikatorUtama);
      }
    }
  }, [isEditMode, detailDataRes]);

  // Fetch Daftar Indikator Utama
  const { data: mainIndicatorsRes } = useQuery({
    queryKey: ["mainIndicators"],
    queryFn: () => indikatorService.getMainIndicator(),
  });

  const mainIndicatorsList = mainIndicatorsRes?.data || mainIndicatorsRes || [];
  const filteredIndicators = mainIndicatorsList.filter(
    (ind) =>
      ind.nama?.toLowerCase().includes(searchIndikator.toLowerCase()) ||
      ind.kode?.toLowerCase().includes(searchIndikator.toLowerCase()),
  );

  // Fetch Daftar Tahun dari API
  const { data: tahunRes, isLoading: isLoadingTahun } = useQuery({
    queryKey: ["tahunList"],
    queryFn: () => indikatorService.getAllYearIndicator(),
  });

  // Sesuaikan dengan struktur respons dari axios (bisa di dalam data.data atau langsung data)
  const tahunList = tahunRes?.data || tahunRes || [];

  // 1. SINKRONISASI OTOMATIS TEXT EDITOR <-> PAYLOAD
  useEffect(() => {
    // Jangan jalankan jika master list belum ready
    if (!mainIndicatorsList || mainIndicatorsList.length === 0) return;

    const currentFormula = formData.formula || "";

    // Ekstrak semua teks yang berada di dalam kurung kurawal ganda, misal: {{KODE1}}
    const matches = currentFormula.match(/\{\{([^}]+)\}\}/g) || [];
    const usedKodes = matches.map((m) => m.replace(/[{}]/g, ""));

    // Gabungkan dengan selectedIndicators lama untuk jaga-jaga ada indikator lama yang tidak ada di list master
    const availableIndicators = [...mainIndicatorsList, ...selectedIndicators];
    const uniqueIndicatorsMap = new Map();
    availableIndicators.forEach((ind) => {
      if (ind.kode) uniqueIndicatorsMap.set(ind.kode, ind);
    });

    const activeIndicators = [];
    const addedIds = new Set();

    // Cocokkan KODE yang ada di dalam text editor dengan data objek indikatornya
    usedKodes.forEach((kode) => {
      const ind = uniqueIndicatorsMap.get(kode);
      if (ind && !addedIds.has(ind.id)) {
        activeIndicators.push(ind);
        addedIds.add(ind.id);
      }
    });

    // Otomatis update state indikator terpilih
    setSelectedIndicators(activeIndicators);
  }, [formData.formula, mainIndicatorsList]); // Trigger setiap kali teks formula berubah

  // Mutations
  const mutationConfig = {
    onSuccess: () => {
      queryClient.invalidateQueries(["allFormulaIndicators"]);
      navigate("/dashboard/indikator-perhitungan");
    },
    onError: (error) => {
      console.error("Gagal menyimpan:", error.response?.data);
      alert(
        error.response?.data?.message ||
        "Terjadi kesalahan saat menyimpan data.",
      );
    },
  };

  const createMutation = useMutation({
    mutationFn: (payload) => indikatorService.createFormulaIndicator(payload),
    ...mutationConfig,
  });

  const updateMutation = useMutation({
    mutationFn: (payload) =>
      indikatorService.updateFormulaIndicator(id, payload),
    ...mutationConfig,
  });

  // --- FUNGSI INTERAKTIF ---
  const insertAtCursor = (textToInsert) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const currentFormula = formData.formula;

    const newFormula =
      currentFormula.substring(0, startPos) +
      textToInsert +
      currentFormula.substring(endPos);

    setFormData((prev) => ({ ...prev, formula: newFormula }));

    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd =
        startPos + textToInsert.length;
      textarea.focus();
    }, 0);
  };

  // 2. Cukup insert ke text editor, payload otomatis mengikuti berkat useEffect di atas
  /**
   * Membungkus teks yang diseleksi dengan fungsi matematika.
   * Jika ada teks yang diseleksi, hasilnya: fnName(selectedText, ...suffix)
   * Jika tidak ada seleksi, hasilnya: fnName(|) — cursor diletakkan di dalam kurung.
   */
  const wrapWithFunction = (fnPrefix, fnSuffix = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const currentFormula = formData.formula;
    const selectedText = currentFormula.substring(startPos, endPos);

    let insertion;
    let newCursorPos;

    if (selectedText) {
      // Ada teks yang diseleksi → bungkus
      insertion = `${fnPrefix}${selectedText}${fnSuffix})`;
      newCursorPos = startPos + insertion.length;
    } else {
      // Tidak ada seleksi → insert placeholder, cursor di dalam kurung
      insertion = `${fnPrefix}${fnSuffix})`;
      newCursorPos = startPos + fnPrefix.length; // cursor tepat setelah "("
    }

    const newFormula =
      currentFormula.substring(0, startPos) +
      insertion +
      currentFormula.substring(endPos);

    setFormData((prev) => ({ ...prev, formula: newFormula }));

    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = newCursorPos;
      textarea.focus();
    }, 0);
  };

  // 2. FIX: Cukup insert ke text editor, payload otomatis mengikuti berkat useEffect di atas
  const handleIndicatorClick = (indicator) => {
    const formatKode = `{{${indicator.kode}}}`;
    insertAtCursor(formatKode);
  };

  // 3. Hapus teks dari editor, bukan sekedar hapus dari array panel kanan
  const removeIndicator = (indicator) => {
    if (!indicator.kode) return;
    const formatKode = `{{${indicator.kode}}}`;

    // Ini akan menghapus semua instance {{KODE}} tersebut dari teks formula
    const newFormula = formData.formula.split(formatKode).join("");
    setFormData((prev) => ({ ...prev, formula: newFormula }));
  };

  const clearFormula = () => {
    if (window.confirm("Hapus seluruh isi formula?")) {
      setFormData((prev) => ({ ...prev, formula: "" }));
      textareaRef.current?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.nama ||
      !formData.formula ||
      !formData.tahunIndikatorPerhitunganId
    ) {
      alert("Nama, Tahun, dan Formula wajib diisi!");
      return;
    }

    if (selectedIndicators.length === 0) {
      alert(
        "Minimal pilih 1 Indikator Utama dari Pustaka (tambahkan dengan format {{KODE}})",
      );
      return;
    }

    // PAYLOAD BERSIH SESUAI SKEMA BACKEND
    const payload = {
      nama: formData.nama,
      formula: formData.formula,
      tahunIndikatorPerhitunganId: formData.tahunIndikatorPerhitunganId,
      indikatorUtamaId: selectedIndicators.map((ind) => ind.id),
    };

    if (isEditMode) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const isLoading = createMutation.isLoading || updateMutation.isLoading;

  // --- DAFTAR OPERATOR MATEMATIKA DITAMBAHKAN AKAR KUADRAT DLL ---
  const mathOperators = [
    { label: "(", action: " ( " },
    { label: ")", action: " ) " },
    { label: "+", action: " + " },
    { label: "-", action: " - " },
    { label: "×", action: " * " },
    { label: "÷", action: " / " },
    { label: "√", action: " sqrt(" },
    { label: "^", action: " ^ " }, // Ditambahkan: Pangkat
    { label: "%", action: " % " }, // Ditambahkan: Persentase/Modulo
    { label: ".", action: "." }, // Ditambahkan: Titik Desimal
  ];

  // Operator matematika lanjutan (pangkat & akar)
  const advancedOperators = [
    {
      label: "x²",
      title: "Kuadrat — tambahkan ^2 setelah variabel",
      onClick: () => insertAtCursor("^2"),
    },
    {
      label: "xⁿ",
      title: "Pangkat N — tambahkan ^ lalu ketik angkanya",
      onClick: () => insertAtCursor("^"),
    },
    {
      label: "√x",
      title: "Akar Kuadrat — bungkus ekspresi terpilih dengan sqrt(...)",
      onClick: () => wrapWithFunction("sqrt("),
    },
    {
      label: "ⁿ√x",
      title: "Akar N — bungkus ekspresi terpilih dengan nthRoot(..., n)",
      onClick: () => wrapWithFunction("nthRoot(", ", n"),
    },
  ];

  return (
    <DashboardLayout activeMenu="Indikator Perhitungan">
      <main className="flex-1 flex flex-col h-full bg-[#FAFBFC] overflow-hidden relative">
        {isFetchingDetail && isEditMode && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <span className="text-emerald-700 font-bold animate-pulse">
              Memuat data formula...
            </span>
          </div>
        )}

        {/* HEADER AREA */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 z-40 shadow-sm shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 text-slate-500 hover:text-emerald-700 font-medium text-sm transition-colors w-fit mb-1"
              >
                <ChevronLeft size={16} /> Kembali
              </button>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-700">
                  <FunctionSquare size={18} strokeWidth={2.5} />
                </div>
                {isEditMode ? "Edit Formula Indikator" : "Tambah Formula Baru"}
              </h1>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors text-sm shadow-sm"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-6 py-2.5 bg-[#2D7344] text-white font-bold rounded-xl hover:bg-[#1E5230] transition-colors shadow-md shadow-emerald-900/10 flex items-center gap-2 disabled:opacity-70 text-sm"
              >
                {isLoading ? (
                  <AlertCircle className="animate-spin" size={16} />
                ) : (
                  <Save size={16} />
                )}
                {isEditMode ? "Simpan Perubahan" : "Simpan Formula"}
              </button>
            </div>
          </div>
        </div>

        {/* WORKSPACE AREA */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col lg:flex-row gap-6 p-6">
            {/* KIRI: Editor Formula */}
            <div className="lg:w-7/12 xl:w-8/12 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2 pb-10">
              <div className="bg-white p-6 md:p-8 rounded-[24px] border border-slate-200 shadow-sm">
                <div className="space-y-8">
                  {/* Grid Input Nama & Tahun */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-2">
                        Nama Formula <span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        type="text"
                        value={formData.nama}
                        onChange={(e) =>
                          setFormData({ ...formData, nama: e.target.value })
                        }
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all text-slate-800 font-bold text-base"
                        placeholder="Contoh: Formula Pertumbuhan Penduduk"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-2">
                        Tahun Referensi <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Calendar
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <select
                          required
                          value={formData.tahunIndikatorPerhitunganId}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              tahunIndikatorPerhitunganId: e.target.value,
                            })
                          }
                          disabled={isLoadingTahun || !!tahunIdParam} // Disable saat loading atau di-lock
                          className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all text-slate-800 font-bold text-base appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-100"
                        >
                          <option value="" disabled>
                            {isLoadingTahun
                              ? "Memuat tahun..."
                              : "-- Pilih Tahun --"}
                          </option>
                          {tahunList.map((thn) => (
                            <option key={thn.id} value={thn.id}>
                              {thn.tahun}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* MODERN EDITOR LOGIKA */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-bold text-slate-800">
                        Editor Logika Perhitungan{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-emerald-100 shadow-sm">
                        <MousePointerClick size={14} /> Pilih indikator di panel
                        kanan
                      </span>
                    </div>

                    {/* Wrapper Editor (Glow Effect) */}
                    <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-200 focus-within:ring-4 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all duration-300">
                      {/* Math Pad Toolbar */}
                      <div className="bg-slate-900 px-4 pt-3 pb-2 border-b border-slate-950 flex flex-col gap-2">
                        {/* Baris 1: Operator Dasar + Clear */}
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-1 shrink-0">
                            Operator
                          </span>
                          {mathOperators.map((op, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => insertAtCursor(op.action)}
                              className="w-10 h-10 flex items-center justify-center bg-slate-800 text-slate-200 hover:text-white hover:bg-emerald-600 font-mono font-bold text-lg rounded-xl border-b-[3px] border-slate-950 hover:border-emerald-800 active:border-b-0 active:translate-y-[3px] transition-all"
                            >
                              {op.label}
                            </button>
                          ))}

                          {/* Clear Button */}
                          <button
                            type="button"
                            onClick={clearFormula}
                            className="flex items-center gap-1.5 px-3 h-10 bg-slate-800 hover:bg-red-500 text-slate-300 hover:text-white font-bold text-xs rounded-xl border-b-[3px] border-slate-950 hover:border-red-700 active:border-b-0 active:translate-y-[3px] transition-all ml-auto"
                            title="Bersihkan Editor"
                          >
                            <Eraser size={14} /> Clear
                          </button>
                        </div>

                        {/* Baris 2: Operator Pangkat & Akar */}
                        <div className="flex flex-wrap items-center gap-2.5 pb-1">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-1 shrink-0">
                            Pangkat &amp; Akar
                          </span>
                          {advancedOperators.map((op, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={op.onClick}
                              title={op.title}
                              className="h-10 px-3.5 flex items-center justify-center bg-slate-800 text-amber-300 hover:text-white hover:bg-amber-600 font-bold text-base rounded-xl border-b-[3px] border-slate-950 hover:border-amber-800 active:border-b-0 active:translate-y-[3px] transition-all font-mono"
                            >
                              {op.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Area Teks Terminal-Style */}
                      <textarea
                        ref={textareaRef}
                        required
                        value={formData.formula}
                        onChange={(e) =>
                          setFormData({ ...formData, formula: e.target.value })
                        }
                        className="w-full px-6 py-6 bg-[#0B1120] text-emerald-400 focus:outline-none resize-none transition-all font-mono text-xl leading-loose custom-scrollbar-dark selection:bg-emerald-900 selection:text-emerald-100 placeholder-slate-700"
                        rows="8"
                        placeholder="Ketik logika rumus matematika Anda di sini..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* KANAN: Sticky Container */}
            <div className="lg:w-5/12 xl:w-4/12 flex flex-col gap-6 h-[calc(100vh-140px)]">
              {/* PANEL 1: PUSTAKA INDIKATOR */}
              <div className="flex-[3] min-h-0 bg-white rounded-[24px] border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-emerald-50/50 shrink-0">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
                    <BookOpen className="text-emerald-600" size={20} />
                    Pustaka Indikator Utama
                  </h3>
                  <div className="relative">
                    <Search
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder="Cari berdasarkan nama atau kode..."
                      value={searchIndikator}
                      onChange={(e) => setSearchIndikator(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-emerald-100 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 custom-scrollbar">
                  {filteredIndicators.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {filteredIndicators.map((ind) => (
                        <div
                          key={ind.id}
                          onClick={() => handleIndicatorClick(ind)}
                          className="p-3 bg-white border border-slate-200 rounded-[16px] hover:border-emerald-500 hover:shadow-md hover:-translate-y-0.5 cursor-pointer transition-all duration-200 group flex flex-col justify-between h-28 relative overflow-hidden"
                        >
                          <div className="flex justify-between items-start z-10">
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-mono group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors border border-slate-200 group-hover:border-emerald-200">
                              {ind.kode}
                            </span>
                            <div className="w-6 h-6 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <PlusCircle size={16} />
                            </div>
                          </div>
                          <p className="text-xs font-bold text-slate-800 leading-snug line-clamp-3 z-10">
                            {ind.nama}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                        <Search size={24} className="text-slate-300" />
                      </div>
                      <p className="text-sm font-medium">
                        Indikator tidak ditemukan.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* PANEL 2: INDIKATOR TERPILIH */}
              <div className="flex-[2] min-h-0 bg-white rounded-[24px] border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-blue-50/30 shrink-0 flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="text-blue-600" size={20} />
                    Indikator Terpilih
                  </h3>
                  <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-lg">
                    {selectedIndicators.length} Item
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30 custom-scrollbar">
                  {selectedIndicators.length > 0 ? (
                    selectedIndicators.map((ind) => (
                      <div
                        key={ind.id}
                        className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm group hover:border-blue-200 transition-colors"
                      >
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 font-mono block mb-1">
                            {ind.kode}
                          </span>
                          <span className="text-sm font-bold text-slate-800 leading-tight block">
                            {ind.nama}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeIndicator(ind)}
                          className="shrink-0 text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          title="Hapus dari daftar"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60 text-center px-4">
                      <Database size={32} className="mb-3 text-slate-300" />
                      <p className="text-sm font-bold text-slate-500">
                        Belum ada indikator.
                      </p>
                      <p className="text-xs mt-1">
                        Pilih dari pustaka di atas.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default FormFormulaIndicator;
