import React from "react";
import { Loader2 } from "lucide-react";
import { useBackgroundRefresh } from "../hooks/useBakgroundRefresh";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function DashboardLayout({ children, activeMenu, noScroll = false, noPadding = false }) {
  // Background token refresh: setiap 15 menit + setiap pindah halaman
  const { isRecovering } = useBackgroundRefresh();

  // Tunda render konten (yang fetch data) sampai accessToken selesai
  // direcovery dari refreshToken — cegah request API 401 dini.
  if (isRecovering) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="animate-spin text-[#2D7344]" size={32} />
      </div>
    );
  }

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
