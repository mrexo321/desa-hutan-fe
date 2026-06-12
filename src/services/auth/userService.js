import authInstance from "../../api/authInstance";
import { normalizeCollection, normalizeResource } from "../../utils/apiResponse";

const userService = {
    async getUser() {
        const response = await authInstance.get("/users");
        return normalizeCollection(response);
    },

    async getUserById(id) {
        const response = await authInstance.get(`/users/${id}`);
        return normalizeResource(response);
    },

    async createUser(payload){
        const response = await authInstance.post(`/users`, payload)
        return response.data;
    },

    async updateUser(id, payload){
        const response = await authInstance.put(`/users/${id}`, payload)
        return response.data;
    },

    async deleteUser(id){
        const response = await authInstance.delete(`/users/${id}`)
        return response.data;
    },

    async createUserBulk(payload){
        const response = await authInstance.post(`/users/bulk`, payload)
        return response.data;
    },


    async deleteUserBulk(payload){
        const response = await authInstance.delete(`/users/bulk`, payload)
        return response.data;
    },


};

export default userService;
