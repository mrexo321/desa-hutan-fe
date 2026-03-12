import React, { useState } from "react";
import HomeLayout from "./components/HomeLayout";

const AboutUs = () => {
  const [activeTab, setActiveTab] = useState("struktur");

  return (
    <HomeLayout>
      <div className="bg-white font-sans text-gray-800">
        <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">
          {/* JUDUL HALAMAN (Opsional, karena di gambar terpotong. Saya tambahkan agar rapi) */}
          <h1 className="text-3xl font-bold mb-8 text-center md:text-left text-[#0B8457]">
            Tentang Kami
          </h1>

          {/* --- BAGIAN KONTEN TEKS --- */}
          <div className="space-y-6 text-sm md:text-base leading-relaxed text-justify mb-12">
            <p>
              <strong>Direktorat Penggunaan Kawasan Hutan</strong> merupakan
              bagian dari keluarga besar Direktorat Jenderal Planologi
              Kehutanan, Kementerian Kehutanan, yang bertugas merumuskan dan
              melaksanakan kebijakan di bidang penggunaan kawasan hutan secara
              optimal, sesuai ketentuan peraturan perundang-undangan. Kami
              berkomitmen mendukung visi Direktorat Jenderal Planologi
              Kehutanan, yaitu:
            </p>

            <p className="font-bold italic text-gray-900 px-4 py-2 border-l-4 border-[#0B8457] bg-green-50/50">
              "Memastikan pemantapan dan optimasi kawasan hutan untuk mengawal
              penguatan fondasi transformasi menuju Indonesia Maju."
            </p>

            <p>
              Sebagai wujud komitmen tersebut, Direktorat Penggunaan Kawasan
              Hutan memiliki sasaran utama:{" "}
              <strong>
                "Mengoptimalkan penggunaan kawasan hutan sesuai ketentuan yang
                berlaku"
              </strong>
              , sehingga penggunaan kawasan hutan dapat memberikan manfaat yang
              berkelanjutan bagi lingkungan, masyarakat, dan perekonomian
              nasional.
            </p>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">
                Indikator Kinerja Utama
              </h3>
              <p className="mb-2">
                Pencapaian sasaran kegiatan diukur melalui indikator berikut:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  Persentase permohonan penggunaan kawasan hutan yang dilayani
                </li>
                <li>Nilai penerimaan PNBP dari penggunaan kawasan hutan</li>
                <li>
                  Persentase pemegang persetujuan yang diverifikasi di wilayah
                  kerja Balai Pemantapan Kawasan Hutan (BPKH)
                </li>
                <li>
                  Persentase pemegang persetujuan yang dimonitoring dan/atau
                  dievaluasi di wilayah kerja BPKH
                </li>
              </ul>
            </div>

            <p>
              Pelaksanaan tugas dan fungsi Direktorat Penggunaan Kawasan Hutan
              didukung oleh struktur organisasi yang diatur dalam{" "}
              <strong>
                Peraturan Menteri Kehutanan Republik Indonesia Nomor 1 Tahun
                2024 tentang Organisasi dan Tata Kerja Kementerian Kehutanan
              </strong>
              , sebagai berikut:
            </p>
          </div>

          {/* --- BAGIAN TABS --- */}
          <div className="flex justify-center gap-12 border-b border-gray-200 mb-8">
            <button
              onClick={() => setActiveTab("struktur")}
              className={`pb-2 font-bold text-sm tracking-wide transition-colors ${
                activeTab === "struktur"
                  ? "text-[#E5B82A] border-b-2 border-[#E5B82A]"
                  : "text-[#5E9B79] hover:text-[#0B8457]"
              }`}
            >
              STRUKTUR KELOMPOK KERJA
            </button>
            <button
              onClick={() => setActiveTab("video")}
              className={`pb-2 font-bold text-sm tracking-wide transition-colors ${
                activeTab === "video"
                  ? "text-[#E5B82A] border-b-2 border-[#E5B82A]"
                  : "text-[#5E9B79] hover:text-[#0B8457]"
              }`}
            >
              VIDEO
            </button>
          </div>

          {/* --- BAGIAN BAGAN STRUKTUR ORGANISASI --- */}
          {activeTab === "struktur" && (
            <div className="border rounded-xl p-4 md:p-8 overflow-x-auto bg-gray-50/30">
              {/* Wrapper lebar minimum agar tidak hancur di HP */}
              <div className="min-w-[800px] flex flex-col items-center">
                {/* Level 1: Direktur */}
                <div className="w-56 bg-[#FADBB8] border border-gray-400 p-3 text-center rounded shadow-sm z-10 relative">
                  <p className="font-bold text-xs">
                    DIREKTUR
                    <br />
                    PENGGUNAAN
                    <br />
                    KAWASAN HUTAN
                  </p>
                </div>

                {/* Garis Vertikal Utama */}
                <div className="w-px h-8 bg-gray-400"></div>

                {/* Level 2: Tata Usaha & Fungsional */}
                <div className="flex justify-between w-[600px] relative">
                  {/* Garis Horizontal Penghubung Level 2 */}
                  <div className="absolute top-0 left-[20%] right-[20%] h-px bg-gray-400"></div>

                  <div className="flex flex-col items-center w-1/2 pt-6 relative">
                    <div className="absolute top-0 w-px h-6 bg-gray-400"></div>
                    <div className="w-48 bg-white border border-gray-400 p-3 text-center rounded shadow-sm">
                      <p className="font-bold text-[10px] md:text-xs">
                        KEPALA SUBBAGIAN TATA USAHA
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center w-1/2 pt-6 relative">
                    <div className="absolute top-0 w-px h-6 bg-gray-400"></div>
                    <div className="w-48 bg-[#FCE5B5] border border-gray-400 p-3 text-center rounded shadow-sm">
                      <p className="font-bold text-[10px] md:text-xs">
                        KELOMPOK JABATAN
                        <br />
                        FUNGSIONAL
                      </p>
                    </div>
                  </div>
                </div>

                {/* Garis Vertikal Lanjutan ke Bawah (dari Direktur memotong tengah) */}
                <div className="w-px h-8 bg-gray-400 -mt-10"></div>

                {/* Level 3: Subdirektorat */}
                <div className="flex justify-between w-full mt-10 relative">
                  {/* Garis Horizontal Penghubung Level 3 */}
                  <div className="absolute top-0 left-[25%] right-[25%] h-px bg-gray-400"></div>

                  {/* Kiri: Subdit Penyiapan */}
                  <div className="flex flex-col items-center w-1/2 pt-6 relative">
                    <div className="absolute top-0 w-px h-6 bg-gray-400"></div>
                    <div className="w-72 bg-[#5D92C9] text-white border border-gray-400 p-4 text-center rounded shadow-sm mb-6 z-10">
                      <p className="font-bold text-xs">
                        KEPALA SUBDIREKTORAT
                        <br />
                        PENYIAPAN PENGGUNAAN
                        <br />
                        KAWASAN HUTAN
                      </p>
                    </div>

                    {/* Anak-anak dari Subdit Penyiapan */}
                    <div className="flex gap-4 relative pt-4">
                      <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gray-400"></div>

                      <div className="flex flex-col items-center relative pt-4">
                        <div className="absolute top-0 w-px h-4 bg-gray-400"></div>
                        <div className="w-36 bg-[#D6E3F2] border border-gray-400 p-2 text-center rounded text-[9px] font-bold h-full flex items-center justify-center">
                          <p>
                            TIM KERJA BIDANG PENYIAPAN PENGGUNAAN KAWASAN HUTAN
                            WILAYAH KALIMANTAN, SULAWESI DAN PAPUA
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-center relative pt-4">
                        <div className="absolute top-0 w-px h-4 bg-gray-400"></div>
                        <div className="w-36 bg-[#D6E3F2] border border-gray-400 p-2 text-center rounded text-[9px] font-bold h-full flex items-center justify-center">
                          <p>
                            TIM KERJA BIDANG PENYIAPAN PENGGUNAAN KAWASAN HUTAN
                            WILAYAH SUMATERA, JAWA, BALI, NUSA TENGGARA, MALUKU
                            DAN MALUKU UTARA
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Kanan: Subdit Pemantauan */}
                  <div className="flex flex-col items-center w-1/2 pt-6 relative">
                    <div className="absolute top-0 w-px h-6 bg-gray-400"></div>
                    <div className="w-80 bg-[#62A65C] text-white border border-gray-400 p-4 text-center rounded shadow-sm mb-6 z-10">
                      <p className="font-bold text-xs">
                        KEPALA SUBDIREKTORAT PEMANTAUAN
                        <br />
                        KEWAJIBAN DAN PENATAUSAHAAN
                        <br />
                        PENERIMAAN NEGARA BUKAN PAJAK
                        <br />
                        PENGGUNAAN KAWASAN HUTAN
                      </p>
                    </div>

                    {/* Anak-anak dari Subdit Pemantauan */}
                    <div className="flex gap-2 relative pt-4">
                      <div className="absolute top-0 left-[16%] right-[16%] h-px bg-gray-400"></div>

                      <div className="flex flex-col items-center relative pt-4">
                        <div className="absolute top-0 w-px h-4 bg-gray-400"></div>
                        <div className="w-28 bg-[#D7EBD4] border border-gray-400 p-2 text-center rounded text-[9px] font-bold h-full flex items-center justify-center">
                          <p>
                            TIM KERJA BIDANG PEMANTAUAN KEWAJIBAN PERSETUJUAN
                            PENGGUNAAN KAWASAN HUTAN
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-center relative pt-4">
                        <div className="absolute top-0 w-px h-4 bg-gray-400"></div>
                        <div className="w-28 bg-[#D7EBD4] border border-gray-400 p-2 text-center rounded text-[9px] font-bold h-full flex items-center justify-center">
                          <p>
                            TIM KERJA BIDANG PENATAUSAHAAN PENERIMAAN NEGARA
                            BUKAN PAJAK PENGGUNAAN KAWASAN HUTAN
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-center relative pt-4">
                        <div className="absolute top-0 w-px h-4 bg-gray-400"></div>
                        <div className="w-28 bg-[#D7EBD4] border border-gray-400 p-2 text-center rounded text-[9px] font-bold h-full flex items-center justify-center">
                          <p>
                            TIM KERJA BIDANG DATA DAN INFORMASI PENGGUNAAN
                            KAWASAN HUTAN
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- BAGIAN SISTEM INFORMASI TERKAIT --- */}
          <div className="mt-16">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Sistem Informasi Terkait
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Banner 1 */}
              <div className="w-full h-24 md:h-32 bg-gray-200 rounded-lg overflow-hidden border border-gray-200">
                {/* Ganti dengan <img src="..." className="w-full h-full object-cover" /> */}
                <div className="w-full h-full bg-[#E5ECE7] flex items-center justify-center text-sm text-gray-500 italic">
                  (Gambar Banner Jendral Planologi)
                </div>
              </div>

              {/* Banner 2 */}
              <div className="w-full h-24 md:h-32 bg-gray-200 rounded-lg overflow-hidden border border-gray-200">
                {/* Ganti dengan <img src="..." className="w-full h-full object-cover" /> */}
                <div className="w-full h-full bg-[#115C3E] flex items-center px-6 text-white text-sm font-bold">
                  Direktorat Jenderal Planologi
                  <br />
                  Kehutanan dan Tata Lingkungan
                </div>
              </div>

              {/* Banner 3 */}
              <div className="w-full h-24 md:h-32 bg-gray-200 rounded-lg overflow-hidden border border-gray-200">
                {/* Ganti dengan <img src="..." className="w-full h-full object-cover" /> */}
                <div className="w-full h-full bg-[#20DA5F] flex items-center justify-center text-white text-xl font-bold tracking-widest">
                  SIMONTANA
                </div>
              </div>

              {/* Banner 4 */}
              <div className="w-full h-24 md:h-32 bg-gray-200 rounded-lg overflow-hidden border border-gray-200">
                {/* Ganti dengan <img src="..." className="w-full h-full object-cover" /> */}
                <div className="w-full h-full bg-orange-100 flex items-center px-6 text-orange-600 font-bold text-xl">
                  SIGAP KLHK
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
};

export default AboutUs;
