import authInstance from "../../api/authInstance";

export const authService = {
  async login(payload) {
    const response = await authInstance.post("/auth/login", payload);
    return response.data;
  },

  //   async logout() {
  //     const response = await axiosInstance.post("/logout");
  //     return response.data;
  //   },
};
