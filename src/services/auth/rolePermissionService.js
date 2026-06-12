import authInstance from "../../api/authInstance";
import { normalizeCollection, normalizeResource } from "../../utils/apiResponse";

const bulkUnassignPermissionFromRole = async (payload) => {
    const response = await authInstance.post(`/role-permissions/bulk-unassign`, payload)
    return response.data;
};

export const rolePermissionService ={
    async getRolePermission(){
        const response = await authInstance.get("/role-permissions")
        return normalizeCollection(response);
    },

    async getRolePermissionById(id){
        try {
        const response = await authInstance.get(`/role-permissions/${id}`, {
            skipGlobalErrorToast: true,
        })
        const collection = normalizeCollection(response);
        if (collection.length > 0) return collection;

        const resource = normalizeResource(response);
        return Array.isArray(resource) ? resource : resource ? [resource] : [];
        } catch (error) {
            if (error?.response?.status === 404) return [];
            throw error;
        }
    },

    async assignPermissionToRole(payload){
        const response = await authInstance.post(`/role-permissions/assign`, payload)
        return response.data;
    },

    async unassignPermissionFromRole(payload){
        const response = await authInstance.post(`/role-permissions/unassign`, payload)
        return response.data;
    },

    async assignPermissionToRoleBulk(payload){
        const response = await authInstance.post(`/role-permissions/bulk-assign`, payload)
        return response.data;
    },

    async unassignPermissionToRoleBulk(payload){
        return bulkUnassignPermissionFromRole(payload);
    },

    async unassignPermissionFromRoleBulk(payload){
        return bulkUnassignPermissionFromRole(payload);
    },

}
