import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { roleService } from "../../services/auth/roleService";
import { permissionService } from "../../services/auth/permissionService";
import { rolePermissionService } from "../../services/auth/rolePermissionService";
import {
  ChevronLeft,
  Save,
  Loader2,
  KeyRound,
  Search,
  CheckSquare,
  Square,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const AssignPermission = () => {
  const { id: roleId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPerms, setSelectedPerms] = useState([]);
  const [initialPerms, setInitialPerms] = useState([]);

  // =========================================================
  // FETCH DATA
  // =========================================================
  const { data: roleData, isLoading: isLoadingRole } = useQuery({
    queryKey: ["role", roleId],
    queryFn: () => roleService.getRoleById(roleId),
    enabled: !!roleId,
  });

  const { data: allPermissions, isLoading: isLoadingPerms } = useQuery({
    queryKey: ["permissions"],
    queryFn: permissionService.getPermissions,
  });

  // Sinkronisasi data awal
  useEffect(() => {
    if (roleData && Array.isArray(roleData.permissions)) {
      // Ambil array ID permission yang sudah dimiliki role ini
      const currentIds = roleData.permissions.map((p) =>
        typeof p === "object" ? p.id : p,
      );
      setSelectedPerms(currentIds);
      setInitialPerms(currentIds);
    }
  }, [roleData]);

  const savePermissionsMutation = useMutation({
    mutationFn: async () => {
      const addedIds = selectedPerms.filter((id) => !initialPerms.includes(id));
      const removedIds = initialPerms.filter(
        (id) => !selectedPerms.includes(id),
      );

      // Buat format Payload sesuai permintaan: [{ role_id, permission_id }]
      // SESUDAH (BENAR)
      const assignPayload = addedIds.map((permId) => ({
        roleId: roleId,
        permissionId: permId,
      }));
      const unassignPayload = removedIds.map((permId) => ({
        roleId: roleId,
        permissionId: permId,
      }));

      const promises = [];
      if (assignPayload.length > 0) {
        promises.push(
          rolePermissionService.assignPermissionToRoleBulk(assignPayload),
        );
      }
      if (unassignPayload.length > 0) {
        // Pastikan Anda sudah membuat endpoint unassignBulk ini di service Anda
        promises.push(
          rolePermissionService.unassignPermissionFromRoleBulk(unassignPayload),
        );
      }

      await Promise.all(promises);
    },
    onSuccess: () => {
      toast.success("Hak akses berhasil diperbarui!");
      queryClient.invalidateQueries({ queryKey: ["role", roleId] });
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      navigate("/dashboard/manajemen-role");
    },
    onError: (err) => {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Gagal memperbarui hak akses.",
      );
    },
  });

  // =========================================================
  // LOGIKA PENGELOMPOKAN (GROUPING) & FILTER UX
  // =========================================================
  const groupedPermissions = useMemo(() => {
    if (!allPermissions) return {};

    // Filter berdasarkan pencarian
    const filtered = allPermissions.filter((perm) =>
      perm.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    // Kelompokkan berdasarkan kata sebelum tanda ":" (misal: "user:create" -> "user")
    return filtered.reduce((acc, perm) => {
      const moduleName = perm.name
        .split(":")[0]
        .replace(/_/g, " ")
        .toUpperCase();
      if (!acc[moduleName]) acc[moduleName] = [];
      acc[moduleName].push(perm);
      return acc;
    }, {});
  }, [allPermissions, searchQuery]);

  // =========================================================
  // HANDLERS
  // =========================================================
  const handleToggleSingle = (permId) => {
    setSelectedPerms((prev) =>
      prev.includes(permId)
        ? prev.filter((id) => id !== permId)
        : [...prev, permId],
    );
  };

  const handleToggleModule = (modulePerms) => {
    const moduleIds = modulePerms.map((p) => p.id);
    const isAllSelected = moduleIds.every((id) => selectedPerms.includes(id));

    if (isAllSelected) {
      // Hapus semua id module ini dari state
      setSelectedPerms((prev) => prev.filter((id) => !moduleIds.includes(id)));
    } else {
      // Tambahkan semua id module ini ke state (hindari duplikat)
      setSelectedPerms((prev) => {
        const newSet = new Set([...prev, ...moduleIds]);
        return Array.from(newSet);
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    savePermissionsMutation.mutate();
  };

  const isChanged =
    selectedPerms.length !== initialPerms.length ||
    !selectedPerms.every((id) => initialPerms.includes(id));

  // =========================================================
  // RENDER LOADING STATE
  // =========================================================
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
      <main className="flex-1 flex flex-col h-full bg-[#FAFBFC] relative">
        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8 pb-32 custom-scrollbar">
          {/* BREADCRUMB & HEADER */}
          <button
            onClick={() => navigate("/dashboard/manajemen-role")}
            className="flex items-center gap-2 text-gray-500 hover:text-[#2D7344] mb-6 font-semibold text-sm transition-colors w-max"
          >
            <ChevronLeft size={16} /> Kembali ke Manajemen Role
          </button>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-[#2D7344] to-[#1E5230] px-8 py-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-inner">
                  <KeyRound size={28} />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight">
                    Kelola Hak Akses
                  </h1>
                  <p className="text-green-100/80 font-medium text-sm mt-1">
                    Role:{" "}
                    <span className="text-white font-bold underline decoration-green-400/50 underline-offset-2">
                      {roleData?.name || roleData?.nama}
                    </span>
                  </p>
                </div>
              </div>

              <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 backdrop-blur-sm flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest text-green-200 font-bold">
                    Total Akses
                  </p>
                  <p className="text-xl font-black">{selectedPerms.length}</p>
                </div>
                <div className="w-px h-8 bg-white/20"></div>
                <div className="text-left">
                  <p className="text-[10px] uppercase tracking-widest text-green-200 font-bold">
                    Modul
                  </p>
                  <p className="text-xl font-black">
                    {Object.keys(groupedPermissions).length}
                  </p>
                </div>
              </div>
            </div>

            {/* SEARCH BAR */}
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-end">
              <div className="relative w-full md:w-72">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Cari nama hak akses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2D7344]/20 focus:border-[#2D7344] transition-all shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* GRID PERMISSIONS */}
          {Object.keys(groupedPermissions).length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <Search className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500 font-medium">
                Tidak ada hak akses yang sesuai dengan pencarian Anda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(groupedPermissions).map(([moduleName, perms]) => {
                const moduleIds = perms.map((p) => p.id);
                const isAllSelected = moduleIds.every((id) =>
                  selectedPerms.includes(id),
                );
                const isSomeSelected =
                  moduleIds.some((id) => selectedPerms.includes(id)) &&
                  !isAllSelected;

                return (
                  <div
                    key={moduleName}
                    className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:border-[#2D7344]/30 transition-colors"
                  >
                    {/* Module Header */}
                    <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                      <h3 className="font-bold text-gray-800 tracking-tight">
                        {moduleName}
                      </h3>
                      <button
                        type="button"
                        onClick={() => handleToggleModule(perms)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                          isAllSelected
                            ? "bg-[#2D7344]/10 text-[#2D7344] hover:bg-red-50 hover:text-red-600"
                            : "bg-gray-200 text-gray-600 hover:bg-[#2D7344]/10 hover:text-[#2D7344]"
                        }`}
                      >
                        {isAllSelected ? (
                          <>
                            <CheckSquare size={14} /> Batalkan Semua
                          </>
                        ) : isSomeSelected ? (
                          <>
                            <Square size={14} className="fill-gray-300" /> Pilih
                            Semua Sisa
                          </>
                        ) : (
                          <>
                            <Square size={14} /> Pilih Semua
                          </>
                        )}
                      </button>
                    </div>

                    {/* Permissions List */}
                    <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {perms.map((perm) => {
                        const isChecked = selectedPerms.includes(perm.id);
                        // Ambil kata setelah titik dua untuk mempercantik (misal user:create -> Create)
                        const actionName = perm.name.split(":")[1] || perm.name;

                        return (
                          <label
                            key={perm.id}
                            className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer border transition-all duration-200 ${
                              isChecked
                                ? "bg-[#EAFBF0]/50 border-[#2D7344]/30 shadow-sm"
                                : "bg-white border-transparent hover:bg-gray-50"
                            }`}
                          >
                            <div className="mt-0.5 relative flex items-center justify-center">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleSingle(perm.id)}
                                className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-md checked:bg-[#2D7344] checked:border-[#2D7344] transition-all cursor-pointer"
                              />
                              <CheckSquare
                                size={14}
                                strokeWidth={3}
                                className="text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                              />
                            </div>
                            <div className="flex flex-col">
                              <span
                                className={`text-sm font-bold capitalize ${isChecked ? "text-[#2D7344]" : "text-gray-700"}`}
                              >
                                {actionName}
                              </span>
                              <span className="text-[10px] text-gray-400 font-mono tracking-tighter mt-0.5">
                                {perm.name}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* STICKY FOOTER ACTION BAR */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-200 px-6 py-4 flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
          <div className="hidden sm:block">
            {isChanged ? (
              <span className="text-sm font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                ⚠️ Ada perubahan yang belum disimpan
              </span>
            ) : (
              <span className="text-sm font-semibold text-gray-400">
                Tidak ada perubahan
              </span>
            )}
          </div>
          <div className="flex w-full sm:w-auto items-center gap-3">
            <button
              onClick={() => navigate("/dashboard/manajemen-role")}
              className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl transition-colors shadow-sm"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isChanged || savePermissionsMutation.isPending}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-2.5 text-sm font-bold text-white bg-[#2D7344] hover:bg-[#1E5230] rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {savePermissionsMutation.isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Menyimpan...
                </>
              ) : (
                <>
                  <Save size={18} /> Simpan Hak Akses
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default AssignPermission;
