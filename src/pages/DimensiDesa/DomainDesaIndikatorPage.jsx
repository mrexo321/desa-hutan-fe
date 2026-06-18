import React, { useState, useEffect } from "react";
import {
  Calendar,
  Plus,
  ChevronRight,
  ArrowLeft,
  Trash2,
  Download,
  Upload,
  Loader2,
  Award,
  ListPlus,
  Check,
  HelpCircle,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { dimensiDesaService } from "../../services/master/dimensiDesaService";
import { indikatorService } from "../../services/master/indikatorService";
import { usePermission } from "../../hooks/usePermission";

export default function DomainDesaIndikatorPage() {
  const { can } = usePermission();
  // State Halaman
  const [selectedTahun, setSelectedTahun] = useState(null); // Menyimpan objek tahun terpilih

  // State Tahun
  const [tahunList, setTahunList] = useState([]);
  const [loadingTahun, setLoadingTahun] = useState(false);
  const [modalTahunOpen, setModalTahunOpen] = useState(false);
  const [newTahun, setNewTahun] = useState("");

  // State Konfigurasi Indikator
  const [schemaIndikator, setSchemaIndikator] = useState([]);
  const [loadingIndikator, setLoadingIndikator] = useState(false);

  // State Master Kategori (Untuk Dropdown Tambah Indikator)
  const [masterKategori, setMasterKategori] = useState([]);
  const [selectedKategoriId, setSelectedKategoriId] = useState("");
  const [addingIndikator, setAddingIndikator] = useState(false);

  // State Excel Upload
  const [uploadingExcel, setUploadingExcel] = useState(false);

  // ==================== FETCH DATA ====================
  const fetchTahunList = async () => {
    setLoadingTahun(true);
    try {
      const res = await dimensiDesaService.getTahun();
      const list = res?.data?.rows || res?.data || res || [];
      // Sort descending by year
      const sortedList = [...list].sort((a, b) => b.tahun - a.tahun);
      setTahunList(sortedList);
    } catch (err) {
      toast.error("Gagal memuat daftar tahun dimensi");
    } finally {
      setLoadingTahun(false);
    }
  };

  const fetchSchemaIndikator = async (tahun) => {
    setLoadingIndikator(true);
    try {
      const res = await dimensiDesaService.getIndikatorByTahun(tahun);
      const data = res?.data?.[0]?.dimensiIndikator || res?.data || res || [];
      setSchemaIndikator(data);
    } catch (err) {
      toast.error(`Gagal memuat indikator tahun ${tahun}`);
    } finally {
      setLoadingIndikator(false);
    }
  };

  const fetchMasterKategori = async () => {
    try {
      const res = await indikatorService.getAllCategoryIndicator();
      const list = res?.data?.rows || res?.data || res || [];
      setMasterKategori(list);
    } catch (err) {
      toast.error("Gagal mengambil daftar master kategori indikator");
    }
  };

  useEffect(() => {
    fetchTahunList();
    fetchMasterKategori();
  }, []);

  // ==================== HANDLER TAHUN ====================
  const handleCreateTahun = async (e) => {
    e.preventDefault();
    if (!newTahun || isNaN(newTahun)) {
      toast.warning("Tahun harus berupa angka valid");
      return;
    }
    const yearVal = parseInt(newTahun);
    if (yearVal < 1900 || yearVal > 2100) {
      toast.warning("Masukkan tahun yang valid (1900 - 2100)");
      return;
    }
    try {
      await dimensiDesaService.createTahun({ tahun: yearVal });
      toast.success(`Berhasil menambahkan tahun dimensi ${newTahun}`);
      setNewTahun("");
      setModalTahunOpen(false);
      fetchTahunList();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menambahkan tahun");
    }
  };

  // ==================== HANDLER INDIKATOR ====================
  const handleAddIndikator = async () => {
    if (!selectedKategoriId) {
      toast.warning("Silakan pilih indikator terlebih dahulu");
      return;
    }
    setAddingIndikator(true);
    try {
      await dimensiDesaService.addIndikator(selectedTahun.tahun, {
        kategoriIndikatorId: selectedKategoriId,
      });
      toast.success("Indikator berhasil ditambahkan ke tahun ini");
      setSelectedKategoriId("");
      fetchSchemaIndikator(selectedTahun.tahun);
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menambahkan indikator");
    } finally {
      setAddingIndikator(false);
    }
  };

  const handleRemoveIndikator = async (kategoriId, nama) => {
    if (
      window.confirm(
        `Apakah Anda yakin ingin menghapus indikator "${nama}" dari skema tahun ini?`
      )
    ) {
      try {
        await dimensiDesaService.removeIndikator(selectedTahun.tahun, [kategoriId]);
        toast.success(`Berhasil menghapus indikator ${nama}`);
        fetchSchemaIndikator(selectedTahun.tahun);
      } catch (err) {
        toast.error(err.response?.data?.message || "Gagal menghapus indikator");
      }
    }
  };

  // ==================== HANDLER EXCEL ====================
  const handleDownloadTemplate = async () => {
    if (schemaIndikator.length === 0) {
      toast.warning("Daftarkan minimal 1 indikator sebelum mengunduh template!");
      return;
    }
    const toastId = toast.loading("Menyiapkan berkas template Excel...");
    try {
      const response = await dimensiDesaService.downloadTemplate(selectedTahun.tahun);
      const blob = response.data || response;
      const url = window.URL.createObjectURL(
        new Blob([blob], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        })
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = `Template_Data_Domain_Desa_${selectedTahun.tahun}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Template berhasil diunduh!", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengunduh template Excel", { id: toastId });
    }
  };

  const handleUploadExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("tahun", selectedTahun.tahun.toString());

    setUploadingExcel(true);
    const toastId = toast.loading("Mengunggah berkas Excel...");
    try {
      const res = await dimensiDesaService.uploadExcel(formData);
      toast.success(
        res.message || "File Excel berhasil diproses & data disimpan!",
        { id: toastId }
      );
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Gagal mengunggah berkas Excel",
        { id: toastId }
      );
    } finally {
      setUploadingExcel(false);
      e.target.value = null; // reset file input
    }
  };

  // Switch ke Detail View
  const handleSelectTahun = (item) => {
    setSelectedTahun(item);
    fetchSchemaIndikator(item.tahun);
  };

  return (
    <div className="w-full text-slate-800 animate-in fade-in duration-300">
      {/* ================= TAMPILAN 1: DAFTAR TAHUN DIMENSI ================= */}
      {!selectedTahun ? (
        <div>
          {/* Toolbar */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-[#2D7344] shrink-0 border border-emerald-100/50">
                <Award size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-800">
                  Dimensi & Indikator Desa
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  Atur skema kolom indikator dinamis per tahun sebelum mengupload nilai desa
                </p>
              </div>
            </div>
            {can('dimensi_desa:create') && (
              <button
                onClick={() => setModalTahunOpen(true)}
                className="flex items-center gap-2 bg-[#2D7344] hover:bg-[#1E5230] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all transform hover:-translate-y-0.5"
              >
                <Plus size={18} strokeWidth={2.5} /> Daftarkan Tahun
              </button>
            )}
          </div>

          {/* List Grid */}
          {loadingTahun ? (
            <div className="flex flex-col justify-center items-center py-24 bg-white rounded-2xl border border-slate-200 min-h-[300px]">
              <Loader2 className="animate-spin text-[#2D7344] mb-3" size={36} />
              <span className="text-slate-500 text-sm font-medium">
                Memuat tahun dimensi...
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tahunList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectTahun(item)}
                  className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-[#2D7344]/40 hover:shadow-md transition-all duration-300 cursor-pointer group flex justify-between items-center relative"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3.5 bg-emerald-50 rounded-2xl text-[#2D7344] border border-emerald-100/50 group-hover:bg-[#2D7344] group-hover:text-white transition-colors duration-300">
                      <Calendar size={22} strokeWidth={2.2} />
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-800">
                        Tahun {item.tahun}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        Atur skema & unggah excel
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    size={18}
                    className="text-slate-400 group-hover:translate-x-1 group-hover:text-[#2D7344] transition-all"
                  />
                </div>
              ))}

              {tahunList.length === 0 && (
                <div className="col-span-full bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center text-slate-400 font-medium">
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-400 mb-3">
                    <Info size={24} />
                  </div>
                  <h3>Belum Ada Tahun Dimensi</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Klik tombol "Daftarkan Tahun" di kanan atas untuk membuat skema tahun pertama.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        // ================= TAMPILAN 2: DETAIL SKEMA INDIKATOR & EXCEL =================
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Back & Title */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedTahun(null)}
                className="p-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl transition-all cursor-pointer shadow-sm"
                title="Kembali ke Daftar Tahun"
              >
                <ArrowLeft size={18} strokeWidth={2.5} />
              </button>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-lg font-extrabold text-slate-800">
                    Dimensi Desa Tahun {selectedTahun.tahun}
                  </h2>
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-[#2D7344] border border-emerald-100/50 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                    Skema Aktif
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  Konfigurasi kolom indikator dan lakukan import data Excel seluruh desa
                </p>
              </div>
            </div>

            {/* Action Files */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={handleDownloadTemplate}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer w-1/2 md:w-auto"
              >
                <Download size={14} strokeWidth={2.5} /> Template Excel
              </button>
              {can('dimensi_desa:import') && (
                <label className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#2D7344] hover:bg-[#1E5230] text-white rounded-xl text-xs font-bold cursor-pointer shadow-sm transition-all w-1/2 md:w-auto">
                  {uploadingExcel ? (
                    <>
                      <Loader2 className="animate-spin" size={14} /> Memproses...
                    </>
                  ) : (
                    <>
                      <Upload size={14} strokeWidth={2.5} /> Unggah Excel
                    </>
                  )}
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleUploadExcel}
                    className="hidden"
                    disabled={uploadingExcel}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Split Grid: Left (Schema List), Right (Add Form) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Kolom Kiri: Daftar Skema Indikator Terdaftar */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3.5 mb-4 flex items-center gap-2">
                <ListPlus size={16} className="text-[#2D7344]" />
                Struktur Kolom Indikator
              </h3>

              {loadingIndikator ? (
                <div className="flex justify-center items-center py-16">
                  <Loader2 className="animate-spin text-[#2D7344]" size={36} />
                </div>
              ) : (
                <div className="space-y-3">
                  {schemaIndikator.map((item, idx) => (
                    <div
                      key={item.kategoriIndikatorId || idx}
                      className="flex justify-between items-center p-4 bg-slate-50 border border-slate-200 rounded-xl group hover:border-[#2D7344]/30 hover:shadow-xs transition-all"
                    >
                      <div>
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-600 font-mono text-[9px] font-bold rounded uppercase border border-slate-300">
                          {item.kode}
                        </span>
                        <h4 className="font-extrabold text-slate-800 text-sm mt-1.5">
                          {item.nama}
                        </h4>
                      </div>
                      {can('dimensi_desa:delete') && (
                        <button
                          onClick={() =>
                            handleRemoveIndikator(item.kategoriIndikatorId, item.nama)
                          }
                          className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                          title="Hapus dari tahun ini"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}

                  {schemaIndikator.length === 0 && (
                    <div className="bg-slate-50/50 border border-dashed border-slate-250 rounded-xl p-12 text-center text-slate-400 text-xs font-semibold leading-relaxed">
                      <Info size={24} className="mx-auto mb-2 text-slate-350" />
                      Belum ada indikator terdaftar untuk skema tahun ini.<br />
                      Silakan daftarkan indikator dari dropdown menu di sebelah kanan.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Kolom Kanan: Tambah Kategori Indikator Baru — hanya tampil jika punya izin create */}
            {can('dimensi_desa:create') && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-fit">
                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3.5 mb-4 flex items-center gap-2">
                  <Plus size={16} className="text-[#2D7344]" />
                  Tambah Indikator
                </h3>
                <p className="text-xs text-slate-450 leading-relaxed mb-5 font-semibold">
                  Pilih kategori indikator dari daftar master untuk dimasukkan sebagai struktur data di tahun {selectedTahun.tahun}.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-2 uppercase tracking-wide">
                      Pilih Kategori Indikator
                    </label>
                    <select
                      value={selectedKategoriId}
                      onChange={(e) => setSelectedKategoriId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#2D7344] focus:ring-2 focus:ring-emerald-500/10 transition-all cursor-pointer"
                    >
                      <option value="">-- Pilih Indikator --</option>
                      {masterKategori
                        .filter(
                          (mk) =>
                            !schemaIndikator.some(
                              (si) => si.kategoriIndikatorId === mk.id
                            )
                        )
                        .map((mk) => (
                          <option key={mk.id} value={mk.id}>
                            {mk.nama} ({mk.kode})
                          </option>
                        ))}
                    </select>
                  </div>

                  <button
                    onClick={handleAddIndikator}
                    disabled={addingIndikator || !selectedKategoriId}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#2D7344] hover:bg-[#1E5230] text-white rounded-xl text-xs font-bold disabled:bg-slate-150 disabled:text-slate-400 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
                  >
                    {addingIndikator ? (
                      <>
                        <Loader2 className="animate-spin" size={14} /> Menyimpan...
                      </>
                    ) : (
                      <>
                        <Check size={14} strokeWidth={2.5} /> Daftarkan Indikator
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-100 text-[10px] text-slate-400 leading-relaxed flex gap-2 font-medium">
                  <HelpCircle size={28} className="text-slate-300 flex-shrink-0" />
                  <span>
                    <strong>Penting:</strong> Menambahkan/menghapus indikator akan mengubah susunan kolom di file template Excel secara otomatis di backend.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Tambah Tahun Dimensi */}
      {modalTahunOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-lg font-extrabold text-slate-900 mb-4">
              Daftarkan Tahun Dimensi Baru
            </h2>
            <form onSubmit={handleCreateTahun} className="space-y-4">
              <div>
                <label className="block text-slate-700 text-xs font-bold mb-2 uppercase tracking-wide">
                  Tahun Dimensi
                </label>
                <input
                  type="number"
                  value={newTahun}
                  onChange={(e) => setNewTahun(e.target.value)}
                  placeholder="Contoh: 2026"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2D7344] focus:ring-2 focus:ring-emerald-500/10 transition-all font-medium text-slate-700"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalTahunOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#2D7344] hover:bg-[#1E5230] text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-emerald-800/10 cursor-pointer"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
