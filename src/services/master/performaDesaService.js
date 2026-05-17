import masterInstance from "../../api/masterInstance";

export const performaDesaService = {
  async getListPerformaDesa(params) {
    const response = await masterInstance.get("/performa-desa-hutan", { params });
    return response.data;
  },
  async getDetailPerformaDesa(id) {
    const response = await masterInstance.get(`/performa-desa-hutan/${id}`);
    return response.data;
  },
  async createPerformaDesa(payload) {
    const response = await masterInstance.post("/performa-desa-hutan", payload);
    return response.data;
  },
  async updatePerformaDesa(id, payload) {
    const response = await masterInstance.put(`/performa-desa-hutan/${id}`, payload);
    return response.data;
  },
  async deletePerformaDesa(id) {
    const response = await masterInstance.delete(`/performa-desa-hutan/${id}`);
    return response.data;
  },
  async uploadExcelPerformaDesa(formData) {
    const response = await masterInstance.post("/performa-desa-hutan/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  async downloadPerformaExcelTemplate(formulaId) {
    const response = await masterInstance.get("/performa-desa-hutan/template", {
      params: { formulaId },
      responseType: "blob",
    });
    return response.data;
  },
};
