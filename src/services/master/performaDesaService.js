import masterInstance from "../../api/masterInstance";
import axiosInstance from "../../api/axiosInstance";

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
  async getIndexPerformaDesaHutan({ page = 1, size = 10, formulaId, tahun, provinsi, kabupaten, kecamatan, indexDesaHutanId, fungsiKawasanId } = {}) {
    const params = {
      page,
      size,
    };

    if (formulaId) params.formulaId = formulaId;
    if (tahun) params.tahun = tahun;
    if (provinsi) params.provinsi = provinsi;
    if (kabupaten) params.kabupaten = kabupaten;
    if (kecamatan) params.kecamatan = kecamatan;
    if (indexDesaHutanId) params.indexDesaHutanId = indexDesaHutanId;
    if (fungsiKawasanId && (Array.isArray(fungsiKawasanId) ? fungsiKawasanId.length > 0 : true)) {
      params.fungsiKawasanId = fungsiKawasanId;
    }

    console.log("DEBUG getIndexPerformaDesaHutan params sent to backend:", params);

    const response = await masterInstance.get("/performa-desa-hutan/index", {
      params,
      paramsSerializer: {
        indexes: null, // serializes array as fungsiKawasanId=1&fungsiKawasanId=2 instead of fungsiKawasanId[]=1
      }
    });

    console.log("DEBUG getIndexPerformaDesaHutan response received:", response.data);
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

  /**
   * GET /performa-desa-hutan/request-excel
   * Ambil semua permohonan file Excel performa desa hutan.
   */
  async getAllRequestExcel({ page = 1, size = 10, search = "", status = "" } = {}) {
    try {
      const params = { page, size };
      if (search) params.search = search;
      if (status) params.status = status;
      const response = await masterInstance.get("/performa-desa-hutan/request-excel", { params });
      return response.data;
    } catch (error) {
      console.warn("Using localStorage fallback for performa request-excel list", error);
      const local = getLocalPerformaRequests();
      let filtered = [...local];

      if (status && status !== "all") {
        filtered = filtered.filter((r) => r.status === status);
      }

      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (r) =>
            String(r.email).toLowerCase().includes(q) ||
            String(r.provinsi).toLowerCase().includes(q) ||
            (r.kabupaten && String(r.kabupaten).toLowerCase().includes(q)) ||
            (r.kecamatan && String(r.kecamatan).toLowerCase().includes(q)) ||
            String(r.tahun).includes(q)
        );
      }

      const total = filtered.length;
      const totalPages = Math.ceil(total / size) || 1;
      const startIdx = (page - 1) * size;
      const sliced = filtered.slice(startIdx, startIdx + size);

      return {
        success: true,
        data: {
          items: sliced,
          total,
          page,
          size,
          totalPages,
        },
      };
    }
  },

  /**
   * GET /api/request-excel/label?tahun={tahun}
   * Ambil label indikator/dimensi (admin/public) berdasarkan tahun.
   */
  async getRequestExcelLabels(tahun) {
    try {
      const response = await masterInstance.get("/public/request-excel/label", {
        params: { tahun },
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        try {
          const response = await masterInstance.get("/public/request-excel/label", {
            params: { tahun },
          });
          return response.data;
        } catch (err2) {
          if (err2.response?.status === 404) {
            const response = await axiosInstance.get("/api/request-excel/label", {
              params: { tahun },
            });
            return response.data;
          }
          throw err2;
        }
      }
      throw error;
    }
  },

  /**
   * POST /api/public/request-excel
   * Buat permohonan data excel publik baru.
   */
  async createPublicRequestExcel(payload) {
    try {
      const response = await masterInstance.post("/public/request-excel", payload);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        try {
          const response = await masterInstance.post("/api/public/request-excel", payload);
          return response.data;
        } catch (err2) {
          if (err2.response?.status === 404) {
            const response = await axiosInstance.post("/api/public/request-excel", payload);
            return response.data;
          }
          throw err2;
        }
      }
      if (error.response) {
        throw error;
      }
      console.warn("Using localStorage fallback for performa request-excel creation", error);
      const local = getLocalPerformaRequests();
      const newRequest = {
        id: "req-perf-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9),
        nama: payload.nama,
        noHp: payload.noHp,
        email: payload.email,
        export_type: "performa_desa_hutan",
        filters: {
          tahun: Number(payload.tahun),
          tingkatAdministrasi: payload.tingkatAdministrasi,
          provinsiId: payload.provinsi?.id || payload.provinsiId || null,
          provinsiNama: payload.provinsi?.nama || payload.provinsiNama || null,
          kabupatenId: payload.kabupaten?.id || payload.kabupatenId || null,
          kabupatenNama: payload.kabupaten?.nama || payload.kabupatenNama || null,
          kecamatanId: payload.kecamatan?.id || payload.kecamatanId || null,
          kecamatanNama: payload.kecamatan?.nama || payload.kecamatanNama || null,
          desaId: payload.desa?.id || payload.desaId || null,
          desaNama: payload.desa?.nama || payload.desaNama || null,
          jenisData: payload.jenisData || [],
        },
        status: "pending",
        reject_reason: null,
        error_message: null,
        createdAt: new Date().toISOString(),
      };
      local.unshift(newRequest);
      saveLocalPerformaRequests(local);
      return { success: true, data: newRequest, message: "Berhasil mengirim permintaan data, mohon tunggu persetujuan Admin" };
    }
  },

  /**
   * POST /public/performa-desa-hutan/request-excel or /api/public/request-excel
   * Wrapper for backward compatibility.
   */
  async createRequestExcel(payload) {
    return this.createPublicRequestExcel(payload);
  },

  /**
   * POST /request-excel/:requestExcelId/approve
   * Setujui permohonan excel.
   */
  async approveRequestExcel(id, payload = {}) {
    try {
      const response = await masterInstance.post(`/request-excel/${id}/approve`, payload);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        try {
          const response = await masterInstance.post(`/performa-desa-hutan/request-excel/${id}/approve`, payload);
          return response.data;
        } catch (err2) {
          if (err2.response?.status === 404) {
            const response = await axiosInstance.post(`/api/request-excel/${id}/approve`, payload);
            return response.data;
          }
          throw err2;
        }
      }
      if (error.response) {
        throw error;
      }
      console.warn(`Using localStorage fallback to approve request ${id}`, error);
      const local = getLocalPerformaRequests();
      const index = local.findIndex((r) => String(r.id) === String(id));
      if (index !== -1) {
        local[index].status = "approved";
        saveLocalPerformaRequests(local);
        return { success: true, data: local[index] };
      }
      throw error;
    }
  },

  /**
   * POST /request-excel/:requestExcelId/reject
   * Tolak permohonan excel.
   */
  async rejectRequestExcel(id, payload = {}) {
    try {
      const response = await masterInstance.post(`/request-excel/${id}/reject`, payload);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        try {
          const response = await masterInstance.post(`/performa-desa-hutan/request-excel/${id}/reject`, payload);
          return response.data;
        } catch (err2) {
          if (err2.response?.status === 404) {
            const response = await axiosInstance.post(`/api/request-excel/${id}/reject`, payload);
            return response.data;
          }
          throw err2;
        }
      }
      if (error.response) {
        throw error;
      }
      console.warn(`Using localStorage fallback to reject request ${id}`, error);
      const local = getLocalPerformaRequests();
      const index = local.findIndex((r) => String(r.id) === String(id));
      if (index !== -1) {
        local[index].status = "rejected";
        local[index].reject_reason = payload.reject_reason || payload.message || "Ditolak oleh admin";
        saveLocalPerformaRequests(local);
        return { success: true, data: local[index] };
      }
      throw error;
    }
  },

  /**
   * Update status permohonan excel performa (approve / reject).
   */
  async updateRequestExcelStatus(id, payload) {
    if (payload?.status === "rejected") {
      return this.rejectRequestExcel(id, payload);
    }
    return this.approveRequestExcel(id, payload);
  },
};

// ============================================================
// LOCAL STORAGE HELPERS FOR FALLBACK
// ============================================================
const LOCAL_STORAGE_PERFORMA_KEY = "performa_desa_hutan_requests";

const getLocalPerformaRequests = () => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_PERFORMA_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to parse local performa requests:", e);
    return [];
  }
};

const saveLocalPerformaRequests = (requests) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_PERFORMA_KEY, JSON.stringify(requests));
  } catch (e) {
    console.error("Failed to save local performa requests:", e);
  }
};
