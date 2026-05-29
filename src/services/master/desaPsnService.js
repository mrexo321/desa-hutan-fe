import masterInstance from "../../api/masterInstance";

export const desaPsnService = {
  // Get all periods
  async getTahun() {
    const response = await masterInstance.get("/desa-psn/tahun");
    return response.data;
  },

  // Create new period
  async createTahun(payload) {
    const response = await masterInstance.post("/desa-psn/tahun", payload);
    return response.data;
  },

  // Update existing period
  async updateTahun(id, payload) {
    const response = await masterInstance.put(`/desa-psn/tahun/${id}`, payload);
    return response.data;
  },

  // Delete period
  async deleteTahun(id) {
    const response = await masterInstance.delete(`/desa-psn/tahun/${id}`);
    return response.data;
  },

  // Get village list by period ID with pagination support
  async getDesaByPeriode(psnPeriodeId, page, size, filters = {}) {
    const response = await masterInstance.get(`/desa-psn/periode/${psnPeriodeId}`, {
      params: { 
        page, 
        size,
        provinsi: filters.provinsi || undefined,
        kabupaten: filters.kabupaten || undefined,
        kecamatan: filters.kecamatan || undefined,
      },
    });
    return response.data;
  },

  // Download template Excel as a blob to preserve Authorization headers
  async downloadTemplate() {
    const response = await masterInstance.get("/desa-psn/template", {
      responseType: "blob",
    });
    return response;
  },

  // Import Excel data with multipart/form-data
  async importExcel(formData) {
    const response = await masterInstance.post("/desa-psn/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};
