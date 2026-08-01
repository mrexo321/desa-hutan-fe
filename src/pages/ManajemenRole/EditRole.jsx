import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { roleService } from "../../services/auth/roleService";
import { ChevronLeft, Save, Loader2, Edit3 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const EditRole = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [roleName, setRoleName] = useState("");

  // FETCH ROLE BY ID
  const { data: roleData, isLoading: isLoadingRole } = useQuery({
    queryKey: ["role", id],
    queryFn: () => roleService.getRoleById(id),
    enabled: !!id,
  });

  useEffect(() => {
    if (roleData) {
      setRoleName(roleData.name || roleData.nama || "");
    }
  }, [roleData]);

  // MUTASI UPDATE NAMA ROLE
  const updateMutation = useMutation({
    mutationFn: () => roleService.updateRole(id, { name: roleName }),
    onSuccess: () => {
      toast.success("Nama Role berhasil diperbarui!");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["role", id] });
      navigate("/dashboard/manajemen-role");
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Gagal memperbarui nama role."),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!roleName.trim()) {
      return toast.error("Nama role tidak boleh kosong!");
    }
    updateMutation.mutate();
  };

  if (isLoadingRole) {
    return (
      <DashboardLayout activeMenu="Manajemen Role">
        <div className="flex h-full items-center justify-center">
          <Loader2 className="animate-spin text-[#2D7344]" size={40} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="Manajemen Role">
      <main className="flex-1 flex flex-col h-full bg-[#FAFBFC]">
        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8 custom-scrollbar">
          <button
            onClick={() => navigate("/dashboard/manajemen-role")}
            className="flex items-center gap-2 text-gray-500 hover:text-[#2D7344] mb-6 font-semibold text-xs transition-colors cursor-pointer"
          >
            <ChevronLeft size={16} /> Kembali ke Manajemen Role
          </button>

          <div className="bg-white rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-gray-100/80 max-w-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-slate-50/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#2D7344] border border-emerald-100 flex items-center justify-center font-bold">
                <Edit3 size={20} />
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-gray-900">
                  Edit Nama Role
                </h1>
                <p className="text-xs text-gray-400 font-medium">
                  Ubah sebutan nama peran ini di dalam sistem.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider font-mono">
                  Nama Role
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Admin Desa, Supervisor"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50/70 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#2D7344] transition-all"
                />
              </div>

              <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard/manajemen-role")}
                  className="px-5 py-2.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#2D7344] hover:bg-[#1E5230] rounded-xl transition-all disabled:opacity-70 shadow-sm cursor-pointer"
                >
                  {updateMutation.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default EditRole;
