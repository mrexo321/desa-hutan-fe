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
  ShieldCheck,
} from "lucide-react";

import { authService } from "../../services/auth/authService";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // PERBAIKAN: Gunakan accessToken
  const token = useSelector((state) => state.user.accessToken);

  useEffect(() => {
    if (token) {
      // Beri sedikit jeda agar redux selesai menyimpan ke localstorage
      const timer = setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [token, navigate]);

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: ({ data }) => {
      // PERBAIKAN: Tangkap data API dengan format camelCase
      dispatch(
        setUserData({
          userId: data?.user?.id || null,
          username: data?.user?.username || null,
          accessToken: data?.accessToken || null,
          refreshToken: data?.refreshToken || null,
          roles: data?.user?.roles || [],
          permissions: data?.user?.permissions || [],
        }),
      );

      toast.success("Login berhasil! Selamat datang.");
    },
    onError: (error) => {
      console.error("Gagal login:", error);
      toast.error(
        error?.response?.data?.message || "Username atau password salah.",
      );
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!username || !password) {
      toast.warning("Username dan Password wajib diisi!");
      return;
    }
    loginMutation.mutate({ username, password });
  };

  return (
    <div className="min-h-screen flex w-full bg-white font-sans overflow-hidden">
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 sm:px-16 md:px-24 z-10 shadow-[20px_0_40px_rgba(0,0,0,0.04)] relative">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-green-50 rounded-full blur-3xl opacity-50"></div>
        </div>

        <div className="w-full max-w-sm mx-auto">
          <div className="mb-10 text-center lg:text-left">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2D7344] to-[#154023] text-white shadow-lg shadow-green-900/20 mb-6">
              <Leaf size={32} strokeWidth={1.5} />
            </div>

            <h1 className="text-[#2D7344] font-bold text-[11px] tracking-[0.2em] uppercase mb-2">
              Kementerian Kehutanan RI
            </h1>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              Desa Hutan
            </h2>
            <p className="text-sm text-gray-500 mt-2 font-medium">
              Masuk untuk mengelola data dan potensi kawasan hutan.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 ml-1">
                Username
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#2D7344] transition-colors">
                  <User size={18} strokeWidth={2} />
                </div>
                <input
                  type="text"
                  placeholder="Masukkan username Anda"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 font-medium transition-all focus:bg-white focus:outline-none focus:border-[#2D7344] focus:ring-4 focus:ring-green-500/10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 ml-1">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#2D7344] transition-colors">
                  <Lock size={18} strokeWidth={2} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 font-medium transition-all focus:bg-white focus:outline-none focus:border-[#2D7344] focus:ring-4 focus:ring-green-500/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 pb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-[#2D7344] border-gray-300 rounded focus:ring-[#2D7344]"
                />
                <span className="text-sm font-medium text-gray-600">
                  Ingat saya
                </span>
              </label>
              <a
                href="#"
                className="text-sm font-bold text-[#2D7344] hover:text-[#1a4a2a] transition-colors"
              >
                Lupa Password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className={`w-full flex items-center justify-center gap-2 text-white text-sm font-bold py-3.5 rounded-xl transition-all ${
                loginMutation.isPending
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#2D7344] hover:bg-[#1f5631] hover:shadow-[0_8px_25px_rgba(45,115,68,0.3)] hover:-translate-y-0.5 active:translate-y-0"
              }`}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  Masuk ke Sistem
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 font-medium mt-10">
            &copy; {new Date().getFullYear()} Kementerian Kehutanan Republik
            Indonesia.
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
                  Sistem Informasi Manajemen
                </h3>
                <p className="text-green-200/80 text-sm font-medium">
                  Terintegrasi & Aman
                </p>
              </div>
            </div>
            <p className="text-white/80 text-sm leading-relaxed font-medium">
              Platform digital untuk pemantauan, evaluasi, dan pengelolaan
              potensi sumber daya alam pada kawasan desa hutan secara
              *real-time* di seluruh penjuru Nusantara.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
