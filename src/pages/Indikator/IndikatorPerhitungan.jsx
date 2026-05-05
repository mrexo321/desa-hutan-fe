import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import DataTable from "../../components/DataTable"; // Sesuaikan path
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { indikatorService } from "../../services/master/indikatorService"; // Sesuaikan path
import { toast } from "sonner"; // Import Sonner
import {
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  AlertTriangle,
  ChevronLeft,
} from "lucide-react";

const IndikatorPerhitungan = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch All Data
  const {
    data: responseData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["allFormulaIndicators"],
    queryFn: () => indikatorService.getAllFormula(),
  });

  const rawData = responseData?.data || responseData || [];

  // Client-side search filtering
  const filteredData = rawData.filter((item) =>
    item.nama?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Mutation untuk Delete
  const deleteMutation = useMutation({
    mutationFn: (id) => indikatorService.deleteFormulaIndicator(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["allFormulaIndicators"]);
      toast.success("Berhasil menghapus formula indikator.");
    },
    onError: () => {
      toast.error("Gagal menghapus formula indikator. Silakan coba lagi.");
    },
  });

  // Handler Trigger Sonner Confirmation
  const handleDeleteConfirmation = (row) => {
    // Generate custom toast id agar kita bisa dismiss toast-nya secara spesifik jika dibutuhkan
    const toastId = toast.custom(
      (t) => (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-red-900/5 p-5 w-full max-w-sm">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0 text-red-500">
              <AlertTriangle size={20} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-800 mb-1">
                Konfirmasi Penghapusan
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Apakah Anda yakin ingin menghapus formula{" "}
                <span className="font-bold text-slate-700">"{row.nama}"</span>?
                Tindakan ini permanen dan tidak dapat dibatalkan.
              </p>
              <div className="flex items-center justify-end gap-2 mt-2">
                <button
                  onClick={() => toast.dismiss(t)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    toast.dismiss(t);
                    deleteMutation.mutate(row.id);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-sm"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        duration: 10000, // Akan tetap muncul selama 10 detik jika tidak direspon
        position: "top-center", // Posisi konfirmasi yang baik agar langsung terlihat
      },
    );
  };

  // Definisi Kolom DataTable
  const columns = [
    {
      header: "No",
      accessor: "id",
      className: "w-16 text-center text-slate-400",
      render: (_, idx) => idx + 1,
    },
    {
      header: "Nama Indikator",
      accessor: "nama",
      render: (row) => (
        <span className="font-bold text-slate-800">{row.nama}</span>
      ),
    },
    {
      header: "Tahun",
      accessor: "tahunIndikator",
      render: (row) => (
        <span className="px-3 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg text-xs">
          {row.tahunIndikator?.tahun || "-"}
        </span>
      ),
    },
    {
      header: "Formula",
      accessor: "formula",
      render: (row) => (
        <code className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 block truncate max-w-xs">
          {row.formula}
        </code>
      ),
    },
    {
      header: "Aksi",
      className: "w-40 text-center",
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() =>
              navigate(`/dashboard/indikator-perhitungan/${row.id}`)
            }
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            title="Lihat Detail"
          >
            <Eye size={16} strokeWidth={2.5} />
          </button>
          <button
            onClick={() =>
              navigate(`/dashboard/indikator-perhitungan/edit/${row.id}`)
            }
            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
            title="Edit"
          >
            <Edit2 size={16} strokeWidth={2.5} />
          </button>
          <button
            onClick={() => handleDeleteConfirmation(row)}
            disabled={deleteMutation.isLoading}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
            title="Hapus"
          >
            <Trash2 size={16} strokeWidth={2.5} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout activeMenu="Indikator Perhitungan">
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#FAFBFC]">
        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8 custom-scrollbar">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-500 hover:text-emerald-700 font-bold text-sm transition-colors w-fit px-3 py-2 -ml-3 rounded-xl hover:bg-emerald-50"
            >
              <ChevronLeft size={18} />
              Kembali
            </button>
          </div>
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Indikator Perhitungan
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Kelola data formula dan tahun untuk referensi perhitungan
              indikator.
            </p>
          </div>

          <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 flex flex-col">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
                  <Calendar size={20} strokeWidth={2} />
                </div>
                <h2 className="text-lg font-bold text-slate-800">
                  Daftar Formula
                </h2>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-full sm:w-64 group">
                  <Search
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Cari formula..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium"
                  />
                </div>
                <button
                  onClick={() =>
                    navigate("/dashboard/indikator-perhitungan/tambah")
                  }
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#2D7344] hover:bg-[#1E5230] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md active:scale-[0.98]"
                >
                  <Plus size={18} strokeWidth={2.5} />
                  Tambah Formula
                </button>
              </div>
            </div>

            <DataTable
              columns={columns}
              data={filteredData}
              isLoading={isLoading}
              isError={isError}
              searchQuery={searchTerm}
              emptyMessage="Belum ada formula yang ditambahkan."
            />
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default IndikatorPerhitungan;
