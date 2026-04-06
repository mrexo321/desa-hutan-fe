import authInstance from "../../api/authInstance";

export const roleService = {
<<<<<<< HEAD
    async getRoles() {
        const response = await authInstance.get("/roles");
        console.log(response);
        
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


    async deleteBulkRoles(payload) {
        const response = await authInstance.delete("/roles/bulk", payload);
        return response.data;
    },
};
=======
  async getRoles() {
    const response = await authInstance.get("/roles");
    return response.data;
  },
};
>>>>>>> de916acf6b3043dc9346ad336dc518a34c6fe486
