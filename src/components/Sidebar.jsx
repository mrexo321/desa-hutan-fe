import React from "react";
import { Link } from "react-router-dom";

export default function Sidebar({ activeMenu }) {
  // --- DATA MENU HOME ---
  const homeMenus = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />,
    },
    {
      name: "Desa Hutan",
      path: "/desa-hutan",
      icon: <path d="M17.5 19c-2.5 0-4-2-4-2s-1.5 2-4 2-4-2-4-2V5c0 0 1.5 2 4 2s4-2 4-2 1.5 2 4 2 4-2 4-2v12c0 0-1.5 2-4 2z" />,
    },
    {
      name: "Performa Desa Hutan",
      path: "/performa-desa",
      icon: (
        <>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </>
      ),
    },
    {
      name: "Potensi Desa",
      path: "/potensi-desa",
      icon: (
        <>
          <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
          <polyline points="2 17 12 22 22 17"></polyline>
          <polyline points="2 12 12 17 22 12"></polyline>
        </>
      ),
    },
  ];

  // --- DATA MENU METADATA ---
  const metadataMenus = [
    { name: "Indikator", path: "#", icon: <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect> },
    { name: "Indikator Perhitungan", path: "#", icon: <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"></path> },
    { name: "Klasifikasi", path: "#", icon: <rect x="3" y="3" width="7" height="7"></rect> },
    { name: "Wilayah", path: "#", icon: <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"></path> },
    { name: "Manajemen User", path: "#", icon: <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path> },
    { name: "Manajemen Roles", path: "#", icon: <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path> },
    { name: "Master Wilayah", path: "#", icon: <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path> },
    { name: "Master Potensi", path: "#", icon: <circle cx="12" cy="12" r="10"></circle> },
  ];

  return (
    <aside className="w-64 bg-[#FAFAFA] border-r border-gray-200 flex flex-col flex-shrink-0 h-full overflow-y-auto custom-scrollbar">
      <div className="p-6">
        
        {/* Bagian Home */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-400 mb-3 tracking-wider">Home</h3>
          <ul className="space-y-1">
            {homeMenus.map((item, idx) => {
              const isActive = activeMenu === item.name;
              return (
                <li key={idx}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[#2D7344] text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill={isActive ? "currentColor" : "none"}
                      stroke={isActive ? "none" : "currentColor"}
                      strokeWidth={isActive ? "0" : "2"}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {item.icon}
                    </svg>
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Bagian Metadata */}
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-3 tracking-wide">Metadata</h3>
          <ul className="space-y-1">
            {metadataMenus.map((item, idx) => {
              const isActive = activeMenu === item.name;
              return (
                <li key={idx}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[#2D7344] text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill={isActive ? "currentColor" : "none"}
                      stroke={isActive ? "none" : "#2D7344"} 
                      strokeWidth={isActive ? "0" : "2"}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {item.icon}
                    </svg>
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        
      </div>
    </aside>
  );
}