import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authService } from "../../services/authService";
import { setUserData } from "../../store/userSlice";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      dispatch(
        setUserData({
          userId: data?.user?.id || null,
          name: data?.user?.name || null,
          username: data?.user?.username || null,
          role: data?.user?.role || null,
          token: data?.token || null,
        }),
      );

      toast.success("Login berhasil!");
      navigate("/dashboard");
    },
    onError: (error) => {
      console.error("Gagal login:", error);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validasi aja semisal username atau passwordnya kaga diisi
    if (!username || !password) {
      toast.warning("Username dan Password wajib diisi!");
      return;
    }
    loginMutation.mutate({ username, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white font-sans">
      {/* Container Utama */}
      <div className="flex w-full h-screen max-w-[1440px]">
        {/* BAGIAN KIRI: Form Login */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-8 sm:px-16 lg:px-24">
          <div className="w-full max-w-sm">
            {/* Bagian Logo */}
            <div className="flex flex-col items-center mb-8">
              {/* Ganti div ini dengan <img src="/logo.png" alt="Logo" className="w-24 mb-2" /> */}
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-md flex items-center justify-center overflow-hidden relative mb-3 bg-gray-50">
                <div className="absolute bottom-0 w-full h-1/3 bg-[#A47144]"></div>
                <div className="absolute top-0 w-full h-2/3 bg-[#4E8E42] rounded-b-full"></div>
              </div>

              <h1 className="text-[#367c3b] font-bold text-center text-sm tracking-wide leading-tight">
                KEMENTERIAN
                <br />
                KEHUTANAN
                <br />
                <span className="font-medium text-xs">REPUBLIK INDONESIA</span>
              </h1>
            </div>

            {/* Judul Form */}
            <h2 className="text-3xl italic font-bold text-center mb-10 text-black">
              Desa Hutan
            </h2>

            {/* Form Input */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Input Username */}
              <div className="flex border border-gray-400 rounded-sm focus-within:border-[#367c3b] focus-within:ring-1 focus-within:ring-[#367c3b] transition-all">
                <div className="w-12 flex items-center justify-center border-r border-gray-400 text-gray-500 bg-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 outline-none text-sm placeholder-gray-400 text-gray-700"
                />
              </div>

              {/* Input Password */}
              <div className="flex border border-gray-400 rounded-sm focus-within:border-[#367c3b] focus-within:ring-1 focus-within:ring-[#367c3b] transition-all">
                <div className="w-12 flex items-center justify-center border-r border-gray-400 text-gray-500 bg-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
                  </svg>
                </div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 outline-none text-sm placeholder-gray-400 text-gray-700"
                />
              </div>

              {/* Lupa Password & Tombol Login */}
              <div className="flex items-center justify-between pt-4">
                <a
                  href="#"
                  className="text-sm text-gray-500 hover:text-[#367c3b] transition-colors"
                >
                  Lupa Password ?
                </a>
                <button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className={`text-white text-sm font-medium py-2 px-8 rounded-sm transition-colors ${
                    loginMutation.isPending
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#2D7344] hover:bg-[#235e36]"
                  }`}
                >
                  {loginMutation.isPending ? "Memproses..." : "Login"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* BAGIAN KANAN: Ilustrasi */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#EAFBF0] rounded-l-[40px] items-center justify-center my-4 mr-4 relative overflow-hidden">
          <div className="text-center">
            <div className="w-[400px] h-[400px] bg-green-100/50 rounded-[100px] flex items-center justify-center border-4 border-dashed border-[#8bdba3] text-[#2D7344]">
              <p className="font-semibold px-6">
                Taruh Gambar Ilustrasi
                <br />
                Handphone & Avatar di sini
                <br />
                (Ganti dengan tag &lt;img /&gt;)
              </p>
            </div>
          </div>
          <div className="absolute top-32 right-32 w-2 h-2 bg-green-500 rounded-full"></div>
          <div className="absolute top-48 left-32 w-1.5 h-1.5 bg-green-500 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
