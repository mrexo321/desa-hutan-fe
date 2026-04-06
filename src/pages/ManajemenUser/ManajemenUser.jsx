import React, { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout"; 
import userService from "../../services/auth/userService"; 
// ⚠️ IMPORT ROLE SERVICE (Sesuaikan path-nya!)
import { roleService } from "../../services/auth/roleService"; 
import {
  Plus, Search, Eye, Edit2, Trash2, ChevronLeft, ChevronRight,
  Filter, Users, Loader2, ShieldPlus, X
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { userRoleService } from "../../services/auth/userRoleService";

const ManajemenUser = () => {
  const queryClient = useQueryClient();

  // =========================================================
  // 1. STATE UNTUK MODAL ASSIGN ROLE
  // =========================================================
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRoleId, setSelectedRoleId] = useState(""); // Menyimpan ID Role yang dipilih di dropdown

  // =========================================================
  // 2. FETCH DATA MENGGUNAKAN REACT QUERY
  // =========================================================
  // Ambil Data Users
  const { data: users, isLoading: isLoadingUsers, isError, error } = useQuery({
    queryKey: ["users"],
    queryFn: userService.getUser,
  });

  // Ambil Data Roles (Untuk Dropdown di Modal)
  const { data: roles, isLoading: isLoadingRoles } = useQuery({
    queryKey: ["roles"],
    queryFn: roleService.getRoles, // ⚠️ Pastikan nama fungsinya sesuai dengan yang ada di roleService.js
  });

  // =========================================================
  // 3. MUTASI: ASSIGN ROLE KE USER
  // =========================================================
  const assignRoleMutation = useMutation({
    mutationFn: async (payload) => {
      return await userRoleService.assignRole(payload);
    },
    onSuccess: () => {
      toast.success("Berhasil menetapkan Role ke User!");
      queryClient.invalidateQueries({ queryKey: ["users"] }); // Refresh tabel otomatis
      closeModal();
    },
    onError: (err) => {
      console.error("Gagal assign role:", err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || "Gagal menetapkan Role.";
      toast.error(errorMsg);
    }
  });

  // =========================================================
  // 4. HANDLER FUNGSI
  // =========================================================
  const openAssignRoleModal = (user) => {
    setSelectedUser(user);
    // Jika backend mengirim role_id di data user, kita bisa jadikan default value di sini
    // setSelectedRoleId(user.role_id || ""); 
    setSelectedRoleId("");
    setIsRoleModalOpen(true);
  };

  const closeModal = () => {
    setIsRoleModalOpen(false);
    setTimeout(() => {
      setSelectedUser(null);
      setSelectedRoleId("");
    }, 200);
  };

  const handleSaveAssignRole = () => {
    if (!selectedRoleId) {
      toast.error("Silakan pilih Role terlebih dahulu!");
      return;
    }

    // ⚠️ PASTIKAN KEY JSON INI SESUAI DENGAN PAYLOAD POST /user-roles/assign DI INSOMNIA
    const payload = {
      userId: selectedUser.id,
      roleId: selectedRoleId
    };

    assignRoleMutation.mutate(payload);
  };

  const getBadgeColor = (wilayah) => {
    const text = (wilayah || "").toLowerCase();
    if (text.includes("nasional")) return "bg-purple-50 text-purple-700 border-purple-200";
    if (text.includes("provinsi")) return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  };

  return (
    <DashboardLayout activeMenu="Manajemen User">
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#FAFBFC]">
        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8 custom-scrollbar">
          
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manajemen User</h1>
            <p className="text-sm text-gray-500 mt-1">Kelola data akun pengguna, hak akses, dan wilayah penugasan.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 flex flex-col">
            {/* Header Toolbar (Tetap sama) */}
            <div className="p-6 border-b border-gray-50 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-[#2D7344] shrink-0">
                    <Users size={20} strokeWidth={2} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-800 whitespace-nowrap hidden sm:block">Tabel Data User</h2>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#2D7344] hover:bg-[#1E5230] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm">
                  <Plus size={18} strokeWidth={2.5} /> Tambah User
                </button>
              </div>
            </div>

            {/* TABEL DATA DINAMIS */}
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-[11px] uppercase tracking-wider font-bold text-gray-500">
                    <th className="py-4 px-6 w-16 text-center">No</th>
                    <th className="py-4 px-6">Nama Pengguna</th>
                    <th className="py-4 px-6">Tingkat Wilayah</th>
                    <th className="py-4 px-6">Daerah Penugasan</th>
                    <th className="py-4 px-6 text-center w-48">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium text-gray-700">
                  {isLoadingUsers ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Loader2 className="animate-spin text-[#2D7344]" size={28} />
                          <p>Memuat data user...</p>
                        </div>
                      </td>
                    </tr>
                  ) : isError ? (
                    <tr><td colSpan="5" className="py-12 text-center text-red-500 bg-red-50/50">{error?.message || "Gagal memuat data."}</td></tr>
                  ) : users?.length === 0 ? (
                    <tr><td colSpan="5" className="py-12 text-center text-gray-500">Belum ada data user.</td></tr>
                  ) : (
                    users?.map((user, index) => {
                      const namaLengkap = user.nama || user.name || user.username || "Anonim";
                      const inisial = namaLengkap.charAt(0).toUpperCase();
                      const tingkatWilayah = user.wilayah || user.tingkat_wilayah || "-";
                      const daerahPenugasan = user.daerah || user.daerah_penugasan || "-";

                      return (
                        <tr key={user.id || index} className="border-b border-gray-50/80 hover:bg-[#F9FBFA] transition-colors group">
                          <td className="py-4 px-6 text-gray-500 font-semibold text-center">{index + 1}</td>
                          <td className="py-4 px-6 text-gray-900 font-bold flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold shrink-0 uppercase">{inisial}</div>
                            {namaLengkap}
                          </td>
                          <td className="py-4 px-6"><span className={`px-3 py-1.5 rounded-md text-xs font-bold border ${getBadgeColor(tingkatWilayah)}`}>{tingkatWilayah}</span></td>
                          <td className="py-4 px-6 text-gray-600">{daerahPenugasan}</td>
                          <td className="py-4 px-6">
                            <div className="flex items-center justify-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                              
                              {/* 🎯 TOMBOL BARU: ASSIGN ROLE */}
                              <button 
                                onClick={() => openAssignRoleModal(user)}
                                className="px-3 py-1.5 flex items-center gap-1.5 text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-200 hover:border-blue-600 rounded-md transition-all text-xs font-bold bg-blue-50"
                                title="Atur Role Akses"
                              >
                                <ShieldPlus size={14} /> Atur Role
                              </button>

                              <button className="p-1.5 text-gray-400 hover:text-[#2D7344] hover:bg-[#EAFBF0] rounded-md transition-all" title="Edit">
                                <Edit2 size={16} strokeWidth={2} />
                              </button>
                              <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all" title="Hapus">
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
          </div>
        </div>
      </main>

      {/* ========================================================= */}
      {/* OVERLAY & MODAL ASSIGN ROLE                               */}
      {/* ========================================================= */}
      {isRoleModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-blue-50 text-blue-800">
              <div className="flex items-center gap-3">
                <ShieldPlus size={20} />
                <div>
                  <h3 className="text-lg font-bold">Atur Role Akses</h3>
                  <p className="text-xs font-medium opacity-80 text-blue-600">
                    User: {selectedUser.username || selectedUser.nama}
                  </p>
                </div>
              </div>
              <button onClick={closeModal} className="p-1 hover:bg-blue-200 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Pilih Role untuk User Ini
              </label>
              
              {isLoadingRoles ? (
                <div className="flex justify-center py-4 border rounded-lg bg-gray-50">
                  <Loader2 className="animate-spin text-blue-500" size={24} />
                </div>
              ) : (
                <select 
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-gray-800 py-3 px-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer font-medium"
                >
                  <option value="" disabled>-- Klik untuk memilih Role --</option>
                  {roles?.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name || role.nama}
                    </option>
                  ))}
                </select>
              )}
              
              <p className="text-[11px] text-gray-500 mt-3 flex items-start gap-1">
                <span className="text-blue-500 font-bold">ℹ️</span> Role menentukan hak akses menu apa saja yang bisa dilihat oleh pengguna ini.
              </p>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={closeModal} 
                disabled={assignRoleMutation.isPending}
                className="px-5 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-bold transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={handleSaveAssignRole}
                disabled={assignRoleMutation.isPending}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {assignRoleMutation.isPending ? (
                  <><Loader2 size={16} className="animate-spin" /> Menyimpan...</>
                ) : (
                  "Simpan Role"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
};

export default ManajemenUser;