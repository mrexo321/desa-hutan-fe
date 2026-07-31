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
  Check,
  Plus,
  Minus,
  LayoutGrid,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  GripVertical
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const AssignPermission = () => {
  const { id: roleId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchUnassigned, setSearchUnassigned] = useState("");
  const [searchAssigned, setSearchAssigned] = useState("");
  const [selectedPerms, setSelectedPerms] = useState([]);
  const [initialPerms, setInitialPerms] = useState([]);

  // Drag state for visual feedback
  const [isDraggingOverUnassigned, setIsDraggingOverUnassigned] = useState(false);
  const [isDraggingOverAssigned, setIsDraggingOverAssigned] = useState(false);
  const [draggedItemId, setDraggedItemId] = useState(null);

  // =========================================================
  // FETCH DATA
  // =========================================================
  const { data: roleData, isLoading: isLoadingRole } = useQuery({
    queryKey: ["role", roleId],
    queryFn: () => roleService.getRoleById(roleId),
    enabled: !!roleId,
  });

  const { data: rolePermissionsData, isLoading: isLoadingRolePerms } = useQuery({
    queryKey: ["role-permissions", roleId],
    queryFn: () => rolePermissionService.getRolePermissionById(roleId),
    enabled: !!roleId,
  });

  const { data: allPermissions, isLoading: isLoadingPerms } = useQuery({
    queryKey: ["permissions"],
    queryFn: permissionService.getPermissions,
  });

  // Sinkronisasi data awal
  useEffect(() => {
    if (rolePermissionsData) {
      const dataList = Array.isArray(rolePermissionsData)
        ? rolePermissionsData
        : rolePermissionsData?.data || [];
      const currentIds = dataList.map((rp) => rp.permissionId || rp.permission?.id || rp.id);
      const t = setTimeout(() => {
        setSelectedPerms(currentIds);
        setInitialPerms(currentIds);
      }, 0);
      return () => clearTimeout(t);
    }
  }, [rolePermissionsData]);

  // =========================================================
  // LOGIC & GROUPING
  // =========================================================
  // Pisahkan menjadi Unassigned dan Assigned
  const { unassigned, assigned } = useMemo(() => {
    const unassigned = [];
    const assigned = [];
    (allPermissions || []).forEach(perm => {
      if (selectedPerms.includes(perm.id)) {
        assigned.push(perm);
      } else {
        unassigned.push(perm);
      }
    });
    return { unassigned, assigned };
  }, [allPermissions, selectedPerms]);

  // Filter tiap tabel dengan search bar-nya masing-masing
  const filteredUnassigned = useMemo(
    () => unassigned.filter((perm) => perm.name.toLowerCase().includes(searchUnassigned.toLowerCase())),
    [unassigned, searchUnassigned]
  );
  const filteredAssigned = useMemo(
    () => assigned.filter((perm) => perm.name.toLowerCase().includes(searchAssigned.toLowerCase())),
    [assigned, searchAssigned]
  );

  // Fungsi helper untuk mengelompokkan per modul
  const groupByModule = (permsArray) => {
    return permsArray.reduce((acc, perm) => {
      const moduleName = perm.name.split(":")[0].replace(/_/g, " ").toUpperCase();
      if (!acc[moduleName]) acc[moduleName] = [];
      acc[moduleName].push(perm);
      return acc;
    }, {});
  };

  const groupedUnassigned = useMemo(() => groupByModule(filteredUnassigned), [filteredUnassigned]);
  const groupedAssigned = useMemo(() => groupByModule(filteredAssigned), [filteredAssigned]);

  // =========================================================
  // HANDLERS (CLICK & BULK)
  // =========================================================
  const toggleSingle = (permId) => {
    setSelectedPerms((prev) =>
      prev.includes(permId)
        ? prev.filter((id) => id !== permId)
        : [...prev, permId]
    );
  };

  const moveModule = (modulePerms, target) => {
    const ids = modulePerms.map(p => p.id);
    if (target === "assigned") {
      // Tambahkan semua ke selected
      setSelectedPerms(prev => Array.from(new Set([...prev, ...ids])));
    } else {
      // Hapus semua dari selected
      setSelectedPerms(prev => prev.filter(id => !ids.includes(id)));
    }
  };

  // =========================================================
  // DRAG AND DROP HANDLERS
  // =========================================================
  const handleDragStart = (e, permId) => {
    e.dataTransfer.setData("permId", permId);
    e.dataTransfer.effectAllowed = "move";
    setDraggedItemId(permId);
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
    setIsDraggingOverUnassigned(false);
    setIsDraggingOverAssigned(false);
  };

  const handleDragOver = (e, zone) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (zone === "assigned") {
      setIsDraggingOverAssigned(true);
      setIsDraggingOverUnassigned(false);
    } else {
      setIsDraggingOverUnassigned(true);
      setIsDraggingOverAssigned(false);
    }
  };

  const handleDragLeave = (zone) => {
    if (zone === "assigned") setIsDraggingOverAssigned(false);
    if (zone === "unassigned") setIsDraggingOverUnassigned(false);
  };

  const handleDrop = (e, zone) => {
    e.preventDefault();
    setIsDraggingOverAssigned(false);
    setIsDraggingOverUnassigned(false);

    const permId = e.dataTransfer.getData("permId");
    if (!permId) return;

    if (zone === "assigned" && !selectedPerms.includes(permId)) {
      setSelectedPerms(prev => [...prev, permId]);
    } else if (zone === "unassigned" && selectedPerms.includes(permId)) {
      setSelectedPerms(prev => prev.filter(id => id !== permId));
    }
  };

  // =========================================================
  // SAVE MUTATION
  // =========================================================
  const savePermissionsMutation = useMutation({
    mutationFn: async () => {
      const addedIds = selectedPerms.filter((id) => !initialPerms.includes(id));
      const removedIds = initialPerms.filter((id) => !selectedPerms.includes(id));

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
        promises.push(rolePermissionService.assignPermissionToRoleBulk(assignPayload));
      }
      if (unassignPayload.length > 0) {
        promises.push(rolePermissionService.unassignPermissionFromRoleBulk(unassignPayload));
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
      toast.error(err?.response?.data?.message || "Gagal memperbarui hak akses.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    savePermissionsMutation.mutate();
  };

  const isChanged =
    selectedPerms.length !== initialPerms.length ||
    !selectedPerms.every((id) => initialPerms.includes(id));

  // =========================================================
  // RENDER HELPERS
  // =========================================================
  const renderPermissionRow = (perm, type) => {
    const actionName = perm.name.split(":")[1] || perm.name;
    const isAssigned = type === "assigned";
    const isDragged = draggedItemId === perm.id;

    return (
      <tr
        key={perm.id}
        draggable
        onDragStart={(e) => handleDragStart(e, perm.id)}
        onDragEnd={handleDragEnd}
        className={`group border-b border-gray-100 last:border-0 cursor-grab active:cursor-grabbing transition-colors ${
          isDragged ? "opacity-40 bg-[#2D7344]/5" : "bg-white hover:bg-[#2D7344]/5"
        }`}
      >
        <td className="py-2 pl-2 pr-2 align-middle">
          <div className="flex items-center gap-2 min-w-0">
            <GripVertical size={14} className="text-gray-300 group-hover:text-gray-400 transition-colors shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-bold text-gray-800 capitalize truncate">
                {actionName}
              </span>
              <span className="text-[10px] text-gray-400 font-mono truncate">
                {perm.name}
              </span>
            </div>
          </div>
        </td>
        <td className="py-2 pr-2 align-middle w-10 text-right">
          <button
            type="button"
            onClick={() => toggleSingle(perm.id)}
            className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all ${
              isAssigned
                ? "bg-red-50 text-red-500 hover:bg-red-500 hover:text-white"
                : "bg-[#2D7344]/10 text-[#2D7344] hover:bg-[#2D7344] hover:text-white"
            }`}
            title={isAssigned ? "Cabut Akses" : "Berikan Akses"}
          >
            {isAssigned ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
          </button>
        </td>
      </tr>
    );
  };

  const renderModuleGroup = (moduleName, perms, type) => {
    return (
      <tbody key={moduleName}>
        <tr className="sticky top-0 z-10">
          <td colSpan={2} className="bg-slate-100/95 backdrop-blur-sm px-2 py-1.5 border-b border-gray-200/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LayoutGrid size={12} className="text-gray-400" />
                <span className="text-[11px] font-bold tracking-wider text-gray-600 uppercase">
                  {moduleName}
                </span>
                <span className="bg-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-gray-200 text-gray-500">
                  {perms.length}
                </span>
              </div>

              <button
                onClick={() => moveModule(perms, type === "unassigned" ? "assigned" : "unassigned")}
                className={`text-[10px] font-bold px-2 py-1 rounded-md transition-all ${
                  type === "unassigned"
                    ? "bg-[#2D7344]/10 text-[#2D7344] hover:bg-[#2D7344] hover:text-white"
                    : "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white"
                }`}
              >
                {type === "unassigned" ? "+ Semua" : "- Semua"}
              </button>
            </div>
          </td>
        </tr>
        {perms.map(p => renderPermissionRow(p, type))}
      </tbody>
    );
  };

  if (isLoadingRole || isLoadingRolePerms || isLoadingPerms) {
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
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => navigate("/dashboard/manajemen-role")}
            className="flex items-center gap-2 text-gray-500 hover:text-[#2D7344] mb-2 font-semibold text-xs transition-colors w-max"
          >
            <ChevronLeft size={16} /> Kembali
          </button>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-white shadow-sm border border-gray-200 rounded-xl flex items-center justify-center">
              <KeyRound size={20} className="text-[#2D7344]" />
            </div>
            Assign Hak Akses: <span className="text-[#2D7344] underline decoration-green-200 underline-offset-4">{roleData?.name || roleData?.nama}</span>
          </h1>
        </div>
      </div>

      {/* DUA TABEL BERSEBELAHAN — tiap tabel punya scroll & search sendiri, tidak bergantung tinggi viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 items-start">

        {/* TABEL 1: UNASSIGNED */}
        <div
          className={`flex flex-col bg-slate-50 border rounded-2xl overflow-hidden transition-all duration-300 ${
            isDraggingOverUnassigned ? "border-[#2D7344] bg-[#EAFBF0] shadow-[0_0_20px_rgba(45,115,68,0.15)] ring-4 ring-[#2D7344]/10" : "border-gray-200"
          }`}
          onDragOver={(e) => handleDragOver(e, "unassigned")}
          onDragLeave={() => handleDragLeave("unassigned")}
          onDrop={(e) => handleDrop(e, "unassigned")}
        >
          <div className="p-3 border-b border-gray-200 bg-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                <ShieldAlert size={16} />
              </div>
              <div>
                <h2 className="font-extrabold text-slate-800">Tersedia</h2>
                <p className="text-[10px] text-slate-500 font-medium">Belum diberikan ke role ini</p>
              </div>
            </div>
            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-sm font-black border border-slate-200">
              {unassigned.length}
            </span>
          </div>
          <div className="p-2.5 border-b border-gray-100 bg-white shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Cari di daftar tersedia..."
                value={searchUnassigned}
                onChange={(e) => setSearchUnassigned(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2D7344]/20 focus:border-[#2D7344] transition-all"
              />
            </div>
          </div>
          <div className="max-h-[65vh] overflow-y-auto min-h-[240px] custom-scrollbar relative">
            {unassigned.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-gray-400 py-16">
                <Check size={48} className="mb-4 opacity-50" />
                <p className="font-semibold text-sm">Semua akses telah diberikan</p>
              </div>
            ) : Object.keys(groupedUnassigned).length === 0 ? (
              <div className="flex flex-col items-center justify-center text-gray-400 py-16">
                <Search size={40} className="mb-4 opacity-40" />
                <p className="font-semibold text-sm">Tidak ditemukan hasil pencarian</p>
              </div>
            ) : (
              <table className="w-full border-collapse">
                {Object.entries(groupedUnassigned).map(([mod, perms]) => renderModuleGroup(mod, perms, "unassigned"))}
              </table>
            )}
          </div>
        </div>

        {/* TABEL 2: ASSIGNED */}
        <div
          className={`flex flex-col bg-slate-50 border rounded-2xl overflow-hidden transition-all duration-300 ${
            isDraggingOverAssigned ? "border-[#2D7344] bg-[#EAFBF0] shadow-[0_0_20px_rgba(45,115,68,0.15)] ring-4 ring-[#2D7344]/10" : "border-gray-200"
          }`}
          onDragOver={(e) => handleDragOver(e, "assigned")}
          onDragLeave={() => handleDragLeave("assigned")}
          onDrop={(e) => handleDrop(e, "assigned")}
        >
          <div className="p-3 border-b border-[#2D7344]/20 bg-gradient-to-r from-[#2D7344] to-[#1E5230] text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white backdrop-blur-sm border border-white/20">
                <ShieldCheck size={16} />
              </div>
              <div>
                <h2 className="font-extrabold text-white tracking-wide">Diberikan</h2>
                <p className="text-[10px] text-green-100 font-medium">Akses yang dimiliki role</p>
              </div>
            </div>
            <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm font-black border border-white/30 shadow-inner">
              {assigned.length}
            </span>
          </div>
          <div className="p-2.5 border-b border-gray-100 bg-white shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Cari di daftar diberikan..."
                value={searchAssigned}
                onChange={(e) => setSearchAssigned(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2D7344]/20 focus:border-[#2D7344] transition-all"
              />
            </div>
          </div>
          <div className="max-h-[65vh] overflow-y-auto min-h-[240px] custom-scrollbar relative">
            {assigned.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-gray-400 py-16">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center mb-4">
                  <Plus size={24} className="text-gray-300" />
                </div>
                <p className="font-semibold text-sm">Belum ada hak akses</p>
                <p className="text-xs text-gray-400 mt-1">Tarik card ke area ini</p>
              </div>
            ) : Object.keys(groupedAssigned).length === 0 ? (
              <div className="flex flex-col items-center justify-center text-gray-400 py-16">
                <Search size={40} className="mb-4 opacity-40" />
                <p className="font-semibold text-sm">Tidak ditemukan hasil pencarian</p>
              </div>
            ) : (
              <table className="w-full border-collapse">
                {Object.entries(groupedAssigned).map(([mod, perms]) => renderModuleGroup(mod, perms, "assigned"))}
              </table>
            )}
          </div>
        </div>

      </div>

      {/* SAVE BAR — sticky ke bawah viewport, ikut scroll utama DashboardLayout, tidak perlu scroll panjang untuk dijangkau */}
      <div className="sticky bottom-0 -mx-6 md:-mx-8 mt-6 px-6 md:px-8 py-4 bg-white/90 backdrop-blur-xl border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20">
        <div className="hidden sm:flex items-center gap-4">
          {isChanged ? (
            <span className="text-sm font-bold text-amber-600 bg-amber-50 px-4 py-2 rounded-xl border border-amber-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              Ada perubahan yang belum disimpan
            </span>
          ) : (
            <span className="text-sm font-semibold text-gray-400 flex items-center gap-2 px-2">
              <Check size={16} /> Tidak ada perubahan
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
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-2.5 text-sm font-bold text-white bg-[#2D7344] hover:bg-[#1E5230] hover:shadow-[0_8px_20px_rgba(45,115,68,0.3)] hover:-translate-y-0.5 active:translate-y-0 rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {savePermissionsMutation.isPending ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Menyimpan...
              </>
            ) : (
              <>
                <Save size={18} /> Simpan Perubahan
              </>
            )}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AssignPermission;
