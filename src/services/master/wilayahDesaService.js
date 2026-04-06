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
};
