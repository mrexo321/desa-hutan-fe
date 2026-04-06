import geoserverInstance from "../../api/geoserverInstance";

export const geoserverService = {
  async getLayerHutan() {
    const layerName = "wilayah_hutan_geom"; // Nama layer dinamis Anda

    const response = await geoserverInstance.get("/wms", {
      params: {
        bbox: "{bbox-epsg-3857}",
        format: "image/png8",
        service: "WMS",
        version: "1.1.1",
        request: "GetMap",
        srs: "EPSG:3857",
        transparent: true,
        width: 256,
        height: 256,
        // Gabungkan nama workspace dan layer di sini
        layers: `desa_gis:${layerName}`,
      },
      responseType: "blob",
    });

    return response.data;
  },

  async getLayerDesa() {
    const response = await geoserverInstance.get("wilayah_desa_geom");
    return response.data;
  },
};
