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

  async getRingkasanAnalisis({ provinsi, kabupaten, kecamatan } = {}) {
    const response = await masterInstance.get(`/analisis-spasial/ringkasan-analisis`, {
      params: {
        ...(provinsi && { provinsi }),
        ...(kabupaten && { kabupaten }),
        ...(kecamatan && { kecamatan }),
      },
    });
    return response.data.data;
  },

  async getDesaDetail(id) {
    const response = await masterInstance.get(`/analisis-spasial/rekap/desa/${id}`);
    return response.data.data;
  },

  async getInfografisPublic({ provinsi, kabupaten, kecamatan } = {}) {
    const response = await masterInstance.get("/public/infografis", {
      params: {
        ...(provinsi && { provinsi }),
        ...(kabupaten && { kabupaten }),
        ...(kecamatan && { kecamatan }),
      },
    });
    return response.data.data;
  },
};


