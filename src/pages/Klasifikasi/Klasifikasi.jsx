import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import DashboardLayout from "../../components/DashboardLayout";
import DataTable from "../../components/DataTable";
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Layers,
  X,
  Loader2,
  AlertTriangle,
  Eye,
  Map,
} from "lucide-react";

import { klasifikasiService } from "../../services/master/klasifikasiService";

const Klasifikasi = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("hutan");
  const [searchQuery, setSearchQuery] = useState("");

  // ==========================================
  // STATE MODALS & FORMS
  // ==========================================

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewId, setPreviewId] = useState(null);

  // State Add
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({ nama: "", warna: "#2D7344" });

  // State Edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    id: "",
    nama: "",
    warna: "",
    originalNama: "",
    originalWarna: "",
  });

  // State Delete
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // ==========================================
  // 1. DATA FETCHING (GET LIST & DETAIL)
  // ==========================================

  const {
    data: responseHutan,
    isLoading: isLoadingHutan,
    isError: isErrorHutan,
  } = useQuery({
    queryKey: ["klasifikasi-hutan"],
    queryFn: klasifikasiService.getAllClassificationForest,
    enabled: activeTab === "hutan",
  });

  const dataHutan = responseHutan?.data || responseHutan || [];

  // Data dummy buat desa
  const dataDesa = useMemo(
    () => [
      { id: 1, nama: "Desa Swadaya", warna: "#F59E0B" },
      { id: 2, nama: "Desa Swakarya", warna: "#3B82F6" },
    ],
    [],
  );

  // Fetch Detail Hutan (Untuk Preview)
  const { data: responsePreviewHutan, isFetching: isFetchingPreviewHutan } =
    useQuery({
      queryKey: ["klasifikasi-hutan-detail", previewId],
      queryFn: () => klasifikasiService.getForestClassificationById(previewId),
      enabled: !!previewId && activeTab === "hutan", // Hanya jalan jika ada ID & di tab hutan
    });

  // Menentukan Data Preview (Dari API Hutan ATAU Array Desa)
  const previewData = useMemo(() => {
    if (activeTab === "hutan") {
      return responsePreviewHutan?.data || responsePreviewHutan;
    }
    return dataDesa.find((d) => d.id === previewId);
  }, [activeTab, responsePreviewHutan, previewId, dataDesa]);

  const isFetchingPreview =
    activeTab === "hutan" ? isFetchingPreviewHutan : false;

  // ==========================================
  // 2. MUTATIONS (CREATE, UPDATE, DELETE)
  // ==========================================
  const createMutation = useMutation({
    mutationFn: (payload) =>
      klasifikasiService.createForestClassification(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["klasifikasi-hutan"] });
      toast.success("Data klasifikasi berhasil ditambahkan!");
      setIsAddModalOpen(false);
      setAddForm({ nama: "", warna: "#2D7344" });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "Terjadi kesalahan saat menyimpan data.",
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) =>
      klasifikasiService.updateForestClassification(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["klasifikasi-hutan"] });
      toast.success("Data klasifikasi berhasil diperbarui!");
      setIsEditModalOpen(false);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "Terjadi kesalahan saat memperbarui data.",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => klasifikasiService.deleteForestClassification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["klasifikasi-hutan"] });
      toast.success("Data klasifikasi berhasil dihapus!");
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "Terjadi kesalahan saat menghapus data.",
      );
    },
  });

  // ==========================================
  // 3. HANDLERS
  // ==========================================

  // Handler Preview
  const handlePreviewClick = (row) => {
    setPreviewId(row.id);
    setIsPreviewModalOpen(true);
  };

  const closePreviewModal = () => {
    setIsPreviewModalOpen(false);
    setTimeout(() => setPreviewId(null), 200); // Clear state setelah animasi selesai
  };

  // Handler Add
  const handleAddClick = () => {
    setAddForm({ nama: "", warna: "#2D7344" });
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!addForm.nama || !addForm.warna)
      return toast.warning("Nama dan Warna wajib diisi!");
    createMutation.mutate({ nama: addForm.nama, warna: addForm.warna });
  };

  // Handler Edit
  const handleEditClick = (row) => {
    setEditForm({
      id: row.id,
      nama: row.nama,
      warna: row.warna,
      originalNama: row.nama,
      originalWarna: row.warna,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    if (!editForm.nama || !editForm.warna)
      return toast.warning("Nama dan Warna wajib diisi!");

    if (
      editForm.nama === editForm.originalNama &&
      editForm.warna === editForm.originalWarna
    ) {
      toast.info("Tidak ada perubahan data.");
      setIsEditModalOpen(false);
      return;
    }

    updateMutation.mutate({
      id: editForm.id,
      payload: { nama: editForm.nama, warna: editForm.warna },
    });
  };

  // Handler Delete
  const handleDeleteClick = (row) => {
    setItemToDelete(row);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) deleteMutation.mutate(itemToDelete.id);
  };


  // ==========================================
  // 4. FILTERING & KOLOM TABEL
  // ==========================================
  const displayData = useMemo(() => {
    const rawData = activeTab === "hutan" ? dataHutan : dataDesa;
    if (!searchQuery.trim()) return rawData;
    return rawData.filter((item) =>
      item.nama?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [activeTab, dataHutan, dataDesa, searchQuery]);

  const columns = useMemo(
    () => [
      {
        header: activeTab === "hutan" ? "Nama Hutan" : "Nama Desa",
        accessor: "nama",
        render: (row) => (
          <span className="text-slate-800 font-semibold">{row.nama}</span>
        ),
      },
      {
        header: "Warna Peta",
        accessor: "warna",
        render: (row) => (
          <div className="flex items-center gap-3">
            <div
              className="w-6 h-6 rounded-md shadow-inner border border-black/10"
              style={{ backgroundColor: row.warna }}
            ></div>
            <span className="font-mono text-xs font-semibold text-slate-500 uppercase">
              {row.warna}
            </span>
          </div>
        ),
      },
      {
        header: "Aksi",
        className: "text-center w-36",
        render: (row) => (
          <div className="flex items-center justify-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => handlePreviewClick(row)}
              className="p-2 text-slate-500 hover:text-[#2D7344] hover:bg-green-50 rounded-lg transition-all"
              title="Lihat Detail"
            >
              <Eye size={16} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => handleEditClick(row)}
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              title="Edit"
            >
              <Edit2 size={16} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => handleDeleteClick(row)}
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              title="Hapus"
            >
              <Trash2 size={16} strokeWidth={2.5} />
            </button>
          </div>
        ),
      },
    ],
    [activeTab],
  );

  return (
    <DashboardLayout activeMenu="Klasifikasi">
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#FAFBFC]">
        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8 custom-scrollbar">
          {/* HEADER */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Manajemen Klasifikasi
            </h1>
            <p className="text-sm text-slate-500 mt-2 max-w-2xl">
              Kelola data master klasifikasi hutan dan klasifikasi desa.
            </p>
          </div>

          {/* TABS */}
          <div className="flex p-1.5 bg-slate-200/60 backdrop-blur-sm rounded-xl w-max mb-8 border border-slate-200">
            {["hutan", "desa"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSearchQuery("");
                }}
                className={`px-6 py-2.5 text-sm font-semibold rounded-lg capitalize transition-all duration-300 ${
                  activeTab === tab
                    ? "bg-white text-[#2D7344] shadow-sm ring-1 ring-slate-900/5"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
                }`}
              >
                Klasifikasi {tab}
              </button>
            ))}
          </div>

          {/* TABEL DATA */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-[#2D7344]">
                  <Layers size={20} strokeWidth={2} />
                </div>
                <h2 className="text-lg font-bold text-slate-800">
                  Tabel Data Klasifikasi{" "}
                  {activeTab === "hutan" ? "Hutan" : "Desa"}
                </h2>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-full sm:w-64 group">
                  <Search
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#2D7344] transition-colors"
                    size={18}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Cari ${activeTab}...`}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-[#2D7344]"
                  />
                </div>

                <button
                  onClick={handleAddClick}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#2D7344] hover:bg-[#235c36] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm"
                >
                  <Plus size={18} strokeWidth={3} />
                  Tambah Data
                </button>
              </div>
            </div>

            <DataTable
              columns={columns}
              data={displayData}
              isLoading={activeTab === "hutan" ? isLoadingHutan : false}
              isError={activeTab === "hutan" ? isErrorHutan : false}
              searchQuery={searchQuery}
              emptyMessage={`Belum ada data klasifikasi ${activeTab} yang ditambahkan`}
            />
          </div>
        </div>
      </main>

      {/* ==========================================
          1. MODAL PREVIEW DETAIL (NEW)
      ========================================== */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header Modal Preview */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Map size={20} className="text-[#2D7344]" />
                Detail Klasifikasi {activeTab === "hutan" ? "Hutan" : "Desa"}
              </h3>
              <button
                onClick={closePreviewModal}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body Modal Preview */}
            <div className="p-6">
              {isFetchingPreview ? (
                // SKELETON LOADING PREVIEW
                <div className="space-y-6 animate-pulse">
                  <div>
                    <div className="h-3 bg-slate-200 rounded w-1/3 mb-2"></div>
                    <div className="h-5 bg-slate-200 rounded w-2/3"></div>
                  </div>
                  <div>
                    <div className="h-3 bg-slate-200 rounded w-1/4 mb-2"></div>
                    <div className="h-16 bg-slate-200 rounded-xl w-full"></div>
                  </div>
                </div>
              ) : previewData ? (
                // TAMPILAN DATA PREVIEW
                <div className="space-y-6">
                  {/* Blok Nama */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Nama Klasifikasi
                    </p>
                    <p className="text-lg font-bold text-slate-900">
                      {previewData.nama || "-"}
                    </p>
                  </div>

                  {/* Blok Warna dengan UI Menarik */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                      Representasi Warna Peta
                    </p>
                    <div className="flex items-center gap-4 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                      <div
                        className="w-12 h-12 rounded-lg shadow-inner border border-black/10 shrink-0"
                        style={{ backgroundColor: previewData.warna || "#ccc" }}
                      ></div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Warna Area (Fill Color)
                        </p>
                        <p className="text-xs font-mono font-bold text-slate-500 mt-0.5 uppercase">
                          {previewData.warna || "#000000"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // TAMPILAN ERROR/KOSONG
                <div className="text-center py-8 text-slate-500">
                  <AlertTriangle
                    size={36}
                    className="mx-auto mb-3 text-amber-500 opacity-50"
                  />
                  <p className="font-semibold">Data tidak ditemukan.</p>
                </div>
              )}
            </div>

            {/* Footer Modal Preview */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                onClick={closePreviewModal}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-xl transition-colors shadow-sm"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          2. MODAL TAMBAH DATA (CREATE)
      ========================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">
                Tambah Klasifikasi
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Nama Klasifikasi
                  </label>
                  <input
                    type="text"
                    value={addForm.nama}
                    onChange={(e) =>
                      setAddForm({ ...addForm, nama: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2D7344]/20 focus:border-[#2D7344] transition-all"
                    placeholder={`Masukkan nama klasifikasi ${activeTab}...`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Warna Peta (Hex Code)
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-11 rounded-xl overflow-hidden border border-slate-200 shadow-sm shrink-0">
                      <input
                        type="color"
                        value={addForm.warna}
                        onChange={(e) =>
                          setAddForm({ ...addForm, warna: e.target.value })
                        }
                        className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                        required
                      />
                    </div>
                    <input
                      type="text"
                      value={addForm.warna}
                      onChange={(e) =>
                        setAddForm({ ...addForm, warna: e.target.value })
                      }
                      className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2D7344]/20 focus:border-[#2D7344] transition-all uppercase"
                      placeholder="#000000"
                      pattern="^#[0-9A-Fa-f]{6}$"
                      title="Format warna harus Hex (contoh: #FF0000)"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  disabled={createMutation.isPending}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#2D7344] hover:bg-[#235c36] rounded-xl transition-colors disabled:opacity-70"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />{" "}
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Data"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          3. MODAL EDIT
      ========================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">
                Edit Klasifikasi
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="p-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Nama Klasifikasi
                  </label>
                  <input
                    type="text"
                    value={editForm.nama}
                    onChange={(e) =>
                      setEditForm({ ...editForm, nama: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2D7344]/20 focus:border-[#2D7344] transition-all"
                    placeholder={`Masukkan nama klasifikasi ${activeTab}...`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Warna Peta (Hex Code)
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-11 rounded-xl overflow-hidden border border-slate-200 shadow-sm shrink-0">
                      <input
                        type="color"
                        value={editForm.warna}
                        onChange={(e) =>
                          setEditForm({ ...editForm, warna: e.target.value })
                        }
                        className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                        required
                      />
                    </div>
                    <input
                      type="text"
                      value={editForm.warna}
                      onChange={(e) =>
                        setEditForm({ ...editForm, warna: e.target.value })
                      }
                      className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2D7344]/20 focus:border-[#2D7344] transition-all uppercase"
                      placeholder="#000000"
                      pattern="^#[0-9A-Fa-f]{6}$"
                      title="Format warna harus Hex (contoh: #FF0000)"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  disabled={updateMutation.isPending}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#2D7344] hover:bg-[#235c36] rounded-xl transition-colors disabled:opacity-70"
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />{" "}
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Perubahan"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          4. MODAL DELETE (WARNING)
      ========================================== */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-6 sm:p-8 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-5 border-[6px] border-red-50/50">
              <AlertTriangle size={28} strokeWidth={2.5} />
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Hapus Data?
            </h3>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
              Apakah Anda yakin ingin menghapus{" "}
              <span className="font-bold text-slate-800">
                "{itemToDelete?.nama}"
              </span>
              ? Data yang telah dihapus tidak dapat dikembalikan.
            </p>

            <div className="flex items-center justify-center gap-3 w-full">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setItemToDelete(null);
                }}
                className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                disabled={deleteMutation.isPending}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-70"
              >
                {deleteMutation.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Ya, Hapus"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Klasifikasi;
