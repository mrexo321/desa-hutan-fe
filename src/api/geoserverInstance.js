import axios from "axios";
import environment from "../config/environment";

const geoserverInstance = axios.create({
  baseURL: environment.GEOSERVER_URL,
  timeout: 60000,
});

export default geoserverInstance;
