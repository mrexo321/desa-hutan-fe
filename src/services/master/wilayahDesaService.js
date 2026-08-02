import masterInstance from "../../api/masterInstance";

export const wilayahDesaService = {
  async getAllDesa(pageOrParams, size, search, provinsi, kabupaten, kecamatan, tipe_administrasi) {
    let params = {};
    if (typeof pageOrParams === "object" && pageOrParams !== null) {
      params = {
        page: pageOrParams.page || 1,
        size: pageOrParams.size || 10,
        search: pageOrParams.search || "",
        provinsi: pageOrParams.provinsi || pageOrParams.provinsiId || null,
        kabupaten: pageOrParams.kabupaten || pageOrParams.kabupatenId || null,
        kecamatan: pageOrParams.kecamatan || pageOrParams.kecamatanId || null,
        tipe_administrasi: pageOrParams.tipe_administrasi || pageOrParams.tipeAdministrasi || null,
      };
    } else {
      params = {
        page: pageOrParams || 1,
        size: size || 10,
      };
      if (search) params.search = search;
      if (provinsi) params.provinsi = provinsi;
      if (kabupaten) params.kabupaten = kabupaten;
      if (kecamatan) params.kecamatan = kecamatan;
      if (tipe_administrasi) params.tipe_administrasi = tipe_administrasi;
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

  async searchMap(query, limit = 50) {
    const response = await masterInstance.get("/wilayah-desa/search-map", {
      params: {
        q: query,
        limit: limit,
      },
    });
    return response.data;
  },

  async searchMapPublic(query, limit = 50) {
    const response = await masterInstance.get("/public/search-map", {
      params: {
        q: query,
        limit: limit,
      },
    });
    return response.data;
  },
};
