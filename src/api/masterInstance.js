import axios from "axios";
import { toast } from "sonner";
import { clearUserData, setToken } from "../store/userSlice";
import environment from "../config/environment";
import { reduxStore } from "../store/store";

const masterInstance = axios.create({
  baseURL: environment.MASTER_URL,
  timeout: 60000,
});

const forceLogout = () => {
  reduxStore.dispatch(clearUserData());
  toast.error("Sesi Anda telah berakhir. Silakan login kembali.");
  setTimeout(() => {
    window.location.href = "/login";
  }, 1500);
};

// ==========================================
// VARIABEL UNTUK ANTREAN MULTIPLE REQUEST
// ==========================================
let isRefreshing = false;
let failedQueue = [];

// Fungsi untuk menjalankan ulang antrean request setelah token baru didapat
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
      // Jika SEDANG proses refresh token, masukkan request ini ke dalam antrean (Queue)
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            // Setelah token didapat, ubah header dan jalankan ulang
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return masterInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // Jika BELUM ada proses refresh, tandai sebagai request pertama
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const state = reduxStore.getState();
        const currentRefreshToken = state.user?.refreshToken;

        if (!currentRefreshToken) {
          processQueue(new Error("No refresh token"), null);
          return Promise.reject(error);
        }

        // Hit API Refresh Token
        const res = await axios.post(
          `${environment.AUTH_URL}/auth/refresh-token`,
          { refreshToken: currentRefreshToken },
        );

        const newToken = res.data.data.accessToken;

        // Simpan token baru ke Redux
        reduxStore.dispatch(setToken({ accessToken: newToken }));

        // Jalankan semua request yang sempat mengantre tadi
        processQueue(null, newToken);

        // Eksekusi ulang request utama yang memicu refresh ini
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return masterInstance(originalRequest);
      } catch (refreshError) {
        // Jika gagal refresh (misal refresh token mati), tolak semua antrean & logout
        processQueue(refreshError, null);
        forceLogout();
        return Promise.reject(refreshError);
      } finally {
        // Pastikan status dikembalikan ke false setelah selesai (berhasil/gagal)
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
        forceLogout();
      } else if (status === 403) {
        toast.error(message || "Anda tidak memiliki akses untuk tindakan ini!");
      } else if (status === 500) {
        toast.error("Terjadi kesalahan internal pada server (500).");
      } else if (status !== 401) {
        console.error("API Error:", message || "Terjadi kesalahan pada server");
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
