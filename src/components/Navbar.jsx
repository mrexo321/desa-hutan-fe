import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const API_BASE = "https://api-simpeg.uika-bogor.ac.id/desa/v1";

const Navbar = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  const [siteLogo, setSiteLogo] = useState(null);
  const [siteName, setSiteName] = useState("Desa Hutan");

  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const res = await fetch(`${API_BASE}/site-settings/category/general`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const logoItem = json.data.find((d) => d.key === "site_logo");
          const nameItem = json.data.find((d) => d.key === "site_name");
          if (logoItem?.image_url) setSiteLogo(logoItem.image_url);
          if (nameItem?.value) setSiteName(nameItem.value);
        }
      } catch (err) {
        console.error("Gagal memuat site settings:", err);
      }
    };
    fetchSiteSettings();
  }, []);

  return (
    <header
      className={`z-50 w-full text-white transition-all duration-300 ${isHome
        ? "absolute top-0 left-0 bg-transparent"
        : "relative bg-[#0B8457]"
        }`}
    >
      <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
        {/* Logo & Site Name */}
        <Link to="/" className="flex items-center gap-3 cursor-pointer">
          {siteLogo ? (
            <img
              src={siteLogo}
              alt={siteName}
              className="w-10 h-10 object-contain rounded-full bg-white/10"
            />
          ) : (
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold">Logo</span>
            </div>
          )}
          <span className="font-semibold text-sm leading-tight hidden sm:block max-w-[180px]">
            {siteName}
          </span>
        </Link>

        <nav className="hidden md:flex gap-8 text-sm font-medium">
          <Link
            to="/"
            className={`pb-1 transition-colors ${location.pathname === "/"
              ? "text-yellow-400 border-b border-yellow-400"
              : "hover:text-yellow-300"
              }`}
          >
            Beranda
          </Link>
          <Link to="/map" className="hover:text-yellow-300 transition-colors">
            Peta
          </Link>
          <Link
            to="/infografis"
            className={`pb-1 transition-colors ${location.pathname === "/infografis"
              ? "text-yellow-400 border-b border-yellow-400"
              : "hover:text-yellow-300"
              }`}
          >
            Infografis
          </Link>
          <Link to="/data-desa" className="hover:text-yellow-300 transition-colors">
            Data Desa
          </Link>
          <Link
            to="/about-us"
            className={`hover:text-yellow-300 transition-colors ${location.pathname === "/about-us"
              ? "text-yellow-400 border-b border-yellow-400"
              : "hover:text-yellow-300"
              }`}
          >
            Tentang Kami
          </Link>
          <Link
            to="/login"
            className={`hover:text-yellow-300 transition-colors ${location.pathname === "/login"
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
