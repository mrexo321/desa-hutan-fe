import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearUserData } from "../store/userSlice";
import {
  Bell,
  Search,
  Settings,
  LogOut,
  User as UserIcon,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Ambil data user dari Redux (dengan fallback yang elegan)
  const user = useSelector((state) => state.user);
  const displayName = user?.name || user?.username || "Admin Utama";
  const displayRole = user?.roles?.[0] || "Superadmin"; // Ambil role dari Redux

  // Fungsi Tanggal & Waktu Dinamis
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return "Selamat Pagi";
    if (hour >= 11 && hour < 15) return "Selamat Siang";
    if (hour >= 15 && hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  const todayDate = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  // Fungsi untuk menutup dropdown saat klik di luar elemen
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(clearUserData());
    setIsOpen(false);
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 w-full flex items-center justify-between px-6 md:px-10 py-3 bg-white/80 backdrop-blur-xl border-b border-gray-100 transition-all">
      <div className="hidden md:flex flex-col">
        <h2 className="text-lg font-bold text-gray-800 tracking-tight flex items-center gap-2">
          {getGreeting()}, {displayName}{" "}
          <span className="text-xl animate-wave origin-bottom-right inline-block">
            👋
          </span>
        </h2>
        <p className="text-xs font-medium text-gray-500 mt-0.5">{todayDate}</p>
      </div>

      <div className="flex items-center gap-3 md:gap-5 ml-auto">
        <div className="hidden lg:flex relative group">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2D7344] transition-colors"
            size={16}
          />
          <input
            type="text"
            placeholder="Pencarian cepat... (Ctrl+K)"
            className="w-64 bg-gray-50/50 border border-gray-200 text-gray-700 py-2.5 pl-10 pr-4 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/50 focus:bg-white transition-all font-medium placeholder-gray-400"
          />
        </div>

        <button className="relative p-2.5 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200 focus:outline-none">
          <Bell size={18} strokeWidth={2} />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="hidden md:block w-px h-7 bg-gray-200 mx-1"></div>

        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-3 bg-white p-1.5 pr-4 rounded-full border border-gray-200 hover:border-gray-300 shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 ease-in-out select-none"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-green-100 to-green-50 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc`}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="hidden sm:flex flex-col">
              <p className="text-sm font-bold text-gray-800 leading-none">
                {displayName}
              </p>
              <p className="text-[10px] font-semibold text-[#2D7344] mt-1 uppercase tracking-wider">
                {displayRole}
              </p>
            </div>

            <ChevronDown
              size={16}
              className={`text-gray-400 transition-transform duration-300 ml-1 ${isOpen ? "rotate-180" : "rotate-0"}`}
            />
          </div>

          <div
            className={`absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-gray-100 py-2 z-50 transition-all duration-200 origin-top-right ${
              isOpen
                ? "opacity-100 scale-100 visible"
                : "opacity-0 scale-95 invisible"
            }`}
          >
            <div className="px-5 py-3 border-b border-gray-50 mb-1 flex items-center gap-3">
              <div className="bg-green-50 p-2 rounded-lg text-green-600">
                <ShieldCheck size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">{displayName}</p>
                <p className="text-xs text-gray-500">{displayRole}</p>
              </div>
            </div>

            <div className="px-2 space-y-1">
              <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors">
                <UserIcon size={16} />
                Profil Saya
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors">
                <Settings size={16} />
                Pengaturan Akun
              </button>
            </div>

            <div className="h-px bg-gray-100 my-2 mx-4"></div>

            <div className="px-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors"
              >
                <LogOut size={16} />
                Keluar Aplikasi
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
