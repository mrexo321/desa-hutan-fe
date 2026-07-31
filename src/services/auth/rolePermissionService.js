import authInstance from "../../api/authInstance";

export const rolePermissionService ={
    async getRolePermission(){
        const response = await authInstance.get("/role-permissions")
        return response.data.data;
    },

    async getRolePermissionById(id){
        const response = await authInstance.get(`/role-permissions/${id}`)
        return response.data.data;
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
        const response = await authInstance.post(`/role-permissions/bulk-unassign`, payload)
        return response.data;
    },

    async unassignPermissionFromRoleBulk(payload){
        const response = await authInstance.post(`/role-permissions/bulk-unassign`, payload)
        return response.data;
    },

}