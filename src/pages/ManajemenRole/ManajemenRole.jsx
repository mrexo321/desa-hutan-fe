import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import DataTable from "../../components/DataTable";
import { roleService } from "../../services/auth/roleService";
import { rolePermissionService } from "../../services/auth/rolePermissionService";
import { usePermission } from "../../hooks/usePermission";
import {
  Eye,
  Edit2,
  Key,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash,
  Trash2,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const getRoleId = (role) =>
  String(
    role?.roleId ??
      role?.role_id ??
      role?.roleID ??
      role?.RoleId ??
      role?.role?.id ??
      role?.role?.roleId ??
      role?.role?.role_id ??
      role?.Role?.id ??
      role?.id ??
      "",
  );

const getRelationRoleId = (relation) =>
  String(
    relation?.roleId ??
      relation?.role_id ??
      relation?.roleID ??
      relation?.RoleId ??
      relation?.role?.id ??
      relation?.role?.roleId ??
      relation?.role?.role_id ??
      relation?.Role?.id ??
      relation?.Role?.roleId ??
      "",
  );

const extractPermissions = (value) => {
  const source = Array.isArray(value) ? value : value ? [value] : [];

  return source.flatMap((item) => {
    if (!item || typeof item !== "object") return item ? [item] : [];
    if (Array.isArray(item.permissions)) return item.permissions;
    if (Array.isArray(item.role_permissions)) return item.role_permissions;
    if (Array.isArray(item.rolePermissions)) return item.rolePermissions;
    if (item.permission) return [item.permission];
    if (item.Permission) return [item.Permission];
    if (
      item.permissionId ||
      item.permission_id ||
      item.permissionID ||
      item.PermissionId
    ) {
      return [
        {
          id:
            item.permissionId ??
            item.permission_id ??
            item.permissionID ??
            item.PermissionId,
          name:
            item.permissionName ??
            item.permission_name ??
            item.PermissionName ??
            item.name,
        },
      ];
    }
    return [item];
  });
};

const getPermissionId = (permission) =>
  String(
    permission?.permissionId ??
      permission?.permission_id ??
      permission?.permissionID ??
      permission?.PermissionId ??
      permission?.permission?.id ??
      permission?.Permission?.id ??
      permission?.id ??
      permission?.name ??
      permission ??
      "",
  );

const uniqueByPermission = (permissions) => {
  const permissionMap = new Map();

  extractPermissions(permissions).forEach((permission) => {
    const permissionId = getPermissionId(permission);
    if (permissionId) permissionMap.set(permissionId, permission);
  });

  return Array.from(permissionMap.values());
};

const ManajemenRole = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { can, canAny } = usePermission();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  const {
    data: roles = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["roles"],
    queryFn: roleService.getRoles,
  });

  const { data: rolePermissionRelations = [] } = useQuery({
    queryKey: ["role-permissions"],
    queryFn: rolePermissionService.getRolePermission,
    enabled: canAny(["role:read", "role_permission:read", "role_permission:assign"]),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => roleService.deleteRole(id),
    onSuccess: () => {
      toast.success("Role berhasil dihapus!");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["role-permissions"] });
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Gagal menghapus role."),
  });

  const deleteBulkMutation = useMutation({
    mutationFn: (ids) => roleService.deleteBulkRoles(ids),
    onSuccess: () => {
      toast.success(`${selectedIds.length} Role berhasil dihapus!`);
      setSelectedIds([]);
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["role-permissions"] });
    },
    onError: (err) => {
      const data = err?.response?.data;
      let errorMsg = data?.message || "Gagal menghapus data secara massal.";

      if (data?.errors && data.errors.length > 0) {
        errorMsg = `${errorMsg}: ${data.errors[0].message}`;
      }

      toast.error(errorMsg);
    },
  });

  const getPermissionsForRole = (roleData) => {
    const roleId = getRoleId(roleData);
    const relationPermissions = rolePermissionRelations
      .filter((relation) => getRelationRoleId(relation) === roleId)
      .flatMap(extractPermissions);

    return uniqueByPermission([
      roleData?.permissions || [],
      relationPermissions,
    ]);
  };

  const lowerSearchQuery = searchQuery.toLowerCase();
  const filteredRoles = roles
    .filter((role) =>
      lowerSearchQuery
        ? (role.name || role.nama || "").toLowerCase().includes(lowerSearchQuery)
        : true,
    )
    .map((role, index) => ({
      ...role,
      _index: index + 1,
      _permissions: getPermissionsForRole(role),
    }));

  const handleSelectAll = (event) => {
    setSelectedIds(event.target.checked ? filteredRoles.map((role) => role.id) : []);
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
        onClick: () => deleteBulkMutation.mutate(selectedIds),
      },
      cancel: { label: "Batal" },
    });
  };

  const isAllSelected =
    filteredRoles.length > 0 && selectedIds.length === filteredRoles.length;

  const tableColumns = [
    ...(can("role:delete")
      ? [
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
        ]
      : []),
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
              className={`font-bold ${
                isSuperadmin ? "text-[#2D7344]" : "text-gray-900"
              }`}
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
      header: "Hak Akses",
      render: (row) =>
        row._permissions.length > 0 ? (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700">
            <ShieldCheck size={14} />
            <span className="text-xs font-bold">
              {row._permissions.length} Akses Diberikan
            </span>
          </div>
        ) : (
          <span className="text-gray-400 italic text-xs">
            Tidak ada permission khusus
          </span>
        ),
    },
    {
      header: "Aksi",
      className: "text-center w-40",
      render: (row) => (
        <div className="flex items-center justify-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
          {can("role_permission:assign") && (
            <button
              onClick={() =>
                navigate(`/dashboard/manajemen-role/assign/${row.id}`)
              }
              className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-all"
              title="Kelola Hak Akses"
            >
              <Key size={16} strokeWidth={2.5} />
            </button>
          )}
          {can("role:read") && (
            <button
              onClick={() =>
                navigate(`/dashboard/manajemen-role/detail/${row.id}`)
              }
              className="p-1.5 text-gray-400 hover:text-[#0A66C2] hover:bg-blue-50 rounded-md transition-all"
              title="Lihat Detail"
            >
              <Eye size={16} strokeWidth={2} />
            </button>
          )}
          {can("role:update") && (
            <button
              onClick={() => navigate(`/dashboard/manajemen-role/edit/${row.id}`)}
              className="p-1.5 text-gray-400 hover:text-[#2D7344] hover:bg-[#EAFBF0] rounded-md transition-all"
              title="Edit"
            >
              <Edit2 size={16} strokeWidth={2} />
            </button>
          )}
          {can("role:delete") && (
            <button
              onClick={() => confirmDelete(row.id)}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
              title="Hapus"
            >
              <Trash2 size={16} strokeWidth={2} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout activeMenu="Manajemen Role">
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#FAFBFC]">
        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8 custom-scrollbar">
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
              <div className="flex items-center gap-4">
                {can("role:delete") && selectedIds.length > 0 ? (
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
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:border-[#2D7344]"
                  />
                </div>
                {can("role:create") && (
                  <button
                    onClick={() => navigate("/dashboard/manajemen-role/create")}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#2D7344] hover:bg-[#1E5230] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm"
                  >
                    <Plus size={18} strokeWidth={2.5} /> Tambah Role
                  </button>
                )}
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

            <div className="p-4 md:p-6 border-t border-gray-50 bg-gray-50/30 rounded-b-2xl">
              <p className="text-xs font-medium text-gray-500">
                Menampilkan{" "}
                <span className="font-bold text-gray-900">
                  {filteredRoles.length}
                </span>{" "}
                role
              </p>
            </div>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default ManajemenRole;
