import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, Map, ArrowLeft, Trees } from "lucide-react";

const Unauthorized = () => {
  const navigate = useNavigate();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-[#0B241A] relative flex items-center justify-center p-4 overflow-hidden">
      {/* Decorative Forest Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div 
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #00C47C, transparent 70%)" }}
        />
        <div 
          className="absolute -bottom-40 -right-40 w-[30rem] h-[30rem] rounded-full opacity-10 blur-3xl"
          style={{ background: "radial-gradient(circle, #0ea5e9, transparent 70%)" }}
        />
        
        {/* Subtle grid/pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "32px 32px" }}
        />
      </div>

      <div 
        className="relative z-10 bg-white/5 border border-white/10 p-8 md:p-12 rounded-[2.5rem] shadow-2xl backdrop-blur-xl max-w-lg w-full text-center transition-all duration-700 ease-out"
        style={{
          transform: isMounted ? "translateY(0) scale(1)" : "translateY(40px) scale(0.95)",
          opacity: isMounted ? 1 : 0
        }}
      >
        <div className="flex justify-center mb-8 relative">
          {/* Pulsing ring */}
          <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse" />
          
          <div className="w-24 h-24 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center relative z-10">
            <ShieldAlert size={40} className="text-red-400" />
            
            {/* Tiny accent icon */}
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#0B241A] border border-white/10 rounded-full flex items-center justify-center shadow-lg">
              <Trees size={18} className="text-[#00C47C]" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
          Hutan Terlarang!
        </h1>
        
        <p className="text-white/60 text-sm md:text-base leading-relaxed mb-8 max-w-sm mx-auto font-medium">
          Waduh, sepertinya Anda tersesat. Area ini dilindungi oleh sistem keamanan desa dan Anda tidak memiliki izin untuk memasukinya.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate("/dashboard", { replace: true })}
            className="w-full flex items-center justify-center gap-2 bg-[#00C47C] hover:bg-[#00a869] text-[#0B241A] font-bold py-3.5 px-6 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_8px_25px_rgba(0,196,124,0.3)]"
          >
            <Map size={18} />
            Kembali ke Peradaban (Dashboard)
          </button>
          
          <button
            onClick={() => navigate(-1)}
            className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-semibold py-3.5 px-6 rounded-2xl border border-white/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <ArrowLeft size={18} className="opacity-70" />
            Kembali ke Halaman Sebelumnya
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
