import masterInstance from "../../api/masterInstance";

const LOCAL_STORAGE_KEY = "desa_hutan_data_requests";

// Helper to get local requests
const getLocalRequests = () => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to parse local requests:", e);
    return [];
  }
};

// Helper to save local requests
const saveLocalRequests = (requests) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(requests));
  } catch (e) {
    console.error("Failed to save local requests:", e);
  }
};

export const requestDataService = {
  /**
   * GET /request-data
   * Ambil semua permohonan data
   */
  async getAllRequests() {
    try {
      const response = await masterInstance.get("/request-data");
      return response.data?.data || response.data || [];
    } catch (error) {
      console.warn("Using localStorage fallback for request-data list", error);
      return getLocalRequests();
    }
  },

  /**
   * POST /request-data
   * Buat permohonan data desa baru
   */
  async createRequest(payload) {
    try {
      const response = await masterInstance.post("/request-data", payload);
      return response.data;
    } catch (error) {
      console.warn("Using localStorage fallback for request-data creation", error);
      const local = getLocalRequests();
      const newRequest = {
        id: "req-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9),
        email: payload.email,
        tahunId: payload.tahunId || payload.tahun_id || "",
        tahun: payload.tahun || "",
        provinsiId: payload.provinsiId || payload.provinsi_id || "",
        provinsiNama: payload.provinsiNama || payload.provinsi_nama || "",
        kabupatenId: payload.kabupatenId || payload.kabupaten_id || "",
        kabupatenNama: payload.kabupatenNama || payload.kabupaten_nama || "",
        kecamatanId: payload.kecamatanId || payload.kecamatan_id || "",
        kecamatanNama: payload.kecamatanNama || payload.kecamatan_nama || "",
        status: "pending", // pending, approved, rejected
        alasanReject: "",
        createdAt: new Date().toISOString(),
      };
      local.unshift(newRequest);
      saveLocalRequests(local);
      return { success: true, data: newRequest };
    }
  },

  /**
   * PATCH/POST /request-data/:id/approve
   * Setujui permohonan data
   */
  async approveRequest(id) {
    try {
      // Mencoba patch/post ke API backend
      const response = await masterInstance.patch(`/request-data/${id}/approve`);
      return response.data;
    } catch (error) {
      console.warn(`Using localStorage fallback to approve request ${id}`, error);
      const local = getLocalRequests();
      const index = local.findIndex((r) => r.id === id);
      if (index !== -1) {
        local[index].status = "approved";
        saveLocalRequests(local);
        return { success: true, data: local[index] };
      }
      throw error;
    }
  },

  /**
   * PATCH/POST /request-data/:id/reject
   * Tolak permohonan data dengan alasan
   */
  async rejectRequest(id, payload) {
    try {
      // Mencoba patch/post ke API backend
      const response = await masterInstance.patch(`/request-data/${id}/reject`, payload);
      return response.data;
    } catch (error) {
      console.warn(`Using localStorage fallback to reject request ${id}`, error);
      const local = getLocalRequests();
      const index = local.findIndex((r) => r.id === id);
      if (index !== -1) {
        local[index].status = "rejected";
        local[index].alasanReject = payload.alasan || payload.alasan_reject || "Ditolak oleh admin";
        saveLocalRequests(local);
        return { success: true, data: local[index] };
      }
      throw error;
    }
  },
};
