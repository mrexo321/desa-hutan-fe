import authInstance from "../../api/authInstance";

export const userService = {
  async getUser() {
    const response = await authInstance.get("/users");
    return response.data.data;
  },

  async getUserById(id) {
    const response = await authInstance.get(`/users/${id}`);
    return response.data.data;
  },

  async createUser(payload) {
    const response = await authInstance.post(`/users`, payload);
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

  createUserBulk: async (payloadArray) => {
    // Pada POST: argumen kedua adalah payload (langsung masukkan array-nya)
    const response = await authInstance.post("/users/bulk", payloadArray);
    return response.data;
  },

  deleteUserBulk: async (idsArray) => {
    // PENTING PADA DELETE: Payload WAJIB dibungkus dalam object { data: ... }
    const response = await authInstance.delete("/users/bulk", {
      data: idsArray,
    });
    return response.data;
  },

  async changePassword(payload) {
    const response = await authInstance.post("/profile/change-password", payload);
    return response.data;
  },
};

export default userService;

