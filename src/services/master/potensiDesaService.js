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

  async downloadTemplate() {
    const response = await masterInstance.get("/potensi-desa/template", {
      responseType: "blob",
    });
    return response;
  },

  async importExcel(formData) {
    const response = await masterInstance.post("/potensi-desa/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  async exportExcel(filters = {}) {
    const response = await masterInstance.get("/export/potensi-desa", {
      params: {
        provinsi: filters.provinsi || undefined,
        kabupaten: filters.kabupaten || undefined,
        kecamatan: filters.kecamatan || undefined,
      },
      responseType: "blob",
    });
    return response;
  },
};
