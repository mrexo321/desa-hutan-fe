import axios from "axios";
import { toast } from "sonner";
import { clearUserData } from "../store/userSlice";
import environment from "../config/environment";
import { reduxStore } from "../store/store";
import { refreshAccessToken } from "./refreshCoordinator";

const masterInstance = axios.create({
  baseURL: environment.MASTER_URL,
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

// --- REQUEST INTERCEPTOR ---
masterInstance.interceptors.request.use(
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

// --- RESPONSE INTERCEPTOR ---
masterInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const message =
      error.response?.data?.message || error.response?.data?.error || "";

    // ========================================================
    // A. LOGIKA AUTO REFRESH TOKEN (lock tunggal via refreshCoordinator)
    // ========================================================
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshAccessToken();

        // Re-hit endpoint awal dengan token baru
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return masterInstance(originalRequest);
      } catch (refreshError) {
        // Refresh token mati → tampilkan session expired screen
        handleSessionExpired();
        return Promise.reject(refreshError);
      }
    }

    // ========================================================
    // B. LOGIKA HANDLING ERROR LAINNYA
    // ========================================================
    if (error.response) {
      const fatalErrorMessages = [
        "Token tidak valid.",
        "Invalid or missing authentication token.",
        "Akses ditolak, token sudah kedaluwarsa",
      ];

      const isFatal = fatalErrorMessages.some((str) => message.includes(str));

      if (isFatal && status !== 401) {
        handleSessionExpired();
      } else if (status === 403) {
        toast.error(message || "Anda tidak memiliki akses untuk tindakan ini!");
      } else if (status === 500) {
        toast.error("Terjadi kesalahan internal pada server (500).");
      }
    } else if (error.request) {
      toast.error(
        "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
      );
    }

    return Promise.reject(error);
  },
);

export default masterInstance;
