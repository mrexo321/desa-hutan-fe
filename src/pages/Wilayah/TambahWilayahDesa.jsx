import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import DashboardLayout from "../../components/DashboardLayout";
import {
  ArrowLeft,
  MapPin,
  Save,
  Loader2,
  UploadCloud,
  X,
  FileArchive,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { wilayahDesaService } from "../../services/master/wilayahDesaService";

// =========================================================
// SUB-KOMPONEN: Form Field
// =========================================================
const FormField = ({ label, required, hint, children, error }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {hint && <p className="text-xs text-slate-400 mb-2">{hint}</p>}
    {children}
    {error && (
      <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
        <AlertCircle size={12} /> {error}
      </p>
    )}
  </div>
);

// =========================================================
// SUB-KOMPONEN: Zone Upload SHP
// =========================================================
const ShpUploadZone = ({ file, onFileChange, onRemove }) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) onFileChange(dropped);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleFileInput = (e) => {
    if (e.target.files[0]) onFileChange(e.target.files[0]);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (file) {
    return (
      <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-xl">
        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600 shrink-0">
          <FileArchive size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800 truncate">{file.name}</p>
          <p className="text-xs text-slate-500 mt-0.5">{formatSize(file.size)}</p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0"
        >
          <X size={18} />
        </button>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => fileInputRef.current?.click()}
      className={`relative flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
        isDragging
          ? "border-[#2D7344] bg-green-50 scale-[1.01]"
          : "border-slate-200 bg-slate-50/50 hover:border-[#2D7344] hover:bg-green-50/30"
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".zip"
        onChange={handleFileInput}
        className="hidden"
      />
      <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400">
        <UploadCloud size={26} />
      </div>
      <div className="text-center">
        <p className="text-sm font-bold text-slate-700">
          Seret & lepas file di sini
        </p>
        <p className="text-xs text-slate-400 mt-1">
          atau klik untuk browse file
        </p>
        <p className="text-xs font-semibold text-[#2D7344] mt-2 bg-green-50 px-3 py-1 rounded-full inline-block">
          Format: .zip (SHP Shapefile)
        </p>
      </div>
    </div>
  );
};

// =========================================================
// HALAMAN UTAMA: Tambah Wilayah Desa
// =========================================================
const TambahWilayahDesa = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    kodeKemendagri: "",
    nama: "",
    provinsi: "",
    kabupaten: "",
    kecamatan: "",
    luasHa: "",
  });
  const [shpFile, setShpFile] = useState(null);
  const [errors, setErrors] = useState({});

  // ----------------------
  // VALIDASI FORM
  // ----------------------
  const validate = () => {
    const newErrors = {};
    if (!form.kodeKemendagri.trim())
      newErrors.kodeKemendagri = "Kode Kemendagri wajib diisi.";
    else if (!/^\d{2}\.\d{2}\.\d{2}\.\d{4}$/.test(form.kodeKemendagri.trim()))
      newErrors.kodeKemendagri =
        "Format kode salah. Gunakan: 11.01.01.2001";
    if (!form.nama.trim()) newErrors.nama = "Nama desa wajib diisi.";
    if (!form.provinsi.trim()) newErrors.provinsi = "Provinsi wajib diisi.";
    if (!form.kabupaten.trim()) newErrors.kabupaten = "Kabupaten wajib diisi.";
    if (!form.kecamatan.trim()) newErrors.kecamatan = "Kecamatan wajib diisi.";
    if (!form.luasHa) {
      newErrors.luasHa = "Luas area wajib diisi.";
    } else if (isNaN(Number(form.luasHa)) || Number(form.luasHa) <= 0) {
      newErrors.luasHa = "Luas area harus berupa angka positif.";
    }
    return newErrors;
  };

  // ----------------------
  // MUTATION: CREATE
  // ----------------------
  const createMutation = useMutation({
    mutationFn: (payload) => wilayahDesaService.createDesa(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["villages"] });
      toast.success("Data wilayah desa berhasil ditambahkan!");
      navigate("/dashboard/wilayah");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "Terjadi kesalahan saat menyimpan data.",
      );
    },
  });

  // ----------------------
  // HANDLER
  // ----------------------
  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.warning("Mohon perbaiki data yang tidak valid.");
      return;
    }

    const formData = new FormData();
    formData.append("kodeKemendagri", form.kodeKemendagri.trim());
    formData.append("nama", form.nama.trim());
    formData.append("provinsi", form.provinsi.trim());
    formData.append("kabupaten", form.kabupaten.trim());
    formData.append("kecamatan", form.kecamatan.trim());
    formData.append("luasHa", form.luasHa);
    if (shpFile) formData.append("shp", shpFile);

    createMutation.mutate(formData);
  };

  const inputClass = (field) =>
    `w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2D7344]/20 focus:border-[#2D7344] transition-all ${
      errors[field] ? "border-red-400 bg-red-50/30" : "border-slate-200"
    }`;

  return (
    <DashboardLayout activeMenu="Wilayah">
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#FAFBFC]">
        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8 custom-scrollbar">
          {/* BREADCRUMB & HEADER */}
          <div className="mb-8">
            <button
              onClick={() => navigate("/dashboard/wilayah")}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#2D7344] transition-colors mb-4 group"
            >
              <ArrowLeft
                size={16}
                className="group-hover:-translate-x-1 transition-transform"
              />
              Kembali ke Manajemen Wilayah
            </button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center text-[#2D7344] shrink-0">
                <MapPin size={22} strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Tambah Wilayah Desa
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Isi formulir di bawah untuk menambahkan data desa baru.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* ===================== KOLOM KIRI: DATA ADMINISTRATIF ===================== */}
              <div className="lg:col-span-2 space-y-6">
                {/* CARD: Identitas Desa */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-base font-bold text-slate-800">
                      Identitas Desa
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Data administratif utama wilayah desa.
                    </p>
                  </div>
                  <div className="p-6 space-y-5">
                    <FormField
                      label="Kode Kemendagri"
                      required
                      hint="Format: XX.XX.XX.XXXX (contoh: 11.01.01.2001)"
                      error={errors.kodeKemendagri}
                    >
                      <input
                        type="text"
                        value={form.kodeKemendagri}
                        onChange={handleChange("kodeKemendagri")}
                        placeholder="11.01.01.2001"
                        className={inputClass("kodeKemendagri")}
                      />
                    </FormField>

                    <FormField
                      label="Nama Desa"
                      required
                      error={errors.nama}
                    >
                      <input
                        type="text"
                        value={form.nama}
                        onChange={handleChange("nama")}
                        placeholder="Masukkan nama desa..."
                        className={inputClass("nama")}
                      />
                    </FormField>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <FormField
                        label="Kecamatan"
                        required
                        error={errors.kecamatan}
                      >
                        <input
                          type="text"
                          value={form.kecamatan}
                          onChange={handleChange("kecamatan")}
                          placeholder="Nama kecamatan..."
                          className={inputClass("kecamatan")}
                        />
                      </FormField>
                      <FormField
                        label="Kabupaten / Kota"
                        required
                        error={errors.kabupaten}
                      >
                        <input
                          type="text"
                          value={form.kabupaten}
                          onChange={handleChange("kabupaten")}
                          placeholder="Nama kabupaten/kota..."
                          className={inputClass("kabupaten")}
                        />
                      </FormField>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <FormField
                        label="Provinsi"
                        required
                        error={errors.provinsi}
                      >
                        <input
                          type="text"
                          value={form.provinsi}
                          onChange={handleChange("provinsi")}
                          placeholder="Nama provinsi..."
                          className={inputClass("provinsi")}
                        />
                      </FormField>
                      <FormField
                        label="Luas Area (Ha)"
                        required
                        error={errors.luasHa}
                      >
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={form.luasHa}
                          onChange={handleChange("luasHa")}
                          placeholder="0.00"
                          className={inputClass("luasHa")}
                        />
                      </FormField>
                    </div>
                  </div>
                </div>
              </div>

              {/* ===================== KOLOM KANAN: UPLOAD SHP & AKSI ===================== */}
              <div className="lg:col-span-1 space-y-6">
                {/* CARD: Upload Data Spasial */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-base font-bold text-slate-800">
                      Data Spasial (SHP)
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Opsional — upload file ZIP yang berisi shapefile.
                    </p>
                  </div>
                  <div className="p-6">
                    <ShpUploadZone
                      file={shpFile}
                      onFileChange={setShpFile}
                      onRemove={() => setShpFile(null)}
                    />
                    {shpFile && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-green-600 font-semibold">
                        <CheckCircle2 size={14} />
                        File siap diupload bersama data.
                      </div>
                    )}
                    {!shpFile && (
                      <p className="mt-3 text-xs text-slate-400 text-center">
                        Jika tidak diupload, data desa akan disimpan tanpa geometri.
                      </p>
                    )}
                  </div>
                </div>

                {/* CARD: Aksi */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-3">
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 bg-[#2D7344] hover:bg-[#235c36] text-white px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Simpan Data Desa
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/dashboard/wilayah")}
                    disabled={createMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 text-slate-600 bg-slate-100 hover:bg-slate-200 px-5 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-70"
                  >
                    Batal
                  </button>
                </div>

                {/* INFO BOX */}
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <p className="text-xs font-bold text-amber-700 mb-1">
                    Catatan
                  </p>
                  <ul className="text-xs text-amber-600 space-y-1 list-disc list-inside leading-relaxed">
                    <li>
                      Kode Kemendagri harus unik dan mengikuti format standar.
                    </li>
                    <li>
                      File SHP harus dikemas dalam format ZIP.
                    </li>
                    <li>
                      Data spasial dapat ditambahkan kemudian melalui fitur Edit.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default TambahWilayahDesa;
