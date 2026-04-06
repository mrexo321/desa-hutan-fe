import authInstance from "../../api/authInstance";

export const roleService = {
  async getRoles() {
    const response = await authInstance.get("/roles");
    return response.data;
  },
};
