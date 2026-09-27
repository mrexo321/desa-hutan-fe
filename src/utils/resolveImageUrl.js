import environment from "../config/environment";

/**
 * Helper untuk menyusun & mengamankan URL gambar agar tidak terjadi Mixed Content (HTTP di halaman HTTPS).
 * Otomatis mengganti protocol & host dari IP internal backend (seperti 172.16.3.188 atau localhost)
 * dengan domain API resmi yang sudah HTTPS dari .env / window.location.
 */
export const resolveImageUrl = (path) => {
  if (!path) return null;

  const rawBaseUrl =
    environment.API_URL ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3001");
  const baseUrl = rawBaseUrl.replace(/\/$/, "");

  // Jika sudah berupa URL absolute (http:// atau https://)
  if (path.startsWith("http://") || path.startsWith("https://")) {
    try {
      const parsed = new URL(path);
      const base = new URL(baseUrl);

      // Cek apakah host adalah IP internal/private, localhost, atau port backend
      const isInternalHost =
        parsed.hostname === "localhost" ||
        parsed.hostname === "127.0.0.1" ||
        parsed.hostname.startsWith("172.") ||
        parsed.hostname.startsWith("192.168.") ||
        parsed.hostname.startsWith("10.");

      // Cek apakah path mengandung direktori asset backend
      const isBackendPath =
        parsed.pathname.startsWith("/v1/") ||
        parsed.pathname.startsWith("/v2/") ||
        parsed.pathname.startsWith("/v3/") ||
        parsed.pathname.startsWith("/public/") ||
        parsed.pathname.startsWith("/uploads/") ||
        parsed.pathname.startsWith("/images/");

      // Jika host internal atau asset backend, alihkan ke origin base API dari .env
      if (isInternalHost || isBackendPath) {
        parsed.protocol = base.protocol;
        parsed.host = base.host;
        return parsed.toString();
      }

      // Jika halaman saat ini diakses lewat HTTPS, paksa protokol HTTPS agar tidak Mixed Content
      if (typeof window !== "undefined" && window.location.protocol === "https:" && parsed.protocol === "http:") {
        parsed.protocol = "https:";
        return parsed.toString();
      }

      return path;
    } catch {
      // Fallback jika parsing gagal
      if (typeof window !== "undefined" && window.location.protocol === "https:" && path.startsWith("http://")) {
        return path.replace(/^http:\/\//i, "https://");
      }
      return path;
    }
  }

  // Jika path relatif (misal: /v1/public/... atau uploads/...)
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

export default resolveImageUrl;
