// const API = "api";
// const UPLOADS = "uploads";
const environment = {
  MAPBOX_URL: import.meta.env.VITE_MAPBOX_TOKEN,
  API_URL: import.meta.env.VITE_BACKEND_DESA_HUTAN_BASE_URL + "/v1",
  //   IMAGE_URL: import.meta.env.VITE_BACKEND_WEB_GIS_BASE_URL_IMAGE,
};

export default environment;
