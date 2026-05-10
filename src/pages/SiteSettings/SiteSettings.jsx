import React, { useState, useRef } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { siteSettingService } from "../../services/auth/siteSettingService";
import {
  Settings2,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  X,
  ImageIcon,
  Tag,
  AlignLeft,
  FolderOpen,
  Key,
  Search,
  CheckSquare,
  Square,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// ─────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────
const CATEGORIES = [
  { value: "all", label: "Semua" },
  { value: "general", label: "General" },
  { value: "hero", label: "Hero" },
  { value: "profil_desa_hutan", label: "Profil Desa Hutan" },
  { value: "features", label: "Features" },
];

const CATEGORY_BADGE = {
  general: "bg-purple-50 text-purple-700 border-purple-200",
  hero: "bg-blue-50 text-blue-700 border-blue-200",
  profil_desa_hutan: "bg-emerald-50 text-emerald-700 border-emerald-200",
  features: "bg-amber-50 text-amber-700 border-amber-200",
};

const EMPTY_FORM = { category: "", key: "", value: "", image: null };

// ─────────────────────────────────────────────────────
// MODAL FORM COMPONENT
// ─────────────────────────────────────────────────────
const SettingModal = ({ mode, initialData, onClose, onSubmit, isPending }) => {
  const [form, setForm] = useState(
    mode === "edit"
      ? { category: initialData.category, key: initialData.key, value: initialData.value ?? "", image: null }
      : EMPTY_FORM
  );
  const [preview, setPreview] = useState(initialData?.image_url || null);
  const fileInputRef = useRef(null);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm((f) => ({ ...f, image: file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setForm((f) => ({ ...f, image: null }));
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.category.trim() || !form.key.trim()) {
      toast.error("Category dan Key wajib diisi.");
      return;
    }
    const fd = new FormData();
    fd.append("category", form.category.trim());
    fd.append("key", form.key.trim());
    fd.append("value", form.value.trim());
    if (form.image) fd.append("image", form.image);
    onSubmit(fd);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between rounded-t-2xl ${mode === "edit" ? "bg-blue-50 text-blue-800" : "bg-emerald-50 text-emerald-800"}`}>
          <div className="flex items-center gap-3">
            <Settings2 size={20} />
            <div>
              <h3 className="text-lg font-bold">{mode === "edit" ? "Edit Site Setting" : "Tambah Site Setting"}</h3>
              {mode === "edit" && <p className="text-xs opacity-70">Key: {initialData.key}</p>}
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-black/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FolderOpen size={13} /> Category <span className="text-red-400">*</span>
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-gray-50 cursor-pointer"
              required
            >
              <option value="">-- Pilih Category --</option>
              {CATEGORIES.filter((c) => c.value !== "all").map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Key */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Key size={13} /> Key <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="key"
              value={form.key}
              onChange={handleChange}
              placeholder="contoh: hero_headline_normal"
              disabled={mode === "edit"}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed font-mono"
              required
            />
            {mode === "edit" && (
              <p className="text-[11px] text-gray-400 mt-1">Key tidak dapat diubah setelah dibuat.</p>
            )}
          </div>

          {/* Value */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <AlignLeft size={13} /> Value (teks)
            </label>
            <textarea
              name="value"
              value={form.value}
              onChange={handleChange}
              placeholder="Isi nilai teks di sini..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-gray-50 resize-none"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <ImageIcon size={13} /> Gambar (opsional)
            </label>
            {preview ? (
              <div className="relative rounded-xl border border-gray-200 overflow-hidden">
                <img src={preview} alt="Preview" className="w-full h-40 object-contain bg-gray-50" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 cursor-pointer hover:border-emerald-400 hover:text-emerald-500 hover:bg-emerald-50/30 transition-all"
              >
                <ImageIcon size={28} />
                <p className="text-xs font-medium">Klik untuk upload gambar</p>
                <p className="text-[10px]">JPG, PNG, WebP — maks. 5MB</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
              onChange={handleFile}
              className="hidden"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 rounded-b-2xl flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-5 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-bold transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className={`flex items-center gap-2 px-5 py-2 text-white rounded-lg text-sm font-bold transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed ${mode === "edit" ? "bg-blue-600 hover:bg-blue-700" : "bg-[#2D7344] hover:bg-[#1E5230]"}`}
          >
            {isPending ? (
              <><Loader2 size={16} className="animate-spin" /> Menyimpan...</>
            ) : mode === "edit" ? "Simpan Perubahan" : "Tambah Setting"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────
const SiteSettings = () => {
  const queryClient = useQueryClient();

  // ── State ──
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [modalMode, setModalMode] = useState(null); // null | "add" | "edit"
  const [editTarget, setEditTarget] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [confirmBulk, setConfirmBulk] = useState(false);

  // ── Fetch ──
  const { data: settings = [], isLoading, isError, error } = useQuery({
    queryKey: ["siteSettings"],
    queryFn: siteSettingService.getAll,
  });

  // ── Filter ──
  const filtered = settings.filter((s) => {
    const matchCat = activeCategory === "all" || s.category === activeCategory;
    const q = search.toLowerCase();
    const matchSearch = !q || s.key.toLowerCase().includes(q) || (s.value || "").toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  // ── Mutations ──
  const createMutation = useMutation({
    mutationFn: (fd) => siteSettingService.create(fd),
    onSuccess: () => {
      toast.success("Site setting berhasil ditambahkan!");
      queryClient.invalidateQueries({ queryKey: ["siteSettings"] });
      queryClient.invalidateQueries({ queryKey: ["siteSettings", "hero"] });
      queryClient.invalidateQueries({ queryKey: ["siteSettings", "profil_desa_hutan"] });
      queryClient.invalidateQueries({ queryKey: ["siteSettings", "features"] });
      queryClient.invalidateQueries({ queryKey: ["siteSettings", "general"] });
      setModalMode(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Gagal menambahkan setting."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, fd }) => siteSettingService.update(id, fd),
    onSuccess: () => {
      toast.success("Site setting berhasil diupdate!");
      queryClient.invalidateQueries({ queryKey: ["siteSettings"] });
      queryClient.invalidateQueries({ queryKey: ["siteSettings", editTarget?.category] });
      setModalMode(null);
      setEditTarget(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Gagal mengupdate setting."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => siteSettingService.delete(id),
    onSuccess: () => {
      toast.success("Site setting berhasil dihapus.");
      queryClient.invalidateQueries({ queryKey: ["siteSettings"] });
      setConfirmDeleteId(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Gagal menghapus setting."),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids) => siteSettingService.bulkDelete(ids),
    onSuccess: () => {
      toast.success(`${selectedIds.length} setting berhasil dihapus.`);
      queryClient.invalidateQueries({ queryKey: ["siteSettings"] });
      setSelectedIds([]);
      setConfirmBulk(false);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Gagal bulk delete."),
  });

  // ── Handlers ──
  const openEdit = (setting) => {
    setEditTarget(setting);
    setModalMode("edit");
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((s) => s.id));
    }
  };

  const allSelected = filtered.length > 0 && selectedIds.length === filtered.length;

  return (
    <DashboardLayout activeMenu="Site Settings">
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#FAFBFC]">
        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8 custom-scrollbar">

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Site Settings</h1>
            <p className="text-sm text-gray-500 mt-1">
              Kelola konten dinamis landing page — teks, gambar, dan konfigurasi tampilan situs.
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 flex flex-col">

            {/* Toolbar */}
            <div className="p-6 border-b border-gray-50 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-[#2D7344] shrink-0">
                  <Settings2 size={20} />
                </div>
                <h2 className="text-lg font-bold text-gray-800 hidden sm:block">Tabel Site Settings</h2>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari key atau value..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-gray-50"
                  />
                </div>

                {/* Bulk Delete */}
                {selectedIds.length > 0 && (
                  <button
                    onClick={() => setConfirmBulk(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap"
                  >
                    <Trash2 size={16} /> Hapus ({selectedIds.length})
                  </button>
                )}

                {/* Tambah */}
                <button
                  onClick={() => setModalMode("add")}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#2D7344] hover:bg-[#1E5230] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm whitespace-nowrap"
                >
                  <Plus size={18} strokeWidth={2.5} /> Tambah Setting
                </button>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="px-6 pt-4 flex gap-2 flex-wrap border-b border-gray-50 pb-4">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    activeCategory === cat.value
                      ? "bg-[#2D7344] text-white border-[#2D7344] shadow-sm"
                      : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  {cat.label}
                  {cat.value !== "all" && (
                    <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      activeCategory === cat.value ? "bg-white/20" : "bg-gray-200 text-gray-500"
                    }`}>
                      {settings.filter((s) => s.category === cat.value).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-[11px] uppercase tracking-wider font-bold text-gray-500">
                    <th className="py-4 px-4 w-10">
                      <button onClick={toggleSelectAll} className="text-gray-400 hover:text-gray-700 transition-colors">
                        {allSelected ? <CheckSquare size={16} className="text-[#2D7344]" /> : <Square size={16} />}
                      </button>
                    </th>
                    <th className="py-4 px-4 w-12 text-center">No</th>
                    <th className="py-4 px-4">Category</th>
                    <th className="py-4 px-4">Key</th>
                    <th className="py-4 px-4 min-w-[260px]">Value / Gambar</th>
                    <th className="py-4 px-4 text-center w-32">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium text-gray-700">
                  {isLoading ? (
                    <tr>
                      <td colSpan="6" className="py-16 text-center">
                        <div className="flex flex-col items-center gap-2 text-gray-400">
                          <Loader2 size={30} className="animate-spin text-[#2D7344]" />
                          <p className="text-sm">Memuat data...</p>
                        </div>
                      </td>
                    </tr>
                  ) : isError ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-red-500 bg-red-50/50">
                        {error?.response?.data?.message || "Gagal memuat data. Coba refresh."}
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-16 text-center">
                        <div className="flex flex-col items-center gap-2 text-gray-300">
                          <Settings2 size={40} />
                          <p className="text-gray-400 font-medium">Tidak ada data</p>
                          <p className="text-xs text-gray-300">
                            {search ? `Tidak ditemukan untuk "${search}"` : "Belum ada site setting."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((setting, index) => (
                      <tr
                        key={setting.id}
                        className={`border-b border-gray-50/80 hover:bg-[#F9FBFA] transition-colors group ${selectedIds.includes(setting.id) ? "bg-emerald-50/40" : ""}`}
                      >
                        {/* Checkbox */}
                        <td className="py-4 px-4">
                          <button
                            onClick={() => toggleSelect(setting.id)}
                            className="text-gray-300 hover:text-gray-600 transition-colors"
                          >
                            {selectedIds.includes(setting.id) ? (
                              <CheckSquare size={16} className="text-[#2D7344]" />
                            ) : (
                              <Square size={16} />
                            )}
                          </button>
                        </td>

                        {/* No */}
                        <td className="py-4 px-4 text-gray-400 font-semibold text-center text-xs">
                          {index + 1}
                        </td>

                        {/* Category Badge */}
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${CATEGORY_BADGE[setting.category] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                            {setting.category}
                          </span>
                        </td>

                        {/* Key */}
                        <td className="py-4 px-4 font-mono text-xs text-gray-700 font-semibold">
                          {setting.key}
                        </td>

                        {/* Value / Image */}
                        <td className="py-4 px-4 max-w-[300px]">
                          {setting.image_url ? (
                            <div className="flex items-center gap-3">
                              <img
                                src={setting.image_url}
                                alt={setting.key}
                                className="w-10 h-10 rounded-lg object-cover border border-gray-100 shadow-sm"
                              />
                              <a
                                href={setting.image_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-blue-500 hover:underline truncate max-w-[180px] block"
                              >
                                Lihat Gambar
                              </a>
                            </div>
                          ) : setting.value ? (
                            <p className="text-xs text-gray-600 leading-relaxed truncate max-w-[280px]" title={setting.value}>
                              {setting.value}
                            </p>
                          ) : (
                            <span className="text-xs text-gray-300 italic">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEdit(setting)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                              title="Edit"
                            >
                              <Edit2 size={15} strokeWidth={2} />
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(setting.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                              title="Hapus"
                            >
                              <Trash2 size={15} strokeWidth={2} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer count */}
            {!isLoading && filtered.length > 0 && (
              <div className="px-6 py-3 border-t border-gray-50 text-xs text-gray-400">
                Menampilkan {filtered.length} dari {settings.length} data
                {selectedIds.length > 0 && (
                  <span className="ml-2 text-[#2D7344] font-semibold">· {selectedIds.length} dipilih</span>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ─────────────────────────────────────────────── */}
      {/* MODAL TAMBAH / EDIT                            */}
      {/* ─────────────────────────────────────────────── */}
      {modalMode === "add" && (
        <SettingModal
          mode="add"
          initialData={{}}
          onClose={() => setModalMode(null)}
          onSubmit={(fd) => createMutation.mutate(fd)}
          isPending={createMutation.isPending}
        />
      )}

      {modalMode === "edit" && editTarget && (
        <SettingModal
          mode="edit"
          initialData={editTarget}
          onClose={() => { setModalMode(null); setEditTarget(null); }}
          onSubmit={(fd) => updateMutation.mutate({ id: editTarget.id, fd })}
          isPending={updateMutation.isPending}
        />
      )}

      {/* ─────────────────────────────────────────────── */}
      {/* KONFIRMASI HAPUS SINGLE                        */}
      {/* ─────────────────────────────────────────────── */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Hapus Setting?</h3>
                <p className="text-xs text-gray-500">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setConfirmDeleteId(null)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-bold"
              >
                Batal
              </button>
              <button
                onClick={() => deleteMutation.mutate(confirmDeleteId)}
                disabled={deleteMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold disabled:opacity-70"
              >
                {deleteMutation.isPending ? <><Loader2 size={14} className="animate-spin" /> Menghapus...</> : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────── */}
      {/* KONFIRMASI BULK DELETE                         */}
      {/* ─────────────────────────────────────────────── */}
      {confirmBulk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Hapus {selectedIds.length} Setting?</h3>
                <p className="text-xs text-gray-500">Semua data yang dipilih akan dihapus permanen.</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setConfirmBulk(false)}
                disabled={bulkDeleteMutation.isPending}
                className="px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-bold"
              >
                Batal
              </button>
              <button
                onClick={() => bulkDeleteMutation.mutate(selectedIds)}
                disabled={bulkDeleteMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold disabled:opacity-70"
              >
                {bulkDeleteMutation.isPending ? <><Loader2 size={14} className="animate-spin" /> Menghapus...</> : `Hapus ${selectedIds.length} Data`}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default SiteSettings;
