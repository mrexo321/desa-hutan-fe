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
} from "lucide-react";

export default function Sidebar({ activeMenu }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  // Ukuran dan ketebalan ikon diseragamkan agar lebih elegan
  const iconProps = { size: 20, strokeWidth: 1.75 };

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
      {/* --- TOMBOL HAMBURGER MOBILE --- */}
      <button
        onClick={() => setIsOpenMobile(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2.5 rounded-xl bg-white/80 backdrop-blur-md border border-gray-100 shadow-sm text-gray-700 hover:bg-gray-50 transition-all"
      >
        <Menu size={20} />
      </button>

      {/* --- OVERLAY MOBILE DENGAN EFEK BLUR --- */}
      <div
        className={`md:hidden fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpenMobile
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpenMobile(false)}
      />

      {/* --- SIDEBAR UTAMA --- */}
      <aside
        className={`
          fixed md:relative top-0 left-0 h-screen z-50 flex flex-col flex-shrink-0
          bg-white md:bg-[#FCFDFD] border-r border-gray-100 shadow-[4px_0_24px_rgba(0,0,0,0.02)]
          transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${isOpenMobile ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
          ${isCollapsed ? "md:w-20" : "md:w-[260px]"} w-[260px]
        `}
      >
        {/* --- FLOATING TOGGLE BUTTON (DESKTOP) --- */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute -right-3.5 top-8 items-center justify-center w-7 h-7 bg-white border border-gray-200 shadow-sm rounded-full text-gray-400 hover:text-[#2D7344] hover:scale-110 transition-all z-50"
        >
          <ChevronLeft
            size={16}
            className={`transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}
          />
        </button>

        {/* --- HEADER / LOGO SECTION --- */}
        <div className="flex items-center justify-between h-20 px-5 mb-2">
          <div
            className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? "justify-center w-full" : ""}`}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#2D7344] to-[#1e5230] text-white shadow-md flex-shrink-0">
              <Leaf size={22} strokeWidth={2} />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col whitespace-nowrap">
                <span className="font-bold text-gray-800 text-lg leading-tight tracking-wide">
                  Desa Hutan
                </span>
                <span className="text-[10px] font-semibold text-[#2D7344] uppercase tracking-widest">
                  Kemenhut RI
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsOpenMobile(false)}
            className="md:hidden p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* --- DAFTAR MENU DENGAN SCROLLBAR DISEMBUNYIKAN --- */}
        {/* Tambahkan class 'scrollbar-hide' di file CSS Anda jika perlu, atau gunakan styling inline ini */}
        <div
          className="flex-1 overflow-y-auto px-3 pb-8 space-y-8"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {/* BAGIAN HOME */}
          <div>
            <div
              className={`px-3 mb-3 transition-all duration-200 ${isCollapsed ? "opacity-0 h-0 overflow-hidden" : "opacity-100"}`}
            >
              <p className="text-[11px] font-bold tracking-[0.15em] text-gray-400 uppercase">
                Home
              </p>
            </div>
            <ul className="space-y-1.5">
              {homeMenus.map((item, idx) => {
                const isActive = activeMenu === item.name;
                return (
                  <li key={idx}>
                    <Link
                      to={item.path}
                      title={isCollapsed ? item.name : ""}
                      className={`relative flex items-center gap-3.5 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                        isActive
                          ? "bg-[#F3FBF5] text-[#2D7344]"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      {/* Garis Indikator Aktif (Kiri) */}
                      {isActive && !isCollapsed && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#2D7344] rounded-r-full" />
                      )}

                      <div
                        className={`flex-shrink-0 transition-transform duration-200 ${isActive ? "scale-100" : "group-hover:scale-110"}`}
                      >
                        {item.icon}
                      </div>

                      {!isCollapsed && (
                        <span
                          className={`text-sm tracking-wide ${isActive ? "font-semibold" : "font-medium"}`}
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
              className={`px-3 mb-3 transition-all duration-200 ${isCollapsed ? "opacity-0 h-0 overflow-hidden" : "opacity-100"}`}
            >
              <p className="text-[11px] font-bold tracking-[0.15em] text-gray-400 uppercase">
                Metadata
              </p>
            </div>
            <ul className="space-y-1.5">
              {metadataMenus.map((item, idx) => {
                const isActive = activeMenu === item.name;
                return (
                  <li key={idx}>
                    <Link
                      to={item.path}
                      title={isCollapsed ? item.name : ""}
                      className={`relative flex items-center gap-3.5 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                        isActive
                          ? "bg-[#F3FBF5] text-[#2D7344]"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      {/* Garis Indikator Aktif (Kiri) */}
                      {isActive && !isCollapsed && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#2D7344] rounded-r-full" />
                      )}

                      <div
                        className={`flex-shrink-0 transition-transform duration-200 ${isActive ? "scale-100" : "group-hover:scale-110"}`}
                      >
                        {item.icon}
                      </div>

                      {!isCollapsed && (
                        <span
                          className={`text-sm tracking-wide ${isActive ? "font-semibold" : "font-medium"}`}
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
      </aside>
    </>
  );
}
