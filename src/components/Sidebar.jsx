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
} from "lucide-react";

export default function Sidebar({ activeMenu }) {
  // --- STATE UNTUK TOGGLE SIDEBAR ---
  const [isCollapsed, setIsCollapsed] = useState(false); // Untuk desktop
  const [isOpenMobile, setIsOpenMobile] = useState(false); // Untuk mobile

  // --- DATA MENU HOME ---
  const homeMenus = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={18} />,
    },
    {
      name: "Desa Hutan",
      path: "/desa-hutan",
      icon: <Trees size={18} />, // Ikon pepohonan untuk hutan
    },
    {
      name: "Performa Desa Hutan",
      path: "/performa-desa",
      icon: <LineChart size={18} />, // Ikon grafik naik untuk performa
    },
    {
      name: "Potensi Desa",
      path: "/potensi-desa",
      icon: <Sprout size={18} />, // Ikon tunas tanaman untuk potensi yang berkembang
    },
  ];

  // --- DATA MENU METADATA ---
  const metadataMenus = [
    {
      name: "Indikator",
      path: "#",
      icon: <Target size={18} />, // Ikon target/sasaran untuk indikator
    },
    {
      name: "Indikator Perhitungan",
      path: "#",
      icon: <Calculator size={18} />, // Ikon kalkulator untuk perhitungan
    },
    {
      name: "Klasifikasi",
      path: "#",
      icon: <Layers size={18} />, // Ikon tumpukan layer untuk klasifikasi
    },
    {
      name: "Wilayah",
      path: "#",
      icon: <Map size={18} />, // Ikon peta dasar
    },
    {
      name: "Manajemen User",
      path: "#",
      icon: <Users size={18} />, // Ikon multi-user
    },
    {
      name: "Manajemen Roles",
      path: "#",
      icon: <ShieldCheck size={18} />, // Ikon perisai keamanan untuk otorisasi/role
    },
    {
      name: "Master Wilayah",
      path: "#",
      icon: <MapPinned size={18} />, // Ikon peta dengan pin untuk data master spasial
    },
    {
      name: "Master Potensi",
      path: "#",
      icon: <Database size={18} />, // Ikon database untuk data master
    },
  ];

  return (
    <>
      {/* --- TOMBOL HAMBURGER (Hanya tampil di Mobile) --- */}
      {/* Letaknya fixed agar selalu bisa diklik */}
      <button
        onClick={() => setIsOpenMobile(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-md bg-white shadow-md text-gray-700 hover:bg-gray-100 focus:outline-none"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      {/* --- OVERLAY GELAP (Hanya tampil di Mobile saat sidebar terbuka) --- */}
      {isOpenMobile && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* --- SIDEBAR UTAMA --- */}
      <aside
        className={`
          fixed md:relative top-0 left-0 h-full z-50 flex flex-col flex-shrink-0
          bg-[#FAFAFA] border-r border-gray-200 shadow-xl md:shadow-none
          transition-all duration-300 ease-in-out
          ${isOpenMobile ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
          ${isCollapsed ? "md:w-20" : "md:w-64"} w-64
        `}
      >
        {/* Header / Tombol Toggle */}
        <div
          className={`flex items-center p-4 border-b border-gray-100 ${isCollapsed ? "md:justify-center justify-between" : "justify-between"}`}
        >
          {/* Judul Aplikasi (Sembunyikan saat collapsed di desktop) */}
          <span
            className={`font-bold text-[#2D7344] text-lg ${isCollapsed ? "hidden md:hidden" : "block"}`}
          >
            LOGO DISINI
          </span>

          {/* Tombol Close untuk Mobile */}
          <button
            onClick={() => setIsOpenMobile(false)}
            className="md:hidden p-1 text-gray-500 hover:text-gray-800 focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          {/* Tombol Expand/Collapse untuk Desktop */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-1 text-gray-400 hover:text-gray-700 focus:outline-none rounded-md hover:bg-gray-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transform transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
        </div>

        {/* Daftar Menu */}
        <div className="p-4 overflow-y-auto custom-scrollbar flex-grow">
          {/* --- Bagian Home --- */}
          <div className="mb-6">
            {!isCollapsed ? (
              <h3 className="text-xs font-bold text-gray-400 mb-3 tracking-wider px-2">
                Home
              </h3>
            ) : (
              <div className="h-px bg-gray-200 my-4 mx-2"></div>
            )}
            <ul className="space-y-1">
              {homeMenus.map((item, idx) => {
                const isActive = activeMenu === item.name;
                return (
                  <li key={idx}>
                    <Link
                      to={item.path}
                      title={item.name} // Tooltip bawaan browser untuk mode collapse
                      className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"} px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-[#2D7344] text-white shadow-sm"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <div
                        className={`flex-shrink-0 ${isActive ? "text-white" : "text-[#2D7344]"}`}
                      >
                        {item.icon}
                      </div>
                      {/* Teks sembunyi saat mode collapsed di desktop */}
                      <span
                        className={`truncate ${isCollapsed ? "hidden md:hidden" : "block"}`}
                      >
                        {item.name}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* --- Bagian Metadata --- */}
          <div>
            {!isCollapsed ? (
              <h3 className="text-xs font-bold text-gray-700 mb-3 tracking-wide px-2">
                Metadata
              </h3>
            ) : (
              <div className="h-px bg-gray-200 my-4 mx-2"></div>
            )}
            <ul className="space-y-1">
              {metadataMenus.map((item, idx) => {
                const isActive = activeMenu === item.name;
                return (
                  <li key={idx}>
                    <Link
                      to={item.path}
                      title={item.name}
                      className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"} px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-[#2D7344] text-white shadow-sm"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="flex-shrink-0"
                        fill={isActive ? "currentColor" : "none"}
                        stroke={isActive ? "none" : "#2D7344"}
                        strokeWidth={isActive ? "0" : "2"}
                      >
                        {item.icon}
                      </svg>
                      <span
                        className={`truncate ${isCollapsed ? "hidden md:hidden" : "block"}`}
                      >
                        {item.name}
                      </span>
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
