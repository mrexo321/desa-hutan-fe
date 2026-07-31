import authInstance from "../../api/authInstance";
import { normalizeCollection, normalizeResource } from "../../utils/apiResponse";

export const userService = {
  async getUser() {
    const response = await authInstance.get("/users");
    return normalizeCollection(response);
  },

  async getUserById(id) {
    const response = await authInstance.get(`/users/${id}`);
    return normalizeResource(response);
  },

  async createUser(payload) {
    const response = await authInstance.post("/users", payload);
    return response.data;
  },

  async updateUser(id, payload) {
    const response = await authInstance.put(`/users/${id}`, payload);
    return response.data;
  },

  async deleteUser(id) {
    const response = await authInstance.delete(`/users/${id}`);
    return response.data;
  },

  async createUserBulk(payloadArray) {
    const response = await authInstance.post("/users/bulk", payloadArray);
    return response.data;
  },

  async deleteUserBulk(idsArray) {
    const response = await authInstance.delete("/users/bulk", {
      data: idsArray,
    });
    return response.data;
  },

  async changePassword(payload) {
    const response = await authInstance.post("/profile/change-password", payload);
    return response.data;
  },

  async getProfile() {
    const response = await authInstance.get("/users/me");
    return response.data.data;
  },

  async updateProfile(payload) {
    const response = await authInstance.patch("/users/me", payload);
    return response.data;
  },
};

export default userService;
