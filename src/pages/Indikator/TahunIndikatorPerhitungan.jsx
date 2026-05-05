import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import DataTable from "../../components/DataTable";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { indikatorService } from "../../services/master/indikatorService";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  AlertTriangle,
  X,
  Save,
} from "lucide-react";

const TahunIndikatorPerhitungan = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  // State untuk Modal Form (Tambah & Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null); // Menyimpan data baris yang sedang diedit (null jika mode Tambah)
  const [formTahun, setFormTahun] = useState("");

  // Fetch All Data Tahun
  const {
    data: responseData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["allYearIndicators"],
    queryFn: () => indikatorService.getAllYearIndicator(),
  });

  const rawData = responseData?.data || responseData || [];

  // Filter pencarian berdasarkan tahun
  const filteredData = rawData.filter((item) =>
    item.tahun?.toString().toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Mutation untuk Delete
  const deleteMutation = useMutation({
    mutationFn: (id) => indikatorService.deleteYearIndicator(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allYearIndicators"] });
      toast.success("Berhasil menghapus tahun indikator.");
    },
    onError: () => {
      toast.error("Gagal menghapus tahun indikator. Silakan coba lagi.");
    },
  });

  // Mutation untuk Save (Create / Update)
  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editData
        ? indikatorService.updateYearIndicator({
            id: editData.id,
            data: payload,
          })
        : indikatorService.createYearIndicator(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allYearIndicators"] });
      toast.success(
        `Tahun indikator berhasil ${editData ? "diperbarui" : "ditambahkan"}!`,
      );
      handleCloseModal();
    },
    onError: () => {
      toast.error("Gagal menyimpan data. Silakan coba lagi.");
    },
  });

  // Handlers untuk Modal
  const handleOpenAdd = () => {
    setEditData(null);
    setFormTahun("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (row) => {
    setEditData(row);
    setFormTahun(row.tahun?.toString() || "");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditData(null);
    setFormTahun("");
  };

  const handleSubmitModal = (e) => {
    e.preventDefault();
    if (!formTahun) {
      toast.error("Tahun wajib diisi!");
      return;
    }
    saveMutation.mutate({ tahun: formTahun.toString() });
  };

  // Handler Konfirmasi Delete
  const handleDeleteConfirmation = (row) => {
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
                Apakah Anda yakin ingin menghapus data tahun{" "}
                <span className="font-bold text-slate-700">{row.tahun}</span>?
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
      { duration: 10000, position: "top-center" },
    );
  };

  const columns = [
    {
      header: "No",
      accessor: "id",
      className: "w-16 text-center text-slate-400",
      // Mencegah NaN error pada penomoran
      render: (_, idx) => (typeof idx === "number" ? idx + 1 : "-"),
    },
    {
      header: "Tahun Indikator",
      accessor: "tahun",
      render: (row) => (
        <span className="font-bold text-slate-800 text-base">{row.tahun}</span>
      ),
    },
    {
      header: "Aksi",
      className: "w-40 text-center",
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          {/* Arahkan ke halaman detail list formula */}
          <button
            onClick={() => navigate(`/dashboard/indikator-perhitungan`)}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            title="Lihat Detail Indikator"
          >
            <Eye size={16} strokeWidth={2.5} />
          </button>

          {/* Tombol Edit sekarang membuka modal */}
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
            title="Edit Tahun"
          >
            <Edit2 size={16} strokeWidth={2.5} />
          </button>

          <button
            onClick={() => handleDeleteConfirmation(row)}
            disabled={deleteMutation.isLoading}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
            title="Hapus Tahun"
          >
            <Trash2 size={16} strokeWidth={2.5} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout activeMenu="Tahun Indikator Perhitungan">
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#FAFBFC]">
        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8 custom-scrollbar">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Tahun Indikator
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Kelola data master tahun untuk perhitungan indikator.
            </p>
          </div>

          <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 flex flex-col">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
                  <Calendar size={20} strokeWidth={2} />
                </div>
                <h2 className="text-lg font-bold text-slate-800">
                  Daftar Tahun
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
                    placeholder="Cari tahun..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium"
                  />
                </div>

                {/* Tombol Tambah sekarang membuka modal */}
                <button
                  onClick={handleOpenAdd}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#2D7344] hover:bg-[#1E5230] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md active:scale-[0.98]"
                >
                  <Plus size={18} strokeWidth={2.5} />
                  Tambah Tahun
                </button>
              </div>
            </div>

            <DataTable
              columns={columns}
              data={filteredData}
              isLoading={isLoading}
              isError={isError}
              searchQuery={searchTerm}
              emptyMessage="Belum ada data tahun yang ditambahkan."
            />
          </div>
        </div>

        {/* Modal Overlay Tambah/Edit */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-800">
                  {editData ? "Edit Tahun Indikator" : "Tambah Tahun Indikator"}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmitModal} className="p-5">
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Tahun
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <Calendar size={18} />
                    </div>
                    <input
                      type="number"
                      placeholder="Contoh: 2024"
                      value={formTahun}
                      onChange={(e) => setFormTahun(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={saveMutation.isLoading}
                    className="flex items-center gap-2 px-5 py-2 bg-[#2D7344] hover:bg-[#1E5230] text-white text-sm font-semibold rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
                  >
                    <Save size={16} />
                    {saveMutation.isLoading ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </DashboardLayout>
  );
};

export default TahunIndikatorPerhitungan;
