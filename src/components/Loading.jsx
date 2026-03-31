import React from "react";
import { TreePine } from "lucide-react";

export const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 w-full">
      {/* Wrapper Animasi Spinner & Icon */}
      <div className="relative w-14 h-14 flex items-center justify-center mb-4">
        {/* Lingkaran background statis */}
        <div className="absolute inset-0 rounded-full border-4 border-green-50/50"></div>
        {/* Lingkaran hijau berputar */}
        <div className="absolute inset-0 rounded-full border-4 border-[#2D7344] border-t-transparent animate-spin"></div>
        {/* Ikon di tengah */}
        <TreePine size={20} className="text-[#2D7344] animate-pulse" />
      </div>

      {/* Teks Loading */}
      <h3 className="text-sm font-bold text-gray-700 mb-1 tracking-tight">
        Menyiapkan Data
      </h3>
      <p className="text-xs text-gray-500 font-medium">
        Mohon tunggu sebentar...
      </p>
    </div>
  );
};
