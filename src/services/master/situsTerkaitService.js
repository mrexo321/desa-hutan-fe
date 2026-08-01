import authInstance from "../../api/authInstance";

export const situsTerkaitService = {
  /**
   * Mengambil semua data situs terkait (Publik & Admin)
   * GET /v1/situs-terkait
   */
  async getAll() {
    const response = await authInstance.get("/situs-terkait");
    return response.data;
  },

  /**
   * Mengambil 1 data situs terkait berdasarkan ID
   * GET /v1/situs-terkait/:id
   */
  async getById(id) {
    const response = await authInstance.get(`/situs-terkait/${id}`);
    return response.data;
  },

  /**
   * Menambahkan situs terkait baru (multipart/form-data)
   * POST /v1/situs-terkait
   * @param {FormData} formData - memuat nama, url, logo
   */
  async create(formData) {
    const response = await authInstance.post("/situs-terkait", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Mengedit data situs terkait (multipart/form-data)
   * PUT /v1/situs-terkait/:id
   * @param {string} id
   * @param {FormData} formData - memuat nama, url, logo (opsional)
   */
  async update(id, formData) {
    const response = await authInstance.put(`/situs-terkait/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Menghapus 1 data situs terkait (soft delete)
   * DELETE /v1/situs-terkait/:id
   */
  async delete(id) {
    const response = await authInstance.delete(`/situs-terkait/${id}`);
    return response.data;
  },

  async destroy(id) {
    return this.delete(id);
  },

  /**
   * Menghapus banyak situs terkait sekaligus (bulk delete)
   * DELETE /v1/situs-terkait/bulk
   * @param {Array<string>} ids - Array of ID strings
   */
  async bulkDelete(ids) {
    const response = await authInstance.delete("/situs-terkait/bulk", {
      data: { ids },
    });
    return response.data;
  },
};
