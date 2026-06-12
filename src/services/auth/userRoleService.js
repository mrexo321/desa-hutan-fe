import authInstance from "../../api/authInstance";
import { normalizeCollection, normalizeResource } from "../../utils/apiResponse";

export const userRoleService = {
  async getUserRoles() {
    const response = await authInstance.get("/user-roles");
    return normalizeCollection(response);
  },

  async getRoleById(roleid) {
    try {
    const response = await authInstance.get(`/user-roles/${roleid}`, {
      skipGlobalErrorToast: true,
    });
    const collection = normalizeCollection(response);
    if (collection.length > 0) return collection;

    const resource = normalizeResource(response);
    return Array.isArray(resource) ? resource : resource ? [resource] : [];
    } catch (error) {
      if (error?.response?.status === 404) return [];
      throw error;
    }
  },

  async assignRole(payload){
    const response =await authInstance.post("/user-roles/assign", payload);
    return response.data;
  },

  async unassignRole(payload){
    const response = await authInstance.post("/user-roles/unassign", payload);
    return response.data;
  },

  async assignRoleBulk(payload){
    const response = await authInstance.post("/user-roles/bulk-assign", payload);
    return response.data;
  },

  async unassignRoleBulk(payload){
    const response = await authInstance.post("/user-roles/bulk-unassign", payload);
    return response.data;
  }
};
