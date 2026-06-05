// const API = "api";
// const UPLOADS = "uploads";
const environment = {
  MAPBOX_URL: import.meta.env.VITE_MAPBOX_TOKEN,
  API_URL: import.meta.env.VITE_BACKEND_DESA_HUTAN_BASE_URL,
  AUTH_URL: import.meta.env.VITE_BACKEND_DESA_HUTAN_BASE_URL + "/v1",
  MASTER_URL: import.meta.env.VITE_BACKEND_DESA_HUTAN_BASE_URL + "/v2",
  GEOSERVER_URL: import.meta.env.VITE_BACKEND_GEOSERVER_BASE_URL,
  GEOSERVER_WMS_BASE: import.meta.env.VITE_GEOSERVER_WMS_BASE,
  //   IMAGE_URL: import.meta.env.VITE_BACKEND_WEB_GIS_BASE_URL_IMAGE,

  // Chatbot AI
  CHATBOT_API_URL: import.meta.env.VITE_CHATBOT_API_URL || "http://localhost:8080",
  CHATBOT_ID: import.meta.env.VITE_CHATBOT_ID || "",
};

export default environment;

