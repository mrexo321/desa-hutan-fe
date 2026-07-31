import { useState, useEffect, useCallback } from "react";

// ============================================================
// useSessionWarning
// Hook untuk mengelola state Session Warning Modal.
// Dipisahkan ke file sendiri agar memenuhi React fast-refresh rules.
// ============================================================

const WARNING_SECONDS = 120; // 2 menit

export const useSessionWarning = ({ onExtend, onTimeout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [countdown, setCountdown] = useState(WARNING_SECONDS);
  const [isExtending, setIsExtending] = useState(false);

  const showWarning = useCallback(() => {
    setCountdown(WARNING_SECONDS);
    setIsOpen(true);
  }, []);

  const hideWarning = useCallback(() => {
    setIsOpen(false);
    setCountdown(WARNING_SECONDS);
    setIsExtending(false);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsOpen(false);
          onTimeout?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, onTimeout]);

  const handleExtend = useCallback(async () => {
    setIsExtending(true);
    try {
      await onExtend?.();
      hideWarning();
    } catch {
      setIsExtending(false);
    }
  }, [onExtend, hideWarning]);

  return { isOpen, countdown, isExtending, showWarning, hideWarning, handleExtend };
};
