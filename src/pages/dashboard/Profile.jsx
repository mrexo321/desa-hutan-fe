import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import DashboardLayout from "../../components/DashboardLayout";
import { userService } from "../../services/auth/userService";
import { setUserData } from "../../store/userSlice";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Shield,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function Profile() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  // Profile data state
  const [username, setUsername] = useState("");
  const displayRole = user?.roles?.[0] || "Superadmin";
  const displayName = user?.username || "Admin Utama";

  // Password change form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Password visibility toggles
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Initialize profile fields with Redux user state
  useEffect(() => {
    if (user?.username) {
      setUsername(user.username);
    }
  }, [user]);

  // Mutation for updating username
  const updateUsernameMutation = useMutation({
    mutationFn: async (newUsername) => {
      if (!user.userId) {
        throw new Error("User ID tidak ditemukan. Sesi mungkin kedaluwarsa.");
      }
      return await userService.updateUser(user.userId, { username: newUsername });
    },
    onSuccess: (res, newUsername) => {
      toast.success("Username berhasil diperbarui!");
      // Update Redux memory and localStorage
      dispatch(
        setUserData({
          userId: user.userId,
          username: newUsername,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          roles: user.roles,
          permissions: user.permissions,
        })
      );
    },
    onError: (err) => {
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0]?.message ||
        "Gagal memperbarui username.";
      toast.error(errorMsg);
    },
  });

  // Mutation for updating password
  const changePasswordMutation = useMutation({
    mutationFn: async (payload) => {
      return await userService.changePassword(payload);
    },
    onSuccess: () => {
      toast.success("Password berhasil diubah!");
      // Reset form fields
      setCurrentPassword("");
      setPassword("");
      setConfirmPassword("");
    },
    onError: (err) => {
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0]?.message ||
        "Gagal mengubah password. Silakan periksa password lama Anda.";
      toast.error(errorMsg);
    },
  });

  const handleUpdateUsername = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.warning("Username tidak boleh kosong!");
      return;
    }
    if (username.trim() === user.username) {
      toast.info("Username tidak berubah.");
      return;
    }
    updateUsernameMutation.mutate(username.trim());
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.warning("Password lama wajib diisi!");
      return;
    }
    if (!password) {
      toast.warning("Password baru wajib diisi!");
      return;
    }
    if (password.length < 8) {
      toast.warning("Password baru minimal harus 8 karakter!");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Konfirmasi password baru tidak cocok!");
      return;
    }

    changePasswordMutation.mutate({
      current_password: currentPassword,
      password: password,
      password_confirmation: confirmPassword,
    });
  };

  return (
    <DashboardLayout activeMenu="Profile">
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#FAFBFC]">
        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          
          {/* ================= HEADER HALAMAN ================= */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0B241A] to-[#1E5230] p-6 rounded-3xl text-white shadow-lg shadow-green-950/10 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center gap-4 z-10">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-[#00C47C] shadow-inner border border-white/10 shrink-0">
                <User size={28} strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight">Profil Saya</h1>
                <p className="text-xs font-semibold text-green-200/80 mt-1 uppercase tracking-wider">
                  Kelola informasi akun dan preferensi keamanan Anda
                </p>
              </div>
            </div>
            
            {/* Display status log masuk */}
            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-xs font-bold text-green-100 flex items-center gap-2 z-10">
              <ShieldCheck size={16} className="text-[#00C47C]" />
              <span>Sesi Anda Terlindungi</span>
            </div>
          </div>

          {/* ================= CONTENT CONTAINER ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* === KARTU KIRI: DETAIL PROFIL & UPDATE USERNAME === */}
            <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-[0_4px_25px_rgba(0,0,0,0.02)] flex flex-col transition-all hover:shadow-[0_4px_30px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-gray-50">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-[#2D7344]">
                  <User size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 tracking-tight">Detail Akun</h2>
                  <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Informasi Pengguna Utama</p>
                </div>
              </div>

              {/* Tampilan Visual Profile Header */}
              <div className="flex flex-col items-center text-center p-6 bg-gradient-to-b from-green-50/20 to-transparent rounded-2xl border border-green-100/30 mb-8">
                <div className="relative group mb-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-green-100 to-emerald-50 border-[3px] border-[#2D7344]/20 overflow-hidden flex items-center justify-center shadow-md shadow-green-900/5 transition-transform duration-500 group-hover:scale-105">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc`}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-[#2D7344] text-white p-1.5 rounded-full border-2 border-white shadow">
                    <Shield size={14} strokeWidth={2.5} />
                  </div>
                </div>
                <h3 className="text-lg font-extrabold text-gray-800">@{displayName}</h3>
                <span className="mt-1.5 px-3 py-1 rounded-full bg-[#EAFBF0] text-[#2D7344] text-xs font-black uppercase tracking-wider border border-[#2D7344]/10">
                  {displayRole}
                </span>
              </div>

              {/* Form Ubah Username */}
              <form onSubmit={handleUpdateUsername} className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-widest ml-1">
                    Username
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#2D7344] transition-colors">
                      <User size={18} strokeWidth={2} />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Masukkan username baru"
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50/70 border border-gray-200 rounded-2xl text-sm text-gray-800 placeholder-gray-400 font-semibold transition-all focus:bg-white focus:outline-none focus:border-[#2D7344] focus:ring-4 focus:ring-green-500/10"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium ml-1">
                    Username digunakan untuk log masuk ke dalam dashboard Desa Hutan.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={updateUsernameMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 text-white bg-[#2D7344] hover:bg-[#1E5230] text-sm font-bold py-3.5 rounded-2xl transition-all shadow-md shadow-green-900/10 hover:shadow-green-900/20 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {updateUsernameMutation.isPending ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Memperbarui...
                    </>
                  ) : (
                    <>
                      Simpan Username
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* === KARTU KANAN: KEAMANAN & PASSWORD === */}
            <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-[0_4px_25px_rgba(0,0,0,0.02)] flex flex-col transition-all hover:shadow-[0_4px_30px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-gray-50">
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                  <KeyRound size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 tracking-tight">Keamanan Akun</h2>
                  <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Perbarui Password Anda</p>
                </div>
              </div>

              {/* Petunjuk keamanan */}
              <div className="p-4 bg-rose-50/40 border border-rose-100/50 rounded-2xl mb-6 flex items-start gap-3">
                <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={16} />
                <p className="text-xs text-rose-700/80 leading-relaxed font-semibold">
                  Gunakan password yang kuat dengan minimal 8 karakter yang mengombinasikan huruf, angka, dan simbol untuk menjaga keamanan akun Anda.
                </p>
              </div>

              {/* Form Ganti Password */}
              <form onSubmit={handleChangePassword} className="space-y-5">
                
                {/* Password Lama */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-widest ml-1">
                    Password Lama
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-rose-600 transition-colors">
                      <Lock size={18} strokeWidth={2} />
                    </div>
                    <input
                      type={showCurrent ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Masukkan password lama"
                      className="w-full pl-11 pr-12 py-3.5 bg-gray-50/70 border border-gray-200 rounded-2xl text-sm text-gray-800 placeholder-gray-400 font-semibold transition-all focus:bg-white focus:outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none bg-transparent"
                    >
                      {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Password Baru */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-widest ml-1">
                    Password Baru
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-rose-600 transition-colors">
                      <Lock size={18} strokeWidth={2} />
                    </div>
                    <input
                      type={showNew ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan password baru (min 8 karakter)"
                      className="w-full pl-11 pr-12 py-3.5 bg-gray-50/70 border border-gray-200 rounded-2xl text-sm text-gray-800 placeholder-gray-400 font-semibold transition-all focus:bg-white focus:outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none bg-transparent"
                    >
                      {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Konfirmasi Password Baru */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-widest ml-1">
                    Konfirmasi Password Baru
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-rose-600 transition-colors">
                      <Lock size={18} strokeWidth={2} />
                    </div>
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ketik ulang password baru Anda"
                      className="w-full pl-11 pr-12 py-3.5 bg-gray-50/70 border border-gray-200 rounded-2xl text-sm text-gray-800 placeholder-gray-400 font-semibold transition-all focus:bg-white focus:outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none bg-transparent"
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 text-white bg-gray-900 hover:bg-gray-800 text-sm font-bold py-3.5 rounded-2xl transition-all shadow-md shadow-gray-950/10 hover:shadow-gray-950/20 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {changePasswordMutation.isPending ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      Perbarui Password
                      <KeyRound size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>

          </div>

        </div>
      </main>
    </DashboardLayout>
  );
}
