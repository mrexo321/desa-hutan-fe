import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Trees,
  LineChart,
  Sprout,
  Target,
  Calculator,
  Layers,
  Map,
  Users,
  ShieldCheck,
  MapPinned,
  Database,
  ChevronLeft,
  Menu,
  X,
  Leaf,
  LogOut,
} from "lucide-react";

export default function Sidebar({ activeMenu }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  // Ukuran ikon disesuaikan agar proporsional
  const iconProps = { size: 20, strokeWidth: 2 };

  const homeMenus = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard {...iconProps} />,
    },
    {
      name: "Desa Hutan",
      path: "/dashboard/desa-hutan",
      icon: <Trees {...iconProps} />,
    },
    {
      name: "Performa Desa",
      path: "/dashboard/performa-desa",
      icon: <LineChart {...iconProps} />,
    },
    {
      name: "Potensi Desa",
      path: "/dashboard/potensi-desa",
      icon: <Sprout {...iconProps} />,
    },
  ];

  const metadataMenus = [
    {
      name: "Indikator",
      path: "/dashboard/indikator",
      icon: <Target {...iconProps} />,
    },
    {
      name: "Indikator Perhitungan",
      path: "/dashboard/indikator-perhitungan",
      icon: <Calculator {...iconProps} />,
    },
    {
      name: "Klasifikasi",
      path: "/dashboard/klasifikasi",
      icon: <Layers {...iconProps} />,
    },
    {
      name: "Wilayah",
      path: "/dashboard/wilayah",
      icon: <Map {...iconProps} />,
    },
    {
      name: "Manajemen User",
      path: "/dashboard/manajemen-user",
      icon: <Users {...iconProps} />,
    },
    {
      name: "Manajemen Role",
      path: "/dashboard/manajemen-role",
      icon: <ShieldCheck {...iconProps} />,
    },
    {
      name: "Master Wilayah",
      path: "/dashboard/master-wilayah",
      icon: <MapPinned {...iconProps} />,
    },
    {
      name: "Master Potensi",
      path: "/dashboard/master-potensi",
      icon: <Database {...iconProps} />,
    },
  ];

  return (
    <>
      {/* --- TOMBOL HAMBURGER MOBILE (Di area konten terang) --- */}
      <button
        onClick={() => setIsOpenMobile(true)}
        className="md:hidden fixed top-5 left-5 z-40 p-2.5 rounded-xl bg-white/80 backdrop-blur-md border border-gray-100 shadow-sm text-gray-700 hover:bg-gray-50 transition-all"
      >
        <Menu size={20} />
      </button>

      {/* --- OVERLAY MOBILE --- */}
      <div
        className={`md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpenMobile
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpenMobile(false)}
      />

      {/* --- SIDEBAR UTAMA (Dark Forest Theme) --- */}
      <aside
        className={`
          fixed md:relative top-0 left-0 h-screen z-50 flex flex-col flex-shrink-0
          bg-[#0B241A] text-white shadow-[4px_0_24px_rgba(0,0,0,0.05)]
          transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${isOpenMobile ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
          ${isCollapsed ? "md:w-24" : "md:w-[280px]"} w-[280px]
        `}
      >
        {/* --- FLOATING TOGGLE BUTTON (Sesuai Desain: Bulat Hijau) --- */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute -right-3.5 top-10 items-center justify-center w-7 h-7 bg-[#00C47C] text-white shadow-md rounded-full hover:scale-110 transition-all z-50 border-[3px] border-[#F8FAFC]"
        >
          <ChevronLeft
            size={16}
            strokeWidth={3}
            className={`transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}
          />
        </button>

        {/* --- HEADER / LOGO SECTION --- */}
        <div className="flex items-center justify-between h-24 px-6 mb-4">
          <div
            className={`flex items-center gap-4 overflow-hidden ${isCollapsed ? "justify-center w-full" : ""}`}
          >
            <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-[#00C47C] text-white shadow-lg shadow-[#00C47C]/20 flex-shrink-0">
              <Leaf size={24} strokeWidth={2.5} />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col whitespace-nowrap">
                <span className="font-bold text-white text-xl tracking-wide">
                  Desa Hutan
                </span>
                <span className="text-[11px] font-medium text-[#6D9B87] tracking-wider mt-0.5">
                  Management System
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsOpenMobile(false)}
            className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* --- DAFTAR MENU (Scrollable Area) --- */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar-dark space-y-8">
          {/* BAGIAN HOME */}
          <div>
            <div
              className={`px-4 mb-3 transition-all duration-200 ${isCollapsed ? "opacity-0 h-0 overflow-hidden" : "opacity-100"}`}
            >
              <p className="text-[10px] font-bold tracking-[0.2em] text-[#4F7A65] uppercase">
                Menu Utama
              </p>
            </div>
            <ul className="space-y-2">
              {homeMenus.map((item, idx) => {
                const isActive = activeMenu === item.name;
                return (
                  <li key={idx}>
                    <Link
                      to={item.path}
                      title={isCollapsed ? item.name : ""}
                      className={`relative flex items-center ${isCollapsed ? "justify-center px-0" : "px-4"} py-3.5 rounded-2xl transition-all duration-300 group ${
                        isActive
                          ? "bg-[#00C47C] text-white shadow-lg shadow-[#00C47C]/20"
                          : "text-[#7B9E8D] hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div
                        className={`flex-shrink-0 transition-transform duration-200 ${isActive ? "scale-100" : "group-hover:scale-110"}`}
                      >
                        {item.icon}
                      </div>
                      {!isCollapsed && (
                        <span
                          className={`ml-4 text-[15px] tracking-wide ${isActive ? "font-bold" : "font-medium"}`}
                        >
                          {item.name}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* BAGIAN METADATA */}
          <div>
            <div
              className={`px-4 mb-3 transition-all duration-200 ${isCollapsed ? "opacity-0 h-0 overflow-hidden" : "opacity-100"}`}
            >
              <p className="text-[10px] font-bold tracking-[0.2em] text-[#4F7A65] uppercase">
                Pengaturan Data
              </p>
            </div>
            <ul className="space-y-2">
              {metadataMenus.map((item, idx) => {
                const isActive = activeMenu === item.name;
                return (
                  <li key={idx}>
                    <Link
                      to={item.path}
                      title={isCollapsed ? item.name : ""}
                      className={`relative flex items-center ${isCollapsed ? "justify-center px-0" : "px-4"} py-3.5 rounded-2xl transition-all duration-300 group ${
                        isActive
                          ? "bg-[#00C47C] text-white shadow-lg shadow-[#00C47C]/20"
                          : "text-[#7B9E8D] hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div
                        className={`flex-shrink-0 transition-transform duration-200 ${isActive ? "scale-100" : "group-hover:scale-110"}`}
                      >
                        {item.icon}
                      </div>
                      {!isCollapsed && (
                        <span
                          className={`ml-4 text-[15px] tracking-wide ${isActive ? "font-bold" : "font-medium"}`}
                        >
                          {item.name}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* --- FOOTER SIDEBAR (Tombol Keluar) --- */}
        <div className="p-4 mt-auto border-t border-white/5">
          <button
            title={isCollapsed ? "Keluar" : ""}
            className={`w-full flex items-center ${isCollapsed ? "justify-center px-0" : "px-4"} py-3.5 rounded-2xl text-[#7B9E8D] hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 group`}
          >
            <div className="flex-shrink-0 transition-transform duration-200 group-hover:-translate-x-1">
              <LogOut size={20} strokeWidth={2} />
            </div>
            {!isCollapsed && (
              <span className="ml-4 text-[15px] tracking-wide font-medium">
                Keluar
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* --- INLINE STYLE UNTUK SCROLLBAR GELAP --- */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar-dark::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar-dark::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb {
          background: #2A493A;
          border-radius: 10px;
        }
        .custom-scrollbar-dark:hover::-webkit-scrollbar-thumb {
          background: #3B5E4D;
        }
      `,
        }}
      />
    </>
  );
}
