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
  Command,
  LayoutDashboard,
  Trees,
  LineChart,
  Sprout,
  Target,
  Calculator,
  Layers,
  Map,
  Users,
  MapPinned,
  Database,
  X,
  ArrowRight,
} from "lucide-react";

export default function Header() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const profileDropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Ambil data user dari Redux
  const user = useSelector((state) => state.user);
  const displayName = user?.name || user?.username || "Admin Utama";
  const displayRole = user?.roles?.[0] || "Superadmin";

  // =========================================================
  // DATA COMMAND PALETTE (Disesuaikan dengan Sidebar Asli)
  // =========================================================
  const searchItems = [
    // --- Menu Utama ---
    {
      id: "h1",
      title: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={18} />,
      category: "Menu Utama",
    },
    {
      id: "h2",
      title: "Desa Hutan",
      path: "/dashboard/desa-hutan",
      icon: <Trees size={18} />,
      category: "Menu Utama",
    },
    {
      id: "h3",
      title: "Performa Desa",
      path: "/dashboard/performa-desa",
      icon: <LineChart size={18} />,
      category: "Menu Utama",
    },
    {
      id: "h4",
      title: "Potensi Desa",
      path: "/dashboard/potensi-desa",
      icon: <Sprout size={18} />,
      category: "Menu Utama",
    },

    // --- Pengaturan Data (Metadata) ---
    {
      id: "m1",
      title: "Indikator",
      path: "/dashboard/indikator",
      icon: <Target size={18} />,
      category: "Pengaturan Data",
    },
    {
      id: "m2",
      title: "Indikator Perhitungan",
      path: "/dashboard/indikator-perhitungan",
      icon: <Calculator size={18} />,
      category: "Pengaturan Data",
    },
    {
      id: "m3",
      title: "Klasifikasi",
      path: "/dashboard/klasifikasi",
      icon: <Layers size={18} />,
      category: "Pengaturan Data",
    },
    {
      id: "m4",
      title: "Wilayah",
      path: "/dashboard/wilayah",
      icon: <Map size={18} />,
      category: "Pengaturan Data",
    },
    {
      id: "m5",
      title: "Manajemen User",
      path: "/dashboard/manajemen-user",
      icon: <Users size={18} />,
      category: "Pengaturan Data",
    },
    {
      id: "m6",
      title: "Manajemen Role",
      path: "/dashboard/manajemen-role",
      icon: <ShieldCheck size={18} />,
      category: "Pengaturan Data",
    },
    {
      id: "m7",
      title: "Master Wilayah",
      path: "/dashboard/master-wilayah",
      icon: <MapPinned size={18} />,
      category: "Pengaturan Data",
    },
    {
      id: "m8",
      title: "Master Potensi",
      path: "/dashboard/master-potensi",
      icon: <Database size={18} />,
      category: "Pengaturan Data",
    },

    // --- Pengaturan Akun & Profil ---
    {
      id: "p1",
      title: "Profil Saya",
      path: "/profile",
      icon: <UserIcon size={18} />,
      category: "Akun Saya",
    },
    {
      id: "p2",
      title: "Pengaturan Akun",
      path: "/settings",
      icon: <Settings size={18} />,
      category: "Akun Saya",
    },
  ];

  // Logika Filter Pencarian
  const filteredSearchItems = searchItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // --- Utility Functions ---
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

  // --- Event Listeners ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === "Escape" && isSearchOpen) {
        setIsSearchOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen]);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // --- Handlers ---
  const handleLogout = () => {
    dispatch(clearUserData());
    setIsProfileOpen(false);
    navigate("/login");
  };

  const handleNavigate = (path) => {
    navigate(path);
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  return (
    <>
      <header className="sticky top-0 z-30 w-full flex items-center justify-between px-6 md:px-10 py-4 bg-white/70 backdrop-blur-2xl border-b border-gray-200/50 shadow-[0_4px_30px_rgb(0,0,0,0.02)] transition-all">
        {/* KIRI: Sapaan & Tanggal */}
        <div className="hidden md:flex flex-col">
          <h2 className="text-xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent tracking-tight flex items-center gap-2">
            {getGreeting()}, {displayName}{" "}
            <span className="text-xl animate-wave origin-bottom-right inline-block filter drop-shadow-sm">
              👋
            </span>
          </h2>
          <p className="text-xs font-semibold text-gray-500 mt-1 uppercase tracking-wider">
            {todayDate}
          </p>
        </div>

        {/* KANAN: Search, Notifikasi, Profile */}
        <div className="flex items-center gap-3 md:gap-5 ml-auto">
          {/* SEARCH TRIGGER BUTTON */}
          {/* <button
            onClick={() => setIsSearchOpen(true)}
            className="hidden lg:flex relative group items-center w-72 bg-gray-50/80 hover:bg-gray-100/80 border border-gray-200/80 text-gray-400 py-2.5 pl-4 pr-12 rounded-2xl text-sm transition-all duration-300 font-medium shadow-inner text-left"
          >
            <Search
              className="mr-2.5 group-hover:text-[#2D7344] transition-colors"
              size={18}
            />
            <span className="truncate">Cari menu atau halaman...</span>

            <div className="absolute right-3 hidden sm:flex items-center gap-1 bg-white border border-gray-200/80 px-2 py-1 rounded-md shadow-sm">
              <Command size={10} className="text-gray-400" />
              <span className="text-[10px] font-extrabold text-gray-400 leading-none">
                K
              </span>
            </div>
          </button> */}

          {/* Tombol Search Mobile */}
          {/* <button
            onClick={() => setIsSearchOpen(true)}
            className="lg:hidden p-2.5 rounded-xl text-gray-500 hover:text-[#2D7344] hover:bg-green-50 transition-all border border-transparent"
          >
            <Search size={20} strokeWidth={2.2} />
          </button> */}

          {/* Tombol Notifikasi */}
          {/* <button className="relative p-2.5 rounded-xl text-gray-500 hover:text-[#2D7344] hover:bg-green-50 transition-all duration-300 border border-transparent hover:border-green-100 focus:outline-none shadow-sm hover:shadow-md">
            <Bell size={20} strokeWidth={2.2} />
            <span className="absolute top-2.5 right-2.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white"></span>
            </span>
          </button>

          <div className="hidden md:block w-px h-8 bg-gradient-to-b from-transparent via-gray-200 to-transparent mx-1"></div> */}

          {/* Profile Dropdown */}
          <div className="relative" ref={profileDropdownRef}>
            <div
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 bg-white p-1.5 pr-4 rounded-full border border-gray-200 hover:border-[#2D7344]/30 shadow-sm cursor-pointer hover:shadow-md transition-all duration-300 ease-out select-none group"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-green-100 to-emerald-50 border border-green-100/50 overflow-hidden flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-300">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc`}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="hidden sm:flex flex-col">
                <p className="text-sm font-bold text-gray-800 leading-none group-hover:text-[#2D7344] transition-colors">
                  {displayName}
                </p>
                <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">
                  {displayRole}
                </p>
              </div>

              <ChevronDown
                size={16}
                strokeWidth={2.5}
                className={`text-gray-400 transition-transform duration-300 ml-1 ${isProfileOpen
                    ? "rotate-180 text-[#2D7344]"
                    : "rotate-0 group-hover:text-[#2D7344]"
                  }`}
              />
            </div>

            <div
              className={`absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 py-2 z-50 transition-all duration-300 origin-top-right ${isProfileOpen
                  ? "opacity-100 scale-100 translate-y-0 visible"
                  : "opacity-0 scale-95 -translate-y-2 invisible"
                }`}
            >
              <div className="px-5 py-4 border-b border-gray-100/80 mb-2 flex items-center gap-4 bg-gray-50/50 rounded-t-xl mx-2 mt-[-8px]">
                <div className="bg-[#2D7344]/10 p-2.5 rounded-xl text-[#2D7344] shadow-sm">
                  <ShieldCheck size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-gray-900">
                    {displayName}
                  </p>
                  <p className="text-[11px] font-semibold text-[#2D7344] mt-0.5 uppercase tracking-wide">
                    {displayRole}
                  </p>
                </div>
              </div>

              <div className="px-3 space-y-1">
                <button
                  onClick={() => handleNavigate("/profile")}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-gray-600 hover:text-[#2D7344] hover:bg-green-50/80 rounded-xl transition-all duration-200"
                >
                  <UserIcon
                    size={18}
                    strokeWidth={2.5}
                    className="opacity-70"
                  />
                  Profil Saya
                </button>
                <button
                  onClick={() => handleNavigate("/settings")}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-gray-600 hover:text-[#2D7344] hover:bg-green-50/80 rounded-xl transition-all duration-200"
                >
                  <Settings
                    size={18}
                    strokeWidth={2.5}
                    className="opacity-70"
                  />
                  Pengaturan Akun
                </button>
              </div>

              <div className="h-px bg-gray-100/80 my-2 mx-4"></div>

              <div className="px-3">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-all duration-200 group"
                >
                  <LogOut
                    size={18}
                    strokeWidth={2.5}
                    className="opacity-70 group-hover:opacity-100"
                  />
                  Keluar Aplikasi
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ==========================================
          GLOBAL COMMAND PALETTE (SEARCH MODAL)
      ========================================== */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] sm:pt-[15vh] px-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
          {/* Overlay click to close */}
          <div
            className="absolute inset-0"
            onClick={() => setIsSearchOpen(false)}
          ></div>

          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-200 border border-slate-100">
            {/* Search Input Area */}
            <div className="flex items-center px-4 py-4 border-b border-gray-100 bg-gray-50/50">
              <Search className="text-gray-400 ml-2 shrink-0" size={24} />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari menu, halaman, atau pengaturan..."
                className="w-full bg-transparent border-none focus:ring-0 text-gray-800 text-lg px-4 py-2 placeholder-gray-400 outline-none"
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search Results Area */}
            <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar bg-white">
              {filteredSearchItems.length > 0 ? (
                <div className="space-y-1">
                  {filteredSearchItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleNavigate(item.path)}
                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#2D7344]/5 group transition-colors text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-gray-100 text-gray-500 rounded-xl group-hover:bg-white group-hover:text-[#2D7344] group-hover:shadow-sm transition-all">
                          {item.icon}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-800 group-hover:text-[#2D7344] transition-colors">
                            {item.title}
                          </p>
                          <p className="text-xs font-semibold text-gray-400 mt-0.5">
                            {item.category}
                          </p>
                        </div>
                      </div>
                      <ArrowRight
                        size={18}
                        className="text-gray-300 opacity-0 group-hover:opacity-100 group-hover:text-[#2D7344] -translate-x-2 group-hover:translate-x-0 transition-all duration-300"
                      />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                    <Search size={28} />
                  </div>
                  <h3 className="text-gray-900 font-bold">
                    Pencarian Tidak Ditemukan
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 max-w-xs">
                    Tidak ada menu atau halaman yang cocok dengan kata kunci "
                    {searchQuery}".
                  </p>
                </div>
              )}
            </div>

            {/* Footer Modal Search */}
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500 font-medium">
              <div className="flex items-center gap-2">
                <span>Tekan</span>
                <span className="px-1.5 py-0.5 bg-white border border-gray-200 rounded shadow-sm">
                  Esc
                </span>
                <span>untuk menutup</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
