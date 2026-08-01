import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { situsTerkaitService } from "../../services/master/situsTerkaitService";
import environment from "../../config/environment";
import {
  Globe,
  Plus,
  Search,
  Edit3,
  Trash2,
  ExternalLink,
  RefreshCw,
  Image as ImageIcon,
  Loader2,
  X,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Link2,
  Calendar,
  Layers,
} from "lucide-react";

/**
 * Helper untuk menyusun URL gambar logo dari path relatif / uploads
 */
const resolveImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const baseUrl = environment.API_URL || "http://localhost:3001";
  const cleanBase = baseUrl.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
};

/**
 * Formatter tanggal lokal Indonesia
 */
const formatDate = (dateString) => {
  if (!dateString) return "-";
  try {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return dateString;
  }
};

export function ManajemenSitusContent() {
  const queryClient = useQueryClient();

  // ── STATE MANAJEMEN ──
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // ID atau 'bulk'
  const [previewImage, setPreviewImage] = useState(null); // Lightbox modal

  // ── STATE FORM ──
  const [formData, setFormData] = useState({
    nama: "",
    url: "",
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  // ── FETCH DATA ──
  const {
    data: rawData = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["situsTerkait"],
    queryFn: async () => {
      const res = await situsTerkaitService.getAll();
      return res?.data || res || [];
    },
  });

  // Ensure data is array
  const situsList = useMemo(() => {
    return Array.isArray(rawData) ? rawData : [];
  }, [rawData]);

  // Filtered List based on Search
  const filteredList = useMemo(() => {
    if (!search.trim()) return situsList;
    const query = search.toLowerCase();
    return situsList.filter(
      (item) =>
        item.nama?.toLowerCase().includes(query) ||
        item.url?.toLowerCase().includes(query)
    );
  }, [situsList, search]);

  // ── MUTATIONS ──
  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (data) => situsTerkaitService.create(data),
    onSuccess: () => {
      toast.success("Situs terkait berhasil ditambahkan!");
      queryClient.invalidateQueries(["situsTerkait"]);
      closeFormModal();
    },
    onError: (err) => {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Gagal menambahkan situs terkait.";
      toast.error(msg);
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => situsTerkaitService.update(id, data),
    onSuccess: () => {
      toast.success("Situs terkait berhasil diperbarui!");
      queryClient.invalidateQueries(["situsTerkait"]);
      closeFormModal();
    },
    onError: (err) => {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Gagal mengedit situs terkait.";
      toast.error(msg);
    },
  });

  // Delete Mutation (Single)
  const deleteMutation = useMutation({
    mutationFn: (id) => situsTerkaitService.delete(id),
    onSuccess: () => {
      toast.success("Situs terkait berhasil dihapus!");
      queryClient.invalidateQueries(["situsTerkait"]);
      setDeleteTarget(null);
      setSelectedIds((prev) => prev.filter((i) => i !== deleteTarget));
    },
    onError: (err) => {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Gagal menghapus situs terkait.";
      toast.error(msg);
    },
  });

  // Bulk Delete Mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: (ids) => situsTerkaitService.bulkDelete(ids),
    onSuccess: () => {
      toast.success(`${selectedIds.length} situs terkait berhasil dihapus!`);
      queryClient.invalidateQueries(["situsTerkait"]);
      setSelectedIds([]);
      setDeleteTarget(null);
    },
    onError: (err) => {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Gagal menghapus banyak data situs terkait.";
      toast.error(msg);
    },
  });

  // ── HANDLERS MODAL & FORM ──
  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({ nama: "", url: "" });
    setLogoFile(null);
    setLogoPreview(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      nama: item.nama || "",
      url: item.url || "",
    });
    setLogoFile(null);
    setLogoPreview(resolveImageUrl(item.logo));
    setIsModalOpen(true);
  };

  const closeFormModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({ nama: "", url: "" });
    setLogoFile(null);
    setLogoPreview(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ukuran file logo maksimal 5MB!");
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();

    if (!formData.nama.trim()) {
      toast.error("Nama situs tidak boleh kosong!");
      return;
    }
    if (!formData.url.trim()) {
      toast.error("URL situs tidak boleh kosong!");
      return;
    }
    if (!editingItem && !logoFile) {
      toast.error("File logo wajib diunggah untuk situs baru!");
      return;
    }

    const payload = new FormData();
    payload.append("nama", formData.nama.trim());
    payload.append("url", formData.url.trim());
    if (logoFile) {
      payload.append("logo", logoFile);
    }

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const confirmDeleteAction = () => {
    if (deleteTarget === "bulk") {
      if (selectedIds.length === 0) return;
      bulkDeleteMutation.mutate(selectedIds);
    } else if (deleteTarget) {
      deleteMutation.mutate(deleteTarget);
    }
  };

  // Checkbox Selection Helpers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredList.map((item) => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectItem = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const isAllSelected =
    filteredList.length > 0 && selectedIds.length === filteredList.length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
        {/* ── HEADER BANNER ── */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#0B241A] via-[#123E2E] to-[#1C5842] rounded-3xl p-6 sm:p-8 text-white shadow-xl">
          {/* Background Decorative Element */}
          <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute right-20 top-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2">
                <Globe size={16} />
                <span>Pengaturan Data &amp; Integrasi</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Manajemen Situs Terkait
              </h1>
              <p className="text-emerald-100/80 text-sm mt-1.5 max-w-2xl font-medium leading-relaxed">
                Kelola daftar tautan resmi situs yang akan ditampilkan pada beranda situs publik.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => refetch()}
                disabled={isRefetching}
                className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all border border-white/10 flex items-center justify-center cursor-pointer active:scale-95"
                title="Refresh Data"
              >
                <RefreshCw
                  size={18}
                  className={isRefetching ? "animate-spin text-emerald-300" : ""}
                />
              </button>

              <button
                onClick={openCreateModal}
                className="flex-1 sm:flex-initial px-5 py-3 bg-[#00C47C] hover:bg-[#00B06F] text-white font-extrabold rounded-2xl text-sm transition-all shadow-lg shadow-[#00C47C]/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Plus size={18} strokeWidth={2.5} />
                <span>Tambah Situs Baru</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── METRIC STATS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
              <Globe size={22} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Situs Terkait</div>
              <div className="text-2xl font-extrabold text-slate-800">{situsList.length}</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
              <Layers size={22} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hasil Pencarian</div>
              <div className="text-2xl font-extrabold text-slate-800">{filteredList.length} Item</div>
            </div>
          </div>
        </div>

        {/* ── TOOLBAR & SEARCH ── */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full sm:w-96">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama situs atau URL..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Action Bulk Delete */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
                {selectedIds.length} item terpilih
              </span>
              <button
                onClick={() => setDeleteTarget("bulk")}
                className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 font-bold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <Trash2 size={15} />
                <span>Hapus Terpilih</span>
              </button>
            </div>
          )}
        </div>

        {/* ── TABLE LIST ── */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
              <Loader2 size={36} className="animate-spin text-emerald-600" />
              <p className="text-sm font-semibold">Memuat daftar situs terkait...</p>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3 px-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                <Globe size={32} />
              </div>
              <h3 className="font-extrabold text-slate-700 text-base">Tidak Ada Data Situs Terkait</h3>
              <p className="text-xs text-slate-400 max-w-md">
                {search
                  ? `Tidak ditemukan situs terkait dengan kata kunci "${search}".`
                  : "Belum ada data situs terkait. Klik tombol 'Tambah Situs Baru' untuk menambahkan."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-500 uppercase text-[11px] font-extrabold tracking-wider border-b border-slate-200/80">
                    <th className="py-4 px-5 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                      />
                    </th>
                    <th className="py-4 px-4 w-20">Logo</th>
                    <th className="py-4 px-5">Nama Situs</th>
                    <th className="py-4 px-5">URL Tujuan</th>
                    <th className="py-4 px-5">Di input Pada</th>
                    <th className="py-4 px-5 text-right w-36">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                  {filteredList.map((item) => {
                    const isSelected = selectedIds.includes(item.id);
                    const imgUrl = resolveImageUrl(item.logo);

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-emerald-50/30 transition-colors ${
                          isSelected ? "bg-emerald-50/50" : ""
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-4 px-5 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectItem(item.id)}
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                          />
                        </td>

                        {/* Logo Preview */}
                        <td className="py-4 px-4">
                          <div
                            onClick={() => imgUrl && setPreviewImage(imgUrl)}
                            className={`w-12 h-12 rounded-xl border border-slate-200/80 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 group ${
                              imgUrl ? "cursor-pointer hover:border-emerald-500" : ""
                            }`}
                          >
                            {imgUrl ? (
                              <img
                                src={imgUrl}
                                alt={item.nama}
                                className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.style.display = "none";
                                  e.target.parentElement.innerHTML = '<div class="text-slate-400"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>';
                                }}
                              />
                            ) : (
                              <ImageIcon size={20} className="text-slate-400" />
                            )}
                          </div>
                        </td>

                        {/* Nama Situs */}
                        <td className="py-4 px-5 font-bold text-slate-800">
                          <div className="flex flex-col">
                            <span className="text-slate-900 text-sm font-extrabold">{item.nama}</span>
                          </div>
                        </td>

                        {/* URL Link */}
                        <td className="py-4 px-5">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 px-3 py-1.5 rounded-xl transition-all max-w-xs truncate"
                          >
                            <span className="truncate">{item.url}</span>
                            <ExternalLink size={13} className="shrink-0" />
                          </a>
                        </td>

                        {/* Created At */}
                        <td className="py-4 px-5 text-xs text-slate-500 font-semibold">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} className="text-slate-400" />
                            <span>{formatDate(item.created_at || item.createdAt)}</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {imgUrl && (
                              <button
                                onClick={() => setPreviewImage(imgUrl)}
                                className="p-2 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                title="Lihat Logo"
                              >
                                <Eye size={16} />
                              </button>
                            )}

                            <button
                              onClick={() => openEditModal(item)}
                              className="p-2 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                              title="Edit Situs"
                            >
                              <Edit3 size={16} />
                            </button>

                            <button
                              onClick={() => setDeleteTarget(item.id)}
                              className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Hapus Situs"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── MODAL FORM (CREATE / EDIT) ── */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                    <Globe size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-lg">
                      {editingItem ? "Edit Situs Terkait" : "Tambah Situs Terkait Baru"}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      {editingItem ? "Perbarui informasi situs atau logo" : "Isi rincian nama, URL tujuan, dan unggah logo"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={closeFormModal}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmitForm} className="space-y-5">
                {/* Input Nama Situs */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                    Nama Situs Terkait <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kementerian Kehutanan RI"
                    value={formData.nama}
                    onChange={(e) => setFormData((prev) => ({ ...prev, nama: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>

                {/* Input URL */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                    URL Tujuan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="Contoh: https://www.menhut.go.id"
                    value={formData.url}
                    onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
                  />
                </div>

                {/* File Upload Logo */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                    File Logo Gambar {editingItem ? "(Opsional)" : <span className="text-red-500">*</span>}
                  </label>

                  <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-2xl bg-slate-50/50 transition-all group relative cursor-pointer">
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    />

                    {logoPreview ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-24 h-24 rounded-2xl border border-slate-200 bg-white p-2 flex items-center justify-center shadow-sm">
                          <img
                            src={logoPreview}
                            alt="Preview Logo"
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                          {logoFile ? logoFile.name : "Logo Saat Ini (Klik untuk mengganti)"}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-center py-2">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Upload size={22} />
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-slate-700">
                            Pilih file atau seret gambar logo ke sini
                          </p>
                          <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                            Format PNG, JPG, WEBP (Maksimal 5MB)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={closeFormModal}
                    className="px-5 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-2xl text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="px-6 py-2.5 bg-[#00C47C] hover:bg-[#00B06F] text-white font-extrabold rounded-2xl text-xs transition-all shadow-md shadow-[#00C47C]/30 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <span>{editingItem ? "Simpan Perubahan" : "Tambah Situs"}</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── MODAL DELETE CONFIRMATION ── */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-center relative overflow-hidden">
              <div className="w-16 h-16 rounded-3xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
                <AlertTriangle size={32} />
              </div>

              <h3 className="font-extrabold text-slate-800 text-lg mb-2">
                Konfirmasi Hapus Situs
              </h3>

              <p className="text-slate-500 text-xs font-medium leading-relaxed mb-6">
                {deleteTarget === "bulk"
                  ? `Apakah Anda yakin ingin menghapus ${selectedIds.length} situs terkait yang dipilih secara permanen? Action ini tidak dapat dibatalkan.`
                  : "Apakah Anda yakin ingin menghapus situs terkait ini? Data situs yang dihapus tidak akan dapat diakses kembali."}
              </p>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="w-1/2 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-2xl text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>

                <button
                  onClick={confirmDeleteAction}
                  disabled={deleteMutation.isPending || bulkDeleteMutation.isPending}
                  className="w-1/2 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-2xl text-xs transition-all shadow-md shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {deleteMutation.isPending || bulkDeleteMutation.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <span>Ya, Hapus Sekarang</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── LIGHTBOX LOGO PREVIEW MODAL ── */}
        {previewImage && (
          <div
            onClick={() => setPreviewImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md cursor-pointer animate-fade-in"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-xl max-h-[80vh] bg-white rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-center border border-slate-100"
            >
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors"
              >
                <X size={18} />
              </button>

              <div className="w-full flex items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <img
                  src={previewImage}
                  alt="Logo Detail"
                  className="max-h-[60vh] max-w-full object-contain rounded-xl"
                />
              </div>
            </div>
          </div>
        )}
      </div>
  );
}

export default function ManajemenSitus() {
  return <Navigate to="/dashboard/site-settings?tab=manajemen-situs" replace />;
}
