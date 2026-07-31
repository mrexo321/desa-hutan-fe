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
  Award
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
        {/* 3. MAP SECTION                              */}
        {/* ─────────────────────────────────────────── */}
        <section id="map-section" className="py-20 bg-white border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-6">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 border border-emerald-100 px-3.5 py-1.5 rounded-full inline-block mb-3">
                Sebaran Geografis
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight uppercase">
                PETA INTERAKTIF KAWASAN DESA HUTAN
              </h2>
              <p className="text-sm text-slate-500 mt-2 font-medium">
                Sistem informasi geografis yang menyajikan titik koordinat, luas poligon kawasan, dan sebaran perbatasan perhutanan nasional.
              </p>
            </div>

            {/* Dashboard Mockup Map Frame */}
            <div className="max-w-5xl mx-auto bg-slate-950 p-3 rounded-[2rem] shadow-2xl border border-slate-800 relative group overflow-hidden">
              {/* Inner Map Panel */}
              <div className="relative w-full h-[400px] md:h-[480px] bg-slate-900 rounded-[1.5rem] overflow-hidden">
                <iframe
                  title="Peta Lokasi"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.04537152631!2d106.77259601477138!3d-6.602737695225029!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69c5a171ba95a7%3A0xcda6b080ce18001b!2sBogor%20Barat%2C%20Kota%20Bogor%2C%20Jawa%20Barat!5e0!3m2!1sid!2sid!4v1680000000000!5m2!1sid!2sid"
                  width="100%"
                  height="100%"
                  style={{ border: 0, opacity: 0.85 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="grayscale brightness-90 hover:grayscale-0 hover:brightness-100 transition-all duration-700"
                ></iframe>

                {/* Floating Map Info Overlay */}
                <div className="absolute bottom-6 left-6 right-6 md:right-auto bg-slate-950/90 backdrop-blur-md border border-slate-800 p-5 rounded-2xl text-white shadow-2xl font-sans max-w-sm">
                  <div className="flex items-center gap-2 mb-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                    <ShieldCheck size={14} />
                    Verified Spatial Data
                  </div>
                  <h4 className="font-extrabold text-sm mb-1 text-slate-100">GIS &amp; Web Map Service (WMS)</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                    Terintegrasi dengan Geoserver Kementerian Kehutanan untuk menampilkan batas-batas persetujuan penggunaan wilayah hutan secara real-time.
                  </p>

                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-800 text-center">
                    <div>
                      <div className="text-lg font-bold text-emerald-400">38</div>
                      <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Provinsi</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-amber-400">2,500+</div>
                      <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Desa Hutan</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────── */}
        {/* 4. CONTACT US SECTION                       */}
        {/* ─────────────────────────────────────────── */}
        <section id="contact-section" className="py-24 max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 border border-emerald-100 px-3.5 py-1.5 rounded-full inline-block mb-3">
              Hubungi Kami
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight uppercase">
              KONTAK LAYANAN &amp; INFORMASI
            </h2>
            <p className="text-sm text-slate-500 mt-2 font-medium">
              Tim perwakilan Pusat Pengembangan Sosial Ekonomi Masyarakat Hutan siap melayani pertanyaan seputar data spasial dan program pemberdayaan.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Email */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-emerald-500/30 transition-all duration-300 flex flex-col items-center text-center group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                <Mail size={20} />
              </div>
              <h4 className="font-extrabold text-slate-800 text-sm tracking-wider uppercase mb-1">Email</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-3">Surat Elektronik Resmi</p>
              <a href="mailto:p2semh@gmail.com" className="text-xs md:text-sm font-semibold text-emerald-700 hover:text-emerald-600 break-all transition-colors mt-auto">
                p2semh@gmail.com
              </a>
            </div>

            {/* Card 2: Telepon */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-emerald-500/30 transition-all duration-300 flex flex-col items-center text-center group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                <Phone size={20} />
              </div>
              <h4 className="font-extrabold text-slate-800 text-sm tracking-wider uppercase mb-1">Telepon</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-3">Layanan Pengaduan &amp; Chat</p>
              <a href="tel:02193833434233" className="text-xs md:text-sm font-semibold text-emerald-700 hover:text-emerald-600 transition-colors mt-auto">
                (021) 93833434233
              </a>
            </div>

            {/* Card 3: Alamat */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-emerald-500/30 transition-all duration-300 flex flex-col items-center text-center group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                <MapPin size={20} />
              </div>
              <h4 className="font-extrabold text-slate-800 text-sm tracking-wider uppercase mb-1">Alamat</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Kantor Wilayah</p>
              <p className="text-[11px] font-bold text-slate-600 leading-relaxed max-w-[220px] mt-auto">
                RT.02/RW.03, Pasir Jaya, Bogor Barat, Kota Bogor, Jawa Barat 16119
              </p>
            </div>

            {/* Card 4: Media Sosial */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-emerald-500/30 transition-all duration-300 flex flex-col items-center text-center group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                <Share2 size={20} />
              </div>
              <h4 className="font-extrabold text-slate-800 text-sm tracking-wider uppercase mb-1">Sosial Media</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-3">Informasi Terkini</p>

              <div className="flex gap-2.5 mt-auto">
                <a href="#" aria-label="Facebook" className="p-2 bg-slate-50 hover:bg-[#1877F2] text-slate-500 hover:text-white border border-slate-200/60 rounded-xl transition-all hover:-translate-y-0.5">
                  <Globe size={16} />
                </a>
                <a href="#" aria-label="YouTube" className="p-2 bg-slate-50 hover:bg-[#FF0000] text-slate-500 hover:text-white border border-slate-200/60 rounded-xl transition-all hover:-translate-y-0.5">
                  <Youtube size={16} />
                </a>
                <a href="#" aria-label="Instagram" className="p-2 bg-slate-50 hover:bg-[#E1306C] text-slate-500 hover:text-white border border-slate-200/60 rounded-xl transition-all hover:-translate-y-0.5">
                  <Instagram size={16} />
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
