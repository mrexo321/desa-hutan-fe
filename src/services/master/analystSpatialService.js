import masterInstance from "../../api/masterInstance";

export const analystSpatialService = {
  async getAllProvinces() {
    const response = await masterInstance.get(
      "/analisis-spasial/rekap/provinsi",
    );
    return response.data.data;
  },

  async getProvinceDetail(province) {
    const response = await masterInstance.get(
      `/analisis-spasial/rekap/provinsi/${province}`,
    );
    return response.data.data;
  },
};
