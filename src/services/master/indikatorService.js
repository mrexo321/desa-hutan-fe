import masterInstance from "../../api/masterInstance";

export const indikatorService = {
  // ==========================================
  // INDIKATOR UTAMA SERVICES
  // ==========================================
  async getMainIndicator() {
    const response = await masterInstance.get("/master-indikator-utama");
    return response.data;
  },
  async updateMainIndicator(id, payload) {
    const response = await masterInstance.put(
      `/master-indikator-utama/${id}`,
      payload,
    );
    return response.data;
  },
  async createMainIndicator(payload) {
    const response = await masterInstance.post(
      `/master-indikator-utama`,
      payload,
    );
    return response.data;
  },
  async getMainIndicatorById(id) {
    const response = await masterInstance.get(`/master-indikator-utama/${id}`);
    return response.data;
  },

  // ==========================================
  // KATEGORI INDIKATOR SERVICES
  // ==========================================
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
  async deleteCategoryIndicator(id) {
    const response = await masterInstance.delete(
      `/master-kategori-indikator/${id}`,
    );
    return response.data;
  },
  async createCategoryIndicator(payload) {
    const response = await masterInstance.post(
      `/master-kategori-indikator`,
      payload,
    );
    return response.data;
  },
  async getCategoryIndicatorById(id) {
    const response = await masterInstance.get(
      `/master-kategori-indikator/${id}`,
    );
    return response.data;
  },

  // ==========================================
  // FORMULA / INDIKATOR PERHITUNGAN SERVICES
  // ==========================================

  // Ambil semua data formula
  async getAllFormula() {
    // Note: Sesuaikan "/master-indikator-perhitungan" dengan route API backend Anda
    const response = await masterInstance.get("/master-indikator-perhitungan");
    return response.data;
  },

  // Ambil detail formula berdasarkan ID
  async getDetailFormula(id) {
    const response = await masterInstance.get(
      `/master-indikator-perhitungan/${id}`,
    );
    return response.data;
  },

  // Buat formula baru
  async createFormulaIndicator(payload) {
    const response = await masterInstance.post(
      `/master-indikator-perhitungan`,
      payload,
    );
    return response.data;
  },

  // Update formula yang sudah ada
  async updateFormulaIndicator(id, payload) {
    const response = await masterInstance.put(
      `/master-indikator-perhitungan/${id}`,
      payload,
    );
    return response.data;
  },

  // Hapus formula
  async deleteFormulaIndicator(id) {
    const response = await masterInstance.delete(
      `/master-indikator-perhitungan/${id}`,
    );
    return response.data;
  },
};
