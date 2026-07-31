import axios from "axios";
import { toast } from "sonner";
import { setToken, triggerSessionExpired } from "../store/userSlice";
import environment from "../config/environment";
import { reduxStore } from "../store/store";

const masterInstance = axios.create({
  baseURL: environment.MASTER_URL,
  timeout: 60000,
});

// ============================================================
// Dispatch session expired action → UI menampilkan overlay
// profesional, bukan redirect kasar
// ============================================================
const handleSessionExpired = () => {
  reduxStore.dispatch(triggerSessionExpired());
};

// ============================================================
// VARIABEL UNTUK ANTREAN MULTIPLE REQUEST
// ============================================================
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
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
    // A. LOGIKA AUTO REFRESH TOKEN (DENGAN ANTREAN)
    // ========================================================
    if (status === 401 && !originalRequest._retry) {
      // Jika SEDANG proses refresh token, masukkan ke antrean
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return masterInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // Tandai sebagai request pertama yang mencoba refresh
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const state = reduxStore.getState();
        const currentRefreshToken = state.user?.refreshToken;

        if (!currentRefreshToken) {
          processQueue(new Error("No refresh token"), null);
          handleSessionExpired();
          return Promise.reject(error);
        }

        const res = await axios.post(
          `${environment.AUTH_URL}/auth/refresh-token`,
          { refreshToken: currentRefreshToken },
        );

        const newToken = res.data.data.accessToken;

        // Simpan token baru ke Redux
        reduxStore.dispatch(setToken({ accessToken: newToken }));

        // Jalankan semua request yang antre
        processQueue(null, newToken);

        // Re-hit endpoint awal dengan token baru
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return masterInstance(originalRequest);
      } catch (refreshError) {
        // Refresh token mati → tampilkan session expired screen
        processQueue(refreshError, null);
        handleSessionExpired();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
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
