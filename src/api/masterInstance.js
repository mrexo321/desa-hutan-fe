import axios from "axios";
import environment from "../config/environment";

const masterInstance = axios.create({
  baseURL: environment.MASTER_URL,
  timeout: 60000,
});

export default masterInstance;
