import { useEffect, useRef, useCallback } from "react";

// ============================================================
// useIdleTimeout
// Mendeteksi inaktivitas user dan memanggil callback
// ketika idle timeout tercapai.
//
// Props:
//   onWarning  — dipanggil saat (idleTimeout - warningOffset) tercapai
//   onTimeout  — dipanggil saat idle timeout penuh tercapai
//   idleTimeout  — menit inaktivitas sebelum logout (default: 30)
//   warningOffset — menit sebelum timeout untuk memunculkan warning (default: 2)
//   enabled    — aktifkan/nonaktifkan hook (default: true)
// ============================================================
export const useIdleTimeout = ({
  onWarning,
  onTimeout,
  idleTimeout = 30,
  warningOffset = 2,
  enabled = true,
}) => {
  const idleTimerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const isWarningActiveRef = useRef(false);

  const idleMs = idleTimeout * 60 * 1000;
  const warningMs = (idleTimeout - warningOffset) * 60 * 1000;

  const clearTimers = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
  }, []);

  const resetTimers = useCallback(() => {
    if (!enabled) return;

    // Jika warning sudah ditampilkan, jangan reset
    // (biarkan user pilih: perpanjang atau logout)
    if (isWarningActiveRef.current) return;

    clearTimers();

    // Set timer untuk menampilkan warning
    warningTimerRef.current = setTimeout(() => {
      isWarningActiveRef.current = true;
      onWarning?.();
    }, warningMs);

    // Set timer untuk auto-logout
    idleTimerRef.current = setTimeout(() => {
      onTimeout?.();
    }, idleMs);
  }, [enabled, clearTimers, warningMs, idleMs, onWarning, onTimeout]);

  // Fungsi untuk reset paksa dari luar (saat user klik "Perpanjang Sesi")
  const extendSession = useCallback(() => {
    isWarningActiveRef.current = false;
    resetTimers();
  }, [resetTimers]);

  useEffect(() => {
    if (!enabled) return;

    const events = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "click",
      "wheel",
    ];

    // Inisialisasi timer saat pertama mount
    resetTimers();

    // Pasang event listener untuk deteksi aktivitas
    events.forEach((event) => {
      window.addEventListener(event, resetTimers, { passive: true });
    });

    return () => {
      clearTimers();
      events.forEach((event) => {
        window.removeEventListener(event, resetTimers);
      });
    };
  }, [enabled, resetTimers, clearTimers]);

  return { extendSession };
};
