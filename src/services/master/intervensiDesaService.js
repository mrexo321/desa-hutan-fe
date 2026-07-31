import masterInstance from "../../api/masterInstance";

export const intervensiDesaService = {
  async getAll({ page = 1, size = 10 } = {}) {
    const response = await masterInstance.get("/intervensi-desa", {
      params: { page, size },
    });
    return response.data;
  },

  async getById(id) {
    const response = await masterInstance.get(`/intervensi-desa/${id}`);
    return response.data;
  },

  async create(payload) {
    const response = await masterInstance.post("/intervensi-desa", payload);
    return response.data;
  },

  async update(id, payload) {
    const response = await masterInstance.put(`/intervensi-desa/${id}`, payload);
    return response.data;
  },

  async destroy(id) {
    const response = await masterInstance.delete(`/intervensi-desa/${id}`);
    return response.data;
  },

  async downloadTemplate() {
    const response = await masterInstance.get("/intervensi-desa/template", {
      responseType: "blob",
    });
    return response;
  },

  async uploadExcel(formData) {
    const response = await masterInstance.post("/intervensi-desa/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  async getAllTahun() {
    const response = await masterInstance.get("/tahun-intervensi-desa");
    return response.data;
  },

  async createTahun(payload) {
    const response = await masterInstance.post("/tahun-intervensi-desa", payload);
    return response.data;
  },
};
