import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { roleService } from "../../services/auth/roleService";
import { permissionService } from "../../services/auth/permissionService";
import { rolePermissionService } from "../../services/auth/rolePermissionService";
import { ChevronLeft, Save, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const EditRole = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [roleName, setRoleName] = useState("");
  const [checkedPermissions, setCheckedPermissions] = useState([]);

  // FETCH ROLE BY ID
  const { data: roleData, isLoading: isLoadingRole } = useQuery({
    queryKey: ["role", id],
    queryFn: () => roleService.getRoleById(id),
    enabled: !!id,
  });

  // FETCH ALL PERMISSIONS
  const { data: allPermissions, isLoading: isLoadingPerms } = useQuery({
    queryKey: ["permissions"],
    queryFn: permissionService.getPermissions,
  });

  // Sinkronisasi data awal ke state
  useEffect(() => {
    if (roleData) {
      setRoleName(roleData.name || roleData.nama || "");
      if (Array.isArray(roleData.permissions)) {
        setCheckedPermissions(roleData.permissions.map((p) => p.name || p));
      }
    }
  }, [roleData]);

  // MUTASI UPDATE
  const updateMutation = useMutation({
    mutationFn: async () => {
      // 1. Update Nama Role (Jika endpoint update role terpisah dari assign permission)
      await roleService.updateRole(id, { name: roleName });

      // 2. Assign Permissions
      const selectedIds =
        allPermissions
          ?.filter((perm) => checkedPermissions.includes(perm.name))
          .map((p) => p.id) || [];

      const payload = selectedIds.map((permId) => ({
        roleId: id,
        permissionId: permId,
      }));

      return await rolePermissionService.assignPermissionToRoleBulk(payload);
    },
    onSuccess: () => {
      toast.success("Role dan Hak Akses berhasil diperbarui!");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["role", id] });
      navigate("/dashboard/manajemen-role");
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Gagal memperbarui."),
  });

  const handleCheckboxChange = (permName) => {
    setCheckedPermissions((prev) =>
      prev.includes(permName)
        ? prev.filter((p) => p !== permName)
        : [...prev, permName],
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  if (isLoadingRole || isLoadingPerms) {
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
        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8">
          <button
            onClick={() => navigate("/dashboard/manajemen-role")}
            className="flex items-center gap-2 text-gray-500 hover:text-[#2D7344] mb-6 font-semibold text-sm transition-colors"
          >
            <ChevronLeft size={16} /> Kembali
          </button>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 max-w-4xl">
            <div className="p-6 border-b border-gray-50">
              <h1 className="text-xl font-bold text-gray-900">
                Edit Role & Hak Akses
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nama Role
                </label>
                <input
                  type="text"
                  required
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="w-full max-w-md px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-[#2D7344]"
                />
              </div>

              <div>
                <div className="mb-4 flex items-center justify-between">
                  <label className="block text-sm font-semibold text-gray-700">
                    Manajemen Hak Akses (Permissions)
                  </label>
                  <span className="text-xs font-bold text-[#2D7344] bg-green-50 px-2 py-1 rounded border border-green-100">
                    {checkedPermissions.length} Terpilih
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {allPermissions?.map((perm) => {
                    const isChecked = checkedPermissions.includes(perm.name);
                    return (
                      <label
                        key={perm.id}
                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                          isChecked
                            ? "bg-[#EAFBF0] border-[#2D7344]/40"
                            : "bg-white border-gray-200"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleCheckboxChange(perm.name)}
                          className="w-4 h-4 text-[#2D7344] rounded border-gray-300 focus:ring-[#2D7344]"
                        />
                        <span
                          className={`text-sm ${isChecked ? "font-bold text-[#2D7344]" : "font-medium text-gray-600"}`}
                        >
                          {perm.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-6 mt-8 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard/manajemen-role")}
                  className="px-6 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-[#2D7344] hover:bg-[#1E5230] rounded-lg transition-colors disabled:opacity-70"
                >
                  {updateMutation.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  Simpan Perubahan
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
