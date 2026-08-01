import React from "react";
import { useBackgroundRefresh } from "../hooks/useBakgroundRefresh";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function DashboardLayout({ children, activeMenu, noScroll = false, noPadding = false }) {
  // Background token refresh: setiap 15 menit + setiap pindah halaman
  useBackgroundRefresh();

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden">
      {/* Sidebar */}
      <Sidebar activeMenu={activeMenu} />

      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Header */}
        <Header />

        {/* Area Konten Utama */}
        <main
          className={`flex-1 ${
            noScroll
              ? "overflow-hidden flex flex-col min-h-0"
              : "overflow-y-auto p-6 md:p-8 custom-scrollbar"
          } ${noPadding ? "!p-0" : ""}`}
        >
          <div className={`${noScroll ? "h-full flex flex-col min-h-0 w-full" : "max-w-[1600px] mx-auto"}`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
