import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ShieldOff, LogIn, Leaf, Lock } from "lucide-react";
import { clearUserData } from "../store/userSlice";

// ============================================================
// SessionExpiredScreen
// Full-screen overlay yang muncul secara smooth ketika token
// refresh gagal (sesi benar-benar berakhir dari server).
//
// Menggantikan pola lama: toast.error + window.location.href
// yang terasa kasar dan tidak profesional.
// ============================================================

const SessionExpiredScreen = ({ isVisible }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (!isVisible) return;
    // Delay kecil untuk trigger animasi masuk CSS transition
    const t = setTimeout(() => setIsMounted(true), 50);
    return () => {
      clearTimeout(t);
      setIsMounted(false);
    };
  }, [isVisible]);

  const handleLoginAgain = () => {
    dispatch(clearUserData());
    navigate("/login", { replace: true });
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
      style={{
        background: "rgba(2, 20, 10, 0.88)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        opacity: isMounted ? 1 : 0,
        transition: "opacity 0.4s ease",
      }}
    >
      {/* Decorative blobs */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #00C47C, transparent)" }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #0ea5e9, transparent)" }}
        />
      </div>

      {/* Card */}
      <div
        className="relative bg-white/5 border border-white/10 rounded-[32px] p-10 w-full max-w-md text-center shadow-2xl backdrop-blur-xl"
        style={{
          transform: isMounted ? "translateY(0) scale(1)" : "translateY(32px) scale(0.96)",
          opacity: isMounted ? 1 : 0,
          transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease",
        }}
      >
        {/* Icon */}
        <div className="flex items-center justify-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <ShieldOff size={32} className="text-red-400" />
              </div>
            </div>
            {/* Pulse ring */}
            <div
              className="absolute inset-0 rounded-full border border-red-500/30"
              style={{ animation: "pingOnce 1.5s ease-out 0.3s forwards" }}
            />
          </div>
        </div>

        {/* App Branding */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-7 h-7 rounded-lg bg-[#00C47C]/20 flex items-center justify-center">
            <Leaf size={14} className="text-[#00C47C]" />
          </div>
          <span className="text-white/40 text-xs font-bold tracking-widest uppercase">
            Desa Hutan
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-black text-white mb-3 tracking-tight">
          Sesi Berakhir
        </h1>
        <p className="text-white/60 text-sm font-medium leading-relaxed mb-8 max-w-xs mx-auto">
          Sesi login Anda telah berakhir untuk alasan keamanan. Silakan masuk kembali
          untuk melanjutkan aktivitas.
        </p>

        {/* Security info */}
        <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 mb-8 text-left">
          <Lock size={14} className="text-[#00C47C] shrink-0" />
          <p className="text-[11px] text-white/50 font-medium leading-snug">
            Data dan aktivitas Anda tetap aman. Ini adalah prosedur keamanan
            otomatis sistem.
          </p>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleLoginAgain}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm text-[#0B241A] transition-all active:scale-95 group"
          style={{
            background: "linear-gradient(135deg, #00C47C, #00a869)",
            boxShadow: "0 8px 32px rgba(0, 196, 124, 0.35)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "0 12px 40px rgba(0, 196, 124, 0.5)";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 196, 124, 0.35)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <LogIn size={18} className="transition-transform group-hover:translate-x-0.5" />
          Masuk Kembali
        </button>

        {/* Footer */}
        <p className="text-white/20 text-[10px] font-medium mt-6 uppercase tracking-widest">
          © {new Date().getFullYear()} Kementerian Kehutanan RI
        </p>
      </div>

      <style>{`
        @keyframes pingOnce {
          0% { transform: scale(1); opacity: 0.5; }
          70% { transform: scale(1.6); opacity: 0; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default SessionExpiredScreen;
