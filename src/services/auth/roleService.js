import authInstance from "../../api/authInstance";
import { normalizeCollection, normalizeResource } from "../../utils/apiResponse";

const normalizePermissionList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;

  const nestedList = normalizeCollection(value);
  return nestedList.length > 0 ? nestedList : [value];
};

const normalizeRolePermissions = (role) => {
  if (!role || typeof role !== "object") return role;

  const permissions = normalizePermissionList(
    role.permissions ??
      role.permission ??
      role.rolePermissions ??
      role.role_permissions ??
      role.role_permission,
  );

  return {
    ...role,
    permissions: permissions.map((item) => item.permission ?? item),
  };
};

export const roleService = {
    async getRoles() {
        const response = await authInstance.get("/roles");
        return normalizeCollection(response).map(normalizeRolePermissions);
    },

  async getRoleById(roleid) {
    const response = await authInstance.get(`/roles/${roleid}`);
    return normalizeRolePermissions(normalizeResource(response));
  },

  async createRole(payload) {
    const response = await authInstance.post("/roles", payload);
    return response.data;
  },

  async updateRole(roleid, payload) {
    const response = await authInstance.put(`/roles/${roleid}`, payload);
    return response.data;
  },

  async deleteRole(roleid) {
    const response = await authInstance.delete(`/roles/${roleid}`);
    return response.data;
  },

  async createBulkRoles(payload) {
    const response = await authInstance.post("/roles/bulk", payload);
    return response.data;
  },

  async deleteBulkRoles(payload) {
    const response = await authInstance.delete("/roles/bulk", payload);
    return response.data;
  },
};
