import masterInstance from "../../api/masterInstance";

export const wilayahHutanService = {
  async getAllHutan(page, size, search = "") {
    const response = await masterInstance.get("/wilayah-hutan", {
      params: {
        page: page,
        size: size,
        search: search,
      },
    });
    return response.data.data;
  },
};
