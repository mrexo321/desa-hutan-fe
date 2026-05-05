import authInstance from "../../api/authInstance";

export const userRoleService = {
  async getUserRoles() {
    const response = await authInstance.get("/user-roles");
    return response.data.data;
  },

  async getRoleById(roleid) {
    const response = await authInstance.get(`/user-roles/${roleid}`);
    return response.data.data;
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