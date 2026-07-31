import React from "react";
import { Link } from "react-router-dom";
import { TreePine, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#0A2914] text-emerald-100 font-sans border-t border-emerald-950 shadow-2xl relative overflow-hidden">
      {/* Decorative Blur Blob */}
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-16 grid grid-cols-1 md:grid-cols-12 gap-10 relative z-10">

        {/* Column 1: Brand Info */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <Link to="/" className="flex items-center gap-3 w-fit group">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30 text-emerald-400 group-hover:scale-105 transition-transform">
              <TreePine size={20} />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm md:text-base leading-tight tracking-tight uppercase text-white">
                Desa Hutan
              </span>
              <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-widest leading-none mt-0.5">
                Kementerian Kehutanan
              </span>
            </div>
          </Link>

          <p className="text-xs md:text-sm text-emerald-200/70 leading-relaxed font-medium max-w-sm mt-2">
            Platform pemetaan terpadu spasial dan infografis potensi pengembangan sosial ekonomi masyarakat di sekitar kawasan hutan Indonesia.
          </p>
        </div>

        {/* Column 2: Navigation Links */}
        <div className="md:col-span-3 flex flex-col gap-3">
          <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-2 border-b border-emerald-800/40 pb-2">
            Navigasi Situs
          </h4>
          <nav className="flex flex-col gap-2.5 text-xs md:text-sm font-semibold">
            <Link to="/" className="hover:text-amber-400 transition-colors w-fit">Beranda</Link>
            <Link to="/map" className="hover:text-amber-400 transition-colors w-fit">Peta Spasial</Link>
            <Link to="/infografis" className="hover:text-amber-400 transition-colors w-fit">Infografis Potensi</Link>
            <Link to="/data-desa" className="hover:text-amber-400 transition-colors w-fit">Data Desa</Link>
            <Link to="/about-us" className="hover:text-amber-400 transition-colors w-fit">Tentang Kami</Link>
          </nav>
        </div>

        {/* Column 3: Contact & Support */}
        <div className="md:col-span-4 flex flex-col gap-3">
          <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-2 border-b border-emerald-800/40 pb-2">
            Kontak Layanan
          </h4>
          <div className="flex flex-col gap-3.5 text-xs md:text-sm font-semibold text-emerald-200/80">
            <a href="mailto:p2semh@gmail.com" className="flex items-center gap-2.5 hover:text-white transition-colors">
              <Mail size={16} className="text-emerald-400 shrink-0" />
              <span>p2semh@gmail.com</span>
            </a>
            <div className="flex items-start gap-2.5">
              <MapPin size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">RT.02/RW.03, Pasir Jaya, Bogor Barat, Kota Bogor, Jawa Barat 16119</span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Footer Section */}
      <div className="border-t border-emerald-950 bg-[#071F0E] py-6 px-6 md:px-8 text-center text-xs text-emerald-200/50 tracking-wider">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-medium">
            © {new Date().getFullYear()} Direktorat Pusat Pengembangan Sosial Ekonomi Masyarakat Hutan.
          </p>
          <div className="flex gap-4 font-bold">
            <a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a>
            <span>•</span>
            <a href="#" className="hover:text-white transition-colors">Syarat Ketentuan</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
