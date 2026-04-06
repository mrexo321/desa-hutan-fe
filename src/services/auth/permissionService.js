import authInstance from "../../api/authInstance";

export const permissionService = {
    async getPermissions() {
        const response = await authInstance.get("/permissions");
        return response.data.data;
    },

    async getPermissionById(permissionid) {
        const response = await authInstance.get(`/permissions/${permissionid}`);
        return response.data.data;
    },

    async createPermission(payload) {
        const response = await authInstance.post("/permissions", payload);
        return response.data;
    },

    async updatePermission(permissionid, payload) {
        const response = await authInstance.put(`/permissions/${permissionid}`, payload);
        return response.data;
    },

    async deletePermission(permissionid) {
        const response = await authInstance.delete(`/permissions/${permissionid}`);
        return response.data;
    },

    async createBulkPermissions(payload) {
        const response = await authInstance.post("/permissions/bulk", payload);
        return response.data;
    },

    async deleteBulkPermissions(payload) {
        const response = await authInstance.delete("/permissions/bulk", payload);
        return response.data;
    },
};