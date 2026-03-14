import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function DashboardLayout({ children, activeMenu }) {
  return (
    <div className="flex h-screen bg-[#F5F6F8] font-sans overflow-hidden">
      
      {/* 1. Pasang Sidebar dan oper parameter activeMenu */}
      <Sidebar activeMenu={activeMenu} />

      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        
        {/* 2. Pasang Header di atas */}
        <Header />

        {/* 3. Tempat memunculkan halaman (Desa Hutan / Performa Desa) */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
          {children}
        </div>
        
      </main>
    </div>
  );
}