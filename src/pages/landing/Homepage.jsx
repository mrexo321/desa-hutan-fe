import React from "react";
import HomeLayout from "../../components/HomeLayout";
import { useQuery } from "@tanstack/react-query";
import { siteSettingService } from "../../services/auth/siteSettingService";
import { Compass, BarChart2, Table2, Loader2 } from "lucide-react";

// ─────────────────────────────────────────
// HELPER: Render teks dengan satu kata/frasa di-bold
// ─────────────────────────────────────────
const HighlightedText = ({ text = "", highlight = "" }) => {
  if (!highlight || !text.includes(highlight)) return <p className="text-gray-600 mb-16 leading-relaxed text-justify md:text-left">{text}</p>;
  const [before, after] = text.split(highlight);
  return (
    <p className="text-gray-600 mb-16 leading-relaxed text-justify md:text-left">
      {before}
      <strong>{highlight}</strong>
      {after}
    </p>
  );
};

// ─────────────────────────────────────────
// HELPER: Render ikon dari nama string (compass, bar-chart, table)
// ─────────────────────────────────────────
const FeatureIcon = ({ name }) => {
  const iconProps = { width: 28, height: 28, strokeWidth: 2, stroke: "currentColor", fill: "none", strokeLinecap: "round", strokeLinejoin: "round" };
  if (name === "compass") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" {...iconProps} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
      </svg>
    );
  }
  if (name === "bar-chart") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" {...iconProps} viewBox="0 0 24 24">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    );
  }
  if (name === "table") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" {...iconProps} viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    );
  }
  // fallback generik
  return (
    <svg xmlns="http://www.w3.org/2000/svg" {...iconProps} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
};

// ─────────────────────────────────────────
// HELPER: Satu item fitur
// ─────────────────────────────────────────
const FeatureItem = ({ title, description, icon }) => (
  <div className="flex gap-6">
    <div className="flex-shrink-0 w-16 h-16 bg-[#0B8457] rounded-full flex items-center justify-center text-white shadow-md">
      <FeatureIcon name={icon} />
    </div>
    <div>
      <h3 className="font-bold text-gray-900 mb-2 uppercase text-sm tracking-widest">
        {title}
      </h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  </div>
);

// ─────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────
const Homepage = () => {
  const staleTime = 5 * 60 * 1000; // 5 menit cache

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

  // Logo: utamakan section_logo_image (profil), fallback ke site_logo (general/navbar)
  const logoSrc = profil.section_logo_image || general.site_logo || null;

  const isLoading = heroLoading || profilLoading || featuresLoading || generalLoading;

  // Fallback background jika belum ada gambar di DB
  const heroBg = hero.hero_background_image
    ? `url('${hero.hero_background_image}')`
    : `url('/HeroBackground.png')`;

  return (
    <HomeLayout transparent={true}>
      <div className="font-sans text-gray-800 antialiased overflow-x-hidden">

        {/* ─────────────────────────────────────────── */}
        {/* 1. HERO SECTION                             */}
        {/* ─────────────────────────────────────────── */}
        <section
          id="hero-section"
          className="relative min-h-screen bg-cover bg-center flex flex-col"
          style={{ backgroundImage: heroBg }}
        >
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/30"></div>

          {/* Hero Content */}
          <div className="relative z-10 flex-1 flex items-center px-8 md:px-12 max-w-7xl mx-auto w-full">
            <div className="max-w-3xl pt-10">
              {isLoading ? (
                <div className="flex items-center gap-3 text-white/80">
                  <Loader2 size={24} className="animate-spin" />
                  <span>Memuat konten...</span>
                </div>
              ) : (
                <>
                  <h1 className="text-4xl md:text-5xl lg:text-[54px] font-light text-white leading-[1.3] tracking-wide mb-6">
                    {hero.hero_headline_normal || "Demi mewujudkan kemandirian desa melalui pemetaan untuk"}
                    <br />
                    <span className="font-bold">
                      {hero.hero_headline_bold || "perkembangan ekonomi dan pemberdayaan masyarakat"}
                    </span>
                  </h1>
                  <p className="text-white/90 text-base md:text-lg max-w-2xl leading-relaxed tracking-wide">
                    {hero.hero_subheadline ||
                      "Sistem Informasi Pemetaan Profil Desa Hutan Untuk Identifikasi Potensi Ekonomi dan Pemberdayaan Masyarakat Desa."}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Floating Action Button */}
          <div className="absolute bottom-10 right-10 z-10 hidden md:block">
            <button
              id="hero-fab-btn"
              className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-emerald-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>
        </section>

        {/* ─────────────────────────────────────────── */}
        {/* 2. PROFIL DESA HUTAN SECTION               */}
        {/* ─────────────────────────────────────────── */}
        <section id="profil-section" className="py-20 px-8 max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 tracking-wide uppercase">
            {profil.section_title || "PROFIL DESA HUTAN"}
          </h2>

          <HighlightedText
            text={profil.section_description || ""}
            highlight={profil.section_description_highlight || ""}
          />

          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Left: Features List */}
            <div className="flex-1 space-y-10">
              <FeatureItem
                title={features.feature_peta_title || "PETA"}
                description={features.feature_peta_description || ""}
                icon={features.feature_peta_icon || "compass"}
              />
              <FeatureItem
                title={features.feature_infografis_title || "INFOGRAFIS"}
                description={features.feature_infografis_description || ""}
                icon={features.feature_infografis_icon || "bar-chart"}
              />
              <FeatureItem
                title={features.feature_data_desa_title || "DATA DESA"}
                description={features.feature_data_desa_description || ""}
                icon={features.feature_data_desa_icon || "table"}
              />
            </div>

            {/* Right: Logo Section */}
            <div className="flex-1 flex justify-center lg:justify-end">
              {logoSrc ? (
                <img
                  src={logoSrc}
                  alt="Logo Profil Desa Hutan"
                  className="w-64 h-64 md:w-80 md:h-80 object-contain rounded-full shadow-xl border-4 border-white"
                />
              ) : (
                <div className="w-64 h-64 md:w-80 md:h-80 bg-gray-100 rounded-full border-4 border-white shadow-xl flex items-center justify-center overflow-hidden relative">
                  <div className="absolute bottom-0 w-full h-1/3 bg-[#A47144]"></div>
                  <div className="absolute top-0 w-full h-2/3 bg-[#4E8E42] rounded-b-full"></div>
                  <div className="absolute text-white font-bold text-sm z-10 flex flex-col items-center text-center px-4">
                    <span>Upload logo</span>
                    <span>di Site Settings</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────── */}
        {/* 3. MAP SECTION                              */}
        {/* ─────────────────────────────────────────── */}
        <section id="map-section" className="py-12 bg-white">
          <h2 className="text-center font-bold text-xl mb-6">Map</h2>
          <div className="max-w-5xl mx-auto px-4">
            <div className="w-full h-80 bg-gray-200 rounded-lg overflow-hidden shadow-inner">
              <iframe
                title="Peta Lokasi"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.04537152631!2d106.77259601477138!3d-6.602737695225029!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69c5a171ba95a7%3A0xcda6b080ce18001b!2sBogor%20Barat%2C%20Kota%20Bogor%2C%20Jawa%20Barat!5e0!3m2!1sid!2sid!4v1680000000000!5m2!1sid!2sid"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────── */}
        {/* 4. CONTACT US SECTION                       */}
        {/* ─────────────────────────────────────────── */}
        <section id="contact-section" className="py-12 pb-20 max-w-6xl mx-auto px-6">
          <h2 className="text-center font-bold text-xl mb-10">Contact Us</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center text-sm">
            {/* Email */}
            <div className="flex flex-col items-center">
              <h4 className="text-[#0B8457] font-semibold mb-2">Email</h4>
              <a href="mailto:p2semh@gmail.com" className="text-gray-700 hover:text-[#0B8457] transition-colors">
                p2semh@gmail.com
              </a>
            </div>

            {/* Telephone */}
            <div className="flex flex-col items-center">
              <h4 className="text-[#0B8457] font-semibold mb-2">Telephone</h4>
              <a href="tel:02193833434233" className="text-gray-700 hover:text-[#0B8457] transition-colors">
                (021) 93833434233
              </a>
            </div>

            {/* Address */}
            <div className="flex flex-col items-center">
              <h4 className="text-[#0B8457] font-semibold mb-2">Address</h4>
              <p className="text-gray-700 max-w-[200px]">
                RT.02/RW.03, Pasir Jaya, Bogor Barat, Bogor City, West Java 16119
              </p>
            </div>

            {/* Social Media */}
            <div className="flex flex-col items-center">
              <h4 className="text-[#0B8457] font-semibold mb-2">Social Media</h4>
              <div className="flex gap-3 text-gray-600 mt-1">
                <a href="#" aria-label="Facebook" className="hover:text-[#1877F2] transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a href="#" aria-label="TikTok" className="hover:text-black transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v7.2c0 1.96-.44 4.02-1.61 5.63-1.11 1.5-2.81 2.51-4.66 2.8-1.57.26-3.23.1-4.72-.51-1.74-.7-3.15-2.07-3.92-3.75-.75-1.66-.88-3.6-.33-5.31.57-1.8 1.87-3.28 3.51-4.14 1.56-.81 3.42-1.02 5.17-.67v4.13c-1.01-.2-2.12-.13-3.05.35-.91.48-1.58 1.34-1.83 2.34-.23.95-.13 1.98.3 2.86.42.87 1.25 1.52 2.18 1.81.99.3 2.1.2 2.97-.33.88-.54 1.5-1.42 1.74-2.43.2-.84.2-1.72.2-2.58V.02h-2.05z" />
                  </svg>
                </a>
                <a href="#" aria-label="YouTube" className="hover:text-[#FF0000] transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
                <a href="#" aria-label="Instagram" className="hover:text-[#E1306C] transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
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
