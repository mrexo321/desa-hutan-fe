import axios from "axios";
import { toast } from "sonner";
import { clearUserData } from "../store/userSlice";
import environment from "../config/environment";
import { reduxStore } from "../store/store";

const authInstance = axios.create({
  baseURL: environment.AUTH_URL,
  timeout: 60000,
});

// awalnya axiosInstance gegara auth endpointnya ada di v1, pake yg authInstance jadinya
authInstance.interceptors.request.use(
  (config) => {
    const state = reduxStore.getState();
    const token = state.user.access_token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

const forceLogout = () => {
  reduxStore.dispatch(clearUserData());
  toast.error("Sesi Anda telah berakhir. Silakan login kembaliiiii.");
  setTimeout(() => {
    window.location.href = "/login";
  }, 1500);
};
// awalnya axiosInstance gegara auth endpointnya ada di v1, pake yg authInstance jadinya
authInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const responseData = error.response.data;
      const genericMessage = "Terjadi kesalahan pada server, coba lagi nanti.";
      const message = responseData?.message || responseData?.error;

      // ✅ Tambahan kondisi di sini
      if (
        message === "Token tidak valid." ||
        message === "Invalid or missing authentication token." ||
        message === "Akses ditolak, token sudah kedaluwarsa"
      ) {
        forceLogout();
        return Promise.reject(error);
      }

      if (status === 401) {
        if (message === "Invalid or missing authentication token.") {
          forceLogout();
        } else {
          toast.error(message || "Terjadi kesalahan autentikasi!");
        }
      } else if (status === 403) {
        toast.error(message || "Anda tidak memiliki akses!");
      } else {
        toast.error(message || genericMessage);
      }
    } else if (error.request) {
      toast.error(
        "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
      );
    } else {
      toast.error("Terjadi kesalahan yang tidak terduga.");
    }

    return Promise.reject(error);
  },
);

export default authInstance;
