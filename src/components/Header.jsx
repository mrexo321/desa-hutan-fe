import React, { useState, useRef, useEffect, useMemo } from "react";
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
  X,
  ArrowRight,
} from "lucide-react";

// 1. Impor data menu dari folder constants
import { homeMenus, metadataMenus } from "../constants/sidebarMenus";

// =========================================================
// DATA COMMAND PALETTE (Dibuat dinamis dari konstan)
// =========================================================
const searchItems = [
  // Map data Menu Utama
  ...homeMenus.map((item, index) => {
    const Icon = item.icon; // Ambil referensi komponen ikon
    return {
      id: `h${index}`,
      title: item.name,
      path: item.path,
      icon: <Icon size={18} />, // Render ikon dengan ukuran spesifik untuk search
      category: "Menu Utama",
    };
  }),

  // Map data Pengaturan Data
  ...metadataMenus.map((item, index) => {
    const Icon = item.icon;
    return {
      id: `m${index}`,
      title: item.name,
      path: item.path,
      icon: <Icon size={18} />,
      category: "Pengaturan Data",
    };
  }),

  // Tambahan menu statis khusus untuk Akun
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

const Header = React.memo(function Header() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const profileDropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const resultListRef = useRef(null);

  // Mencegah konflik auto-scroll keyboard dengan hover mouse
  const lastInteractionType = useRef("mouse");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.user);
  const displayName = user?.name || user?.username || "Admin Utama";
  const displayRole = user?.roles?.[0] || "Superadmin";

  // Filter pencarian
  const filteredSearchItems = useMemo(() => {
    if (!searchQuery.trim()) return searchItems;
    const lowerQuery = searchQuery.toLowerCase();
    return searchItems.filter(
      (item) =>
        item.title.toLowerCase().includes(lowerQuery) ||
        item.category.toLowerCase().includes(lowerQuery),
    );
  }, [searchQuery]);

  // Tanggal saat ini
  const todayDate = useMemo(() => {
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return "Selamat Pagi";
    if (hour >= 11 && hour < 15) return "Selamat Siang";
    if (hour >= 15 && hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

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
    const handleGlobalKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === "Escape" && isSearchOpen) {
        setIsSearchOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isSearchOpen]);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
      setSelectedIndex(0);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  useEffect(() => {
    if (
      lastInteractionType.current === "keyboard" &&
      resultListRef.current &&
      resultListRef.current.children[selectedIndex]
    ) {
      resultListRef.current.children[selectedIndex].scrollIntoView({
        block: "nearest",
      });
    }
  }, [selectedIndex]);

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

  const handleInputKeyDown = (e) => {
    if (filteredSearchItems.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      lastInteractionType.current = "keyboard";
      setSelectedIndex((prev) =>
        Math.min(prev + 1, filteredSearchItems.length - 1),
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      lastInteractionType.current = "keyboard";
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleNavigate(filteredSearchItems[selectedIndex].path);
    }
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
          <button
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
          </button>

          <button
            onClick={() => setIsSearchOpen(true)}
            className="lg:hidden p-2.5 rounded-xl text-gray-500 hover:text-[#2D7344] hover:bg-green-50 transition-all border border-transparent"
          >
            <Search size={20} strokeWidth={2.2} />
          </button>

          <button className="relative p-2.5 rounded-xl text-gray-500 hover:text-[#2D7344] hover:bg-green-50 transition-all duration-300 border border-transparent hover:border-green-100 focus:outline-none shadow-sm hover:shadow-md">
            <Bell size={20} strokeWidth={2.2} />
            <span className="absolute top-2.5 right-2.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white"></span>
            </span>
          </button>

          <div className="hidden md:block w-px h-8 bg-gradient-to-b from-transparent via-gray-200 to-transparent mx-1"></div>

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
                className={`text-gray-400 transition-transform duration-300 ml-1 ${isProfileOpen ? "rotate-180 text-[#2D7344]" : "rotate-0 group-hover:text-[#2D7344]"}`}
              />
            </div>

            <div
              className={`absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 py-2 z-50 transition-all duration-300 origin-top-right ${isProfileOpen ? "opacity-100 scale-100 translate-y-0 visible" : "opacity-0 scale-95 -translate-y-2 invisible"}`}
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
          <div
            className="absolute inset-0"
            onClick={() => setIsSearchOpen(false)}
          ></div>

          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-200 border border-slate-100 flex flex-col max-h-[80vh]">
            <div className="flex items-center px-4 py-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
              <Search className="text-gray-400 ml-2 shrink-0" size={24} />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleInputKeyDown}
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

            <div className="overflow-y-auto p-4 custom-scrollbar bg-white flex-1">
              {filteredSearchItems.length > 0 ? (
                <div className="space-y-1" ref={resultListRef}>
                  {filteredSearchItems.map((item, index) => {
                    const isActive = index === selectedIndex;

                    return (
                      <button
                        key={item.id}
                        onMouseMove={() => {
                          if (lastInteractionType.current !== "mouse") {
                            lastInteractionType.current = "mouse";
                          }
                          if (selectedIndex !== index) setSelectedIndex(index);
                        }}
                        onClick={() => handleNavigate(item.path)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors text-left group ${
                          isActive ? "bg-[#2D7344]/10" : "hover:bg-[#2D7344]/5"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`p-2.5 rounded-xl transition-all ${isActive ? "bg-white text-[#2D7344] shadow-sm" : "bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-[#2D7344] group-hover:shadow-sm"}`}
                          >
                            {item.icon}
                          </div>
                          <div>
                            <p
                              className={`font-bold text-sm transition-colors ${isActive ? "text-[#2D7344]" : "text-gray-800 group-hover:text-[#2D7344]"}`}
                            >
                              {item.title}
                            </p>
                            <p className="text-xs font-semibold text-gray-400 mt-0.5">
                              {item.category}
                            </p>
                          </div>
                        </div>
                        <ArrowRight
                          size={18}
                          className={`transition-all duration-300 ${isActive ? "text-[#2D7344] translate-x-0 opacity-100" : "text-gray-300 opacity-0 group-hover:opacity-100 group-hover:text-[#2D7344] -translate-x-2 group-hover:translate-x-0"}`}
                        />
                      </button>
                    );
                  })}
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

            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500 font-medium shrink-0">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 bg-white border border-gray-200 rounded shadow-sm flex items-center">
                    ↑↓
                  </span>
                  <span>Navigasi</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 bg-white border border-gray-200 rounded shadow-sm">
                    Enter
                  </span>
                  <span>Pilih</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 bg-white border border-gray-200 rounded shadow-sm">
                    Esc
                  </span>
                  <span>Tutup</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default Header;
