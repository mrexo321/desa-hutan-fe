import React, { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { setUserData } from "../../store/userSlice";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Leaf,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";

import { authService } from "../../services/auth/authService";
import AltchaCaptcha from "../../components/AltchaCaptcha";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Captcha State & Ref
  const [altchaPayload, setAltchaPayload] = useState("");
  const altchaRef = React.useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const token = useSelector((state) => state.user.accessToken);

  useEffect(() => {
    const profileString = localStorage.getItem("user_profile");
    const refreshToken = localStorage.getItem("_rt");

    if (token || profileString || refreshToken) {
      navigate("/dashboard", { replace: true });
    }
  }, [token, navigate]);

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (res) => {
      const data = res?.data || res;

      dispatch(
        setUserData({
          userId: data?.user?.id || null,
          username: data?.user?.username || null,
          accessToken: data?.accessToken || data?.token || data?.access_token || null,
          refreshToken: data?.refreshToken || data?.refresh_token || null,
          roles: data?.user?.roles || data?.roles || [],
          permissions: data?.user?.permissions || data?.permissions || [],
        }),
      );

      toast.success("Login berhasil! Selamat datang.");
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Username atau password salah.",
      );
      // Reset widget jika login gagal
      setAltchaPayload("");
      altchaRef.current?.reset();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!username || !password) {
      toast.warning("Username dan Password wajib diisi!");
      return;
    }

    if (!altchaPayload) {
      toast.warning("Harap selesaikan verifikasi captcha terlebih dahulu!");
      return;
    }

    loginMutation.mutate({
      username,
      password,
      // altcha: altchaPayload,
    });
  };

  return (
    <div className="h-screen max-h-screen flex w-full bg-white font-sans overflow-hidden">
      <div className="w-full lg:w-[45%] h-full max-h-screen flex flex-col justify-between p-5 sm:p-8 md:p-10 z-10 shadow-[20px_0_40px_rgba(0,0,0,0.04)] relative overflow-hidden">
        {/* Top Bar Navigation */}
        <div className="w-full flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-50/90 hover:bg-emerald-50 text-slate-600 hover:text-[#2D7344] border border-slate-200/80 hover:border-emerald-200/80 rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:shadow-sm transition-all duration-200 group cursor-pointer active:scale-95"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform text-slate-500 group-hover:text-[#2D7344]" />
            <span>Kembali ke Beranda</span>
          </button>
        </div>

        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-green-50 rounded-full blur-3xl opacity-50"></div>
        </div>

        {/* Centered Form Body */}
        <div className="w-full max-w-sm mx-auto my-auto py-2">
          <div className="mb-6 text-center lg:text-left">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2D7344] to-[#154023] text-white shadow-lg shadow-green-900/20 mb-4">
              <Leaf size={28} strokeWidth={1.5} />
            </div>

            <h1 className="text-[#2D7344] font-bold text-[10px] tracking-[0.2em] uppercase mb-1">
              Kementerian Kehutanan RI
            </h1>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              GRAWANA
            </h2>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              Masuk untuk mengelola data dan potensi kawasan hutan.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 ml-1">
                Username
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#2D7344] transition-colors">
                  <User size={16} strokeWidth={2} />
                </div>
                <input
                  type="text"
                  placeholder="Masukkan username Anda"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 font-medium transition-all focus:bg-white focus:outline-none focus:border-[#2D7344] focus:ring-4 focus:ring-green-500/10"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 ml-1">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#2D7344] transition-colors">
                  <Lock size={16} strokeWidth={2} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 font-medium transition-all focus:bg-white focus:outline-none focus:border-[#2D7344] focus:ring-4 focus:ring-green-500/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-0.5 pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-3.5 h-3.5 text-[#2D7344] border-gray-300 rounded focus:ring-[#2D7344]"
                />
                <span className="text-xs font-medium text-gray-600">
                  Ingat saya
                </span>
              </label>
              <a
                href="#"
                className="text-xs font-bold text-[#2D7344] hover:text-[#1a4a2a] transition-colors"
              >
                Lupa Password?
              </a>
            </div>

            {/* ALTCHA CAPTCHA */}
            <AltchaCaptcha
              ref={altchaRef}
              onVerify={(payload) => setAltchaPayload(payload)}
              onExpire={() => setAltchaPayload("")}
            />

            <button
              type="submit"
              disabled={loginMutation.isPending || !altchaPayload}
              className={`w-full flex items-center justify-center gap-2 text-white text-xs font-bold py-3 rounded-xl transition-all ${loginMutation.isPending || !altchaPayload
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                  : "bg-[#2D7344] hover:bg-[#1f5631] hover:shadow-[0_8px_25px_rgba(45,115,68,0.3)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                }`}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  Masuk ke Sistem
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="w-full text-center py-1">
          <p className="text-[11px] text-gray-400 font-medium">
            &copy; {new Date().getFullYear()} Kementerian Kehutanan Republik Indonesia.
          </p>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-[55%] relative bg-gray-900 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transform hover:scale-105 transition-transform duration-1000 ease-out"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=2000&auto=format&fit=crop')",
          }}
        ></div>

        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1f11] via-[#154023]/60 to-transparent"></div>

        <div className="absolute bottom-16 left-16 right-16">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-[#A4D6B5]/20 p-3 rounded-2xl border border-white/10 text-green-300">
                <ShieldCheck size={28} />
              </div>
              <div>
                <h3 className="text-white text-xl font-bold tracking-wide">
                  GRAWANA
                </h3>
                <p className="text-green-200/80 text-sm font-medium">
                 GEOBASELINE GRAWANA
                </p>
              </div>
            </div>
            <p className="text-white/80 text-sm leading-relaxed font-medium">
              Platform digital untuk pemantauan, evaluasi, dan pengelolaan
              potensi sumber daya alam pada kawasan desa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
