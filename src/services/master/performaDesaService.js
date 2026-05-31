import masterInstance from "../../api/masterInstance";

export const performaDesaService = {
  /**
   * GET /performa-desa-hutan
   * Menampilkan data kalkulasi dengan kolom dinamis per formula.
   * Response: { column: [...], items: [...], total, page, size }
   */
  async getPerformaList({ formulaId, page = 1, size = 20 } = {}) {
    const response = await masterInstance.get("/performa-desa-hutan", {
      params: { formulaId, page, size },
    });
    return response.data;
  },

  /**
   * GET /performa-desa-hutan/index
   * Menampilkan data performa desa hutan.
   * Response: { items: [...], pagination: { total, perPage, currentPage, totalPage } }
   */
  async getIndexPerformaDesaHutan({ page = 1, size = 10, tahun } = {}) {
    const response = await masterInstance.get("/performa-desa-hutan/index", {
      params: { page, size, tahun },
    });
    return response.data;
  },

  /**
   * GET /performa-desa-hutan/template
   * Download template Excel berdasarkan formulaId.
   * WAJIB responseType: 'blob'
   */
  async downloadTemplate(formulaId) {
    const response = await masterInstance.get("/performa-desa-hutan/template", {
      params: { formulaId },
      responseType: "blob",
    });

    // Trigger download di browser
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Template_Data_Desa_${formulaId}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  /**
   * POST /performa-desa-hutan/import
   * Upload file Excel untuk import + perhitungan.
   * Payload: FormData { file, tahunId, formulaId }
   * Response: 202 Accepted + { jobId }
   */
  async importExcel(formData) {
    const response = await masterInstance.post(
      "/performa-desa-hutan/import",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data;
  },
};
