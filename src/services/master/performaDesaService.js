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
   * POST /public/performa-desa-hutan/request-excel
   * Buat permohonan excel performa baru (public endpoint).
   */
  async createRequestExcel(payload) {
    try {
      const response = await masterInstance.post("/public/performa-desa-hutan/request-excel", payload);
      return response.data;
    } catch (error) {
      console.warn("Using localStorage fallback for performa request-excel creation", error);
      const local = getLocalPerformaRequests();
      const newRequest = {
        id: "req-perf-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9),
        email: payload.email,
        export_type: "performa_desa_hutan",
        filters: {
          tahun: Number(payload.tahun),
          provinsi: payload.provinsi,
          kabupaten: payload.kabupaten || null,
          kecamatan: payload.kecamatan || null,
          formulaId: null,
          fungsiKawasan: null,
          indexDesaHutan: null,
        },
        status: "pending",
        reject_reason: null,
        error_message: null,
        createdAt: new Date().toISOString(),
      };
      local.unshift(newRequest);
      saveLocalPerformaRequests(local);
      return { success: true, data: newRequest };
    }
  },

  /**
   * POST /performa-desa-hutan/request-excel/:id
   * Update status permohonan excel performa (approve / reject).
   */
  async updateRequestExcelStatus(id, payload) {
    try {
      const response = await masterInstance.post(`/performa-desa-hutan/request-excel/${id}`, payload);
      return response.data;
    } catch (error) {
      console.warn(`Using localStorage fallback to update status for performa request ${id}`, error);
      const local = getLocalPerformaRequests();
      const index = local.findIndex((r) => String(r.id) === String(id));
      if (index !== -1) {
        local[index].status = payload.status; // approved, rejected, failed
        local[index].message = payload.message || null;
        if (payload.status === "rejected") {
          local[index].reject_reason = payload.message || payload.reject_reason || null;
        } else if (payload.status === "failed") {
          local[index].error_message = payload.message || payload.error_message || null;
        }
        saveLocalPerformaRequests(local);
        return { success: true, data: local[index] };
      }
      throw error;
    }
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
