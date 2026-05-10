import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { roleService } from "../../services/auth/roleService";
import { rolePermissionService } from "../../services/auth/rolePermissionService";
import {
  ChevronLeft,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  Search,
  KeyRound,
  CheckCircle2,
  Layers,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const DetailRole = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // =========================================================
  // FETCH DATA SECARA PARALEL
  // =========================================================
  // 1. Ambil Data Detail Role (Untuk Nama Role)
  const {
    data: roleData,
    isLoading: isLoadingRole,
    isError: isErrorRole,
  } = useQuery({
    queryKey: ["role", id],
    queryFn: () => roleService.getRoleById(id),
    enabled: !!id,
  });

  // 2. Ambil Mapping Permission (Sesuai Permintaan Baru)
  const {
    data: rolePermissionsData,
    isLoading: isLoadingPerms,
    isError: isErrorPerms,
  } = useQuery({
    queryKey: ["role-permissions", id],
    queryFn: () => rolePermissionService.getRolePermissionById(id),
    enabled: !!id,
  });

  // =========================================================
  // OPTIMASI & NORMALISASI DATA
  // =========================================================
  // Antisipasi berbagai macam bentuk response API
  const rawPermissions = useMemo(() => {
    if (!rolePermissionsData) return [];

    // Jika response berupa array of objects [{id, permission: {id, name}}, ...]
    // atau array of permission objects langsung [{id, name}, ...]
    let dataList = Array.isArray(rolePermissionsData)
      ? rolePermissionsData
      : rolePermissionsData?.data || [];

    return dataList.map((item) => item.permission || item);
  }, [rolePermissionsData]);

  // Jika API role-permission kosong/gagal, sebagai fallback kita pakai data dari getRoleById
  const activePermissions =
    rawPermissions.length > 0
      ? rawPermissions
      : Array.isArray(roleData?.permissions)
        ? roleData.permissions
        : [];

  // Pengelompokan & Filter (Sangat efisien untuk meredam Lag)
  const groupedPermissions = useMemo(() => {
    if (!activePermissions || activePermissions.length === 0) return {};

    const filtered = activePermissions.filter((p) => {
      const pName = typeof p === "object" ? p.name : p;
      if (!pName) return false;
      return pName.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return filtered.reduce((acc, p) => {
      const pName = typeof p === "object" ? p.name : p;
      const moduleName = pName.split(":")[0].replace(/_/g, " ").toUpperCase();

      if (!acc[moduleName]) acc[moduleName] = [];
      acc[moduleName].push(pName);
      return acc;
    }, {});
  }, [activePermissions, searchQuery]);

  // =========================================================
  // RENDER LOADING & ERROR STATE
  // =========================================================
  if (isLoadingRole || isLoadingPerms) {
    return (
      <DashboardLayout activeMenu="Manajemen Role">
        <div className="flex h-full items-center justify-center flex-col gap-3">
          <Loader2 className="animate-spin text-[#2D7344]" size={40} />
          <p className="text-sm font-medium text-gray-500 animate-pulse">
            Memuat detail hak akses...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (isErrorRole || isErrorPerms || !roleData) {
    return (
      <DashboardLayout activeMenu="Manajemen Role">
        <div className="flex h-full items-center justify-center">
          <div className="p-8 text-center bg-red-50 rounded-2xl max-w-sm">
            <ShieldAlert className="mx-auto text-red-400 mb-3" size={40} />
            <h3 className="font-bold text-red-700">Gagal Memuat Data</h3>
            <p className="text-sm text-red-600/80 mt-1">
              Periksa koneksi atau ID Role tidak valid.
            </p>
            <button
              onClick={() => navigate("/dashboard/manajemen-role")}
              className="mt-4 px-4 py-2 bg-white text-red-600 font-bold text-sm rounded-lg border border-red-100 hover:bg-red-100 transition"
            >
              Kembali
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const moduleKeys = Object.keys(groupedPermissions);
  const totalFiltered = Object.values(groupedPermissions).reduce(
    (acc, val) => acc + val.length,
    0,
  );

  return (
    <DashboardLayout activeMenu="Manajemen Role">
      <main className="flex-1 flex flex-col h-full bg-[#FAFBFC] relative">
        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8 pb-10 custom-scrollbar">
          {/* BREADCRUMB */}
          <button
            onClick={() => navigate("/dashboard/manajemen-role")}
            className="flex items-center gap-2 text-gray-500 hover:text-[#2D7344] mb-6 font-semibold text-sm transition-colors w-max"
          >
            <ChevronLeft size={16} /> Kembali ke Manajemen Role
          </button>

          {/* HEADER BANNER */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-[#2D7344] to-[#1E5230] px-8 py-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-inner shrink-0">
                  <ShieldCheck size={32} />
                </div>
                <div>
                  <p className="text-green-100 font-semibold text-xs tracking-widest uppercase mb-1">
                    Detail Role Akses
                  </p>
                  <h1 className="text-3xl font-extrabold tracking-tight">
                    {roleData.name || roleData.nama}
                  </h1>
                </div>
              </div>

              {/* STATS BADGE */}
              <div className="bg-white/10 border border-white/20 rounded-xl px-5 py-3 backdrop-blur-sm flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] uppercase tracking-widest text-green-200 font-bold flex items-center gap-1">
                    <KeyRound size={12} /> Total Akses
                  </span>
                  <span className="text-2xl font-black">
                    {activePermissions.length}
                  </span>
                </div>
                <div className="w-px h-10 bg-white/20"></div>
                <div className="flex flex-col items-start">
                  <span className="text-[10px] uppercase tracking-widest text-green-200 font-bold flex items-center gap-1">
                    <Layers size={12} /> Modul
                  </span>
                  <span className="text-2xl font-black">
                    {moduleKeys.length}
                  </span>
                </div>
              </div>
            </div>

            {/* SEARCH BAR LOKAL */}
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
              <h3 className="text-sm font-bold text-gray-700 pl-2">
                Pemetaan Hak Akses Sistem
              </h3>
              <div className="relative w-full sm:w-80 group">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2D7344] transition-colors"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Cari dalam hak akses role ini..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2D7344]/20 focus:border-[#2D7344] transition-all shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* DAFTAR PERMISSIONS (GROUPED) */}
          {activePermissions.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
              <ShieldAlert className="mx-auto text-gray-300 mb-4" size={56} />
              <h3 className="text-lg font-bold text-gray-800">
                Tidak Ada Hak Akses
              </h3>
              <p className="text-gray-500 font-medium mt-1">
                Role ini belum memiliki izin (permission) untuk modul apapun.
              </p>
            </div>
          ) : moduleKeys.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <Search className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500 font-medium">
                Tidak menemukan hak akses dengan kata kunci "{searchQuery}".
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {moduleKeys.map((moduleName) => (
                <div
                  key={moduleName}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-[#2D7344]/30 transition-all duration-300"
                >
                  <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/80 flex justify-between items-center">
                    <h4 className="font-extrabold text-gray-800 tracking-tight flex items-center gap-2">
                      <Layers size={16} className="text-[#2D7344]" />
                      {moduleName}
                    </h4>
                    <span className="text-[10px] font-bold text-[#2D7344] bg-green-100 px-2 py-1 rounded-full">
                      {groupedPermissions[moduleName].length} Akses
                    </span>
                  </div>

                  <div className="p-4 flex flex-wrap gap-2">
                    {groupedPermissions[moduleName].map((permName, idx) => {
                      // Format tulisan action agar lebih rapi (misal: "create", "read")
                      const actionName = permName.split(":")[1] || permName;

                      return (
                        <div
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EAFBF0] border border-[#2D7344]/20 rounded-lg"
                        >
                          <CheckCircle2 size={14} className="text-[#2D7344]" />
                          <span className="text-xs font-bold text-[#2D7344] capitalize">
                            {actionName}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* INFO JUMLAH FILTER */}
          {searchQuery && moduleKeys.length > 0 && (
            <div className="mt-6 text-center text-sm font-medium text-gray-500">
              Menampilkan {totalFiltered} hak akses yang sesuai pencarian.
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
};

export default DetailRole;
