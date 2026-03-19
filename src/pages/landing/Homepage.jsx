import React from "react";
import Navbar from "../../components/Navbar";
import HomeLayout from "../../components/HomeLayout";

const Homepage = () => {
  return (
    <HomeLayout transparent={true}>
      <div className="font-sans text-gray-800 antialiased overflow-x-hidden">
        {/* 1. HERO SECTION */}
        <section
          className="relative min-h-screen bg-cover bg-center flex flex-col"
          style={{
            // Ganti URL ini dengan gambar hutan/desa asli milikmu
            backgroundImage: `url('https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?q=80&w=2000&auto=format&fit=crop')`,
          }}
        >
          {/* Dark Overlay agar teks putih terbaca */}
          <div className="absolute inset-0 bg-black/30"></div>

          {/* Hero Content */}
          <div className="relative z-10 flex-1 flex items-center px-8 md:px-12 max-w-7xl mx-auto w-full">
            <div className="max-w-3xl pt-10">
              <h1 className="text-4xl md:text-5xl lg:text-[54px] font-light text-white leading-[1.3] tracking-wide mb-6">
                Demi mewujudkan
                <br />
                kemandirian desa melalui
                <br />
                pemetaan untuk
                <br />
                <span className="font-bold">perkembangan ekonomi</span> dan
                <br />
                <span className="font-bold">pemberdayaan masyarakat</span>
              </h1>
              <p className="text-white/90 text-base md:text-lg max-w-2xl leading-relaxed tracking-wide">
                Sistem Informasi Pemetaan Profil Desa Hutan Untuk Identifikasi
                Potensi Ekonomi dan Pemberdayaan Masyarakat Desa.
              </p>
            </div>
          </div>

          {/* Floating Action Button (Bottom Right) */}
          <div className="absolute bottom-10 right-10 z-10 hidden md:block">
            <button className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-emerald-600 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>
        </section>

        {/* 2. PROFIL DESA HUTAN SECTION */}
        <section className="py-20 px-8 max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 tracking-wide uppercase">
            Profil Desa Hutan
          </h2>
          <p className="text-gray-600 mb-16 leading-relaxed text-justify md:text-left">
            Melalui website ini, Pusat Pengembangan Sosial Ekonomi Masyarakat
            Hutan menghadirkan Sistem Informasi Profil Desa Hutan sebagai solusi
            basis data terpadu. Platform ini mengintegrasikan data sosial,
            ekonomi, potensi sumber daya alam, dan spasial yang selama ini
            tersebar, guna{" "}
            <strong>menyediakan referensi baseline yang akurat</strong> bagi
            perencanaan pembangunan dan kebijakan pemberdayaan masyarakat yang
            tepat sasaran sesuai standar Satu Data Indonesia.
          </p>

          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Left: Features List */}
            <div className="flex-1 space-y-10">
              {/* Feature 1 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-16 h-16 bg-[#0B8457] rounded-full flex items-center justify-center text-white shadow-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2 uppercase text-sm tracking-widest">
                    Peta
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Menyajikan data kawasan hutan beserta sebaran desa hutan
                    dengan peta interaktif, serta dilengkapi lapisan informasi
                    geospasial yang mendetail untuk memudahkan identifikasi
                    batas wilayah dan zonasi secara akurat.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-16 h-16 bg-[#0B8457] rounded-full flex items-center justify-center text-white shadow-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2 uppercase text-sm tracking-widest">
                    Infografis
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Menyajikan data sebaran desa dalam bentuk infografis
                    interaktif yang dapat dilihat berdasarkan berbagai parameter
                    statistik, mengubah data kompleks menjadi visualisasi yang
                    mudah dipahami untuk analisis tren dan potensi wilayah.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-16 h-16 bg-[#0B8457] rounded-full flex items-center justify-center text-white shadow-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="2"
                      ry="2"
                    ></rect>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="9" y1="21" x2="9" y2="9"></line>
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2 uppercase text-sm tracking-widest">
                    Data Desa
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Menyajikan metadata sebaran desa hutan kepada masyarakat
                    publik untuk mendukung transparansi informasi, sekaligus
                    menyediakan basis data yang valid bagi keperluan riset,
                    pengambilan kebijakan, dan perencanaan pembangunan.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Graphic/Logo */}
            <div className="flex-1 flex justify-center lg:justify-end">
              {/* Ganti dengan <img src="/logo-pohon.png" alt="Logo" /> */}
              <div className="w-64 h-64 md:w-80 md:h-80 bg-gray-100 rounded-full border-4 border-white shadow-xl flex items-center justify-center overflow-hidden relative">
                {/* Visual placeholder untuk logo daun/pohon seperti di gambar */}
                <div className="absolute bottom-0 w-full h-1/3 bg-[#A47144]"></div>
                <div className="absolute top-0 w-full h-2/3 bg-[#4E8E42] rounded-b-full"></div>
                <div className="absolute text-white font-bold text-xl z-10 flex flex-col items-center">
                  <span>GANTI DENGAN</span>
                  <span>GAMBAR LOGO</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. MAP SECTION */}
        <section className="py-12 bg-white">
          <h2 className="text-center font-bold text-xl mb-6">Map</h2>
          <div className="max-w-5xl mx-auto px-4">
            {/* Ganti iframe src di bawah dengan embed link Google Maps aslimu */}
            <div className="w-full h-80 bg-gray-200 rounded-lg overflow-hidden shadow-inner">
              <iframe
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

        {/* 4. CONTACT US SECTION */}
        <section className="py-12 pb-20 max-w-6xl mx-auto px-6">
          <h2 className="text-center font-bold text-xl mb-10">Contact Us</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center text-sm">
            {/* Email */}
            <div className="flex flex-col items-center">
              <h4 className="text-[#0B8457] font-semibold mb-2">Email</h4>
              <a
                href="mailto:p2semh@gmail.com"
                className="text-gray-700 hover:text-[#0B8457] transition-colors"
              >
                p2semh@gmail.com
              </a>
            </div>

            {/* Telephone */}
            <div className="flex flex-col items-center">
              <h4 className="text-[#0B8457] font-semibold mb-2">Telephone</h4>
              <a
                href="tel:02193833434233"
                className="text-gray-700 hover:text-[#0B8457] transition-colors"
              >
                (021) 93833434233
              </a>
            </div>

            {/* Address */}
            <div className="flex flex-col items-center">
              <h4 className="text-[#0B8457] font-semibold mb-2">Address</h4>
              <p className="text-gray-700 max-w-[200px]">
                RT.02/RW.03, Pasir Jaya, Bogor Barat, Bogor City, West Java
                16119
              </p>
            </div>

            {/* Social Media */}
            <div className="flex flex-col items-center">
              <h4 className="text-[#0B8457] font-semibold mb-2">
                Social Media
              </h4>
              <div className="flex gap-3 text-gray-600 mt-1">
                {/* Ikon Sosmed Placeholder */}
                <a href="#" className="hover:text-[#1877F2] transition-colors">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a href="#" className="hover:text-black transition-colors">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v7.2c0 1.96-.44 4.02-1.61 5.63-1.11 1.5-2.81 2.51-4.66 2.8-1.57.26-3.23.1-4.72-.51-1.74-.7-3.15-2.07-3.92-3.75-.75-1.66-.88-3.6-.33-5.31.57-1.8 1.87-3.28 3.51-4.14 1.56-.81 3.42-1.02 5.17-.67v4.13c-1.01-.2-2.12-.13-3.05.35-.91.48-1.58 1.34-1.83 2.34-.23.95-.13 1.98.3 2.86.42.87 1.25 1.52 2.18 1.81.99.3 2.1.2 2.97-.33.88-.54 1.5-1.42 1.74-2.43.2-.84.2-1.72.2-2.58V.02h-2.05z" />
                  </svg>
                </a>
                <a href="#" className="hover:text-[#FF0000] transition-colors">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
                <a href="#" className="hover:text-[#E1306C] transition-colors">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="2"
                      y="2"
                      width="20"
                      height="20"
                      rx="5"
                      ry="5"
                    ></rect>
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
