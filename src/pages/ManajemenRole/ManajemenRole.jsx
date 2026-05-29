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
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import DataTable from "../../components/DataTable";

const ManajemenRole = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]); // State untuk Bulk Action

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
    toast.warning("Yakin ingin menghapus role ini?", {
      description: "Data yang dihapus tidak dapat dikembalikan.",
      action: {
        label: "Ya, Hapus",
        onClick: () => deleteMutation.mutate(id),
      },
      cancel: { label: "Batal" },
    });
  };

  const confirmBulkDelete = () => {
    toast.error(`Yakin ingin menghapus ${selectedIds.length} role terpilih?`, {
      description: "Operasi massal ini tidak dapat dibatalkan.",
      action: {
        label: "Ya, Hapus Semua",
        onClick: () => deleteBulkMutation.mutate(selectedIds), // selectedIds ini sudah berupa array
      },
      cancel: { label: "Batal" },
    });
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
                  onClick={() => navigate("/dashboard/manajemen-role/create")}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#2D7344] hover:bg-[#1E5230] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm"
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
    </DashboardLayout>
  );
};

export default ManajemenRole;
