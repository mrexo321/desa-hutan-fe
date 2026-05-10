import authInstance from "../../api/authInstance";

export const siteSettingService = {
  // ─────────────────────────────────────────
  // PUBLIK — Digunakan landing page (no auth required)
  // authInstance tetap dipakai karena base URL auth service = /v1
  // Interceptor hanya menambah token jika ada, tidak error jika tidak ada.
  // ─────────────────────────────────────────
  async getAll() {
    const res = await authInstance.get("/site-settings");
    return res.data.data;
  },

  async getByCategory(category) {
    const res = await authInstance.get(`/site-settings/category/${category}`);
    return res.data.data; // Array<{ id, category, key, value, image_url }>
  },

  async getByKey(key) {
    const res = await authInstance.get(`/site-settings/key/${key}`);
    return res.data.data;
  },

  async getById(id) {
    const res = await authInstance.get(`/site-settings/${id}`);
    return res.data.data;
  },

  // ─────────────────────────────────────────
  // ADMIN CRUD — Memerlukan token
  // ─────────────────────────────────────────
  async create(formData) {
    // JANGAN set Content-Type manual — axios otomatis set multipart/form-data
    // beserta boundary yang benar saat menerima FormData
    const res = await authInstance.post("/site-settings", formData);
    return res.data;
  },

  async update(id, formData) {
    // JANGAN set Content-Type manual — axios otomatis set multipart/form-data
    // beserta boundary yang benar saat menerima FormData
    const res = await authInstance.put(`/site-settings/${id}`, formData);
    return res.data;
  },

  async delete(id) {
    const res = await authInstance.delete(`/site-settings/${id}`);
    return res.data;
  },

  async bulkDelete(ids) {
    const res = await authInstance.delete("/site-settings/bulk", {
      data: { ids },
    });
    return res.data;
  },

  // ─────────────────────────────────────────
  // HELPER — Transform array → { key: value }
  // image_url diutamakan jika ada, fallback ke value
  // ─────────────────────────────────────────
  toMap(arr = []) {
    return arr.reduce((acc, item) => {
      acc[item.key] = item.image_url ?? item.value;
      return acc;
    }, {});
  },
};
