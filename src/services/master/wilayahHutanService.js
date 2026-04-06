import masterInstance from "../../api/masterInstance";

export const wilayahHutanService = {
  async getAllHutan(page, size) {
    const response = await masterInstance.get("/wilayah-hutan", {
      params: {
        page: page,
        size: size,
      },
    });
    return response.data.data;
  },
};
