import masterInstance from "../../api/masterInstance";

export const wilayahDesaService = {
  async getAllDesa(page, size) {
    const response = await masterInstance.get("/wilayah-desa", {
      params: {
        page: page,
        size: size,
      },
    });
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
};
