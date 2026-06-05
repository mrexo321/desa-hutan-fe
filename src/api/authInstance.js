import axios from "axios";
import { clearUserData, setToken, triggerSessionExpired } from "../store/userSlice";
import environment from "../config/environment";
import { reduxStore } from "../store/store";

const authInstance = axios.create({
  baseURL: environment.AUTH_URL,
  timeout: 60000,
});

// ============================================================
// Dispatch session expired action → UI akan menampilkan
// SessionExpiredScreen yang profesional (bukan redirect kasar)
// ============================================================
const handleSessionExpired = () => {
  reduxStore.dispatch(triggerSessionExpired());
};

const handleForceLogout = () => {
  reduxStore.dispatch(clearUserData());
  window.location.href = "/login";
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

    // A. LOGIKA AUTO REFRESH (DENGAN ANTREAN)
    if (status === 401 && !originalRequest._retry) {
      // Mencegah infinite loop jika yang error 401 adalah endpoint refresh itu sendiri
      if (originalRequest.url?.includes("/auth/refresh")) {
        handleSessionExpired();
        return Promise.reject(error);
      }

      // Jika SEDANG proses refresh token, masukkan request ini ke dalam antrean
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return authInstance(originalRequest);
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
          handleSessionExpired();
          return Promise.reject(error);
        }

        // Gunakan axios standar agar tidak terkena interceptor ini lagi
        const res = await axios.post(
          `${environment.AUTH_URL}/auth/refresh-token`,
          { refreshToken: currentRefreshToken },
        );

        const newToken = res.data.data.accessToken;

        // Update Redux
        reduxStore.dispatch(setToken({ accessToken: newToken }));

        // Jalankan semua request yang sempat mengantre tadi
        processQueue(null, newToken);

        // Ulangi request yang gagal tadi menggunakan authInstance
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return authInstance(originalRequest);
      } catch (refreshError) {
        // Jika refresh token expired → tampilkan session expired screen
        processQueue(refreshError, null);
        handleSessionExpired();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
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
          handleForceLogout();
        } else {
          handleSessionExpired();
        }
      }
    }

    return Promise.reject(error);
  },
);

export default authInstance;
