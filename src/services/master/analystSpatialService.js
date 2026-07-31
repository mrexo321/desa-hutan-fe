import masterInstance from "../../api/masterInstance";

export const analystSpatialService = {
  async getAllProvinces() {
    const response = await masterInstance.get(
      "/analisis-spasial/rekap/provinsi",
    );
    return response.data.data;
  },

  async getProvinceDetail(province, page = 1, size = 10) {
    const response = await masterInstance.get(
      `/analisis-spasial/rekap/provinsi/${province}`,
      {
        params: {
          page: page,
          size: size,
        },
      },
    );
    return response.data.data;
  },

  async getDetailMapInformation(lat, lng) {
    const response = await masterInstance.get(`/public/map`, {
      params: {
        lat: lat,
        lng: lng,
      },
    });
    return response.data.data;
  },

  async getRingkasanAnalisis({ provinsi, kabupaten, kecamatan, tipe_administrasi } = {}) {
    const response = await masterInstance.get(`/analisis-spasial/ringkasan-analisis`, {
      params: {
        ...(provinsi && { provinsi }),
        ...(kabupaten && { kabupaten }),
        ...(kecamatan && { kecamatan }),
        ...(tipe_administrasi && { tipe_administrasi }),
      },
    });
    return response.data.data;
  },

  async getDesaDetail(id) {
    const response = await masterInstance.get(`/analisis-spasial/rekap/desa/${id}`);
    return response.data.data;
  },

  async getInfografisPublic({ provinsi, kabupaten, kecamatan, tipe_administrasi } = {}) {
    const response = await masterInstance.get("/public/infografis", {
      params: {
        ...(provinsi && { provinsi }),
        ...(kabupaten && { kabupaten }),
        ...(kecamatan && { kecamatan }),
        ...(tipe_administrasi && { tipe_administrasi }),
      },
    });
    return response.data.data;
  },

  async getDimensiDesa(id) {
    const response = await masterInstance.get(`/dimensi-desa/${id}`);
    return response.data.data;
  },

  async getListDesaHutan({ jenis_interaksi, page = 1, size = 10, search, provinsi, kabupaten, kecamatan, tipe_administrasi, tipeAdministrasi } = {}) {
    const response = await masterInstance.get("/analisis-spasial/list-desa-hutan", {
      params: {
        jenis_interaksi,
        page,
        size,
        ...(search && { search }),
        ...(provinsi && { provinsi }),
        ...(kabupaten && { kabupaten }),
        ...(kecamatan && { kecamatan }),
        ...((tipe_administrasi || tipeAdministrasi) && { tipe_administrasi: tipe_administrasi || tipeAdministrasi }),
      },
    });
    return response.data;
  },
};


