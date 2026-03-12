import React from "react";
import Navbar from "./Navbar"; // Sesuaikan path import-nya
import Footer from "./Footer"; // Sesuaikan path import-nya

const HomeLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen font-sans">
      {/* Bagian Atas: Navbar */}
      <Navbar />
      {/* Bagian Tengah: Konten Dinamis (Children) */}
      <main className="relative flex-1">{children}</main>
      {/* Bagian Bawah: Footer */}
      <Footer />
    </div>
  );
};

export default HomeLayout;
