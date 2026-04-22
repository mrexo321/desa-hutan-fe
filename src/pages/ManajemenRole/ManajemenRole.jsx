import React, { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { roleService } from "../../services/auth/roleService";
import { permissionService } from "../../services/auth/permissionService";
import { rolePermissionService } from "../../services/auth/rolePermissionService";
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
  Loader2,
  X,
  CheckSquare,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const ManajemenRole = () => {
  const queryClient = useQueryClient();

  // =========================================================
  // 1. STATE UNTUK MODAL & CHECKBOX
  // =========================================================
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [checkedPermissions, setCheckedPermissions] = useState([]);

  // =========================================================
  // 2. FETCH DATA MENGGUNAKAN REACT QUERY
  // =========================================================
  // Query 1: Ambil Data Roles untuk Tabel
  const {
    data: roles,
    isLoading: isLoadingRoles,
    isError,
    error,
  } = useQuery({
    queryKey: ["roles"],
    queryFn: roleService.getRoles,
  });

  // Query 2: Ambil SEMUA Data Permissions untuk Modal Edit
  const { data: allPermissions, isLoading: isLoadingPermissions } = useQuery({
    queryKey: ["permissions"],
    queryFn: permissionService.getPermissions,
  });

  // =========================================================
  // 3. MUTASI (MENYIMPAN DATA)
  // =========================================================
  const updatePermissionsMutation = useMutation({
    mutationFn: async (payload) => {
      // Pastikan fungsi createBulkPermissions ada di permissionService
      // ATAU gunakan fungsi assign bulk dari roleService, tergantung setup backend-mu.
      // Saya asumsikan kita pakai createBulkPermissions dari permissionService yang kamu kasih di awal.
      return await rolePermissionService.assignPermissionToRoleBulk(payload);
    },
    onSuccess: () => {
      toast.success("Berhasil memperbarui hak akses role!");
      queryClient.invalidateQueries({ queryKey: ["roles"] }); // Refresh tabel
      closeModal();
    },
    onError: (err) => {
      console.error(err);
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Gagal menyimpan perubahan. Periksa koneksi atau hubungi admin.";
      toast.error(errorMsg);
    },
  });

  // =========================================================
  // 4. FUNGSI HANDLER TOMBOL AKSI
  // =========================================================
  const handleViewClick = (roleData) => {
    setSelectedRole(roleData);
    setIsViewModalOpen(true);
  };

  const handleEditClick = (roleData) => {
    setSelectedRole(roleData);

    const currentPerms = Array.isArray(roleData.permissions)
      ? roleData.permissions.map((p) => (typeof p === "object" ? p.name : p))
      : [];

    setCheckedPermissions(currentPerms);
    setIsEditModalOpen(true);
  };

  const closeModal = () => {
    setIsViewModalOpen(false);
    setIsEditModalOpen(false);
    setTimeout(() => {
      setSelectedRole(null);
      setCheckedPermissions([]);
    }, 200);
  };

  const handleCheckboxChange = (permName) => {
    setCheckedPermissions((prev) =>
      prev.includes(permName)
        ? prev.filter((p) => p !== permName)
        : [...prev, permName],
    );
  };

  const handleSavePermissions = () => {
    if (!selectedRole) return;

    // 1. Dapatkan Array ID Permission yang diceklis
    const selectedPermissionIds =
      allPermissions
        ?.filter((perm) => checkedPermissions.includes(perm.name))
        .map((perm) => perm.id) || [];

    // 👇 2. UBAH PAYLOAD MENJADI BENTUK ARRAY OF OBJECTS
    // Kita "memecah" data menjadi daftar pasangan role dan permission
    const payload = selectedPermissionIds.map((permId) => ({
      roleId: selectedRole.id, // Coba pakai camelCase dulu
      permissionId: permId, // Coba pakai camelCase dulu
    }));

    /*
      Hasil payload di atas akan menjadi Array seperti ini:
      [
        { roleId: "role1", permissionId: "permA" },
        { roleId: "role1", permissionId: "permB" }
      ]
    */

    // 3. Tembak API
    updatePermissionsMutation.mutate(payload);
  };
  return (
    <DashboardLayout activeMenu="Manajemen Role">
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#FAFBFC]">
        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8 custom-scrollbar">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Manajemen Roles
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Kelola tingkat otorisasi dan daftar hak akses (permissions) untuk
              setiap peran.
            </p>
          </div>

          <div className="flex p-1 bg-gray-100/80 backdrop-blur-sm rounded-xl w-max mb-6 border border-gray-200/50">
            <button className="px-8 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 bg-white text-[#2D7344] shadow-[0_2px_8px_rgb(0,0,0,0.06)] uppercase tracking-wider">
              Daftar Roles
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 flex flex-col">
            <div className="p-6 border-b border-gray-50 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-[#2D7344] shrink-0">
                    <ShieldCheck size={20} strokeWidth={2} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-800 whitespace-nowrap hidden sm:block">
                    Tabel Data Roles
                  </h2>
                </div>
                <div className="hidden sm:block w-px h-8 bg-gray-200 mx-2"></div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-500 whitespace-nowrap">
                    Wilayah:
                  </span>
                  <select className="bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-[#2D7344] cursor-pointer font-medium min-w-[160px]">
                    <option>-- Pilih Wilayah --</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-full sm:w-64 group">
                  <Search
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2D7344] transition-colors"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Cari role..."
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:border-[#2D7344]"
                  />
                </div>
                <button className="hidden sm:flex items-center justify-center p-2.5 text-gray-500 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                  <Filter size={18} />
                </button>
                <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#2D7344] hover:bg-[#1E5230] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm">
                  <Plus size={18} strokeWidth={2.5} /> Tambah Role
                </button>
              </div>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-[11px] uppercase tracking-wider font-bold text-gray-500">
                    <th className="py-4 px-6 w-16 text-center">No</th>
                    <th className="py-4 px-6 w-64">Nama Role</th>
                    <th className="py-4 px-6">Hak Akses (Permissions)</th>
                    <th className="py-4 px-6 text-center w-36">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium text-gray-700">
                  {isLoadingRoles ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="py-12 text-center text-gray-500"
                      >
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Loader2
                            className="animate-spin text-[#2D7344]"
                            size={28}
                          />
                          <p>Memuat data dari server...</p>
                        </div>
                      </td>
                    </tr>
                  ) : isError ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="py-12 text-center text-red-500 bg-red-50/50"
                      >
                        {error?.message ||
                          "Terjadi kesalahan saat memuat data."}
                      </td>
                    </tr>
                  ) : roles?.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="py-12 text-center text-gray-500"
                      >
                        Belum ada data role yang ditambahkan.
                      </td>
                    </tr>
                  ) : (
                    roles?.map((row, index) => {
                      const roleName = row.name || row.nama || "Tanpa Nama";
                      const isSuperadmin = roleName
                        .toLowerCase()
                        .includes("superadmin");
                      const permissions = Array.isArray(row.permissions)
                        ? row.permissions
                        : [];

                      return (
                        <tr
                          key={row.id || index}
                          className="border-b border-gray-50/80 hover:bg-[#F9FBFA] transition-colors group align-top"
                        >
                          <td className="py-5 px-6 text-gray-500 font-semibold text-center">
                            {index + 1}
                          </td>
                          <td className="py-5 px-6">
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
                          </td>
                          <td className="py-5 px-6">
                            {permissions.length > 0 ? (
                              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700">
                                <ShieldCheck size={14} />
                                <span className="text-xs font-bold">
                                  {permissions.length} Akses Diberikan
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400 italic text-xs">
                                Tidak ada permission khusus
                              </span>
                            )}
                          </td>
                          <td className="py-5 px-6">
                            <div className="flex items-center justify-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleViewClick(row)}
                                className="p-1.5 text-gray-400 hover:text-[#0A66C2] hover:bg-blue-50 rounded-md transition-all"
                                title="Lihat Detail"
                              >
                                <Eye size={16} strokeWidth={2} />
                              </button>
                              <button
                                onClick={() => handleEditClick(row)}
                                className="p-1.5 text-gray-400 hover:text-[#2D7344] hover:bg-[#EAFBF0] rounded-md transition-all"
                                title="Edit"
                              >
                                <Edit2 size={16} strokeWidth={2} />
                              </button>
                              <button
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                                title="Hapus"
                              >
                                <Trash2 size={16} strokeWidth={2} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 md:p-6 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/30 rounded-b-2xl">
              <p className="text-xs font-medium text-gray-500">
                Menampilkan{" "}
                <span className="font-bold text-gray-900">
                  {roles?.length || 0}
                </span>{" "}
                role
              </p>
              <div className="flex items-center gap-2">
                <button className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-gray-700 shadow-sm disabled:opacity-50 cursor-pointer">
                  <ChevronLeft size={18} />
                </button>
                <div className="flex items-center gap-1 px-2">
                  <button className="w-8 h-8 rounded-lg bg-[#2D7344] text-white text-xs font-bold shadow-md">
                    1
                  </button>
                </div>
                <button className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 shadow-sm cursor-pointer">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL DETAIL PERMISSION */}
      {isViewModalOpen && selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  Detail Hak Akses
                </h3>
                <p className="text-sm text-gray-500 font-medium">
                  {selectedRole.name || selectedRole.nama}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar">
              {Array.isArray(selectedRole.permissions) &&
              selectedRole.permissions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedRole.permissions.map((perm, idx) => (
                    <span
                      key={idx}
                      className="bg-[#EAFBF0] border border-green-200 text-[#2D7344] px-3 py-1.5 rounded-md text-xs font-mono tracking-tight font-semibold flex items-center gap-1.5"
                    >
                      <CheckSquare size={14} />
                      {perm.name || perm}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShieldAlert
                    className="mx-auto text-gray-300 mb-3"
                    size={48}
                  />
                  <p className="text-gray-500 text-sm">
                    Role ini belum memiliki hak akses (permissions) apapun.
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={closeModal}
                className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-bold transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT PERMISSION */}
      {isEditModalOpen && selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-[#2D7344]">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Edit Hak Akses Role
                </h3>
                <p className="text-sm text-green-100 font-medium">
                  {selectedRole.name || selectedRole.nama}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 text-green-100 hover:text-white hover:bg-green-700 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar bg-gray-50/30">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-bold text-gray-700">
                  Pilih Hak Akses:
                </span>
                <span className="text-xs font-medium text-[#2D7344] bg-green-50 px-2 py-1 rounded border border-green-100">
                  {checkedPermissions.length} Terpilih
                </span>
              </div>

              {isLoadingPermissions ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-[#2D7344]" size={32} />
                </div>
              ) : (
                <div className="space-y-2">
                  {allPermissions?.map((perm) => {
                    const isChecked = checkedPermissions.includes(perm.name);
                    return (
                      <label
                        key={perm.id}
                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                          isChecked
                            ? "bg-[#EAFBF0] border-[#2D7344]/30"
                            : "bg-white border-gray-200 hover:border-[#2D7344]/50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-[#2D7344] rounded border-gray-300 focus:ring-[#2D7344]"
                          checked={isChecked}
                          onChange={() => handleCheckboxChange(perm.name)}
                        />
                        <span
                          className={`text-sm ${isChecked ? "font-bold text-[#2D7344]" : "font-semibold text-gray-600"}`}
                        >
                          {perm.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-end gap-3 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
              <button
                onClick={closeModal}
                disabled={updatePermissionsMutation.isPending}
                className="px-5 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-bold transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSavePermissions}
                disabled={updatePermissionsMutation.isPending}
                className="flex items-center gap-2 px-5 py-2 bg-[#2D7344] hover:bg-[#1E5230] text-white rounded-lg text-sm font-bold transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {updatePermissionsMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Menyimpan...
                  </>
                ) : (
                  "Simpan Perubahan"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ManajemenRole;
