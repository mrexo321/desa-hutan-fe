import authInstance from "../../api/authInstance";

export const roleService = {
  async getRoles() {
    const response = await authInstance.get("/roles");

    return response.data.data;
  },

  async getRoleById(roleid) {
    const response = await authInstance.get(`/roles/${roleid}`);
    return response.data.data;
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

  async deleteBulkRoles(idsArray) {
    const response = await authInstance.delete("/roles/bulk", {
      data: idsArray,
    });
    return response.data;
  },
};
