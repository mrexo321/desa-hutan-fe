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
  LayoutGrid,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  GripVertical,
  X,
  Filter,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const AssignPermission = () => {
  const { id: roleId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedPerms, setSelectedPerms] = useState([]);
  const [initialPerms, setInitialPerms] = useState([]);

  // Card-level search & category filter state
  const [searchUnassigned, setSearchUnassigned] = useState("");
  const [searchAssigned, setSearchAssigned] = useState("");
  const [categoryUnassigned, setCategoryUnassigned] = useState("all");
  const [categoryAssigned, setCategoryAssigned] = useState("all");

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

  // Available unique categories/modules
  const availableCategories = useMemo(() => {
    if (!allPermissions) return [];
    const categories = new Set();
    allPermissions.forEach((perm) => {
      const moduleName = perm.name.split(":")[0].replace(/_/g, " ").toUpperCase();
      categories.add(moduleName);
    });
    return Array.from(categories).sort();
  }, [allPermissions]);

  // Filter Unassigned perms with Card 1 search and category
  const unassigned = useMemo(() => {
    if (!allPermissions) return [];
    return allPermissions.filter((perm) => {
      const isUnassigned = !selectedPerms.includes(perm.id);
      if (!isUnassigned) return false;

      const moduleName = perm.name.split(":")[0].replace(/_/g, " ").toUpperCase();

      if (categoryUnassigned !== "all" && moduleName !== categoryUnassigned) {
        return false;
      }

      if (searchUnassigned.trim()) {
        const q = searchUnassigned.toLowerCase();
        const matchesName = perm.name.toLowerCase().includes(q);
        const matchesCat = moduleName.toLowerCase().includes(q);
        return matchesName || matchesCat;
      }

      return true;
    });
  }, [allPermissions, selectedPerms, categoryUnassigned, searchUnassigned]);

  // Filter Assigned perms with Card 2 search and category
  const assigned = useMemo(() => {
    if (!allPermissions) return [];
    return allPermissions.filter((perm) => {
      const isAssigned = selectedPerms.includes(perm.id);
      if (!isAssigned) return false;

      const moduleName = perm.name.split(":")[0].replace(/_/g, " ").toUpperCase();

      if (categoryAssigned !== "all" && moduleName !== categoryAssigned) {
        return false;
      }

      if (searchAssigned.trim()) {
        const q = searchAssigned.toLowerCase();
        const matchesName = perm.name.toLowerCase().includes(q);
        const matchesCat = moduleName.toLowerCase().includes(q);
        return matchesName || matchesCat;
      }

      return true;
    });
  }, [allPermissions, selectedPerms, categoryAssigned, searchAssigned]);

  const groupByModule = (permsArray) => {
    return permsArray.reduce((acc, perm) => {
      const moduleName = perm.name.split(":")[0].replace(/_/g, " ").toUpperCase();
      if (!acc[moduleName]) acc[moduleName] = [];
      acc[moduleName].push(perm);
      return acc;
    }, {});
  };

  const groupedUnassigned = useMemo(() => groupByModule(unassigned), [unassigned]);
  const groupedAssigned = useMemo(() => groupByModule(assigned), [assigned]);

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
    const ids = modulePerms.map((p) => p.id);
    if (target === "assigned") {
      setSelectedPerms((prev) => Array.from(new Set([...prev, ...ids])));
    } else {
      setSelectedPerms((prev) => prev.filter((id) => !ids.includes(id)));
    }
  };

  const handleAssignAll = () => {
    if (!allPermissions) return;
    const allIds = allPermissions.map((p) => p.id);
    setSelectedPerms(allIds);
  };

  const handleUnassignAll = () => {
    setSelectedPerms([]);
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
      setSelectedPerms((prev) => [...prev, permId]);
    } else if (zone === "unassigned" && selectedPerms.includes(permId)) {
      setSelectedPerms((prev) => prev.filter((id) => id !== permId));
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
  const renderPermissionCard = (perm, type) => {
    const actionName = perm.name.split(":")[1] || perm.name;
    const isAssigned = type === "assigned";
    const isDragged = draggedItemId === perm.id;

    return (
      <div
        key={perm.id}
        draggable
        onDragStart={(e) => handleDragStart(e, perm.id)}
        onDragEnd={handleDragEnd}
        className={`group relative flex items-center justify-between p-2.5 mb-1.5 rounded-xl border transition-all duration-200 cursor-grab active:cursor-grabbing bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 ${
          isDragged
            ? "opacity-40 border-dashed border-[#2D7344]"
            : "border-gray-100 hover:border-[#2D7344]/40"
        } ${isAssigned ? "border-l-4 border-l-[#00C47C]" : "border-l-4 border-l-slate-300"}`}
      >
        <div className="flex items-center gap-3 w-full min-w-0">
          <div className="text-gray-300 cursor-grab active:cursor-grabbing hover:text-gray-500 transition-colors shrink-0">
            <GripVertical size={16} />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[13px] font-bold text-gray-800 capitalize truncate">
              {actionName}
            </span>
            <span className="text-[10px] text-gray-400 font-mono mt-0.5 truncate">
              {perm.name}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => toggleSingle(perm.id)}
          className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 ${
            isAssigned
              ? "bg-red-50 text-red-500 hover:bg-red-500 hover:text-white"
              : "bg-emerald-50 text-[#2D7344] hover:bg-[#2D7344] hover:text-white"
          }`}
          title={isAssigned ? "Cabut Akses" : "Berikan Akses"}
        >
          {isAssigned ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
        </button>
      </div>
    );
  };

  const renderModuleGroup = (moduleName, perms, type) => {
    return (
      <div key={moduleName} className="mb-4 last:mb-0">
        <div className="flex items-center justify-between mb-2 sticky top-0 bg-slate-50/95 backdrop-blur-md z-10 py-1.5 px-1 border-b border-gray-200/50">
          <div className="flex items-center gap-2">
            <LayoutGrid size={14} className="text-gray-400" />
            <h4 className="text-xs font-bold tracking-wider text-gray-600 uppercase">
              {moduleName}
            </h4>
            <span className="bg-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-gray-200 text-gray-500">
              {perms.length}
            </span>
          </div>

          <button
            type="button"
            onClick={() => moveModule(perms, type === "unassigned" ? "assigned" : "unassigned")}
            className={`text-[11px] font-bold px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              type === "unassigned"
                ? "bg-emerald-50 text-[#2D7344] hover:bg-[#2D7344] hover:text-white"
                : "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white"
            }`}
          >
            {type === "unassigned" ? "+ Pindahkan Modul" : "- Cabut Modul"}
          </button>
        </div>
        <div>{perms.map((p) => renderPermissionCard(p, type))}</div>
      </div>
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
    <DashboardLayout activeMenu="Manajemen Role" noScroll noPadding>
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#FAFBFC] relative">
        
        {/* HEADER TOP BAR - STICKY & ALWAYS ACCESSIBLE WITHOUT SCROLLING */}
        <div className="bg-white border-b border-gray-200/80 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 shadow-xs z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard/manajemen-role")}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all cursor-pointer shrink-0"
              title="Kembali"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="w-10 h-10 bg-emerald-50 text-[#2D7344] border border-emerald-100/80 rounded-xl flex items-center justify-center shrink-0 shadow-inner">
              <KeyRound size={20} strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                  Assign / Unassign Permissions
                </span>
                <h1 className="text-lg font-extrabold text-gray-900 tracking-tight">
                  {roleData?.name || roleData?.nama || "Role"}
                </h1>
              </div>
              <p className="text-xs text-gray-400 font-medium">
                Kelola hak akses untuk peran ini secara efisien dengan drag &amp; drop atau pencarian per kartu.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Status Unsaved Indicator */}
            {isChanged && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                Belum Disimpan
              </span>
            )}

            {/* TOP SAVE BUTTON */}
            <button
              onClick={handleSubmit}
              disabled={!isChanged || savePermissionsMutation.isPending}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black text-white bg-[#2D7344] hover:bg-[#1E5230] transition-all shadow-md shadow-green-950/10 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none shrink-0 cursor-pointer"
            >
              {savePermissionsMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* MAIN CONTAINER (LOCKED HEIGHT, CARD-LEVEL SCROLL & SEARCH) */}
        <div className="flex-1 p-6 flex flex-col md:flex-row gap-6 overflow-hidden min-h-0 relative">

          {/* COLUMN 1: UNASSIGNED / TERSEDIA CARD */}
          <div
            className={`flex-1 flex flex-col h-full min-h-0 bg-white border rounded-3xl overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.02)] transition-all duration-300 ${
              isDraggingOverUnassigned
                ? "border-[#2D7344] bg-[#EAFBF0] shadow-[0_0_25px_rgba(45,115,68,0.15)] ring-4 ring-[#2D7344]/10"
                : "border-gray-200/80"
            }`}
            onDragOver={(e) => handleDragOver(e, "unassigned")}
            onDragLeave={() => handleDragLeave("unassigned")}
            onDrop={(e) => handleDrop(e, "unassigned")}
          >
            {/* Card Header & Per-card Search */}
            <div className="p-4 border-b border-gray-100 bg-slate-50/80 flex flex-col gap-3 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-200/80 text-slate-700 flex items-center justify-center font-bold">
                    <ShieldAlert size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-extrabold text-slate-800 text-sm">Hak Akses Tersedia</h2>
                      <span className="bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded-full text-[11px] font-black">
                        {unassigned.length}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">Belum diberikan ke role ini</p>
                  </div>
                </div>

                {unassigned.length > 0 && (
                  <button
                    type="button"
                    onClick={handleAssignAll}
                    className="text-[11px] font-black text-[#2D7344] bg-emerald-50 hover:bg-[#2D7344] hover:text-white px-3 py-1.5 rounded-xl border border-emerald-200/80 transition-all cursor-pointer shrink-0"
                  >
                    + Berikan Semua
                  </button>
                )}
              </div>

              {/* Card-level Search and Category Dropdown */}
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="relative flex-1 w-full group">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2D7344] transition-colors"
                    size={14}
                  />
                  <input
                    type="text"
                    placeholder="Cari izin / modul..."
                    value={searchUnassigned}
                    onChange={(e) => setSearchUnassigned(e.target.value)}
                    className="w-full pl-8 pr-7 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#2D7344] transition-all"
                  />
                  {searchUnassigned && (
                    <button
                      type="button"
                      onClick={() => setSearchUnassigned("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                <div className="relative w-full sm:w-auto shrink-0">
                  <select
                    value={categoryUnassigned}
                    onChange={(e) => setCategoryUnassigned(e.target.value)}
                    className="w-full sm:w-auto bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-gray-600 focus:outline-none focus:border-[#2D7344] transition-all cursor-pointer"
                  >
                    <option value="all">Semua Kategori ({availableCategories.length})</option>
                    {availableCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Scrollable Body Column 1 */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar min-h-0 relative">
              {Object.keys(groupedUnassigned).length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3 py-12">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                    <Check size={28} strokeWidth={2.5} />
                  </div>
                  <p className="font-extrabold text-slate-700 text-sm">Tidak Ada Izin Ditemukan</p>
                  <p className="text-xs text-slate-400 font-medium max-w-xs text-center">
                    {searchUnassigned || categoryUnassigned !== "all"
                      ? "Coba ubah kata kunci atau filter kategori pada kartu ini."
                      : "Role ini telah memiliki seluruh izin yang tersedia di dalam sistem."}
                  </p>
                </div>
              ) : (
                Object.entries(groupedUnassigned).map(([mod, perms]) =>
                  renderModuleGroup(mod, perms, "unassigned")
                )
              )}
            </div>
          </div>

          {/* COLUMN 2: ASSIGNED / DIBERIKAN CARD */}
          <div
            className={`flex-1 flex flex-col h-full min-h-0 bg-white border rounded-3xl overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.02)] transition-all duration-300 ${
              isDraggingOverAssigned
                ? "border-[#2D7344] bg-[#EAFBF0] shadow-[0_0_25px_rgba(45,115,68,0.15)] ring-4 ring-[#2D7344]/10"
                : "border-gray-200/80"
            }`}
            onDragOver={(e) => handleDragOver(e, "assigned")}
            onDragLeave={() => handleDragLeave("assigned")}
            onDrop={(e) => handleDrop(e, "assigned")}
          >
            {/* Card Header & Per-card Search */}
            <div className="p-4 border-b border-emerald-900/10 bg-gradient-to-r from-[#0B241A] to-[#1E5230] text-white flex flex-col gap-3 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/10 text-emerald-300 border border-white/10 flex items-center justify-center font-bold">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-extrabold text-white text-sm">Hak Akses Diberikan</h2>
                      <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-[11px] font-black border border-white/20">
                        {assigned.length}
                      </span>
                    </div>
                    <p className="text-[11px] text-green-200/80 font-medium">Akses aktif yang dimiliki role</p>
                  </div>
                </div>

                {assigned.length > 0 && (
                  <button
                    type="button"
                    onClick={handleUnassignAll}
                    className="text-[11px] font-black text-red-200 bg-white/10 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-xl border border-white/20 transition-all cursor-pointer shrink-0"
                  >
                    - Cabut Semua
                  </button>
                )}
              </div>

              {/* Card-level Search and Category Dropdown */}
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="relative flex-1 w-full group">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2D7344] transition-colors"
                    size={14}
                  />
                  <input
                    type="text"
                    placeholder="Cari izin / modul..."
                    value={searchAssigned}
                    onChange={(e) => setSearchAssigned(e.target.value)}
                    className="w-full pl-8 pr-7 py-1.5 bg-white/95 text-gray-800 border border-white/20 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-white transition-all placeholder-gray-400"
                  />
                  {searchAssigned && (
                    <button
                      type="button"
                      onClick={() => setSearchAssigned("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                <div className="relative w-full sm:w-auto shrink-0">
                  <select
                    value={categoryAssigned}
                    onChange={(e) => setCategoryAssigned(e.target.value)}
                    className="w-full sm:w-auto bg-white/95 text-gray-800 border border-white/20 rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-white transition-all cursor-pointer"
                  >
                    <option value="all">Semua Kategori ({availableCategories.length})</option>
                    {availableCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Scrollable Body Column 2 */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar min-h-0 relative">
              {Object.keys(groupedAssigned).length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3 py-12">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 border border-slate-200 flex items-center justify-center">
                    <Plus size={28} strokeWidth={2.5} />
                  </div>
                  <p className="font-extrabold text-slate-700 text-sm">Tidak Ada Izin Ditemukan</p>
                  <p className="text-xs text-slate-400 font-medium max-w-xs text-center">
                    {searchAssigned || categoryAssigned !== "all"
                      ? "Coba ubah kata kunci atau filter kategori pada kartu ini."
                      : "Klik tombol + Pindahkan atau tarik card dari kolom kiri ke area ini."}
                  </p>
                </div>
              ) : (
                Object.entries(groupedAssigned).map(([mod, perms]) =>
                  renderModuleGroup(mod, perms, "assigned")
                )
              )}
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
};

export default AssignPermission;

