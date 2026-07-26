import masterInstance from "../../api/masterInstance";

export const wilayahDesaService = {
  async getAllDesa(page, size, search = "", provinsi = "", kabupaten = "", kecamatan = "") {
    let params = {};
    if (typeof page === "object" && page !== null) {
      const opts = page;
      if (opts.page != null) params.page = opts.page;
      if (opts.size != null) params.size = opts.size;
      if (opts.search) params.search = opts.search;
      if (opts.provinsi) params.provinsi = opts.provinsi;
      if (opts.kabupaten) params.kabupaten = opts.kabupaten;
      if (opts.kecamatan) params.kecamatan = opts.kecamatan;
    } else {
      if (page != null) params.page = page;
      if (size != null) params.size = size;
      if (search) params.search = search;
      if (provinsi) params.provinsi = provinsi;
      if (kabupaten) params.kabupaten = kabupaten;
      if (kecamatan) params.kecamatan = kecamatan;
    }

    const response = await masterInstance.get("/wilayah-desa", { params });
    return response.data.data;
  },

  async getDesaById(id) {
    const response = await masterInstance.get(`/wilayah-desa/${id}`);
    return response.data.data;
  },

  async createDesa(formData) {
    // formData adalah FormData (multipart/form-data)
    const response = await masterInstance.post("/wilayah-desa", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  async updateDesa(id, formData) {
    // formData adalah FormData (multipart/form-data)
    const response = await masterInstance.patch(
      `/wilayah-desa/${id}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },

  async deleteDesa(id) {
    const response = await masterInstance.delete(`/wilayah-desa/${id}`);
    return response.data;
  },

  async searchMap(query, limit = 5) {
    const response = await masterInstance.get("/wilayah-desa/search-map", {
      params: {
        q: query,
        limit: limit,
      },
    });
    return response.data;
  },

  async searchMapPublic(query, limit = 5) {
    const response = await masterInstance.get("/public/search-map", {
      params: {
        q: query,
        limit: limit,
      },
    });
    return response.data;
  },
};
