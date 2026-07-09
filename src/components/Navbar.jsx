import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, TreePine } from "lucide-react";

const API_BASE = "https://api-simpeg.uika-bogor.ac.id/desa/v1";

const Navbar = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  const [siteLogo, setSiteLogo] = useState(null);
  const [siteName, setSiteName] = useState("Desa Hutan");
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: "Beranda", path: "/" },
    { name: "Peta", path: "/map" },
    { name: "Infografis", path: "/infografis" },
    { name: "Data Desa", path: "/data-desa" },
    { name: "Tentang Kami", path: "/about-us" },
  ];

  return (
    <header
      className={`w-full text-white transition-all duration-300 z-50 ${
        isHome
          ? scrolled
            ? "fixed top-0 left-0 bg-[#0F381F]/90 backdrop-blur-md shadow-lg border-b border-emerald-800/20 py-4"
            : "absolute top-0 left-0 bg-transparent py-6"
          : "relative bg-[#0F381F] py-4 shadow-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-8 flex justify-between items-center">
        {/* Logo & Site Name */}
        <Link to="/" className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            {siteLogo ? (
              <img
                src={siteLogo}
                alt={siteName}
                className="w-10 h-10 object-contain rounded-xl bg-white/10 p-0.5 border border-white/20 group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30 text-emerald-400 group-hover:scale-105 transition-transform">
                <TreePine size={20} />
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-sm md:text-base leading-tight tracking-tight uppercase bg-gradient-to-r from-emerald-100 to-white bg-clip-text text-transparent group-hover:text-emerald-300 transition-colors">
              {siteName}
            </span>
            <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-widest leading-none mt-0.5">
              Kementerian Kehutanan
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 hover:bg-white/10 ${
                  isActive
                    ? "text-[#E6B93B] bg-white/5"
                    : "text-emerald-100 hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          
          <Link
            to="/login"
            className="ml-4 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-[#10B981] hover:from-emerald-600 hover:to-emerald-500 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-950/20 active:scale-[0.98]"
          >
            Sign In
          </Link>
        </nav>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-emerald-100 hover:text-white focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#0F381F]/95 backdrop-blur-lg border-b border-emerald-800/35 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col p-6 gap-3">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-3 rounded-xl text-base font-bold transition-colors ${
                    isActive
                      ? "text-[#E6B93B] bg-emerald-950/40"
                      : "text-emerald-100 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            <hr className="border-emerald-800/40 my-2" />
            <Link
              to="/login"
              className="w-full text-center py-3.5 bg-gradient-to-r from-emerald-500 to-[#10B981] text-white font-bold rounded-xl text-base shadow-lg transition-transform active:scale-95"
            >
              Sign In
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
