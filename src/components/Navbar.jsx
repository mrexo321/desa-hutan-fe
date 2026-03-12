import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  // 1. Ambil informasi rute saat ini
  const location = useLocation();

  // 2. Cek apakah pengguna sedang berada di Homepage ("/")
  const isHome = location.pathname === "/";

  return (
    <header
      // 3. Logika pergantian class:
      // Jika di Home: absolute (mengambang) dan transparan
      // Jika di halaman lain: relative (normal) dan background hijau
      className={`z-50 w-full text-white transition-all duration-300 ${
        isHome
          ? "absolute top-0 left-0 bg-transparent"
          : "relative bg-[#0B8457]" // Menggunakan warna hijau sesuai desainmu
      }`}
    >
      <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer">
          {/* Tempat Logo */}
          <Link
            to="/"
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
          >
            <span className="text-xs font-bold">Logo</span>
          </Link>
        </div>

        <nav className="hidden md:flex gap-8 text-sm font-medium">
          <Link
            to="/"
            className={`pb-1 transition-colors ${
              location.pathname === "/"
                ? "text-yellow-400 border-b border-yellow-400"
                : "hover:text-yellow-300"
            }`}
          >
            Beranda
          </Link>
          <Link to="#" className="hover:text-yellow-300 transition-colors">
            Peta
          </Link>
          <Link
            to="/infografis"
            className={`pb-1 transition-colors ${
              location.pathname === "/infografis"
                ? "text-yellow-400 border-b border-yellow-400"
                : "hover:text-yellow-300"
            }`}
          >
            Infografis
          </Link>
          <Link to="#" className="hover:text-yellow-300 transition-colors">
            Data Desa
          </Link>
          <Link
            to="/about-us"
            className={`hover:text-yellow-300 transition-colors ${
              location.pathname === "/about-us"
                ? "text-yellow-400 border-b border-yellow-400"
                : "hover:text-yellow-300"
            }`}
          >
            Tentang Kami
          </Link>
          <Link
            to="/login"
            className={`hover:text-yellow-300 transition-colors ${
              location.pathname === "/login"
                ? "text-yellow-400 border-b border-yellow-400"
                : "hover:text-yellow-300"
            }`}
          >
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
