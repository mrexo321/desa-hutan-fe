import axios from "axios";
import { toast } from "sonner";
import { clearUserData } from "../store/userSlice";
import environment from "../config/environment";
import { reduxStore } from "../store/store";

const masterInstance = axios.create({
  baseURL: environment.MASTER_URL, // Menggunakan MASTER_URL
  timeout: 60000,
});

// Fungsi untuk memaksa user logout jika token bermasalah
const forceLogout = () => {
  reduxStore.dispatch(clearUserData());
  toast.error("Sesi Anda telah berakhir. Silakan login kembali.");
  setTimeout(() => {
    window.location.href = "/login";
  }, 1500);
};

// --- REQUEST INTERCEPTOR ---
// Mengambil token dari Redux Store dan menyisipkannya ke header
masterInstance.interceptors.request.use(
  (config) => {
    const state = reduxStore.getState();
    const token = state.user?.access_token; // Gunakan optional chaining untuk keamanan

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// --- RESPONSE INTERCEPTOR ---
// Menangani error global, terutama masalah autentikasi (401/403)
masterInstance.interceptors.response.use(
  (response) => {
    // Jika request berhasil, langsung kembalikan response-nya
    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const responseData = error.response.data;
      const genericMessage = "Terjadi kesalahan pada server, coba lagi nanti.";

      // Ambil pesan error dari API (sesuaikan dengan format balasan API Anda)
      const message = responseData?.message || responseData?.error;

      // Cek pesan spesifik yang menandakan token tidak valid/expired
      if (
        message === "Token tidak valid." ||
        message === "Invalid or missing authentication token." ||
        message === "Akses ditolak, token sudah kedaluwarsa"
      ) {
        forceLogout();
        return Promise.reject(error);
      }

      // Handle berdasarkan HTTP Status Code
      if (status === 401) {
        if (message === "Invalid or missing authentication token.") {
          forceLogout();
        } else {
          // Hanya tampilkan error jika bukan karena masalah token expired (misal: password salah saat verifikasi ulang)
          toast.error(message || "Terjadi kesalahan autentikasi!");
        }
      } else if (status === 403) {
        toast.error(message || "Anda tidak memiliki akses untuk tindakan ini!");
      } else if (status === 500) {
        toast.error("Terjadi kesalahan internal pada server (500).");
      } else {
        // Untuk error 400, 404, dll yang tidak tertangkap di atas
        // Sebaiknya tidak selalu memunculkan toast otomatis di sini jika Anda ingin menangani error form validation secara lokal di komponen
        // Namun jika ingin global, biarkan baris ini:
        console.error("API Error:", message || genericMessage);
        // toast.error(message || genericMessage);
      }
    } else if (error.request) {
      toast.error(
        "Tidak dapat terhubung ke server (Master API). Periksa koneksi internet Anda.",
      );
    } else {
      toast.error("Terjadi kesalahan yang tidak terduga pada aplikasi.");
    }

    return Promise.reject(error);
  },
);

export default masterInstance;
