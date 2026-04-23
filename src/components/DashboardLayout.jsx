import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useBackgroundRefresh } from "../hooks/useBakgroundRefresh";

export default function DashboardLayout({ children, activeMenu }) {
  useBackgroundRefresh();
  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden">
      {/* Sidebar */}
      <Sidebar activeMenu={activeMenu} />

      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Header */}
        <Header />

        {/* Area Konten Utama - Di sinilah halaman di-render */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
