import axiosInstance from "../api/axiosInstance";

export const authService = {
  async login(payload) {
    const response = await axiosInstance.post("/auth/login", payload);
    return response.data;
  },

  //   async logout() {
  //     const response = await axiosInstance.post("/logout");
  //     return response.data;
  //   },
};
