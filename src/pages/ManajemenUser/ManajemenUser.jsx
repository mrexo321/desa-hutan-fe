import React, { useMemo, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import DataTable from "../../components/DataTable";
import { roleService } from "../../services/auth/roleService";
import userService from "../../services/auth/userService";
import { userRoleService } from "../../services/auth/userRoleService";
import { usePermission } from "../../hooks/usePermission";
import {
  Edit2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Plus,
  Search,
  ShieldPlus,
  Trash,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const getUserId = (user) =>
  String(user?.id ?? user?.userId ?? user?.user_id ?? user?.user?.id ?? "");

const getRoleId = (role, roles = []) => {
  if (role && typeof role === "object") {
    const id =
      role.roleId ??
      role.role_id ??
      role.roleID ??
      role.RoleId ??
      role.role?.id ??
      role.role?.roleId ??
      role.role?.role_id ??
      role.Role?.id ??
      role.id;

    if (id !== undefined && id !== null) return String(id);

    const roleName =
      role.name ??
      role.nama ??
      role.role?.name ??
      role.role?.nama ??
      role.Role?.name ??
      role.Role?.nama;
    const matchedRole = roles.find(
      (item) => (item.name ?? item.nama) === roleName,
    );
    if (matchedRole?.id) return String(matchedRole.id);
  }

  if (typeof role === "string" || typeof role === "number") {
    const roleValue = String(role);
    const matchedRole = roles.find(
      (item) =>
        String(item.id) === roleValue ||
        item.name === roleValue ||
        item.nama === roleValue,
    );
    return matchedRole?.id ? String(matchedRole.id) : roleValue;
  }

  return "";
};

const getRelationUserId = (relation) =>
  String(
    relation?.userId ??
      relation?.user_id ??
      relation?.userID ??
      relation?.UserId ??
      relation?.user?.id ??
      relation?.user?.userId ??
      relation?.user?.user_id ??
      relation?.User?.id ??
      relation?.User?.userId ??
      "",
  );

const getRelationRoleId = (relation, roles = []) =>
  getRoleId(
    relation?.role ??
      relation?.roleId ??
      relation?.role_id ??
      relation?.roleID ??
      relation?.RoleId ??
      relation?.Role ??
      relation?.roles?.[0] ??
      relation?.roleName ??
      relation?.role_name,
    roles,
  );

const uniqueValues = (values) => [...new Set(values.filter(Boolean))];

const ManajemenUser = () => {
  const queryClient = useQueryClient();
  const { can, canAny } = usePermission();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [initialRoles, setInitialRoles] = useState([]);
  const [isPreparingRoles, setIsPreparingRoles] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userInputs, setUserInputs] = useState([
    { username: "", password: "" },
  ]);
  const [editData, setEditData] = useState({
    id: "",
    username: "",
    password: "",
  });

  const {
    data: users = [],
    isLoading: isLoadingUsers,
    isError: isErrorUsers,
  } = useQuery({
    queryKey: ["users"],
    queryFn: userService.getUser,
  });

  const { data: roles = [], isLoading: isLoadingRoles } = useQuery({
    queryKey: ["roles"],
    queryFn: roleService.getRoles,
  });

  const { data: userRoleRelations = [] } = useQuery({
    queryKey: ["user-roles"],
    queryFn: userRoleService.getUserRoles,
    enabled: can("user_role:assign"),
  });

  const createUserMutation = useMutation({
    mutationFn: (payload) =>
      payload.length === 1
        ? userService.createUser(payload[0])
        : userService.createUserBulk(payload),
    onSuccess: () => {
      toast.success("User berhasil ditambahkan!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      closeAddModal();
    },
    onError: (err) => {
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0]?.message ||
        "Gagal menyimpan user baru.";
      toast.error(errorMsg);
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, payload }) => userService.updateUser(id, payload),
    onSuccess: () => {
      toast.success("User berhasil diperbarui!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      closeEditModal();
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Gagal memperbarui user."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => userService.deleteUser(id),
    onSuccess: () => {
      toast.success("User berhasil dihapus!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Gagal menghapus user."),
  });

  const deleteBulkMutation = useMutation({
    mutationFn: (ids) => userService.deleteUserBulk(ids),
    onSuccess: () => {
      toast.success(`${selectedIds.length} User berhasil dihapus!`);
      setSelectedIds([]);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () => toast.error("Gagal menghapus data secara massal."),
  });

  const saveUserRolesMutation = useMutation({
    mutationFn: async () => {
      const userId = getUserId(selectedUser);
      if (!userId) throw new Error("User tidak valid.");

      const addedIds = selectedRoles.filter((id) => !initialRoles.includes(id));
      const removedIds = initialRoles.filter((id) => !selectedRoles.includes(id));

      const assignPayload = addedIds.map((roleId) => ({ userId, roleId }));
      const unassignPayload = removedIds.map((roleId) => ({ userId, roleId }));

      if (unassignPayload.length > 0) {
        await userRoleService.unassignRoleBulk(unassignPayload);
      }

      if (assignPayload.length > 0) {
        await userRoleService.assignRoleBulk(assignPayload);
      }
    },
    onSuccess: () => {
      toast.success("Hak akses role pengguna berhasil diperbarui!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user-roles"] });
      closeAssignRoleModal();
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Gagal memperbarui Role."),
  });

  const getRoleIdsForUser = (user, relations = userRoleRelations) => {
    const userId = getUserId(user);
    const rolesFromUser = [
      user?.roleId,
      user?.role_id,
      user?.role,
      ...(Array.isArray(user?.roles) ? user.roles : []),
    ].map((role) => getRoleId(role, roles));
    const rolesFromRelations = relations
      .filter((relation) => getRelationUserId(relation) === userId)
      .map((relation) => getRelationRoleId(relation, roles));

    return uniqueValues([...rolesFromUser, ...rolesFromRelations]);
  };

  const applyCurrentRoles = (roleIds) => {
    const nextRoleIds = uniqueValues(roleIds);
    setSelectedRoles(nextRoleIds);
    setInitialRoles(nextRoleIds);
  };

  const openAssignRoleModal = async (user) => {
    setSelectedUser(user);
    applyCurrentRoles(getRoleIdsForUser(user));
    setIsRoleModalOpen(true);
    setIsPreparingRoles(true);

    try {
      const [userDetailResult, userRoleListResult] =
        await Promise.allSettled([
          userService.getUserById(getUserId(user)),
          queryClient.fetchQuery({
            queryKey: ["user-roles"],
            queryFn: userRoleService.getUserRoles,
          }),
        ]);
      const userDetail =
        userDetailResult.status === "fulfilled" && userDetailResult.value
          ? userDetailResult.value
          : user;
      const latestUserRoleRelations =
        userRoleListResult.status === "fulfilled"
          ? userRoleListResult.value
          : userRoleRelations;
      const freshRoleIds = uniqueValues([
        ...getRoleIdsForUser(user, latestUserRoleRelations),
        ...getRoleIdsForUser(userDetail, latestUserRoleRelations),
      ]);

      setSelectedUser(userDetail);
      applyCurrentRoles(freshRoleIds);
    } catch {
      toast.error("Gagal mengambil role user terbaru.");
    } finally {
      setIsPreparingRoles(false);
    }
  };

  const closeAssignRoleModal = () => {
    setIsRoleModalOpen(false);
    setTimeout(() => {
      setSelectedUser(null);
      setSelectedRoles([]);
      setInitialRoles([]);
      setIsPreparingRoles(false);
    }, 200);
  };

  const handleToggleRole = (roleId) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId],
    );
  };

  const isRoleChanged =
    selectedRoles.length !== initialRoles.length ||
    !selectedRoles.every((id) => initialRoles.includes(id));

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setTimeout(() => {
      setUserInputs([{ username: "", password: "" }]);
      setShowPassword(false);
    }, 200);
  };

  const handleAddRow = () =>
    setUserInputs([...userInputs, { username: "", password: "" }]);

  const handleRemoveRow = (index) => {
    setUserInputs(userInputs.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleInputAddChange = (index, field, value) => {
    const updated = [...userInputs];
    updated[index][field] = value;
    setUserInputs(updated);
  };

  const handleSimpanUserBaru = (event) => {
    event.preventDefault();
    const validInputs = userInputs.filter(
      (user) => user.username.trim() !== "" && user.password.trim() !== "",
    );

    if (validInputs.length === 0) {
      toast.error("Minimal satu data user harus diisi!");
      return;
    }

    createUserMutation.mutate(validInputs);
  };

  const openEditModal = (user) => {
    setEditData({ id: getUserId(user), username: user.username || "", password: "" });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setTimeout(() => {
      setEditData({ id: "", username: "", password: "" });
      setShowPassword(false);
    }, 200);
  };

  const handleSaveEditUser = () => {
    const payload = {
      username: editData.username,
      ...(editData.password ? { password: editData.password } : {}),
    };

    updateUserMutation.mutate({ id: editData.id, payload });
  };

  const confirmDelete = (user) => {
    toast.warning("Yakin ingin menghapus pengguna ini?", {
      description: `Akun @${user.username} akan dihapus secara permanen.`,
      action: {
        label: "Ya, Hapus",
        onClick: () => deleteMutation.mutate(getUserId(user)),
      },
      cancel: { label: "Batal" },
    });
  };

  const confirmBulkDelete = () => {
    toast.error(
      `Yakin ingin menghapus ${selectedIds.length} pengguna terpilih?`,
      {
        description: "Operasi massal ini tidak dapat dibatalkan.",
        action: {
          label: "Ya, Hapus Semua",
          onClick: () => deleteBulkMutation.mutate(selectedIds),
        },
        cancel: { label: "Batal" },
      },
    );
  };

  const filteredUsers = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();

    return users
      .filter((user) =>
        lowerQuery
          ? (user.username || "").toLowerCase().includes(lowerQuery)
          : true,
      )
      .map((user, index) => ({ ...user, _index: index + 1 }));
  }, [users, searchQuery]);

  const handleSelectAll = (event) => {
    setSelectedIds(
      event.target.checked ? filteredUsers.map((user) => getUserId(user)) : [],
    );
  };

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const isAllSelected =
    filteredUsers.length > 0 && selectedIds.length === filteredUsers.length;

  const tableColumns = [
    ...(can("user:delete")
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
                checked={selectedIds.includes(getUserId(row))}
                onChange={() => handleSelectRow(getUserId(row))}
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
        <div className="text-center font-semibold text-gray-500">
          {row._index}
        </div>
      ),
    },
    {
      header: "Informasi Pengguna",
      render: (row) => {
        const username = row.username || "Anonim";
        const initial = username.charAt(0).toUpperCase();

        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-[#2D7344] text-sm font-bold shrink-0 uppercase">
              {initial}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-gray-900">@{username}</span>
            </div>
          </div>
        );
      },
    },
    {
      header: "Aksi",
      className: "text-center w-48",
      render: (row) =>
        canAny(["user_role:assign", "user:update", "user:delete"]) ? (
          <div className="flex items-center justify-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
            {can("user_role:assign") && (
              <button
                onClick={() => openAssignRoleModal(row)}
                className="px-3 py-1.5 flex items-center gap-1.5 text-[#2D7344] hover:text-white hover:bg-[#2D7344] border border-[#2D7344]/30 hover:border-[#2D7344] rounded-md transition-all text-xs font-bold bg-[#EAFBF0]"
                title="Atur Role Akses"
              >
                <ShieldPlus size={14} /> Roles
              </button>
            )}
            {can("user:update") && (
              <button
                onClick={() => openEditModal(row)}
                className="p-1.5 text-gray-400 hover:text-[#0A66C2] hover:bg-blue-50 rounded-md transition-all"
                title="Edit Data User"
              >
                <Edit2 size={16} strokeWidth={2} />
              </button>
            )}
            {can("user:delete") && (
              <button
                onClick={() => confirmDelete(row)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                title="Hapus User"
              >
                <Trash2 size={16} strokeWidth={2} />
              </button>
            )}
          </div>
        ) : (
          <span className="text-gray-400 text-xs">-</span>
        ),
    },
  ];

  return (
    <DashboardLayout activeMenu="Manajemen User">
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#FAFBFC]">
        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8 custom-scrollbar">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Manajemen User
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Kelola data akun pengguna, hak akses, dan wilayah penugasan.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 flex flex-col">
            <div className="p-6 border-b border-gray-50 flex flex-col xl:flex-row justify-between gap-6">
              <div className="flex items-center gap-4">
                {can("user:delete") && selectedIds.length > 0 ? (
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
                      <Users size={20} strokeWidth={2} />
                    </div>
                    <h2 className="text-lg font-bold text-gray-800 hidden sm:block">
                      Tabel Data User
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
                    placeholder="Cari username..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:border-[#2D7344]"
                  />
                </div>
                {can("user:create") && (
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#2D7344] hover:bg-[#1E5230] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm"
                  >
                    <Plus size={18} strokeWidth={2.5} /> Tambah User
                  </button>
                )}
              </div>
            </div>

            <DataTable
              columns={tableColumns}
              data={filteredUsers}
              isLoading={isLoadingUsers}
              isError={isErrorUsers}
              searchQuery={searchQuery}
              emptyMessage="Belum ada data pengguna yang terdaftar."
            />

            <div className="p-4 md:p-6 border-t border-gray-50 bg-gray-50/30 rounded-b-2xl">
              <p className="text-xs font-medium text-gray-500">
                Menampilkan{" "}
                <span className="font-bold text-gray-900">
                  {filteredUsers.length}
                </span>{" "}
                pengguna
              </p>
            </div>
          </div>
        </div>
      </main>

      {isRoleModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-[#2D7344] text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <ShieldPlus size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Atur Role Akses</h3>
                  <p className="text-xs font-medium text-green-100">
                    User: @{selectedUser.username}
                  </p>
                </div>
              </div>
              <button
                onClick={closeAssignRoleModal}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 bg-gray-50/30 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-bold text-gray-700">
                  Pilih Role:
                </span>
                <span className="text-xs font-medium text-[#2D7344] bg-green-50 px-2 py-1 rounded border border-green-100">
                  {selectedRoles.length} Terpilih
                </span>
              </div>

              {isLoadingRoles || isPreparingRoles ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-[#2D7344]" size={32} />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {roles.map((role) => {
                    const roleId = getRoleId(role);
                    const isChecked = selectedRoles.includes(roleId);

                    return (
                      <label
                        key={roleId}
                        className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${
                          isChecked
                            ? "bg-[#EAFBF0] border-[#2D7344]/40 shadow-sm"
                            : "bg-white border-gray-200 hover:border-[#2D7344]/50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-[#2D7344] rounded border-gray-300 focus:ring-[#2D7344] cursor-pointer"
                          checked={isChecked}
                          onChange={() => handleToggleRole(roleId)}
                        />
                        <span
                          className={`text-sm ${
                            isChecked
                              ? "font-bold text-[#2D7344]"
                              : "font-semibold text-gray-700"
                          }`}
                        >
                          {role.name || role.nama}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-between items-center gap-3">
              <div>
                {isRoleChanged && (
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">
                    Ada Perubahan
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={closeAssignRoleModal}
                  disabled={saveUserRolesMutation.isPending}
                  className="px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-bold transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={() => saveUserRolesMutation.mutate()}
                  disabled={
                    saveUserRolesMutation.isPending ||
                    isPreparingRoles ||
                    !isRoleChanged ||
                    selectedRoles.length === 0
                  }
                  className="flex items-center gap-2 px-5 py-2 bg-[#2D7344] hover:bg-[#1E5230] text-white rounded-lg text-sm font-bold transition-colors shadow-sm disabled:opacity-50"
                >
                  {saveUserRolesMutation.isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Menyimpan...
                    </>
                  ) : (
                    "Simpan Hak Akses"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  Tambah Pengguna Baru
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Isi username dan password. Mendukung penambahan banyak user
                  sekaligus.
                </p>
              </div>
              <button
                onClick={closeAddModal}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSimpanUserBaru}
              className="flex flex-col max-h-[70vh]"
            >
              <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
                {userInputs.map((input, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row items-start sm:items-end gap-3 p-4 border border-gray-100 bg-gray-50/30 rounded-xl relative"
                  >
                    {userInputs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(index)}
                        className="absolute -top-2.5 -right-2.5 bg-red-100 hover:bg-red-200 text-red-600 p-1.5 rounded-full border border-white shadow-sm transition-colors"
                        title="Hapus baris"
                      >
                        <X size={14} strokeWidth={3} />
                      </button>
                    )}

                    <div className="flex-1 w-full">
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Username {index + 1}
                      </label>
                      <div className="relative">
                        <Mail
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                          size={16}
                        />
                        <input
                          type="text"
                          required
                          value={input.username}
                          onChange={(event) =>
                            handleInputAddChange(
                              index,
                              "username",
                              event.target.value,
                            )
                          }
                          placeholder="Contoh: andi_admin"
                          className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2D7344]/20 focus:border-[#2D7344]"
                        />
                      </div>
                    </div>

                    <div className="flex-1 w-full mt-3 sm:mt-0">
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Password {index + 1}
                      </label>
                      <div className="relative">
                        <Lock
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                          size={16}
                        />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={input.password}
                          onChange={(event) =>
                            handleInputAddChange(
                              index,
                              "password",
                              event.target.value,
                            )
                          }
                          placeholder="Minimal 6 karakter"
                          className="w-full pl-9 pr-9 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2D7344]/20 focus:border-[#2D7344]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddRow}
                  className="flex items-center gap-2 text-sm font-bold text-[#2D7344] hover:text-[#1E5230] px-2"
                >
                  <Plus size={16} /> Tambah Baris User Lain
                </button>
              </div>

              <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-end gap-3 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="px-5 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-bold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createUserMutation.isPending}
                  className="flex items-center gap-2 px-6 py-2 bg-[#2D7344] hover:bg-[#1E5230] text-white rounded-lg text-sm font-bold transition-colors shadow-sm disabled:opacity-70"
                >
                  {createUserMutation.isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Menyimpan...
                    </>
                  ) : (
                    "Simpan Data"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-800">Edit Pengguna</h3>
              <button
                onClick={closeEditModal}
                className="p-2 text-gray-400 hover:text-red-500 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    value={editData.username}
                    onChange={(event) =>
                      setEditData({ ...editData, username: event.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-[#2D7344]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Password{" "}
                  <span className="text-gray-400 font-normal text-xs">
                    (Kosongkan jika tidak diubah)
                  </span>
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={editData.password}
                    onChange={(event) =>
                      setEditData({ ...editData, password: event.target.value })
                    }
                    placeholder="Minimal 6 karakter"
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-[#2D7344]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={closeEditModal}
                className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-bold bg-white"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEditUser}
                disabled={updateUserMutation.isPending}
                className="flex items-center gap-2 px-5 py-2 bg-[#2D7344] hover:bg-[#1E5230] text-white rounded-lg text-sm font-bold disabled:opacity-70"
              >
                {updateUserMutation.isPending && (
                  <Loader2 size={16} className="animate-spin" />
                )}
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ManajemenUser;
