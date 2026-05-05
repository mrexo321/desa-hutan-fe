import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  Plus,
  Trash2,
  Save,
  Loader2,
  Target,
  ListChecks,
  FileText,
  Tags,
  Hash,
  Ruler,
  ArrowUpDown,
  Component,
  PlusCircle,
} from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "../../components/DashboardLayout";
import { indikatorService } from "../../services/master/indikatorService";

const FormMainIndikator = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  // --- STATE FORM ---
  const [formData, setFormData] = useState({
    kategoriIndikatorId: "",
    tipe: "",
    kode: "",
    nama: "",
    satuan: "",
    arahPenilaian: "positif",
    penilaianIndikator: [],
  });

  // State untuk mencegah form tertimpa ulang oleh React Query
  const [isFormInitialized, setIsFormInitialized] = useState(false);

  // --- LOGIKA KONDISIONAL ---
  // Menyembunyikan bagian skoring jika tipe yang dipilih bukan "skala"
  const isShowScoring = formData.tipe === "skala" || formData.tipe === "Skala";

  // --- FETCH DATA (Select Kategori) ---
  const { data: categoriesResponse } = useQuery({
    queryKey: ["category-indicators-select"],
    queryFn: indikatorService.getAllCategoryIndicator,
    staleTime: 5 * 60 * 1000,
  });
  const categories = categoriesResponse?.data || [];

  // --- FETCH DATA DETAIL (Edit Mode) ---
  const { data: detailResponse, isLoading: isLoadingDetail } = useQuery({
    queryKey: ["main-indicator-detail", id],
    queryFn: () => indikatorService.getMainIndicatorById(id),
    enabled: isEditMode,
  });

  // Hanya set data JIKA isFormInitialized masih false
  useEffect(() => {
    if (isEditMode && detailResponse?.data && !isFormInitialized) {
      const detail = detailResponse.data;

      setFormData({
        kategoriIndikatorId: detail.kategoriIndikatorId || "",
        tipe: detail.tipe ? detail.tipe.toLowerCase() : "",
        kode: detail.kode || "",
        nama: detail.nama || "",
        satuan: detail.satuan || "",
        arahPenilaian: detail.arahPenilaian || "positif",
        penilaianIndikator: detail.penilaianIndikator?.length
          ? detail.penilaianIndikator.map((item) => ({
              label: item.label || "",
              nilai: item.nilai !== undefined ? item.nilai : "",
            }))
          : [],
      });

      // Kunci form agar tidak tertimpa re-render berikutnya
      setIsFormInitialized(true);
    }
  }, [detailResponse, isEditMode, isFormInitialized]);

  // --- MUTATIONS ---
  const mutation = useMutation({
    mutationFn: (payload) => {
      if (isEditMode) {
        return indikatorService.updateMainIndicator(id, payload);
      }
      return indikatorService.createMainIndicator(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["main-indicators"] });
      queryClient.invalidateQueries({
        queryKey: ["main-indicator-detail", id],
      });

      toast.success(
        `Indikator utama berhasil ${isEditMode ? "diperbarui" : "ditambahkan"}!`,
      );
      navigate(-1);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "Terjadi kesalahan saat menyimpan data.",
      );
    },
  });

  // --- HANDLERS DYNAMIC ARRAY ---
  const handleAddNilai = () => {
    setFormData((prev) => ({
      ...prev,
      penilaianIndikator: [
        ...prev.penilaianIndikator,
        { label: "", nilai: "" },
      ],
    }));
  };

  const handleRemoveNilai = (index) => {
    setFormData((prev) => {
      const newArray = [...prev.penilaianIndikator];
      newArray.splice(index, 1);
      return { ...prev, penilaianIndikator: newArray };
    });
  };

  const handleNilaiChange = (index, field, value) => {
    setFormData((prev) => {
      const newArray = [...prev.penilaianIndikator];
      newArray[index][field] = value;
      return { ...prev, penilaianIndikator: newArray };
    });
  };

  // --- SUBMIT HANDLER ---
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData.tipe);

    if (isShowScoring) {
      const hasEmptyNilai = formData.penilaianIndikator.some(
        (item) => !item.label || item.nilai === "",
      );

      if (hasEmptyNilai) {
        toast.warning(
          "Mohon lengkapi semua field pada daftar Nilai Indikator, atau hapus baris yang kosong.",
        );
        return;
      }
    }

    const payload = {
      ...formData,
      tipe: formData.tipe, // Pastikan tipe dikirim ke backend
      penilaianIndikator: isShowScoring
        ? formData.penilaianIndikator.map((item) => ({
            label: item.label,
            nilai: Number(item.nilai),
          }))
        : [],
    };

    console.log("Payload dikirim:", payload); // Bisa dicek di console browser saat klik simpan
    mutation.mutate(payload);
  };

  return (
    <DashboardLayout activeMenu="Indikator">
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#FAFBFC]">
        {/* LOADING OVERLAY */}
        {isLoadingDetail && isEditMode && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#2D7344] mb-4" />
            <span className="text-emerald-800 font-bold animate-pulse">
              Memuat data indikator...
            </span>
          </div>
        )}

        {/* HEADER STICKY */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 z-40 shadow-sm shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-7xl mx-auto">
            <div>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 text-slate-500 hover:text-emerald-700 font-medium text-sm transition-colors w-fit mb-1"
              >
                <ChevronLeft size={16} /> Kembali
              </button>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-700">
                  <Target size={18} strokeWidth={2.5} />
                </div>
                {isEditMode ? "Edit Indikator Utama" : "Tambah Indikator Utama"}
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
                type="submit"
                form="form-indikator"
                disabled={mutation.isPending || isLoadingDetail}
                className="px-6 py-2.5 bg-[#2D7344] text-white font-bold rounded-xl hover:bg-[#1E5230] transition-colors shadow-md shadow-emerald-900/10 flex items-center gap-2 disabled:opacity-70 text-sm active:scale-95"
              >
                {mutation.isPending ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Save size={16} />
                )}
                {isEditMode ? "Simpan Perubahan" : "Simpan Indikator"}
              </button>
            </div>
          </div>
        </div>

        {/* WORKSPACE AREA */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <form
            id="form-indikator"
            onSubmit={handleSubmit}
            className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-6 items-start"
          >
            {/* KOLOM KIRI: INFORMASI DASAR */}
            <div
              className={`bg-white rounded-[24px] p-6 md:p-8 shadow-sm border border-slate-200 transition-all duration-300 ${
                isShowScoring
                  ? "xl:col-span-7"
                  : "xl:col-span-12 max-w-4xl mx-auto w-full"
              }`}
            >
              <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    Informasi Dasar
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Detail dan kriteria pengelompokan indikator.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Baris 1: Kategori & Kode */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                      <Tags
                        size={14}
                        className="text-slate-400 group-focus-within:text-emerald-500 transition-colors"
                      />
                      Kategori Indikator <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.kategoriIndikatorId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          kategoriIndikatorId: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all cursor-pointer appearance-none"
                    >
                      <option value="" disabled>
                        -- Pilih Kategori --
                      </option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.kode} - {cat.nama}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="group">
                    <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                      <Hash
                        size={14}
                        className="text-slate-400 group-focus-within:text-emerald-500 transition-colors"
                      />
                      Kode Indikator <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.kode}
                      onChange={(e) =>
                        setFormData({ ...formData, kode: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-800 uppercase focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:font-sans placeholder:font-normal"
                      placeholder="Contoh: S_KP"
                    />
                  </div>
                </div>

                {/* Baris 2: Nama Indikator (Full Width) */}
                <div className="group">
                  <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                    <Component
                      size={14}
                      className="text-slate-400 group-focus-within:text-emerald-500 transition-colors"
                    />
                    Nama Indikator <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.nama}
                    onChange={(e) =>
                      setFormData({ ...formData, nama: e.target.value })
                    }
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                    placeholder="Contoh: Kepadatan Penduduk"
                  />
                </div>

                {/* Baris 3: Tipe & Satuan */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                      Tipe Input <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.tipe}
                      onChange={(e) =>
                        setFormData({ ...formData, tipe: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all cursor-pointer appearance-none"
                    >
                      <option value="" disabled>
                        -- Pilih Tipe --
                      </option>
                      <option value="input">Input</option>
                      <option value="skala">Skala</option>
                    </select>
                  </div>

                  <div className="group">
                    <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                      <Ruler
                        size={14}
                        className="text-slate-400 group-focus-within:text-emerald-500 transition-colors"
                      />
                      Satuan (UoM)
                    </label>
                    <input
                      type="text"
                      value={formData.satuan}
                      onChange={(e) =>
                        setFormData({ ...formData, satuan: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                      placeholder="Contoh: jiwa/km2, persen"
                    />
                  </div>
                </div>

                {/* Baris 4: Arah Penilaian */}
                <div className="group">
                  <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                    <ArrowUpDown
                      size={14}
                      className="text-slate-400 group-focus-within:text-emerald-500 transition-colors"
                    />
                    Arah Penilaian <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.arahPenilaian}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        arahPenilaian: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all cursor-pointer appearance-none"
                  >
                    <option value="positif">
                      ↑ Positif (Nilai Positif (+))
                    </option>
                    <option value="negatif">
                      ↓ Negatif (Nilai Negatif (-))
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* KOLOM KANAN: NILAI INDIKATOR / DYNAMIC ARRAY */}
            {isShowScoring && (
              <div className="xl:col-span-5 bg-slate-50 border border-slate-200 rounded-[24px] shadow-sm flex flex-col xl:sticky xl:top-6 max-h-[calc(100vh-140px)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-200 bg-white shrink-0 rounded-t-[24px] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                      <ListChecks size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">
                        Skoring & Nilai
                      </h3>
                    </div>
                  </div>
                  <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
                    {formData.penilaianIndikator.length} Kriteria
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-4">
                  {formData.penilaianIndikator.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-12 px-4 bg-white border border-dashed border-slate-300 rounded-2xl">
                      <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-3">
                        <ListChecks size={24} />
                      </div>
                      <p className="text-slate-800 font-bold mb-1">
                        Belum Ada Kriteria
                      </p>
                      <p className="text-slate-500 text-xs mb-4">
                        Tambahkan baris untuk menentukan bobot nilai indikator
                        ini.
                      </p>
                      <button
                        type="button"
                        onClick={handleAddNilai}
                        className="bg-[#2D7344] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#1E5230] shadow-sm transition-all flex items-center gap-2"
                      >
                        <Plus size={16} strokeWidth={3} /> Buat Kriteria Pertama
                      </button>
                    </div>
                  ) : (
                    formData.penilaianIndikator.map((item, index) => (
                      <div
                        key={index}
                        className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative group hover:border-emerald-300 transition-colors"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <span className="w-5 h-5 bg-slate-100 text-slate-600 rounded flex items-center justify-center">
                              {index + 1}
                            </span>
                            Baris Nilai
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveNilai(index)}
                            className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                            title="Hapus Kriteria"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <input
                              type="text"
                              placeholder="Label (Contoh: Tinggi, Sedang, Rendah)"
                              value={item.label}
                              onChange={(e) =>
                                handleNilaiChange(
                                  index,
                                  "label",
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder:font-normal"
                              required
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-300 font-bold shrink-0">
                              →
                            </span>
                            <div className="relative flex-1">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                                Skor:
                              </span>
                              <input
                                type="number"
                                placeholder="0"
                                value={item.nilai}
                                onChange={(e) =>
                                  handleNilaiChange(
                                    index,
                                    "nilai",
                                    e.target.value,
                                  )
                                }
                                className="w-full pl-12 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-emerald-700 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:font-sans placeholder:font-normal placeholder:text-slate-400"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  {formData.penilaianIndikator.length > 0 && (
                    <button
                      type="button"
                      onClick={handleAddNilai}
                      className="w-full py-3 border-2 border-dashed border-emerald-200 text-emerald-600 bg-emerald-50/50 hover:bg-emerald-50 hover:border-emerald-300 rounded-2xl font-bold text-sm flex justify-center items-center gap-2 transition-all mt-2"
                    >
                      <PlusCircle size={16} />
                      Tambah Baris Penilaian
                    </button>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default FormMainIndikator;
