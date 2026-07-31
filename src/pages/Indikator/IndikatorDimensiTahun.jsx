import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import DataTable from "../../components/DataTable";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dimensiDesaService } from "../../services/master/dimensiDesaService";
import { toast } from "sonner";
import {
  Search,
  Eye,
  Edit2,
  Calendar,
  ChevronLeft,
  X,
  Loader2,
  Plus,
} from "lucide-react";

const IndikatorDimensiTahun = () => {
  const navigate = useNavigate();
  const { tahun } = useParams();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  // State Modal Edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editNama, setEditNama] = useState("");

  // State Modal Tambah Dimensi Desa
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newNama, setNewNama] = useState("");

  // Fetch data indikator dimensi berdasarkan tahun
  const {
    data: responseData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["indikatorDimensiByTahun", tahun],
    queryFn: () => dimensiDesaService.getIndikatorDimensiByTahun(tahun),
    enabled: !!tahun,
  });

  const rawData = responseData?.data || responseData || [];

  // Filter pencarian berdasarkan nama indikator
  const filteredData = Array.isArray(rawData)
    ? rawData.filter((item) =>
        item.nama?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Mutation Tambah Dimensi Desa (/dimensi-desa)
  const createMutation = useMutation({
    mutationFn: (payload) => dimensiDesaService.createDimensiDesa(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["indikatorDimensiByTahun", tahun] });
      toast.success("Dimensi desa berhasil ditambahkan!");
      setIsAddModalOpen(false);
      setNewNama("");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Gagal menambahkan dimensi desa"
      );
    },
  });

  // Mutation Update Indikator Dimensi (/dimensi-desa/:id)
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) =>
      dimensiDesaService.updateIndikatorDimensi(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["indikatorDimensiByTahun", tahun] });
      toast.success("Indikator dimensi berhasil diperbarui!");
      setIsEditModalOpen(false);
      setEditItem(null);
      setEditNama("");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Gagal memperbarui indikator dimensi"
      );
    },
  });

  const handleGoToDetailMatrix = (indicatorId) => {
    if (indicatorId) {
      navigate(`/dashboard/indikator?tab=dimensi&indicatorId=${indicatorId}&tahun=${tahun}`);
    } else if (Array.isArray(rawData) && rawData.length > 0) {
      navigate(`/dashboard/indikator?tab=dimensi&indicatorId=${rawData[0].id}&tahun=${tahun}`);
    } else {
      navigate(`/dashboard/indikator?tab=dimensi&detailTahun=${tahun}`);
    }
  };

  const handleSubmitAdd = (e) => {
    e.preventDefault();
    if (!newNama.trim()) {
      toast.warning("Nama dimensi desa tidak boleh kosong!");
      return;
    }
    createMutation.mutate({ nama: newNama.trim(), tahun: parseInt(tahun) });
  };

  const handleOpenEdit = (row) => {
    setEditItem(row);
    setEditNama(row.nama || "");
    setIsEditModalOpen(true);
  };

  const handleSubmitEdit = (e) => {
    e.preventDefault();
    if (!editNama.trim()) {
      toast.warning("Nama indikator tidak boleh kosong!");
      return;
    }
    updateMutation.mutate({
      id: editItem.id,
      payload: { nama: editNama.trim() },
    });
  };

  // Definisi Kolom DataTable
  const columns = [
    {
      header: "No",
      accessor: "id",
      className: "w-16 text-center text-slate-400",
      render: (_, idx) => (typeof idx === "number" ? idx + 1 : "-"),
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
      accessor: "tahunIndikatorDimensi",
      render: (row) => {
        const yearVal = row.tahunIndikatorDimensi?.tahun || tahun || "-";
        return (
          <span className="px-3 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg text-xs border border-blue-200/60">
            {yearVal}
          </span>
        );
      },
    },
    {
      header: "Aksi",
      className: "w-40 text-center",
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handleGoToDetailMatrix(row.id)}
            className="p-2 text-slate-400 hover:text-[#2D7344] hover:bg-emerald-50 rounded-lg transition-all"
            title="Lihat Matrix & Skema Data Desa"
          >
            <Eye size={16} strokeWidth={2.5} />
          </button>
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            title="Edit Indikator Dimensi"
          >
            <Edit2 size={16} strokeWidth={2.5} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout activeMenu="Indikator">
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#FAFBFC]">
        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8 custom-scrollbar">
          <div>
            <button
              onClick={() => navigate("/dashboard/indikator?tab=dimensi")}
              className="flex items-center gap-2 text-slate-500 hover:text-[#2D7344] font-bold text-sm transition-colors w-fit px-3 py-2 -ml-3 rounded-xl hover:bg-emerald-50"
            >
              <ChevronLeft size={18} />
              Kembali
            </button>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 mt-2">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                Dimensi Indikator Desa - Tahun {tahun}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Daftar indikator dimensi desa yang terdaftar untuk perhitungan tahun {tahun}.
              </p>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-[#2D7344] hover:bg-[#235c36] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all"
            >
              <Plus size={18} strokeWidth={2.5} />
              Tambah Dimensi Desa
            </button>
          </div>

          <div className="bg-white rounded-[20px] shadow-sm border border-slate-200 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-[#2D7344] border border-emerald-100">
                  <Calendar size={20} strokeWidth={2.2} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    Tabel Indikator Dimensi ({tahun})
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">
                    Total {filteredData.length} indikator ditemukan
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-full sm:w-72 group">
                  <Search
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#2D7344] transition-colors"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Cari indikator dimensi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-[#2D7344] transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            <DataTable
              columns={columns}
              data={filteredData}
              isLoading={isLoading}
              isError={isError}
              searchQuery={searchTerm}
              emptyMessage={`Belum ada indikator dimensi yang ditambahkan untuk tahun ${tahun}.`}
            />
          </div>
        </div>
      </main>

      {/* Modal Tambah Dimensi Desa */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h2 className="text-lg font-extrabold text-slate-900">
                Tambah Dimensi Desa
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmitAdd} className="space-y-4">
              <div>
                <label className="block text-slate-700 text-xs font-bold mb-2 uppercase tracking-wide">
                  Nama Dimensi Desa
                </label>
                <input
                  type="text"
                  value={newNama}
                  onChange={(e) => setNewNama(e.target.value)}
                  placeholder="Contoh: Indeks Ketahanan Pangan"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2D7344] focus:ring-2 focus:ring-emerald-500/10 transition-all font-medium text-slate-700"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isLoading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#2D7344] hover:bg-[#1E5230] text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-emerald-800/10 cursor-pointer disabled:opacity-50"
                >
                  {createMutation.isLoading && (
                    <Loader2 size={14} className="animate-spin" />
                  )}
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Indikator Dimensi */}
      {isEditModalOpen && editItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h2 className="text-lg font-extrabold text-slate-900">
                Edit Indikator Dimensi
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmitEdit} className="space-y-4">
              <div>
                <label className="block text-slate-700 text-xs font-bold mb-2 uppercase tracking-wide">
                  Nama Indikator
                </label>
                <input
                  type="text"
                  value={editNama}
                  onChange={(e) => setEditNama(e.target.value)}
                  placeholder="Masukkan nama indikator..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2D7344] focus:ring-2 focus:ring-emerald-500/10 transition-all font-medium text-slate-700"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isLoading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#2D7344] hover:bg-[#1E5230] text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-emerald-800/10 cursor-pointer disabled:opacity-50"
                >
                  {updateMutation.isLoading && (
                    <Loader2 size={14} className="animate-spin" />
                  )}
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default IndikatorDimensiTahun;
