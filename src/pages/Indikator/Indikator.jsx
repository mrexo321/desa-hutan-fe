import React, { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye, // Tambahan ikon untuk preview
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import DashboardLayout from "../../components/DashboardLayout";
import DataTable from "../../components/DataTable";
import { indikatorService } from "../../services/master/indikatorService";

const Indikator = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("utama");
  const [searchQuery, setSearchQuery] = useState("");

  // ==========================================
  // STATE MODALS
  // ==========================================
  // State Preview
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewId, setPreviewId] = useState(null);

  // State Add
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({ kode: "", nama: "" });

  // State Edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    id: "",
    kode: "",
    nama: "",
    originalKode: "",
    originalNama: "",
  });

  // State Delete
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // ==========================================
  // 1. DATA FETCHING & MUTATION
  // ==========================================

  // Fetch Semua Data Kategori
  const {
    data: categoriesResponse,
    isLoading: isLoadingCat,
    isError: isErrorCat,
  } = useQuery({
    queryKey: ["category-indicators"],
    queryFn: indikatorService.getAllCategoryIndicator,
    enabled: activeTab === "kategori",
    staleTime: 5 * 60 * 1000,
  });

  const categoryData = categoriesResponse?.data || [];

  // Fetch Data Detail Kategori (Berdasarkan ID untuk Preview)
  const { data: previewResponse, isFetching: isFetchingPreview } = useQuery({
    queryKey: ["category-indicator-detail", previewId],
    queryFn: () => indikatorService.getCategoryIndicatorById(previewId),
    enabled: !!previewId, // Hanya jalan jika previewId ada isinya
  });

  // Menyesuaikan dengan struktur response API (biasanya di dalam .data)
  const previewData = previewResponse?.data || previewResponse;

  // Mock Data Utama (Tetap)
  const mainIndicatorData = useMemo(
    () => [
      {
        id: 1,
        kode: "B_B",
        nama: "Bencana Banjir",
        kategori: "Bencana",
        badgeColor: "bg-red-100 text-red-700 border-red-200",
      },
      {
        id: 2,
        kode: "S_P",
        nama: "Kepadatan Penduduk",
        kategori: "Sosial",
        badgeColor: "bg-blue-100 text-blue-700 border-blue-200",
      },
    ],
    [],
  );

  // Filter Data
  const displayData = useMemo(() => {
    const dataSource = activeTab === "utama" ? mainIndicatorData : categoryData;
    if (!searchQuery.trim()) return dataSource;
    return dataSource.filter(
      (item) =>
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.kode.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [activeTab, categoryData, mainIndicatorData, searchQuery]);

  // Mutation Create (Tambah)
  const createCategoryMutation = useMutation({
    mutationFn: (payload) => indikatorService.createCategoryIndicator(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["category-indicators"] });
      toast.success("Data kategori berhasil ditambahkan!");
      setIsAddModalOpen(false);
      setAddForm({ kode: "", nama: "" }); // Reset form
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        "Terjadi kesalahan saat menambahkan data.";
      toast.error(errorMessage);
    },
  });

  // Mutation Update
  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, payload }) =>
      indikatorService.updateCategoryIndicator(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["category-indicators"] });
      toast.success("Data kategori berhasil diperbarui!");
      setIsEditModalOpen(false);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        "Terjadi kesalahan saat memperbarui data.";
      toast.error(errorMessage);
    },
  });

  // Mutation Delete
  const deleteCategoryMutation = useMutation({
    mutationFn: (id) => indikatorService.deleteCategoryIndicator(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["category-indicators"] });
      toast.success("Data kategori berhasil dihapus!");
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        "Terjadi kesalahan saat menghapus data.";
      toast.error(errorMessage);
    },
  });

  // ==========================================
  // 2. HANDLERS
  // ==========================================

  // Handler Preview
  const handlePreviewClick = (row) => {
    setPreviewId(row.id);
    setIsPreviewModalOpen(true);
  };

  const closePreviewModal = () => {
    setIsPreviewModalOpen(false);
    setTimeout(() => setPreviewId(null), 200); // Clear state setelah animasi modal selesai
  };

  // Handler Add
  const handleAddClick = () => {
    setAddForm({ kode: "", nama: "" });
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!addForm.kode || !addForm.nama) {
      toast.warning("Kode dan Nama tidak boleh kosong!");
      return;
    }
    createCategoryMutation.mutate({
      kode: addForm.kode,
      nama: addForm.nama,
    });
  };

  // Handler Edit
  const handleEditClick = (row) => {
    setEditForm({
      id: row.id,
      kode: row.kode,
      nama: row.nama,
      originalKode: row.kode,
      originalNama: row.nama,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();

    if (!editForm.kode || !editForm.nama) {
      toast.warning("Kode dan Nama tidak boleh kosong!");
      return;
    }

    // 1. Cek apakah TIDAK ADA perubahan sama sekali
    if (
      editForm.kode === editForm.originalKode &&
      editForm.nama === editForm.originalNama
    ) {
      toast.info("Tidak ada perubahan data.");
      setIsEditModalOpen(false);
      return;
    }

    // 2. PERBAIKAN: Selalu kirimkan kode dan nama secara utuh (Full Payload)
    // Ini menghindari error 'undefined' di backend
    const payload = {
      kode: editForm.kode,
      nama: editForm.nama,
    };

    updateCategoryMutation.mutate({
      id: editForm.id,
      payload: payload,
    });
  };

  // Handler Delete
  const handleDeleteClick = (row) => {
    setItemToDelete(row);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteCategoryMutation.mutate(itemToDelete.id);
    }
  };

  // ==========================================
  // 3. KONFIGURASI KOLOM TABEL DINAMIS
  // ==========================================

  // Tambahkan onPreview ke ActionButtons
  const ActionButtons = ({ row, onPreview, onEdit, onDelete }) => (
    <div className="flex items-center justify-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity duration-300">
      <button
        onClick={() => onPreview(row)}
        className="p-2 text-slate-500 hover:text-[#2D7344] hover:bg-green-50 rounded-lg transition-colors"
        title="Lihat Detail"
      >
        <Eye size={16} strokeWidth={2.5} />
      </button>
      <button
        onClick={() => onEdit(row)}
        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        title="Edit"
      >
        <Edit2 size={16} strokeWidth={2.5} />
      </button>
      <button
        onClick={() => onDelete(row)}
        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        title="Hapus"
      >
        <Trash2 size={16} strokeWidth={2.5} />
      </button>
    </div>
  );

  const columnsUtama = useMemo(
    () => [
      {
        header: "Kode",
        accessor: "kode",
        className: "w-24",
        render: (row) => (
          <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            {row.kode}
          </span>
        ),
      },
      {
        header: "Nama Indikator",
        accessor: "nama",
        render: (row) => (
          <span className="text-slate-800 font-semibold">{row.nama}</span>
        ),
      },
      {
        header: "Jenis Kategori",
        accessor: "kategori",
        render: (row) => (
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${row.badgeColor}`}
          >
            {row.kategori}
          </span>
        ),
      },
      {
        header: "Aksi",
        accessor: "aksi",
        className: "text-center w-36",
        render: (row) => (
          <ActionButtons
            row={row}
            onPreview={handlePreviewClick}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />
        ),
      },
    ],
    [],
  );

  const columnsKategori = useMemo(
    () => [
      {
        header: "Kode",
        accessor: "kode",
        className: "w-24",
        render: (row) => (
          <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            {row.kode}
          </span>
        ),
      },
      {
        header: "Nama Kategori",
        accessor: "nama",
        render: (row) => (
          <span className="text-slate-800 font-semibold">{row.nama}</span>
        ),
      },
      {
        header: "Aksi",
        accessor: "aksi",
        className: "text-center w-36",
        render: (row) => (
          <ActionButtons
            row={row}
            onPreview={handlePreviewClick}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />
        ),
      },
    ],
    [],
  );

  return (
    <DashboardLayout activeMenu="Indikator">
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#FAFBFC]">
        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8 custom-scrollbar">
          {/* HEADER & TABS */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Manajemen Indikator
            </h1>
            <p className="text-sm text-slate-500 mt-2 max-w-2xl">
              Kelola data indikator utama dan kategori untuk pengukuran desa
              hutan.
            </p>
          </div>

          <div className="flex p-1.5 bg-slate-200/60 backdrop-blur-sm rounded-xl w-max mb-8 border border-slate-200">
            {["utama", "kategori"].map((tab) => (
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
                Indikator {tab}
              </button>
            ))}
          </div>

          {/* KONTEN CARD & TABEL */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/30">
              <h2 className="text-lg font-bold text-slate-800">
                {activeTab === "utama"
                  ? "Tabel Data Indikator Utama"
                  : "Tabel Data Kategori"}
              </h2>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-full sm:w-72 group">
                  <Search
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#2D7344]"
                    size={18}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Cari ${activeTab} ...`}
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
              columns={activeTab === "utama" ? columnsUtama : columnsKategori}
              data={displayData}
              isLoading={activeTab === "kategori" ? isLoadingCat : false}
              isError={activeTab === "kategori" ? isErrorCat : false}
              searchQuery={searchQuery}
              emptyMessage="Belum ada data indikator yang ditambahkan"
            />
          </div>
        </div>
      </main>

      {/* ==========================================
          MODAL PREVIEW DETAIL DATA
      ========================================== */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Eye size={20} className="text-[#2D7344]" />
                Detail Kategori
              </h3>
              <button
                onClick={closePreviewModal}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {isFetchingPreview ? (
                <div className="space-y-5 animate-pulse">
                  <div>
                    <div className="h-3 bg-slate-200 rounded w-1/4 mb-2"></div>
                    <div className="h-5 bg-slate-200 rounded w-1/2"></div>
                  </div>
                  <div>
                    <div className="h-3 bg-slate-200 rounded w-1/4 mb-2"></div>
                    <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                  </div>
                </div>
              ) : previewData ? (
                <div className="space-y-5">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Kode Kategori
                    </p>
                    <p className="text-base font-mono font-semibold text-slate-900">
                      {previewData.kode || "-"}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Nama Kategori
                    </p>
                    <p className="text-base font-semibold text-slate-900">
                      {previewData.nama || "-"}
                    </p>
                  </div>
                  {/* Anda bisa menambahkan field lain dari API di sini, contoh: Tanggal Dibuat dll */}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500">
                  <AlertTriangle
                    size={32}
                    className="mx-auto mb-3 text-amber-500 opacity-50"
                  />
                  <p>Data tidak ditemukan atau gagal dimuat.</p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                onClick={closePreviewModal}
                className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL TAMBAH DATA (CREATE)
      ========================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">
                Tambah Kategori Indikator
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="kodeAdd"
                    className="block text-sm font-semibold text-slate-700 mb-1.5"
                  >
                    Kode Kategori
                  </label>
                  <input
                    type="text"
                    id="kodeAdd"
                    value={addForm.kode}
                    onChange={(e) =>
                      setAddForm({ ...addForm, kode: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2D7344]/20 focus:border-[#2D7344] transition-all"
                    placeholder="Masukkan kode..."
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="namaAdd"
                    className="block text-sm font-semibold text-slate-700 mb-1.5"
                  >
                    Nama Kategori
                  </label>
                  <input
                    type="text"
                    id="namaAdd"
                    value={addForm.nama}
                    onChange={(e) =>
                      setAddForm({ ...addForm, nama: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2D7344]/20 focus:border-[#2D7344] transition-all"
                    placeholder="Masukkan nama kategori..."
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  disabled={createCategoryMutation.isLoading}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createCategoryMutation.isLoading}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#2D7344] hover:bg-[#235c36] rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {createCategoryMutation.isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
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
          MODAL EDIT
      ========================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">
                Edit Kategori Indikator
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="kodeEdit"
                    className="block text-sm font-semibold text-slate-700 mb-1.5"
                  >
                    Kode Kategori
                  </label>
                  <input
                    type="text"
                    id="kodeEdit"
                    value={editForm.kode}
                    onChange={(e) =>
                      setEditForm({ ...editForm, kode: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2D7344]/20 focus:border-[#2D7344] transition-all"
                    placeholder="Masukkan kode..."
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="namaEdit"
                    className="block text-sm font-semibold text-slate-700 mb-1.5"
                  >
                    Nama Kategori
                  </label>
                  <input
                    type="text"
                    id="namaEdit"
                    value={editForm.nama}
                    onChange={(e) =>
                      setEditForm({ ...editForm, nama: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2D7344]/20 focus:border-[#2D7344] transition-all"
                    placeholder="Masukkan nama kategori..."
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  disabled={updateCategoryMutation.isLoading}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={updateCategoryMutation.isLoading}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#2D7344] hover:bg-[#235c36] rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {updateCategoryMutation.isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
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
          MODAL DELETE (WARNING)
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
                disabled={deleteCategoryMutation.isLoading}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteCategoryMutation.isLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {deleteCategoryMutation.isLoading ? (
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

export default Indikator;
