import React from "react";
import HomeLayout from "../../components/HomeLayout";
import { useQuery } from "@tanstack/react-query";
import { siteSettingService } from "../../services/auth/siteSettingService";
import {
  Compass,
  BarChart3,
  Database,
  Loader2,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Share2,
  Instagram,
  Youtube,
  Globe,
  Map,
  ShieldCheck,
  TrendingUp,
  Award,
  ExternalLink
} from "lucide-react";

import { Link } from "react-router-dom";
import defaultHeroBg from '../../../public/HeroBackground.png';

// ─────────────────────────────────────────
// HELPER: HighlightedText with premium typography
// ─────────────────────────────────────────
const HighlightedText = ({ text = "", highlight = "" }) => {
  if (!highlight || !text.includes(highlight)) {
    return <p className="text-slate-600 mb-12 text-base md:text-lg leading-relaxed text-justify md:text-left font-medium">{text}</p>;
  }
  const [before, after] = text.split(highlight);
  return (
    <p className="text-slate-600 mb-12 text-base md:text-lg leading-relaxed text-justify md:text-left font-medium">
      {before}
      <span className="text-emerald-700 font-bold border-b-2 border-emerald-500/25 pb-0.5">{highlight}</span>
      {after}
    </p>
  );
};

// ─────────────────────────────────────────
// HELPER: One premium feature card
// ─────────────────────────────────────────
const FeatureCard = ({ title, description, iconName }) => {
  const renderIcon = () => {
    const props = { className: "text-emerald-600 transition-transform group-hover:scale-110 duration-300", size: 28 };
    if (iconName === "compass" || iconName === "map") return <Map {...props} />;
    if (iconName === "bar-chart" || iconName === "bar-chart-2") return <BarChart3 {...props} />;
    return <Database {...props} />;
  };

  return (
    <div className="group bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(16,185,129,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col sm:flex-row gap-5 items-start">
      <div className="flex-shrink-0 w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300 shadow-sm border border-emerald-100/50">
        {renderIcon()}
      </div>
      <div>
        <h3 className="font-extrabold text-slate-800 text-base tracking-wide mb-2 uppercase font-sans">
          {title}
        </h3>
        <p className="text-slate-500 text-sm leading-relaxed font-medium">{description}</p>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────
const Homepage = () => {
  const staleTime = 5 * 60 * 1000;

  const { data: heroArr = [], isLoading: heroLoading } = useQuery({
    queryKey: ["siteSettings", "hero"],
    queryFn: () => siteSettingService.getByCategory("hero"),
    staleTime,
  });

  const { data: profilArr = [], isLoading: profilLoading } = useQuery({
    queryKey: ["siteSettings", "profil_desa_hutan"],
    queryFn: () => siteSettingService.getByCategory("profil_desa_hutan"),
    staleTime,
  });

  const { data: featuresArr = [], isLoading: featuresLoading } = useQuery({
    queryKey: ["siteSettings", "features"],
    queryFn: () => siteSettingService.getByCategory("features"),
    staleTime,
  });

  const { data: generalArr = [], isLoading: generalLoading } = useQuery({
    queryKey: ["siteSettings", "general"],
    queryFn: () => siteSettingService.getByCategory("general"),
    staleTime,
  });

  const hero = siteSettingService.toMap(heroArr);
  const profil = siteSettingService.toMap(profilArr);
  const features = siteSettingService.toMap(featuresArr);
  const general = siteSettingService.toMap(generalArr);

  const logoSrc = profil.section_logo_image || general.site_logo || null;
  const isLoading = heroLoading || profilLoading || featuresLoading || generalLoading;

  const heroBg = hero.hero_background_image
    ? `url('${hero.hero_background_image}')`
    : `url(${defaultHeroBg})`;

  return (
    <HomeLayout transparent={true}>
      {/* Custom Keyframes for Animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-delay-1 {
          animation-delay: 0.15s;
        }
        .animate-delay-2 {
          animation-delay: 0.3s;
        }
      `}</style>

      <div className="font-sans text-slate-800 antialiased overflow-x-hidden bg-slate-50/30">

        {/* ─────────────────────────────────────────── */}
        {/* 1. HERO SECTION                             */}
        {/* ─────────────────────────────────────────── */}
        <section
          id="hero-section"
          className="relative min-h-[90vh] md:min-h-screen bg-cover bg-center flex flex-col justify-center overflow-hidden"
          style={{ backgroundImage: heroBg }}
        >
          {/* Rich Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#051C0E]/95 via-[#0D381D]/80 to-[#10B981]/25"></div>

          {/* Glowing Ambient Light */}
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full pt-20 pb-16">
            <div className="max-w-4xl text-left">
              {isLoading ? (
                <div className="flex items-center gap-3 text-emerald-200">
                  <Loader2 size={24} className="animate-spin text-emerald-400" />
                  <span className="font-semibold tracking-wide">Memuat konten beranda...</span>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/15 border border-emerald-400/30 rounded-full text-emerald-200 text-xs font-bold uppercase tracking-widest leading-none animate-fade-in-up">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                    Kementerian Kehutanan RI
                  </div>

                  {/* Headline */}
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-light text-white leading-[1.25] tracking-tight mb-4 animate-fade-in-up animate-delay-1">
                    {hero.hero_headline_normal || "Demi mewujudkan kemandirian desa melalui pemetaan untuk"}
                    <br className="hidden sm:inline" />
                    <span className="font-black bg-gradient-to-r from-emerald-200 to-emerald-400 bg-clip-text text-transparent">
                      {hero.hero_headline_bold || "perkembangan ekonomi dan pemberdayaan masyarakat"}
                    </span>
                  </h1>

                  {/* Subheadline */}
                  <p className="text-emerald-100/90 text-base sm:text-lg md:text-xl max-w-3xl leading-relaxed font-medium tracking-wide mb-8 animate-fade-in-up animate-delay-2">
                    {hero.hero_subheadline ||
                      "Sistem Informasi Pemetaan Profil Desa Hutan Untuk Identifikasi Potensi Ekonomi dan Pemberdayaan Masyarakat Desa secara Spasial."}
                  </p>

                  {/* CTA Buttons */}
                  <div className="flex flex-wrap gap-4 pt-2 animate-fade-in-up animate-delay-2">
                    <Link
                      to="/map"
                      className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-[#10B981] hover:from-emerald-600 hover:to-emerald-500 text-white font-extrabold rounded-2xl text-sm transition-all shadow-lg shadow-emerald-950/40 hover:shadow-emerald-950/60 flex items-center gap-2 group active:scale-[0.98]"
                    >
                      Eksplorasi Peta Spasial
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                      to="/data-desa"
                      className="px-8 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 text-white font-extrabold rounded-2xl text-sm transition-all backdrop-blur-sm active:scale-[0.98]"
                    >
                      Permintaan Data Desa
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────── */}
        {/* 2. PROFIL DESA HUTAN SECTION               */}
        {/* ─────────────────────────────────────────── */}
        <section id="profil-section" className="py-24 max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 border border-emerald-100 px-3.5 py-1.5 rounded-full inline-block mb-3">
              Profil Kawasan
            </span>
            <h2 className="text-2xl md:text-4xl font-extrabold text-slate-800 tracking-tight leading-tight mb-4 uppercase">
              {profil.section_title || "PROFIL DESA HUTAN"}
            </h2>
            <div className="w-16 h-1.5 bg-emerald-600 rounded-full mb-6"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left: Highlight Text & Features List */}
            <div className="lg:col-span-7 flex flex-col">
              <HighlightedText
                text={profil.section_description || "Desa Hutan merupakan garda terdepan pelestarian sumber daya alam tapak nasional..."}
                highlight={profil.section_description_highlight || "kemandirian ekonomi lokal"}
              />

              <div className="space-y-6">
                <FeatureCard
                  title={features.feature_peta_title || "PETA INTERAKTIF"}
                  description={features.feature_peta_description || "Visualisasi sebaran koordinat desa, batas wilayah spasial, dan overlay tutupan hutan."}
                  iconName={features.feature_peta_icon || "compass"}
                />
                <FeatureCard
                  title={features.feature_infografis_title || "INFOGRAFIS POTENSI"}
                  description={features.feature_infografis_description || "Penyajian bagan statistik, diagram perkembangan status kemandirian, dan grafik komoditas utama."}
                  iconName={features.feature_infografis_icon || "bar-chart"}
                />
                <FeatureCard
                  title={features.feature_data_desa_title || "DATA DESA TEREKAP"}
                  description={features.feature_data_desa_description || "Tabel informasi komprehensif indikator performa pembangunan desa hutan yang terstruktur."}
                  iconName={features.feature_data_desa_icon || "table"}
                />
              </div>
            </div>

            {/* Right: Premium Image Showcase */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative group">
                {/* Background decorative blobs */}
                <div className="absolute -inset-2 bg-gradient-to-tr from-emerald-500 to-[#10B981] rounded-3xl blur-xl opacity-30 group-hover:opacity-40 transition-opacity"></div>
                <div className="absolute -top-6 -left-6 w-20 h-20 bg-amber-400/20 rounded-full blur-2xl"></div>

                {logoSrc ? (
                  <div className="relative bg-white p-3 rounded-[2.5rem] shadow-2xl border border-slate-100 hover:scale-[1.02] transition-transform duration-500">
                    <img
                      src={logoSrc}
                      alt="Logo Profil Desa Hutan"
                      className="w-72 h-72 md:w-96 md:h-96 object-contain rounded-[2rem] bg-slate-50"
                    />
                  </div>
                ) : (
                  <div className="relative w-72 h-72 md:w-96 md:h-96 bg-white border border-slate-200/60 rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center p-6 text-center overflow-hidden hover:scale-[1.02] transition-transform duration-500">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4 border border-emerald-100">
                      <Award size={28} />
                    </div>
                    <span className="font-extrabold text-slate-800 text-base">Identitas Kehutanan</span>
                    <span className="text-xs text-slate-400 mt-2 max-w-[200px] leading-relaxed">
                      Unggah logo instansi atau sistem Anda melalui menu pengaturan situs di panel admin.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>


        {/* ─────────────────────────────────────────── */}
        {/* 4. MEDIA SOSIAL & SITUS TERKAIT SECTION     */}
        {/* ─────────────────────────────────────────── */}
        <section id="contact-section" className="py-24 max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 border border-emerald-100 px-3.5 py-1.5 rounded-full inline-block mb-3">
              Tautan &amp; Jejaring
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight uppercase">
              MEDIA SOSIAL &amp; SITUS TERKAIT
            </h2>
            <p className="text-sm text-slate-500 mt-2 font-medium">
              Akses cepat ke jejaring media sosial resmi dan portal situs kementerian serta lembaga mitra terkait pengelolaan kawasan hutan.
            </p>
          </div>

          {/* 30% / 70% Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* SEBELAH KIRI (~30% / 4 COLS): CARD KONTAK EMAIL & MEDIA SOSIAL */}
            <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                  <Mail size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">Kontak &amp; Medsos</h3>
                  <p className="text-xs text-slate-400 font-medium">Layanan email &amp; akun sosial media</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                {/* 1. EMAIL (URUTAN PERTAMA - MENONJOL & HIGHLIGHTED) */}
                <a
                  href="mailto:humas@menhut.go.id"
                  className="relative flex items-center gap-3.5 p-4 rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50 shadow-md shadow-emerald-700/5 hover:border-emerald-600 hover:shadow-lg transition-all group overflow-hidden"
                >
                  {/* Decorative background glow */}
                  <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>

                  <div className="w-11 h-11 rounded-xl bg-[#2D7344] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    <Mail size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-900 truncate">Email Resmi</span>
                      <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wider">
                        Utama
                      </span>
                    </div>
                    <div className="text-xs font-bold text-emerald-700 truncate mt-0.5">humas@menhut.go.id</div>
                  </div>
                  <ExternalLink size={14} className="text-emerald-700 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </a>

                {/* 2. INSTAGRAM */}
                <a
                  href="https://www.instagram.com/kementeriankehutanan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-emerald-50/40 hover:border-emerald-200 transition-all group"
                >
                  <div className="w-9 h-9 rounded-xl bg-pink-50 text-pink-600 border border-pink-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Instagram size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-extrabold text-slate-800 truncate">Instagram</div>
                    <div className="text-[11px] font-semibold text-slate-400 truncate">@kemenhut</div>
                  </div>
                  <ExternalLink size={14} className="text-slate-400 group-hover:text-emerald-600 shrink-0" />
                </a>

                {/* 3. YOUTUBE */}
                <a
                  href="https://www.youtube.com/@kementeriankehutananri"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-emerald-50/40 hover:border-emerald-200 transition-all group"
                >
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Youtube size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-extrabold text-slate-800 truncate">YouTube</div>
                    <div className="text-[11px] font-semibold text-slate-400 truncate">Kemenhut RI</div>
                  </div>
                  <ExternalLink size={14} className="text-slate-400 group-hover:text-emerald-600 shrink-0" />
                </a>
              </div>
            </div>


            {/* SEBELAH KANAN (~70% / 8 COLS): CARD SITUS TERKAIT */}
            <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                  <Globe size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">Situs Terkait</h3>
                  <p className="text-xs text-slate-400 font-medium">Tautan resmi portal &amp; lembaga mitra kehutanan</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Situs 1: Kementerian Kehutanan */}
                <a
                  href="https://www.menhut.go.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3.5 p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-emerald-50/40 hover:border-emerald-200 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Globe size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-extrabold text-slate-800 truncate">Kementerian Kehutanan</div>
                    <div className="text-[11px] font-semibold text-emerald-700 truncate">menhut.go.id</div>
                  </div>
                  <ExternalLink size={14} className="text-slate-400 group-hover:text-emerald-600 shrink-0" />
                </a>

                {/* Situs 2: Badan Informasi Geospasial */}
                <a
                  href="https://www.big.go.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3.5 p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-emerald-50/40 hover:border-emerald-200 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Globe size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-extrabold text-slate-800 truncate">Badan Informasi Geospasial</div>
                    <div className="text-[11px] font-semibold text-cyan-700 truncate">big.go.id</div>
                  </div>
                  <ExternalLink size={14} className="text-slate-400 group-hover:text-emerald-600 shrink-0" />
                </a>

                {/* Situs 3: Kemendagri */}
                <a
                  href="https://www.kemendagri.go.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3.5 p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-emerald-50/40 hover:border-emerald-200 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Globe size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-extrabold text-slate-800 truncate">Kementerian Dalam Negeri</div>
                    <div className="text-[11px] font-semibold text-amber-700 truncate">kemendagri.go.id</div>
                  </div>
                  <ExternalLink size={14} className="text-slate-400 group-hover:text-emerald-600 shrink-0" />
                </a>

                {/* Situs 4: SIPSN Kemenhut */}
                <a
                  href="https://sipsn.menhut.go.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3.5 p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-emerald-50/40 hover:border-emerald-200 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Globe size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-extrabold text-slate-800 truncate">SIPSN Kemenhut</div>
                    <div className="text-[11px] font-semibold text-emerald-700 truncate">sipsn.menhut.go.id</div>
                  </div>
                  <ExternalLink size={14} className="text-slate-400 group-hover:text-emerald-600 shrink-0" />
                </a>
              </div>
            </div>

          </div>


        </section>


      </div>
    </HomeLayout>
  );
};

export default Homepage;
