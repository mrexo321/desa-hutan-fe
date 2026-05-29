import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Eye, Calendar, Loader2, Search, Info } from "lucide-react";
import { desaPsnService } from "../../services/master/desaPsnService";
import { toast } from "sonner";

export default function PeriodeTab({ onSelectPeriode }) {
  const [periodes, setPeriodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [tahunInput, setTahunInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchPeriodes = async () => {
    setLoading(true);
    try {
      const response = await desaPsnService.getTahun();
      // Backend returns either { success: true, data: [...] } or direct array
      const listData = response?.data || response || [];
      // Sort periods by year descending
      const sortedData = [...listData].sort((a, b) => b.tahun - a.tahun);
      setPeriodes(sortedData);
    } catch (error) {
      console.error("Gagal memuat data periode:", error);
      toast.error("Gagal memuat data periode");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriodes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!tahunInput || isNaN(tahunInput)) {
      setErrorMsg("Tahun harus berupa angka valid");
      return;
    }

    const tahunNum = parseInt(tahunInput);
    if (tahunNum < 1900 || tahunNum > 2100) {
      setErrorMsg("Masukkan tahun yang valid (1900 - 2100)");
      return;
    }

    try {
      if (editingId) {
        await desaPsnService.updateTahun(editingId, { tahun: tahunNum });
        toast.success("Periode berhasil diperbarui");
      } else {
        await desaPsnService.createTahun({ tahun: tahunNum });
        toast.success("Periode baru berhasil ditambahkan");
      }
      setTahunInput("");
      setEditingId(null);
      setModalOpen(false);
      fetchPeriodes();
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Terjadi kesalahan sistem");
      toast.error(error.response?.data?.message || "Terjadi kesalahan");
    }
  };

  const handleDelete = async (id, tahun) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus periode tahun ${tahun}? Semua data desa terkait periode ini akan ikut terhapus.`)) {
      try {
        await desaPsnService.deleteTahun(id);
        toast.success("Periode berhasil dihapus");
        fetchPeriodes();
      } catch (error) {
        toast.error(error.response?.data?.message || "Gagal menghapus data");
      }
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setTahunInput("");
    setErrorMsg("");
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setTahunInput(item.tahun);
    setErrorMsg("");
    setModalOpen(true);
  };

  const filteredPeriodes = periodes.filter((item) =>
    item.tahun.toString().includes(searchTerm)
  );

  return (
    <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8 custom-scrollbar">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Periode Tahun Desa PSN
          </h1>
          <p className="text-sm text-slate-500 mt-2 font-medium">
            Kelola data periode tahun untuk penandaan Desa Prioritas Sasaran Nasional (PSN).
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-[#2D7344] hover:bg-[#1E5230] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all transform hover:-translate-y-0.5"
        >
          <Plus size={18} strokeWidth={2.5} /> Tambah Periode
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80 group">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#2D7344] transition-colors"
            size={16}
          />
          <input
            type="text"
            placeholder="Cari tahun periode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2D7344] focus:ring-2 focus:ring-emerald-500/10 transition-all font-medium text-slate-700"
          />
        </div>
        <div className="flex-1 text-right text-xs text-slate-400 font-semibold">
          Total: {filteredPeriodes.length} Periode
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col justify-center items-center py-24 bg-white rounded-2xl shadow-sm border border-slate-200 min-h-[400px]">
          <Loader2 className="animate-spin text-[#2D7344] mb-3" size={40} />
          <span className="text-slate-500 text-sm font-medium">Memuat data periode...</span>
        </div>
      ) : (
        <>
          {filteredPeriodes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPeriodes.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-[#2D7344]/40 hover:shadow-md transition-all duration-300 flex flex-col group relative"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-emerald-50 text-[#2D7344] rounded-2xl border border-emerald-100/50 group-hover:bg-[#2D7344] group-hover:text-white transition-colors duration-300">
                      <Calendar size={22} strokeWidth={2.2} />
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-2 text-slate-400 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 size={15} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.tahun)}
                        className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                        title="Hapus"
                      >
                        <Trash2 size={15} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-extrabold text-slate-900 mb-3">
                    Tahun {item.tahun}
                  </h3>
                  {/* <span className="text-xs text-slate-400 font-mono font-medium mb-5 block">
                    ID: {item.id.substring(0, 8)}...
                  </span> */}

                  <button
                    onClick={() => onSelectPeriode(item)}
                    className="w-full mt-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-[#2D7344] text-[#2D7344] hover:text-white rounded-xl text-xs font-bold border border-slate-200 hover:border-transparent transition-all duration-300 cursor-pointer shadow-sm"
                  >
                    <Eye size={15} strokeWidth={2.5} /> Lihat Desa PSN
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-slate-200">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                <Info size={28} />
              </div>
              <h3 className="text-lg font-bold text-slate-700">Tidak Ada Data Periode</h3>
              <p className="text-slate-500 mt-1 max-w-sm">
                Belum ada data periode tahun terdaftar. Silakan klik tombol "Tambah Periode" untuk membuat baru.
              </p>
            </div>
          )}
        </>
      )}

      {/* Modal CRUD */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-lg font-extrabold text-slate-900 mb-4">
              {editingId ? "Edit Periode" : "Tambah Periode Baru"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-700 text-xs font-bold mb-2 uppercase tracking-wider">
                  Tahun Periode
                </label>
                <input
                  type="number"
                  value={tahunInput}
                  onChange={(e) => setTahunInput(e.target.value)}
                  placeholder="Contoh: 2025"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2D7344] focus:ring-2 focus:ring-emerald-500/10 transition-all font-medium text-slate-700"
                  autoFocus
                />
                {errorMsg && (
                  <p className="text-red-500 text-xs mt-2 font-semibold">
                    {errorMsg}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#2D7344] hover:bg-[#1E5230] text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-emerald-800/10 cursor-pointer"
                >
                  {editingId ? "Simpan Perubahan" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
