import masterInstance from "../../api/masterInstance";

export const dimensiDesaService = {
  // Get all registered years
  async getTahun() {
    const response = await masterInstance.get("/dimensi-desa/tahun");
    return response.data;
  },

  // GET /v1/dimensi-desa/labels
  async getLabels() {
    const response = await masterInstance.get("/dimensi-desa/labels");
    return response.data;
  },

  // GET /v1/dimensi-desa/indikator?nama=...
  async getIndikatorByNama(nama, params = {}) {
    const response = await masterInstance.get("/dimensi-desa/indikator", {
      params: {
        nama,
        page: params.page || 1,
        size: params.size || 10,
      },
    });
    return response.data;
  },

  // Create a new dimension year
  async createTahun(payload) {
    const response = await masterInstance.post("/dimensi-desa/tahun", payload);
    return response.data;
  },

    // Create a new dimensi desa entry for a specific year (body: { nama, tahun })
  async createDimensiDesa(payload) {
    const response = await masterInstance.post("/dimensi-desa", payload);
    return response.data;
  },

  // Get indicator schema configured for a specific year
  async getIndikatorByTahun(dimensiId) {
    const response = await masterInstance.get(`/dimensi-desa/indikator/${dimensiId}`);
    return response.data;
  },

  // Get list of indicators for a specific year via query params (/dimensi-desa/indikator?tahun=2025)
  async getIndikatorDimensiByTahun(tahun) {
    const response = await masterInstance.get("/dimensi-desa/indikator", {
      params: { tahun },
    });
    return response.data;
  },

  // Add category indicator to a specific dimensi
  async addIndikator(dimensiId, payload) {
    const response = await masterInstance.post(`/dimensi-desa/indikator/${dimensiId}`, payload);
    return response.data;
  },

  // Remove indicator from a specific dimensi
  async removeIndikator(dimensiId, kategoriIndikatorIds) {
    const response = await masterInstance.delete(`/dimensi-desa/indikator/${dimensiId}`, {
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
  async getMatrixSummary(tahun, onlyPsn = false, extraParams = {}) {
    const response = await masterInstance.get(`/dimensi-desa/matrix/${tahun}`, {
      params: {
        onlyPsn,
        ...(extraParams?.memilikiKawasanHutan && { memilikiKawasanHutan: extraParams.memilikiKawasanHutan }),
        ...(extraParams?.tipeAdministrasi && { tipeAdministrasi: extraParams.tipeAdministrasi }),
      }
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
  },

  // Ambil list desa hutan matrix untuk popup modal
  async getListDesaHutanMatrix(tahun, params = {}) {
    const response = await masterInstance.get(`/dimensi-desa/matrix/${tahun}/list-desa-hutan`, {
      params: {
        kawasan: params.kawasan,
        page: params.page || 1,
        size: params.size || 10,
        ...(params.search && { search: params.search }),
        ...(params.provinsi && { provinsi: params.provinsi }),
        ...(params.kabupaten && { kabupaten: params.kabupaten }),
        ...(params.kecamatan && { kecamatan: params.kecamatan }),
        ...(params.only !== undefined && params.only !== null && { only: params.only }),
        ...(params.onlyPsn !== undefined && params.onlyPsn !== null && { onlyPsn: params.onlyPsn }),
        ...((params.tipe_administrasi || params.tipeAdministrasi) && {
          tipe_administrasi: params.tipe_administrasi || params.tipeAdministrasi,
          tipeAdministrasi: params.tipeAdministrasi || params.tipe_administrasi,
        }),
      },
    });
    return response.data;
  }
};
