import masterInstance from "../../api/masterInstance";

export const klasifikasiService = {
  async getAllClassificationForest() {
    const response = await masterInstance.get("/master-klasifikasi-hutan");
    return response.data;
  },
  async updateForestClassification(id, payload) {
    const response = await masterInstance.put(
      `/master-klasifikasi-hutan/${id}`,
      payload,
    );
    return response.data;
  },
  // Di dalam file services/master/indikatorService.js
  async deleteForestClassification(id) {
    const response = await masterInstance.delete(
      `/master-klasifikasi-hutan/${id}`,
    );
    return response.data;
  },
  // Di dalam file services/master/indikatorService.js
  async createForestClassification(payload) {
    const response = await masterInstance.post(
      `/master-klasifikasi-hutan`,
      payload,
    );
    return response.data;
  },
  // Di dalam file services/master/indikatorService.js
  async getForestClassificationById(id) {
    const response = await masterInstance.get(
      `/master-klasifikasi-hutan/${id}`,
    );
    return response.data;
  },
};
