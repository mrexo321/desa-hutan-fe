import masterInstance from "../../api/masterInstance";

export const masterWilayahService = {
  // --- PROVINSI ---
  async getAllProvinsi(page = null, size = null, search = "") {
    const params = {};
    if (page) params.page = page;
    if (size) params.size = size;
    if (search) params.search = search;

    const response = await masterInstance.get("/master-provinsi", { params });
    return response.data.data;
  },
  async getProvinsiById(id) {
    const response = await masterInstance.get(`/master-provinsi/${id}`);
    return response.data.data;
  },
  async createProvinsi(data) {
    const response = await masterInstance.post("/master-provinsi", data);
    return response.data;
  },
  async updateProvinsi(id, data) {
    const response = await masterInstance.patch(`/master-provinsi/${id}`, data);
    return response.data;
  },
  async deleteProvinsi(id) {
    const response = await masterInstance.delete(`/master-provinsi/${id}`);
    return response.data;
  },

  async getAllProvinsiPublic(page = null, size = null, search = "") {
    const params = {};
    if (page) params.page = page;
    if (size) params.size = size;
    if (search) params.search = search;

    const response = await masterInstance.get("/public/provinsi", { params });
    return response.data.data;
  },

  // --- KABUPATEN ---
  async getAllKabupaten(page = null, size = null, search = "", provinsiId = null) {
    const params = {};
    if (page) params.page = page;
    if (size) params.size = size;
    if (search) params.search = search;
    if (provinsiId) params.provinsiId = provinsiId; // Assuming there might be a filter

    const response = await masterInstance.get("/master-kabupaten", { params });
    return response.data.data;
  },

  async getAllKabupatenPublic(page = null, size = null, search = "", provinsiId = null) {
    const params = {};
    if (page) params.page = page;
    if (size) params.size = size;
    if (search) params.search = search;
    if (provinsiId) params.provinsiId = provinsiId; // Assuming there might be a filter

    const response = await masterInstance.get("/public/kabupaten", { params });
    return response.data.data;
  },
  async getKabupatenById(id) {
    const response = await masterInstance.get(`/master-kabupaten/${id}`);
    return response.data.data;
  },
  async createKabupaten(data) {
    const response = await masterInstance.post("/master-kabupaten", data);
    return response.data;
  },
  async updateKabupaten(id, data) {
    const response = await masterInstance.patch(`/master-kabupaten/${id}`, data);
    return response.data;
  },
  async deleteKabupaten(id) {
    const response = await masterInstance.delete(`/master-kabupaten/${id}`);
    return response.data;
  },

  // --- KECAMATAN ---
  async getAllKecamatan(page = null, size = null, search = "", kabupatenId = null) {
    const params = {};
    if (page) params.page = page;
    if (size) params.size = size;
    if (search) params.search = search;
    if (kabupatenId) params.kabupatenId = kabupatenId;

    const response = await masterInstance.get("/master-kecamatan", { params });
    return response.data.data;
  },

  async getAllKecamatanPublic(page = null, size = null, search = "", kabupatenId = null) {
    const params = {};
    if (page) params.page = page;
    if (size) params.size = size;
    if (search) params.search = search;
    if (kabupatenId) params.kabupatenId = kabupatenId; // Assuming there might be a filter

    const response = await masterInstance.get("/public/kecamatan", { params });
    return response.data.data;
  },
  async getKecamatanById(id) {
    const response = await masterInstance.get(`/master-kecamatan/${id}`);
    return response.data.data;
  },
  async createKecamatan(data) {
    const response = await masterInstance.post("/master-kecamatan", data);
    return response.data;
  },
  async updateKecamatan(id, data) {
    const response = await masterInstance.patch(`/master-kecamatan/${id}`, data);
    return response.data;
  },
  async deleteKecamatan(id) {
    const response = await masterInstance.delete(`/master-kecamatan/${id}`);
    return response.data;
  },
};
