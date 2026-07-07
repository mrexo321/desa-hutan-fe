import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { roleService } from "../../services/auth/roleService";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  ShieldCheck,
  Eye,
  ShieldAlert,
  Trash,
  Key,
  X,
  Loader2,
  Save,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import DataTable from "../../components/DataTable";

const ManajemenRole = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]); // State untuk Bulk Action
  const [deleteRoleId, setDeleteRoleId] = useState(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [roleInputs, setRoleInputs] = useState([{ name: "" }]);

  // =========================================================
  // FETCH DATA
  // =========================================================
  const {
    data: roles,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["roles"],
    queryFn: roleService.getRoles,
  });

  console.log(roles);

  // =========================================================
  // MUTASI (DELETE & BULK DELETE)
  // =========================================================
  const deleteMutation = useMutation({
    mutationFn: (id) => roleService.deleteRole(id),
    onSuccess: () => {
      toast.success("Role berhasil dihapus!");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Gagal menghapus role."),
  });

  const deleteBulkMutation = useMutation({
    // PERBAIKAN: Langsung kirim 'ids' (array) tanpa dibungkus object { ids }
    mutationFn: (ids) => roleService.deleteBulkRoles(ids),
    onSuccess: () => {
      toast.success(`${selectedIds.length} Role berhasil dihapus!`);
      setSelectedIds([]);
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (err) => {
      console.error(err);
      const data = err?.response?.data;
      let errorMsg = data?.message || "Gagal menghapus data secara massal.";

      if (data?.errors && data.errors.length > 0) {
        errorMsg = `${errorMsg}: ${data.errors[0].message}`;
      }
      toast.error(errorMsg);
    },
  });

  const createRoleMutation = useMutation({
    mutationFn: (payload) => {
      if (payload.length === 1) {
        return roleService.createRole({ name: payload[0].name });
      } else {
        return roleService.createBulkRoles(payload);
      }
    },
    onSuccess: () => {
      toast.success("Role berhasil ditambahkan!");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setIsAddModalOpen(false);
      setRoleInputs([{ name: "" }]);
    },
    onError: (err) => {
      console.error(err);
      const data = err?.response?.data;
      let errorMsg = data?.message || "Gagal menyimpan role.";
      if (data?.errors && data.errors.length > 0) {
        errorMsg = `${errorMsg}: ${data.errors[0].message}`;
      }
      toast.error(errorMsg);
    },
  });

  // =========================================================
  // HANDLERS
  // =========================================================
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredRoles.map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const confirmDelete = (id) => {
    setDeleteRoleId(id);
  };

  const handleDeleteRole = () => {
    if (!deleteRoleId) return;
    deleteMutation.mutate(deleteRoleId);
    setDeleteRoleId(null);
  };

  const confirmBulkDelete = () => {
    setShowBulkDeleteConfirm(true);
  };

  const handleBulkDeleteRoles = () => {
    deleteBulkMutation.mutate(selectedIds);
    setShowBulkDeleteConfirm(false);
  };

  const handleAddInput = () => {
    setRoleInputs([...roleInputs, { name: "" }]);
  };

  const handleRemoveInput = (index) => {
    const updated = roleInputs.filter((_, i) => i !== index);
    setRoleInputs(updated);
  };

  const handleChangeRoleInput = (index, value) => {
    const updated = [...roleInputs];
    updated[index].name = value;
    setRoleInputs(updated);
  };

  const handleSubmitRole = (e) => {
    e.preventDefault();
    const validInputs = roleInputs.filter((r) => r.name.trim() !== "");
    if (validInputs.length === 0) {
      return toast.error("Minimal satu nama role harus diisi!");
    }
    createRoleMutation.mutate(validInputs);
  };

  // =========================================================
  // KONFIGURASI DATATABLE
  // =========================================================
  const filteredRoles = useMemo(() => {
    if (!roles) return [];
    let result = roles;
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter((role) =>
        (role.name || role.nama || "").toLowerCase().includes(lowerQuery),
      );
    }
    return result.map((role, index) => ({ ...role, _index: index + 1 }));
  }, [roles, searchQuery]);

  const isAllSelected =
    filteredRoles.length > 0 && selectedIds.length === filteredRoles.length;

  const tableColumns = [
    {
      header: (
        <input
          type="checkbox"
          checked={isAllSelected}
          onChange={handleSelectAll}
          className="w-4 h-4 text-[#2D7344] rounded border-gray-300 focus:ring-[#2D7344] cursor-pointer"
        />
      ),
      className: "w-12 text-center",
      render: (row) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(row.id)}
          onChange={() => handleSelectRow(row.id)}
          className="w-4 h-4 text-[#2D7344] rounded border-gray-300 focus:ring-[#2D7344] cursor-pointer"
        />
      ),
    },
    {
      header: "No",
      className: "w-16 text-center",
      render: (row) => (
        <div className="text-center text-gray-500 font-semibold">
          {row._index}
        </div>
      ),
    },
    {
      header: "Nama Role",
      className: "w-64",
      render: (row) => {
        const roleName = row.name || row.nama || "Tanpa Nama";
        const isSuperadmin = roleName.toLowerCase().includes("superadmin");
        return (
          <div className="flex flex-col gap-1 items-start">
            <span
              className={`font-bold ${isSuperadmin ? "text-[#2D7344]" : "text-gray-900"}`}
            >
              {roleName}
            </span>
            {isSuperadmin && (
              <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#2D7344] bg-green-50 px-2 py-0.5 rounded border border-green-100 mt-1">
                <ShieldAlert size={10} /> Full Access
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "Aksi",
      className: "text-center w-36",
      render: (row) => (
        <div className="flex items-center justify-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
          <button
            onClick={() =>
              navigate(`/dashboard/manajemen-role/assign/${row.id}`)
            }
            className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-all"
            title="Kelola Hak Akses (Permissions)"
          >
            <Key size={16} strokeWidth={2.5} />
          </button>
          <button
            onClick={() =>
              navigate(`/dashboard/manajemen-role/detail/${row.id}`)
            }
            className="p-1.5 text-gray-400 hover:text-[#0A66C2] hover:bg-blue-50 rounded-md transition-all"
            title="Lihat Detail"
          >
            <Eye size={16} strokeWidth={2} />
          </button>
          <button
            onClick={() => navigate(`/dashboard/manajemen-role/edit/${row.id}`)}
            className="p-1.5 text-gray-400 hover:text-[#2D7344] hover:bg-[#EAFBF0] rounded-md transition-all"
            title="Edit"
          >
            <Edit2 size={16} strokeWidth={2} />
          </button>
          <button
            onClick={() => confirmDelete(row.id)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
            title="Hapus"
          >
            <Trash2 size={16} strokeWidth={2} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout activeMenu="Manajemen Role">
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#FAFBFC]">
        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8 custom-scrollbar">
          {/* HEADER */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Manajemen Roles
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Kelola tingkat otorisasi dan daftar hak akses untuk setiap peran.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 flex flex-col">
            <div className="p-6 border-b border-gray-50 flex flex-col xl:flex-row justify-between gap-6">
              {/* BULK ACTION ATAU TITLE */}
              <div className="flex items-center gap-4">
                {selectedIds.length > 0 ? (
                  <div className="flex items-center gap-3 bg-red-50 px-4 py-2 rounded-lg border border-red-100">
                    <span className="text-sm font-bold text-red-700">
                      {selectedIds.length} Terpilih
                    </span>
                    <button
                      onClick={confirmBulkDelete}
                      className="flex items-center gap-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded transition-colors"
                    >
                      <Trash size={14} /> Hapus Massal
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-[#2D7344]">
                      <ShieldCheck size={20} strokeWidth={2} />
                    </div>
                    <h2 className="text-lg font-bold text-gray-800 hidden sm:block">
                      Tabel Data Roles
                    </h2>
                  </div>
                )}
              </div>

              {/* SEARCH & ADD BUTTON */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-full sm:w-64 group">
                  <Search
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2D7344] transition-colors"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Cari role..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:border-[#2D7344]"
                  />
                </div>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#2D7344] hover:bg-[#1E5230] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm cursor-pointer"
                >
                  <Plus size={18} strokeWidth={2.5} /> Tambah Role
                </button>
              </div>
            </div>

            <DataTable
              columns={tableColumns}
              data={filteredRoles}
              isLoading={isLoading}
              isError={isError}
              searchQuery={searchQuery}
              emptyMessage="Belum ada data role yang ditambahkan."
            />
          </div>
        </div>
      </main>

      {/* MODAL CONFIRMATION DELETE SINGLE */}
      {deleteRoleId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="h-1 bg-red-500" />
            <div className="p-6">
              <div className="flex items-center gap-3 text-red-500 mb-3 font-sans">
                <Trash2 size={24} />
                <h3 className="text-lg font-bold text-gray-800">Hapus Role</h3>
              </div>
              <p className="text-xs text-gray-500 font-semibold mb-6 font-sans leading-relaxed">
                Apakah Anda yakin ingin menghapus role ini? Data yang telah dihapus tidak dapat dikembalikan.
              </p>
              <div className="flex justify-end gap-3 font-sans">
                <button
                  type="button"
                  onClick={() => setDeleteRoleId(null)}
                  className="px-4 py-2.5 text-xs font-bold text-gray-600 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDeleteRole}
                  className="px-4 py-2.5 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMATION DELETE BULK */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="h-1 bg-red-500" />
            <div className="p-6">
              <div className="flex items-center gap-3 text-red-500 mb-3 font-sans">
                <Trash2 size={24} />
                <h3 className="text-lg font-bold text-gray-800">Hapus Banyak Role</h3>
              </div>
              <p className="text-xs text-gray-500 font-semibold mb-6 font-sans leading-relaxed">
                Apakah Anda yakin ingin menghapus <span className="font-extrabold text-slate-800">{selectedIds.length} role</span> yang terpilih? Operasi massal ini tidak dapat dibatalkan.
              </p>
              <div className="flex justify-end gap-3 font-sans">
                <button
                  type="button"
                  onClick={() => setShowBulkDeleteConfirm(false)}
                  className="px-4 py-2.5 text-xs font-bold text-gray-600 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleBulkDeleteRoles}
                  className="px-4 py-2.5 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Ya, Hapus Semua
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH ROLE BARU */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#F8FAFC] rounded-[32px] shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200/50 animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            {/* Emerald Header Accent */}
            <div className="h-1.5 bg-gradient-to-r from-emerald-600 to-[#10B981]" />
            
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <div>
                <span className="text-[10px] font-bold px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg uppercase tracking-wider">
                  Pengaturan Keamanan
                </span>
                <h3 className="text-xl font-bold text-slate-800 mt-1.5">
                  Tambah Peran Baru
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setRoleInputs([{ name: "" }]);
                }}
                className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-2xl transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form & Body */}
            <form onSubmit={handleSubmitRole} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-5">
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  Silakan masukkan satu atau beberapa nama role baru yang ingin ditambahkan. Anda dapat menambahkan baris input secara dinamis.
                </p>

                <div className="space-y-4">
                  {roleInputs.map((input, index) => (
                    <div key={index} className="flex items-end gap-3 animate-in slide-in-from-bottom-2 duration-200">
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider font-mono">
                          Nama Role #{index + 1}
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Contoh: Admin Desa, Petugas Lapangan"
                          value={input.name}
                          onChange={(e) => handleChangeRoleInput(index, e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-sans font-semibold text-slate-700"
                        />
                      </div>
                      {roleInputs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveInput(index)}
                          className="p-3 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors mb-[1px] cursor-pointer"
                          title="Hapus Baris"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddInput}
                  className="flex items-center gap-2 text-xs font-extrabold text-[#2D7344] hover:text-[#1E5230] mt-4 font-sans bg-emerald-50 hover:bg-emerald-100/80 px-4 py-2.5 rounded-xl border border-emerald-100/50 transition-all cursor-pointer w-fit"
                >
                  <Plus size={14} strokeWidth={3} />
                  <span>Tambah Baris Role Lain</span>
                </button>
              </div>

              {/* Footer */}
              <div className="px-8 py-5 border-t border-slate-100 flex justify-end gap-3 bg-white">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setRoleInputs([{ name: "" }]);
                  }}
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createRoleMutation.isPending}
                  className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#2D7344] hover:bg-[#1E5230] rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-sm shadow-emerald-800/10 cursor-pointer"
                >
                  {createRoleMutation.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  <span>Simpan Peran</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ManajemenRole;
