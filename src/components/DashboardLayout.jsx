import React from "react";

export default function DashboardLayout({ children, activeMenu }) {
  // --- DATA MENU HOME ---
  const homeMenus = [
    {
      name: "Dashboard",
      icon: <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />,
    },
    {
      name: "Desa Hutan",
      icon: <path d="M17.5 19c-2.5 0-4-2-4-2s-1.5 2-4 2-4-2-4-2V5c0 0 1.5 2 4 2s4-2 4-2 1.5 2 4 2 4-2 4-2v12c0 0-1.5 2-4 2z" />,
    },
    {
      name: "Performa Desa Hutan",
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
    { name: "Indikator", icon: <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect> },
    { name: "Indikator Perhitungan", icon: <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"></path> },
    { name: "Klasifikasi", icon: <rect x="3" y="3" width="7" height="7"></rect> },
    { name: "Wilayah", icon: <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"></path> },
    { name: "Manajemen User", icon: <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path> },
    { name: "Manajemen Roles", icon: <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path> },
    { name: "Master Wilayah", icon: <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path> },
    { name: "Master Potensi", icon: <circle cx="12" cy="12" r="10"></circle> },
  ];

  return (
    <div className="flex h-screen bg-[#F5F6F8] font-sans overflow-hidden">
      
      {/* ================= SIDEBAR ================= */}
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
                    <a
                      href="#"
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
                    </a>
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
                    <a
                      href="#"
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
                        // Jika aktif, stroke hilang. Jika tidak aktif, gunakan warna hijau gelap sesuai desain awal
                        stroke={isActive ? "none" : "#2D7344"} 
                        strokeWidth={isActive ? "0" : "2"}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        {item.icon}
                      </svg>
                      {item.name}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
          
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        
        {/* HEADER */}
        <header className="flex justify-end items-center px-8 py-4 bg-[#F5F6F8]">
          <div className="flex items-center gap-3 bg-white p-2 pr-6 rounded-full shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-full bg-pink-200 overflow-hidden flex items-center justify-center border-2 border-white shadow-sm">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Maulana"
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800 leading-tight">Maulana Ikhsan</p>
              <p className="text-[11px] text-gray-500">maulanaikhsan5311@gmail.com</p>
            </div>
          </div>
        </header>

        {/* INJECT KONTEN HALAMAN DI SINI (seperti form, tabel, peta, dll) */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
          {children}
        </div>
        
      </main>
    </div>
  );
}