import axios from "axios";
import { toast } from "sonner";
import { clearUserData } from "../store/userSlice";
import environment from "../config/environment";
import { reduxStore } from "../store/store";
import { refreshAccessToken } from "./refreshCoordinator";

const authInstance = axios.create({
  baseURL: environment.AUTH_URL,
  timeout: 60000,
});

// ============================================================
// Hapus data user dan redirect langsung ke halaman login
// ============================================================
const handleSessionExpired = () => {
  reduxStore.dispatch(clearUserData());
  if (window.location.pathname.startsWith("/dashboard")) {
    window.location.href = "/login";
  }
};

// 1. Request Interceptor
authInstance.interceptors.request.use(
  (config) => {
    const state = reduxStore.getState();
    const token = state.user?.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 2. Response Interceptor
authInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const message =
      error.response?.data?.message || error.response?.data?.error || "";

    // A. LOGIKA AUTO REFRESH (lock tunggal via refreshCoordinator, aman untuk request paralel)
    if (status === 401 && !originalRequest._retry) {
      // Mencegah infinite loop jika yang error 401 adalah endpoint refresh itu sendiri
      if (originalRequest.url?.includes("/auth/refresh")) {
        handleSessionExpired();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const newToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return authInstance(originalRequest);
      } catch (refreshError) {
        // Jika refresh token expired → tampilkan session expired screen
        handleSessionExpired();
        return Promise.reject(refreshError);
      }
    }

    // B. LOGIKA HANDLING ERROR LAINNYA
    if (error.response) {
      const fatalErrorMessages = [
        "Token tidak valid.",
        "Invalid or missing authentication token.",
        "Akses ditolak, token sudah kedaluwarsa",
        "Unauthorized",
        "unauthorized",
        "Expired token",
      ];

      const isFatal = fatalErrorMessages.some((str) => message.includes(str));

      if ((isFatal || status === 403) && status !== 401) {
        if (status === 403) {
          // 403 = tidak punya izin, bukan session expired
          toast.error(message || "Anda tidak memiliki akses untuk tindakan ini!");
        } else {
          handleSessionExpired();
        }
      }
    }

    return Promise.reject(error);
  },
);

export default authInstance;
