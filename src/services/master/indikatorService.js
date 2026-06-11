import masterInstance from "../../api/masterInstance";

export const indikatorService = {
  // ==========================================
  // INDIKATOR UTAMA SERVICES
  // ==========================================
  async getMainIndicator() {
    const response = await masterInstance.get("/master-indikator-utama");
    return response.data;
  },
  async deleteMainIndicator(id) {
    const response = await masterInstance.delete(
      `/master-indikator-utama/${id}`,
    );
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
  async getAllFormula(params = {}) {
    // Note: Sesuaikan "/master-indikator-perhitungan" dengan route API backend Anda
    const response = await masterInstance.get("/master-indikator-perhitungan", { params });
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

  // ==========================================
  // Master Tahun Indikator Perhitungan SERVICES
  // ==========================================

  getAllYearIndicator: async () => {
    const response = await masterInstance.get(
      "/master-tahun-indikator-perhitungan",
    );
    return response.data;
  },

  getAllYearIndicatorPublic: async () => {
    const response = await masterInstance.get(
      "/public/tahun-indikator-perhitungan",
    );
    return response.data;
  },

  // GET Tahun by ID (untuk kebutuhan Edit Form)
  getYearIndicatorById: async (id) => {
    const response = await masterInstance.get(
      `/master-tahun-indikator-perhitungan/${id}`,
    );
    return response.data;
  },

  // POST Tambah Tahun
  createYearIndicator: async (data) => {
    // req body: { tahun: "2024" }
    const response = await masterInstance.post(
      "/master-tahun-indikator-perhitungan",
      data,
    );
    return response.data;
  },

  // PUT/PATCH Update Tahun
  updateYearIndicator: async ({ id, data }) => {
    const response = await masterInstance.put(
      `/master-tahun-indikator-perhitungan/${id}`,
      data,
    );
    return response.data;
  },

  // DELETE Tahun
  deleteYearIndicator: async (id) => {
    const response = await masterInstance.delete(
      `/master-tahun-indikator-perhitungan/${id}`,
    );
    return response.data;
  },
};
