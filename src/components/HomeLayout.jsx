import React from "react";
import Navbar from "./Navbar"; // Pastikan file Navbar Anda ada
import Footer from "./Footer"; // Pastikan file Footer Anda ada

const HomeLayout = ({ children, transparent = false }) => {
  return (
    <div className="flex flex-col min-h-screen font-sans bg-[#FBFDFD] antialiased">
      {/* Bagian Atas: Navbar
        Menambahkan kelas sticky agar menempel saat di-scroll.
        Properti 'transparent' diteruskan ke Navbar jika Anda mengaturnya.
      */}
      <div className="sticky top-0 z-50">
        <Navbar transparent={transparent} />
      </div>

      {/* Bagian Tengah: Konten Dinamis */}
      <main className="relative flex-1">{children}</main>

      {/* Bagian Bawah: Footer */}
      <Footer />
    </div>
  );
};

export default HomeLayout;
