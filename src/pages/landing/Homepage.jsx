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
  Facebook,
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
import { situsTerkaitService } from "../../services/master/situsTerkaitService";
import environment from "../../config/environment";

/**
 * Helper untuk menyusun URL gambar logo dari path relatif / uploads
 */
const resolveImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const baseUrl = environment.API_URL || "http://localhost:3001";
  const cleanBase = baseUrl.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
};

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

  const { data: rawSitusTerkait = [], isLoading: situsTerkaitLoading } = useQuery({
    queryKey: ["situsTerkaitPublic"],
    queryFn: async () => {
      const res = await situsTerkaitService.getAll();
      return res?.data || res || [];
    },
    staleTime,
  });

  const situsTerkaitList = Array.isArray(rawSitusTerkait) ? rawSitusTerkait : [];

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
                    PUSAT PENGEMBANGAN SOSIAL EKONOMI MASYARAKAT HUTAN Kementerian Kehutanan
                  </div>

                  {/* Headline */}
                  <h1 className="text-xl sm:text-2xl md:text-2xl lg:text-[30px] font-light text-white leading-[1.25] tracking-tight mb-4 animate-fade-in-up animate-delay-1">
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
              KONTAK, MEDIA SOSIAL &amp; SITUS TERKAIT
            </h2>
            <p className="text-sm text-slate-500 mt-2 font-medium">
              Akses cepat ke layanan kontak resmi, akun media sosial, serta portal situs kementerian dan lembaga mitra terkait.
            </p>
          </div>

          {/* 50% / 50% Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">

            {/* SEBELAH KIRI (50%): DIBAGI MENJADI 2 CARD (KONTAK EMAIL & MEDSOS) */}
            <div className="flex flex-col gap-6">

              {/* CARD 1: KONTAK RESMI (EMAIL) */}
              <div className="bg-white border-2 border-emerald-500/40 rounded-3xl p-6 shadow-md shadow-emerald-700/5 hover:shadow-lg transition-all relative overflow-hidden group">
                <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-base">Kontak Resmi</h3>
                    <p className="text-xs text-slate-400 font-medium">Layanan informasi &amp; komunikasi publik</p>
                  </div>
                </div>

                <div className="space-y-4">
                    <a
                  href="#"
                  className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50 border border-emerald-200/80 hover:border-emerald-500 transition-all group/item"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#2D7344] text-white flex items-center justify-center shrink-0 shadow-sm group-hover/item:scale-105 transition-transform">
                    <Mail size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-900 truncate">Email Layanan Publik</span>
                      <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wider">
                        Utama
                      </span>
                    </div>
                    <div className="text-sm font-bold text-emerald-700 truncate mt-0.5">p2semh.kehutanan@gmail.com </div>
                  </div>
                  <ExternalLink size={16} className="text-emerald-700 group-hover/item:translate-x-0.5 transition-transform shrink-0" />
                </a>
                <a
                  href="#"
                  className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50 border border-emerald-200/80 hover:border-emerald-500 transition-all group/item"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#2D7344] text-white flex items-center justify-center shrink-0 shadow-sm group-hover/item:scale-105 transition-transform">
                    <Mail size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-900 truncate">Email Layanan Publik</span>
                      <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wider">
                        Utama
                      </span>
                    </div>
                    <div className="text-sm font-bold text-emerald-700 truncate mt-0.5">puspsemh@kehutanan.go.id</div>
                  </div>
                  <ExternalLink size={16} className="text-emerald-700 group-hover/item:translate-x-0.5 transition-transform shrink-0" />
                </a>
                </div>
              </div>

              {/* CARD 2: MEDIA SOSIAL RESMI */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex-1 flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                    <Share2 size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-base">Media Sosial Resmi</h3>
                    <p className="text-xs text-slate-400 font-medium">Ikuti pembaruan berita &amp; kegiatan terbaru</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Instagram */}
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

                  {/* Facebook */}
                  <a
                    href="https://www.facebook.com/kementeriankehutanan"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-emerald-50/40 hover:border-emerald-200 transition-all group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Facebook size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-extrabold text-slate-800 truncate">Facebook</div>
                      <div className="text-[11px] font-semibold text-slate-400 truncate">Kementerian Kehutanan</div>
                    </div>
                    <ExternalLink size={14} className="text-slate-400 group-hover:text-emerald-600 shrink-0" />
                  </a>
                </div>
              </div>

            </div>

            {/* SEBELAH KANAN (50%): CARD SITUS TERKAIT */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] hover:shadow-xl hover:shadow-emerald-950/5 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
              {/* Top decorative gradient glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full pointer-events-none"></div>

              <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100/80 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/60 text-[#2D7344] border border-emerald-200/60 flex items-center justify-center shrink-0 shadow-xs">
                    <Globe size={22} className="stroke-[2.2]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-slate-800 text-base sm:text-lg tracking-tight">Situs Terkait</h3>
                    </div>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">Tautan resmi portal website terkait</p>
                  </div>
                </div>
                {Array.isArray(situsTerkaitList) && situsTerkaitList.length > 0 && (
                  <span className="hidden sm:inline-flex items-center text-[10px] font-extrabold text-slate-500 bg-slate-100/80 px-2.5 py-1 rounded-full border border-slate-200/60 shrink-0">
                    {situsTerkaitList.length} Portal
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 flex-1 items-center relative z-10">
                {situsTerkaitLoading ? (
                  <>
                    {[1, 2, 3, 4].map((n) => (
                      <div key={n} className="flex items-center gap-3.5 p-4 rounded-2xl border border-slate-100 bg-slate-50/50 animate-pulse">
                        <div className="w-11 h-11 rounded-xl bg-slate-200 shrink-0"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                          <div className="h-2.5 bg-slate-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : situsTerkaitList.length === 0 ? (
                  <div className="sm:col-span-2 py-8 px-6 flex flex-col items-center justify-center text-center bg-slate-50/70 border border-dashed border-slate-200/80 rounded-3xl gap-2.5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#2D7344] flex items-center justify-center border border-emerald-100/80 shadow-xs">
                      <Globe size={24} className="stroke-[1.75]" />
                    </div>
                    <div className="space-y-1 max-w-sm">
                      <h4 className="text-xs font-extrabold text-slate-700">Belum Ada Situs Terkait</h4>
                      <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                        Saat ini belum ada tautan situs resmi mitra yang terdaftar. Daftar situs terkait akan ditampilkan di sini setelah ditambahkan oleh administrator.
                      </p>
                    </div>
                  </div>
                ) : (
                  situsTerkaitList.map((situs) => {
                    const imgUrl = resolveImageUrl(situs.logo);
                    const domainDisplay = situs.url
                      ? situs.url.replace(/^https?:\/\//i, "").replace(/\/$/, "")
                      : "";

                    return (
                      <a
                        key={situs.id || situs.nama}
                        href={situs.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white via-slate-50/40 to-emerald-50/20 hover:from-white hover:to-emerald-50/80 hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-950/5 hover:-translate-y-0.5 transition-all duration-300 group h-full relative overflow-hidden"
                      >
                        {/* Subtle glow accent on hover */}
                        <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-400/10 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                        <div className="w-11 h-11 rounded-xl bg-white text-emerald-700 border border-slate-200/80 group-hover:border-emerald-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300 overflow-hidden p-1.5 shadow-xs">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={situs.nama}
                              className="w-full h-full object-contain transition-transform group-hover:scale-110"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = "none";
                                if (e.target.parentElement) {
                                  e.target.parentElement.innerHTML = '<svg class="w-5 h-5 text-emerald-600 stroke-[2]" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
                                }
                              }}
                            />
                          ) : (
                            <Globe size={20} className="stroke-[2]" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div
                            className="text-xs font-extrabold text-slate-800 group-hover:text-emerald-900 truncate leading-snug transition-colors"
                            title={situs.nama}
                          >
                            {situs.nama}
                          </div>
                          <div
                            className="text-[10px] font-bold text-emerald-700 truncate mt-1 inline-flex items-center gap-1 bg-emerald-50/80 group-hover:bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-100 transition-colors"
                            title={situs.url}
                          >
                            <span>{domainDisplay || situs.url}</span>
                          </div>
                        </div>
                        <div className="w-7 h-7 rounded-lg bg-slate-100/80 group-hover:bg-emerald-600 group-hover:text-white text-slate-400 flex items-center justify-center shrink-0 transition-all duration-300">
                          <ExternalLink size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </div>
                      </a>
                    );
                  })
                )}
              </div>
            </div>

          </div>

        </section>

      </div>
    </HomeLayout>
  );
};

export default Homepage;
