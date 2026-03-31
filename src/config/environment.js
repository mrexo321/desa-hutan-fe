// const API = "api";
// const UPLOADS = "uploads";
const environment = {
  MAPBOX_URL: import.meta.env.VITE_MAPBOX_TOKEN,
  API_URL: import.meta.env.VITE_BACKEND_DESA_HUTAN_BASE_URL,
  AUTH_URL: import.meta.env.VITE_BACKEND_DESA_HUTAN_BASE_URL + "/v1",
  MASTER_URL: import.meta.env.VITE_BACKEND_DESA_HUTAN_BASE_URL + "/v2",
  GEOSERVER_URL: import.meta.env.VITE_BACKEND_GEOSERVER_BASE_URL,
  //   IMAGE_URL: import.meta.env.VITE_BACKEND_WEB_GIS_BASE_URL_IMAGE,
};

export default environment;
