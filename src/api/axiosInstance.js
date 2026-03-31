import axios from "axios";
import environment from "../config/environment";

const axiosInstance = axios.create({
  baseURL: environment.API_URL,
  timeout: 60000,
});

export default axiosInstance;
