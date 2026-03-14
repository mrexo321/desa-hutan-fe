import React from "react";

export default function Header() {
  return (
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
  );
}