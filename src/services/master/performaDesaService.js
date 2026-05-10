import masterInstance from "../../api/masterInstance";

export const performaDesaService = {
  async getPerformaDesaIndex() {
    const response = await masterInstance.get("/performa-desa-hutan/index");
    return response.data;
  },
};
