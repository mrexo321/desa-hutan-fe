import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  Info,
} from "lucide-react";
import { wilayahDesaService } from "../../services/master/wilayahDesaService";
import { Loading } from "../../components/Loading";

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
const ShpUploadZone = ({ file, onFileChange, onRemove, existingFile }) => {
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
          <p className="text-xs text-slate-500 mt-0.5">
            {formatSize(file.size)} — <span className="text-green-600 font-semibold">File baru dipilih</span>
          </p>
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
    <div className="space-y-3">
      {/* Tampilkan info file existing jika ada */}
      {existingFile && (
        <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
          <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-blue-700">File Spasial Saat Ini</p>
            <p className="text-xs text-blue-600 truncate mt-0.5">{existingFile}</p>
            <p className="text-xs text-blue-500 mt-1">Upload file baru untuk mengganti.</p>
          </div>
        </div>
      )}
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
          <p className="text-xs text-slate-400 mt-1">atau klik untuk browse</p>
          <p className="text-xs font-semibold text-[#2D7344] mt-2 bg-green-50 px-3 py-1 rounded-full inline-block">
            Format: .zip (SHP Shapefile)
          </p>
        </div>
      </div>
    </div>
  );
};

// =========================================================
// HALAMAN UTAMA: Edit Wilayah Desa
// =========================================================
const EditWilayahDesa = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    nama: "",
  });
  const [shpFile, setShpFile] = useState(null);
  const [errors, setErrors] = useState({});

  // ----------------------
  // FETCH DATA EXISTING
  // ----------------------
  const { data: desaData, isLoading: isLoadingData } = useQuery({
    queryKey: ["village-detail", id],
    queryFn: () => wilayahDesaService.getDesaById(id),
    enabled: !!id,
    retry: 1,
  });

  // Isi form ketika data berhasil di-fetch
  useEffect(() => {
    if (desaData) {
      setForm({
        nama: desaData.nama || "",
      });
    }
  }, [desaData]);

  // ----------------------
  // MUTATION: UPDATE (PATCH)
  // ----------------------
  const updateMutation = useMutation({
    mutationFn: (payload) => wilayahDesaService.updateDesa(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["villages"] });
      queryClient.invalidateQueries({ queryKey: ["village-detail", id] });
      toast.success("Data wilayah desa berhasil diperbarui!");
      navigate("/dashboard/wilayah");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "Terjadi kesalahan saat memperbarui data.",
      );
    },
  });

  // ----------------------
  // VALIDASI FORM
  // ----------------------
  const validate = () => {
    const newErrors = {};
    if (!form.nama.trim()) newErrors.nama = "Nama desa wajib diisi.";

    // Pastikan minimal ada satu perubahan
    const namaChanged = form.nama.trim() !== (desaData?.nama || "");
    const shpChanged = !!shpFile;

    if (!namaChanged && !shpChanged) {
      toast.info("Tidak ada perubahan data yang perlu disimpan.");
      return null; // signal: tidak ada error, tapi juga tidak perlu submit
    }

    return newErrors;
  };

  // ----------------------
  // HANDLER
  // ----------------------
  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationResult = validate();
    if (validationResult === null) return; // tidak ada perubahan
    if (Object.keys(validationResult).length > 0) {
      setErrors(validationResult);
      toast.warning("Mohon perbaiki data yang tidak valid.");
      return;
    }

    const formData = new FormData();
    // Sesuai PATCH: hanya kirim field yang diizinkan backend
    formData.append("nama", form.nama.trim());
    if (shpFile) formData.append("shp", shpFile);

    updateMutation.mutate(formData);
  };

  const inputClass = (field) =>
    `w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2D7344]/20 focus:border-[#2D7344] transition-all ${
      errors[field] ? "border-red-400 bg-red-50/30" : "border-slate-200"
    }`;

  // ----------------------
  // RENDER: LOADING STATE
  // ----------------------
  if (isLoadingData) {
    return (
      <DashboardLayout activeMenu="Wilayah">
        <main className="flex-1 flex items-center justify-center bg-[#FAFBFC]">
          <Loading />
        </main>
      </DashboardLayout>
    );
  }

  // ----------------------
  // RENDER: DATA NOT FOUND
  // ----------------------
  if (!desaData && !isLoadingData) {
    return (
      <DashboardLayout activeMenu="Wilayah">
        <main className="flex-1 flex flex-col items-center justify-center gap-4 bg-[#FAFBFC]">
          <AlertCircle size={48} className="text-slate-300" />
          <p className="text-slate-500 font-semibold">
            Data desa tidak ditemukan.
          </p>
          <button
            onClick={() => navigate("/dashboard/wilayah")}
            className="text-sm text-[#2D7344] hover:underline"
          >
            Kembali ke Manajemen Wilayah
          </button>
        </main>
      </DashboardLayout>
    );
  }

  const existingFileName =
    desaData?.wilayah_desa_geom?.file_name || null;

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
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <MapPin size={22} strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Edit Wilayah Desa
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Memperbarui data untuk:{" "}
                  <span className="font-semibold text-slate-700">
                    {desaData?.nama}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* ===================== KOLOM KIRI: DATA YANG BISA DIEDIT ===================== */}
              <div className="lg:col-span-2 space-y-6">
                {/* CARD: Info Desa (Read-Only) */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-base font-bold text-slate-800">
                      Informasi Desa (Read-only)
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Data ini tidak dapat diubah melalui form edit.
                    </p>
                  </div>
                  <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      {
                        label: "Kode Kemendagri",
                        value: desaData?.kodeKemendagri || "-",
                      },
                      {
                        label: "Kecamatan",
                        value: desaData?.kecamatan || "-",
                      },
                      {
                        label: "Kabupaten / Kota",
                        value: desaData?.kabupaten || "-",
                      },
                      {
                        label: "Provinsi",
                        value: desaData?.provinsi || "-",
                      },
                      {
                        label: "Luas Area (Ha)",
                        value: desaData?.luasHa
                          ? new Intl.NumberFormat("id-ID").format(desaData.luasHa)
                          : "-",
                      },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="bg-slate-50 rounded-xl p-4 border border-slate-100"
                      >
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                          {label}
                        </p>
                        <p className="text-sm font-semibold text-slate-700">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CARD: Data yang Bisa Diedit */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-base font-bold text-slate-800">
                      Data yang Dapat Diubah
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Ubah nama desa sesuai kebutuhan.
                    </p>
                  </div>
                  <div className="p-6">
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
                  </div>
                </div>
              </div>

              {/* ===================== KOLOM KANAN: UPLOAD SHP & AKSI ===================== */}
              <div className="lg:col-span-1 space-y-6">
                {/* CARD: Upload Data Spasial */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-base font-bold text-slate-800">
                      Perbarui Data Spasial
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Upload file ZIP baru untuk mengganti geometri desa.
                    </p>
                  </div>
                  <div className="p-6">
                    <ShpUploadZone
                      file={shpFile}
                      onFileChange={setShpFile}
                      onRemove={() => setShpFile(null)}
                      existingFile={existingFileName}
                    />
                    {shpFile && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-green-600 font-semibold">
                        <CheckCircle2 size={14} />
                        File baru siap diupload.
                      </div>
                    )}
                  </div>
                </div>

                {/* CARD: Aksi */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-3">
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 bg-[#2D7344] hover:bg-[#235c36] text-white px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
                  >
                    {updateMutation.isPending ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Simpan Perubahan
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/dashboard/wilayah")}
                    disabled={updateMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 text-slate-600 bg-slate-100 hover:bg-slate-200 px-5 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-70"
                  >
                    Batal
                  </button>
                </div>

                {/* INFO BOX */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="text-xs font-bold text-blue-700 mb-1">
                    Informasi Edit
                  </p>
                  <ul className="text-xs text-blue-600 space-y-1 list-disc list-inside leading-relaxed">
                    <li>
                      Hanya nama desa dan file SHP yang dapat diubah.
                    </li>
                    <li>
                      Upload SHP baru akan menggantikan geometri yang ada.
                    </li>
                    <li>
                      Data lain (kode, wilayah, luas) tidak dapat diubah di sini.
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

export default EditWilayahDesa;
