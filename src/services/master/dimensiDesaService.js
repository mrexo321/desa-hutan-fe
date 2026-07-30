import masterInstance from "../../api/masterInstance";

export const dimensiDesaService = {
  // Get all registered years
  async getTahun() {
    const response = await masterInstance.get("/dimensi-desa/tahun");
    return response.data;
  },

  // Create a new dimension year
  async createTahun(payload) {
    const response = await masterInstance.post("/dimensi-desa/tahun", payload);
    return response.data;
  },

  // Get indicator schema configured for a specific year
  async getIndikatorByTahun(tahun) {
    const response = await masterInstance.get(`/dimensi-desa/indikator/${tahun}`);
    return response.data;
  },

  // Get list of indicators for a specific year via query params (/dimensi-desa/indikator?tahun=2025)
  async getIndikatorDimensiByTahun(tahun) {
    const response = await masterInstance.get("/dimensi-desa/indikator", {
      params: { tahun },
    });
    return response.data;
  },

  // Add category indicator to a specific year
  async addIndikator(tahun, payload) {
    const response = await masterInstance.post(`/dimensi-desa/indikator/${tahun}`, payload);
    return response.data;
  },

  // Remove indicator from a specific year
  async removeIndikator(tahun, kategoriIndikatorIds) {
    const response = await masterInstance.delete(`/dimensi-desa/indikator/${tahun}`, {
      data: { kategoriIndikatorIds },
    });
    return response.data;
  },

  // Download template Excel as a blob
  async downloadTemplate(tahun) {
    const response = await masterInstance.get(`/dimensi-desa/template/${tahun}`, {
      responseType: "blob",
    });
    return response;
  },

  // Upload Excel village data
  async uploadExcel(formData) {
    const response = await masterInstance.post("/dimensi-desa/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Ambil data matrix & chart
  async getMatrixSummary(tahun, onlyPsn = false) {
    const response = await masterInstance.get(`/dimensi-desa/matrix/${tahun}`, {
      params: { onlyPsn }
    });
    return response.data;
  },

  // Ambil data dimensi desa (tabel dengan kolom dinamis) per tahun
  async getDimensiDesa(params = {}) {
    const response = await masterInstance.get("/dimensi-desa", {
      params: {
        tahun: params.tahun,
        page: params.page || 1,
        size: params.size || 10,
      },
    });
    return response.data;
  },

  // Ambil data dimensi desa (tabel dengan kolom dinamis) per ID indikator (/dimensi-desa/:id)
  async getDimensiDesaById(id, params = {}) {
    const response = await masterInstance.get(`/dimensi-desa/${id}`, {
      params: {
        page: params.page || 1,
        size: params.size || 10,
      },
    });
    return response.data;
  },

  // Update indikator dimensi desa per ID (/dimensi-desa/:id)
  async updateIndikatorDimensi(id, payload) {
    const response = await masterInstance.patch(`/dimensi-desa/${id}`, payload);
    return response.data;
  },



  // Ambil detail desa untuk drill-down modal
  async getDetailDesa(tahun, params = {}) {
    const response = await masterInstance.get(`/dimensi-desa/matrix/${tahun}/detail`, {
      params: {
        onlyPsn: params.onlyPsn || false,
        kode: params.kode || "IDM (Status)",
        status: params.status || null,
        kawasan: params.kawasan || null,
        page: params.page || 1,
        size: params.size || 10,
        sortBy: params.sortBy || null,
        order: params.order || "asc"
      }
    });
    return response.data;
  }
};
