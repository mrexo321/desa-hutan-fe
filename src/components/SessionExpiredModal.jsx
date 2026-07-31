import React from "react";
import { Shield, Clock, LogOut, RefreshCw, AlertTriangle } from "lucide-react";

// ============================================================
// SessionExpiredModal
// Modal warning yang muncul 2 menit sebelum sesi idle habis.
// useSessionWarning hook ada di hooks/useSessionWarning.js
// ============================================================

const WARNING_SECONDS = 120;

const SessionExpiredModal = ({ isOpen, countdown, onExtend, onLogout, isExtending }) => {
  if (!isOpen) return null;

  const progress = (countdown / WARNING_SECONDS) * 100;
  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const timeDisplay = `${minutes}:${String(seconds).padStart(2, "0")}`;

  const isUrgent = countdown <= 30;
  const ringColor = isUrgent ? "#ef4444" : countdown <= 60 ? "#f59e0b" : "#00C47C";

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
        style={{ animation: "fadeIn 0.3s ease-out" }}
      />

      {/* Modal Card */}
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        style={{ animation: "slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
      >
        {/* Accent top bar */}
        <div
          className="h-1.5 w-full transition-all duration-1000"
          style={{
            background: `linear-gradient(90deg, ${ringColor} ${progress}%, #e5e7eb ${progress}%)`,
          }}
        />

        <div className="p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-500"
              style={{ backgroundColor: isUrgent ? "#fef2f2" : "#f0fdf4" }}
            >
              <AlertTriangle
                size={24}
                style={{ color: ringColor }}
                className="transition-colors duration-500"
              />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-gray-900">
                Sesi Akan Berakhir
              </h2>
              <p className="text-sm text-gray-500 font-medium">
                Anda tidak aktif untuk sementara waktu
              </p>
            </div>
          </div>

          {/* Countdown Ring */}
          <div className="flex flex-col items-center my-6">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="10" />
                <circle
                  cx="64" cy="64" r={radius} fill="none"
                  stroke={ringColor} strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={circumference} strokeDashoffset={dashOffset}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="text-2xl font-black tabular-nums transition-colors duration-500"
                  style={{ color: ringColor }}
                >
                  {timeDisplay}
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  tersisa
                </span>
              </div>
            </div>

            <p className="text-sm text-center text-gray-600 font-medium mt-4 max-w-xs leading-relaxed">
              Sesi Anda akan{" "}
              <strong className="text-gray-900">otomatis berakhir</strong> karena
              tidak ada aktivitas. Klik <em>Perpanjang Sesi</em> untuk tetap masuk.
            </p>
          </div>

          {/* Security Badge */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 mb-6">
            <Shield size={14} className="text-slate-400 shrink-0" />
            <p className="text-[11px] text-slate-500 font-medium leading-tight">
              Sesi otomatis berakhir untuk melindungi keamanan akun Anda.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onLogout}
              disabled={isExtending}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95 disabled:opacity-50"
            >
              <LogOut size={16} />
              Keluar Sekarang
            </button>

            <button
              onClick={onExtend}
              disabled={isExtending}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-white text-sm font-bold transition-all active:scale-95 disabled:opacity-70"
              style={{
                background: isExtending
                  ? "#9ca3af"
                  : "linear-gradient(135deg, #00C47C, #0a9a60)",
                boxShadow: isExtending ? "none" : "0 8px 24px rgba(0,196,124,0.3)",
              }}
            >
              {isExtending ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Clock size={16} />
                  Perpanjang Sesi
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default SessionExpiredModal;
