import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from "react";
import { ShieldCheck, ShieldAlert, Loader2, RefreshCw, CheckCircle2, Lock } from "lucide-react";
import { captchaService } from "../services/captcha/captchaService";

/**
 * AltchaCaptcha Component
 *
 * Captcha interaktif berbasis ALTCHA Proof-of-Work.
 *
 * Props:
 * - onVerify: (payload, solution) => void - Callback saat captcha terverifikasi
 * - onExpire: () => void - Callback saat captcha di-reset
 * - autoSolve: boolean - Jika true, captcha langsung di-solve tanpa klik (default: false)
 * - className: string
 */
const AltchaCaptcha = forwardRef(({ onVerify, onExpire, autoSolve = false, className = "" }, ref) => {
  // Status state: 'idle' | 'fetching' | 'solving' | 'verified' | 'error'
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [solvedPayload, setSolvedPayload] = useState("");

  // Handler untuk meriset captcha
  const resetCaptcha = useCallback(() => {
    setStatus("idle");
    setErrorMessage("");
    setSolvedPayload("");
    if (onExpire) onExpire();
  }, [onExpire]);

  // Expose reset method via ref
  useImperativeHandle(ref, () => ({
    reset: resetCaptcha,
    status,
  }));

  // Solves the challenge
  const handleSolve = useCallback(async () => {
    if (status === "solving" || status === "fetching" || status === "verified") return;

    try {
      setStatus("fetching");
      setErrorMessage("");

      // 1. Fetch challenge dari backend via masterInstance
      const challengeData = await captchaService.getChallenge();
      if (!challengeData) {
        throw new Error("Respon tantangan dari server kosong.");
      }

      setStatus("solving");

      // 2. Solve Proof of Work via Web Crypto API
      const { solution, payload } = await captchaService.solve(challengeData);

      if (payload) {
        setSolvedPayload(payload);
        setStatus("verified");
        if (onVerify) {
          onVerify(payload, solution);
        }
      } else {
        throw new Error("Gagal membuat token verifikasi captcha.");
      }
    } catch (err) {
      console.error("Gagal verifikasi Altcha Captcha:", err);
      setStatus("error");
      setErrorMessage(
        err?.response?.data?.message || err?.message || "Gagal memproses verifikasi captcha. Silakan coba lagi."
      );
      if (onExpire) onExpire();
    }
  }, [status, onVerify, onExpire]);

  // Auto solve jika diaktifkan
  useEffect(() => {
    if (autoSolve && status === "idle") {
      handleSolve();
    }
  }, [autoSolve, status, handleSolve]);

  return (
    <div
      className={`relative w-full rounded-2xl border transition-all duration-300 select-none overflow-hidden ${
        status === "verified"
          ? "bg-emerald-50/70 border-emerald-300/80 shadow-sm"
          : status === "error"
          ? "bg-red-50/70 border-red-200"
          : status === "solving" || status === "fetching"
          ? "bg-slate-50 border-emerald-200"
          : "bg-gradient-to-r from-slate-50 to-emerald-50/30 border-slate-200 hover:border-emerald-400 hover:shadow-sm"
      } ${className}`}
    >
      {/* Top accent bar */}
      <div
        className={`h-1 w-full transition-all duration-500 ${
          status === "verified"
            ? "bg-emerald-500"
            : status === "error"
            ? "bg-red-500"
            : status === "solving" || status === "fetching"
            ? "bg-emerald-400 animate-pulse"
            : "bg-slate-300"
        }`}
      />

      <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          {/* Checkbox / Status Icon Button */}
          <button
            type="button"
            onClick={status === "verified" ? undefined : handleSolve}
            disabled={status === "fetching" || status === "solving"}
            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center transition-all shrink-0 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
              status === "verified"
                ? "bg-emerald-600 text-white shadow-sm scale-105 cursor-default"
                : status === "error"
                ? "bg-red-500 text-white cursor-pointer hover:bg-red-600"
                : status === "solving" || status === "fetching"
                ? "bg-emerald-100 text-emerald-600 cursor-wait"
                : "border-2 border-slate-300 bg-white hover:border-emerald-600 hover:bg-emerald-50 cursor-pointer shadow-inner"
            }`}
            title={status === "verified" ? "Terverifikasi" : "Klik untuk verifikasi captcha"}
          >
            {status === "fetching" || status === "solving" ? (
              <Loader2 size={16} className="animate-spin text-emerald-600" />
            ) : status === "verified" ? (
              <CheckCircle2 size={18} strokeWidth={2.5} className="animate-in zoom-in-75 duration-300" />
            ) : status === "error" ? (
              <ShieldAlert size={16} strokeWidth={2.5} />
            ) : null}
          </button>

          {/* Label and Subtext */}
          <div className="flex flex-col min-w-0 text-left">
            <div className="flex items-center gap-2">
              <span
                onClick={status === "verified" ? undefined : handleSolve}
                className={`text-xs sm:text-sm font-bold tracking-tight cursor-pointer transition-colors ${
                  status === "verified"
                    ? "text-emerald-900 font-extrabold"
                    : status === "error"
                    ? "text-red-700 font-bold"
                    : "text-slate-700 hover:text-emerald-700 font-semibold"
                }`}
              >
                {status === "verified" ? (
                  "Saya bukan robot (Terverifikasi)"
                ) : status === "fetching" ? (
                  "Menghubungkan server captcha..."
                ) : status === "solving" ? (
                  "Memverifikasi keamanan (PoW)..."
                ) : status === "error" ? (
                  "Verifikasi gagal"
                ) : (
                  "Saya bukan robot"
                )}
              </span>

              {status === "verified" && (
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-800 border border-emerald-300">
                  Lolos
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5 flex items-center gap-1">
              {status === "error" ? (
                <span className="text-red-600 font-semibold">{errorMessage}</span>
              ) : (
                <>
                  <Lock size={10} className="text-emerald-600 inline shrink-0" />
                  <span>Proteksi Anti-Bot (ALTCHA PoW)</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Brand / Action Icon */}
        <div className="flex items-center gap-2 shrink-0">
          {status === "verified" ? (
            <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-100/60 px-2.5 py-1 rounded-xl border border-emerald-200/60">
              <ShieldCheck size={16} strokeWidth={2} />
              <span className="text-[11px] font-bold hidden sm:inline">ALTCHA</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleSolve}
              disabled={status === "fetching" || status === "solving"}
              className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              title="Muat ulang tantangan Captcha"
            >
              <RefreshCw size={15} className={status === "fetching" || status === "solving" ? "animate-spin text-emerald-600" : ""} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

AltchaCaptcha.displayName = "AltchaCaptcha";

export default AltchaCaptcha;
