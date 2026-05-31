import masterInstance from "../../api/masterInstance";

export const klasifikasiService = {
  // ==========================================
  // KLASIFIKASI HUTAN
  // ==========================================
  async getAllClassificationForest() {
    const response = await masterInstance.get("/master-klasifikasi-hutan");
    return response.data;
  },
  async getForestClassificationById(id) {
    const response = await masterInstance.get(`/master-klasifikasi-hutan/${id}`);
    return response.data;
  },
  async createForestClassification(payload) {
    const response = await masterInstance.post("/master-klasifikasi-hutan", payload);
    return response.data;
  },
  async updateForestClassification(id, payload) {
    const response = await masterInstance.put(`/master-klasifikasi-hutan/${id}`, payload);
    return response.data;
  },
  async deleteForestClassification(id) {
    const response = await masterInstance.delete(`/master-klasifikasi-hutan/${id}`);
    return response.data;
  },

  // ==========================================
  // KLASIFIKASI DESA
  // Payload: { nama, warna, nilaiMin, nilaiMax }
  // ==========================================
  async getAllClassificationDesa(params = {}) {
    const response = await masterInstance.get("/master-klasifikasi-desa", { params });
    return response.data;
  },
  async getDesaClassificationById(id) {
    const response = await masterInstance.get(`/master-klasifikasi-desa/${id}`);
    return response.data;
  },
  async createDesaClassification(payload) {
    const response = await masterInstance.post("/master-klasifikasi-desa", payload);
    return response.data;
  },
  async updateDesaClassification(id, payload) {
    const response = await masterInstance.put(`/master-klasifikasi-desa/${id}`, payload);
    return response.data;
  },
  async deleteDesaClassification(id) {
    const response = await masterInstance.delete(`/master-klasifikasi-desa/${id}`);
    return response.data;
  },
};
