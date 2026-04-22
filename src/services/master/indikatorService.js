import masterInstance from "../../api/masterInstance";

export const indikatorService = {
  async getAllCategoryIndicator() {
    const response = await masterInstance.get("/master-kategori-indikator");
    return response.data;
  },
  async updateCategoryIndicator(id, payload) {
    const response = await masterInstance.put(
      `/master-kategori-indikator/${id}`,
      payload,
    );
    return response.data;
  },
  // Di dalam file services/master/indikatorService.js
  async deleteCategoryIndicator(id) {
    const response = await masterInstance.delete(
      `/master-kategori-indikator/${id}`,
    );
    return response.data;
  },
  // Di dalam file services/master/indikatorService.js
  async createCategoryIndicator(payload) {
    const response = await masterInstance.post(
      `/master-kategori-indikator`,
      payload,
    );
    return response.data;
  },
  // Di dalam file services/master/indikatorService.js
  async getCategoryIndicatorById(id) {
    const response = await masterInstance.get(
      `/master-kategori-indikator/${id}`,
    );
    return response.data;
  },
};
