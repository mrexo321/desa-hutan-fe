import masterInstance from "../../api/masterInstance";

export const potensiDesaService = {
  async getPotensiList({ page = 1, size = 10 } = {}) {
    const response = await masterInstance.get("/potensi-desa", {
      params: { page, size },
    });
    return response.data;
  },

  async getPotensiDetail(desaId) {
    const response = await masterInstance.get(`/potensi-desa/${desaId}`);
    return response.data;
  },

  async updatePotensi(desaId, payload) {
    const response = await masterInstance.put(`/potensi-desa/${desaId}`, payload);
    return response.data;
  },
};
