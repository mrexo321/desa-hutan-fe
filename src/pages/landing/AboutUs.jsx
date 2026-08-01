import React, { useState } from "react";
import HomeLayout from "../../components/HomeLayout";
import {
  Award,
  Calendar,
  TrendingUp,
  Target,
  ShieldCheck,
  Database,
  Users,
  Layers,
  BookOpen,
  ChevronRight,
  Info,
  Clock,
  Briefcase,
  X,
  FileText,
  HelpCircle
} from "lucide-react";

const AboutUs = () => {
  const [selectedNode, setSelectedNode] = useState(null);

  // KPIs
  const kpis = [
    {
      id: "01",
      title: "Kemandirian Usaha",
      desc: "Persentase kelompok tani hutan (KTH) yang mengalami peningkatan status kelembagaan dan kemandirian skala usaha.",
      icon: <Users className="text-emerald-600" size={24} />
    },
    {
      id: "02",
      title: "Nilai Tambah Ekonomi",
      desc: "Nilai tambah ekonomi yang dihasilkan dari fasilitasi pemanfaatan Hasil Hutan Bukan Kayu (HHBK) dan ekowisata.",
      icon: <TrendingUp className="text-emerald-600" size={24} />
    },
    {
      id: "03",
      title: "Kemitraan Konservasi",
      desc: "Persentase keberhasilan fasilitasi dan pendampingan kemitraan konservasi serta perhutanan sosial.",
      icon: <Target className="text-emerald-600" size={24} />
    },
    {
      id: "04",
      title: "Pemberdayaan Desa",
      desc: "Persentase desa di sekitar kawasan hutan (termasuk Cagar Biosfer) yang terberdayakan secara sosial dan ekonomi.",
      icon: <Award className="text-emerald-600" size={24} />
    }
  ];

  // Tupoksi (Tugas Pokok & Fungsi)
  const tupoksi = [
    {
      title: "Perumusan Kebijakan",
      desc: "Merumuskan standar dan instrumen kebijakan peningkatan pendapatan masyarakat adat sekitar hutan."
    },
    {
      title: "Fasilitasi Kemitraan",
      desc: "Membangun kerja sama kemitraan konservasi antara kelompok tani hutan (KTH) dengan unit pengelola tapak."
    },
    {
      title: "Penyusunan Rencana Kerja",
      desc: "Penyusunan rencana teknis pengelolaan hasil hutan bukan kayu (HHBK) dan jasa lingkungan berkelanjutan."
    },
    {
      title: "Monitoring & Evaluasi",
      desc: "Melakukan pemantauan real-time perkembangan indeks desa hutan mandiri menggunakan sistem informasi geografis."
    }
  ];

  // Milestones Timeline
  const milestones = [
    {
      year: "2024",
      title: "Permenhut No. 1 / 2024",
      desc: "Pengesahan struktur tata kerja baru Kementerian Kehutanan Republik Indonesia."
    },
    {
      year: "2025",
      title: "Inisiasi Program Desa Hutan",
      desc: "Pendampingan gelombang pertama KTH di 1.200 desa perbatasan hutan."
    },
    {
      year: "2026",
      title: "Digitalisasi Sistem Spasial",
      desc: "Peluncuran geoportal peta interaktif dan modul verifikasi ekspor data."
    }
  ];

  // Systems
  const systems = [
    {
      name: "SIPUHH",
      fullName: "Sistem Informasi Penatausahaan Hasil Hutan",
      desc: "Portal verifikasi dan pelaporan hasil produksi pemanfaatan komoditas kayu dan bukan kayu.",
      themeClass: "bg-[#FDF6E2] text-amber-800 border-amber-200/50 hover:border-amber-400"
    },
    {
      name: "SILK",
      fullName: "Sistem Informasi Legalitas Kelestarian",
      desc: "Layanan sertifikasi untuk kepatuhan kelestarian ekologis produk kehutanan masyarakat.",
      themeClass: "bg-emerald-950 text-white border-emerald-800/40 hover:border-emerald-600"
    },
    {
      name: "SIGAP",
      fullName: "Geoportal Spasial Kehutanan",
      desc: "Pemetaan interaktif tutupan lahan, tata batas kawasan hutan, dan zonasi adat nusantara.",
      themeClass: "bg-[#E6F7F0] text-emerald-800 border-emerald-200/60 hover:border-emerald-400"
    },
    {
      name: "SIPNBP",
      fullName: "Penatausahaan Penerimaan Negara",
      desc: "Sistem administrasi iuran pemanfaatan jasa lingkungan dan kewajiban dana reboisasi.",
      themeClass: "bg-orange-50 text-orange-800 border-orange-200/60 hover:border-orange-400"
    }
  ];

  // Org Chart Node descriptions for Modal
  const nodeDetails = {
    direktur: {
      title: "Direktur Penggunaan Kawasan Hutan",
      role: "Pimpinan Puncak / Pengambil Keputusan",
      desc: "Bertanggung jawab memimpin seluruh pelaksanaan kebijakan, perumusan standardisasi kriteria penggunaan kawasan hutan, penyiapan persetujuan prinsip, serta koordinasi strategis lintas sektoral nasional."
    },
    tu: {
      title: "Kepala Subbagian Tata Usaha",
      role: "Manajemen Administrasi & Keuangan",
      desc: "Mengelola persuratan kedinasan, urusan kepegawaian internal, koordinasi pengadaan perlengkapan, serta pengelolaan anggaran belanja direktorat."
    },
    fungsional: {
      title: "Kelompok Jabatan Fungsional",
      role: "Tim Ahli & Analis Teknis",
      desc: "Bertugas melaksanakan analisis kelayakan ekologis, penelitian dampak penggunaan lahan, perumusan kajian ilmiah kehutanan, serta pendampingan teknis independen."
    },
    subdit_penyiapan: {
      title: "Subdirektorat Penyiapan Penggunaan Kawasan Hutan",
      role: "Pemberian Persetujuan & Standardisasi Rencana",
      desc: "Memproses permohonan persetujuan prinsip baru penggunaan kawasan hutan, melakukan verifikasi kelengkapan berkas administratif, dan menyusun kriteria batas lahan."
    },
    subdit_pemantauan: {
      title: "Subdirektorat Pemantauan Kewajiban & PNBP",
      role: "Pengawasan Izin & Penerimaan Negara",
      desc: "Memantau kepatuhan pemegang izin penggunaan kawasan hutan, melakukan inspeksi berkala di lapangan, serta mengelola penatausahaan iuran Penerimaan Negara Bukan Pajak (PNBP) Kehutanan."
    },
    tim_timur: {
      title: "Tim Kerja Penyiapan Wilayah Timur & Tengah",
      role: "Verifikasi Wilayah Kalimantan, Sulawesi & Papua",
      desc: "Melaksanakan pemeriksaan berkas permohonan secara spasial (overlay peta) maupun verifikasi fisik untuk seluruh kawasan hutan di Kalimantan, Sulawesi, dan kepulauan Papua."
    },
    tim_barat: {
      title: "Tim Kerja Penyiapan Wilayah Barat & Selatan",
      role: "Verifikasi Wilayah Sumatera, Jawa, Nusa Tenggara & Maluku",
      desc: "Melaksanakan pemeriksaan berkas permohonan secara spasial (overlay peta) maupun verifikasi fisik untuk seluruh kawasan hutan di Sumatera, Jawa, Bali, Nusa Tenggara, dan kepulauan Maluku."
    },
    tim_kewajiban: {
      title: "Tim Kerja Pemantauan Kewajiban Persetujuan",
      role: "Evaluasi Komitmen Pemegang Izin",
      desc: "Mengawasi pelaksanaan kewajiban reboisasi, pemeliharaan batas izin, laporan berkala, serta kelestarian ekologis oleh korporasi atau instansi pengguna kawasan hutan."
    },
    tim_pnbp: {
      title: "Tim Kerja Penatausahaan PNBP Penggunaan Hutan",
      role: "Verifikasi Keuangan & Penerimaan Negara",
      desc: "Memastikan akurasi pembayaran iuran penggunaan kawasan hutan (seperti PSDH dan DR) dan mengelola pelaporan berkala keuangan PNBP."
    },
    tim_data: {
      title: "Tim Kerja Data & Informasi Penggunaan Hutan",
      role: "Manajemen Sistem Spasial & SIG",
      desc: "Mengelola server basis data spasial (GIS), mengoperasikan aplikasi Geoserver, serta menyajikan visualisasi data tabular rekapitulasi daerah."
    }
  };

  return (
    <HomeLayout>
      <div className="bg-slate-50/50 font-sans text-slate-800 pb-20">

        {/* HEADER HERO BANNER */}
        <div className="bg-gradient-to-tr from-[#0C2A18] to-[#164E2A] text-white py-20 md:py-28 relative overflow-hidden shadow-lg">
          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-5xl mx-auto px-6 relative z-10 text-center md:text-left">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest bg-emerald-900/40 border border-emerald-700/50 px-3.5 py-1.5 rounded-full inline-block mb-4 leading-none">
              Profil Instansi
            </span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
              TENTANG KAMI
            </h1>
            <p className="text-sm md:text-lg text-emerald-100/80 mt-4 max-w-2xl font-medium leading-relaxed">
              Pusat Pengembangan Sosial Ekonomi Masyarakat Hutan (P2SEMH) Kementerian Kehutanan Republik Indonesia.
            </p>
          </div>
        </div>

        {/* CONTAINER UTAMA */}
        <div className="max-w-5xl mx-auto px-6 mt-12 md:mt-16">

          {/* VISI & PROFIL */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 md:p-12 shadow-[0_15px_40px_rgba(0,0,0,0.015)] mb-12 space-y-6">
            <p className="text-slate-600 text-base md:text-lg leading-relaxed font-medium text-justify">
              <strong>Pusat Pengembangan Sosial Ekonomi Masyarakat Hutan (P2SEMH)</strong> merupakan unit kerja strategis di bawah naungan Kementerian Kehutanan, yang bertugas merumuskan, mengoordinasikan, dan melaksanakan kebijakan serta strategi di bidang fasilitasi dan pengembangan sosial ekonomi masyarakat di dalam maupun sekitar kawasan hutan, sesuai ketentuan peraturan perundang-undangan. Kami berkomitmen penuh dalam mendukung visi Kementerian Kehutanan, yaitu:
            </p>

            <blockquote className="font-bold italic text-slate-800 px-6 py-5 border-l-4 border-emerald-600 bg-emerald-50/50 rounded-r-2xl leading-relaxed text-sm md:text-base font-sans shadow-inner">
              "Mewujudkan entitas tapak yang mengalirkan manfaat ekologi, ekonomi, sosial, dan berkelanjutan guna mendukung pembangunan ekonomi hijau."
            </blockquote>

            <p className="text-slate-600 text-base md:text-lg leading-relaxed font-medium text-justify">
              Sebagai wujud komitmen tersebut, Pusat Pengembangan Sosial Ekonomi Masyarakat Hutan (P2SEMH) memiliki sasaran utama:{" "}
              <strong className="text-slate-800">
                "Mengoptimalkan pengembangan sosial ekonomi masyarakat hutan berbasis pengelolaan sumber daya yang inklusif dan lestari"
              </strong>
              , sehingga pelibatan masyarakat dan pemanfaatan hutan—termasuk di dalamnya pengelolaan Hasil Hutan Bukan Kayu (HHBK) dan jasa lingkungan—dapat memberikan manfaat nyata bagi peningkatan kemandirian ekonomi lokal, kesejahteraan masyarakat tapak, sekaligus menjaga keseimbangan ekologis nasional.
            </p>
          </div>

          {/* TWO COLUMN GRID: TUPOKSI & MILITARY HISTORY TIMELINE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">

            {/* KIRI: Tugas Pokok & Fungsi (Tupoksi) */}
            <div className="lg:col-span-7 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_10px_35px_rgba(0,0,0,0.01)] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center shrink-0">
                    <Briefcase size={18} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">Tugas Pokok &amp; Fungsi</h3>
                </div>

                <div className="space-y-5">
                  {tupoksi.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-start">
                      <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 text-emerald-600 text-xs font-bold font-sans">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-sm mb-1">{item.title}</h4>
                        <p className="text-xs md:text-sm text-slate-500 font-semibold leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* KANAN: Timeline / Milestones */}
            <div className="lg:col-span-5 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_10px_35px_rgba(0,0,0,0.01)] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center shrink-0">
                    <Clock size={18} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">Langkah Strategis</h3>
                </div>

                <div className="relative border-l-2 border-emerald-100 pl-5 ml-2.5 space-y-6">
                  {milestones.map((ms, idx) => (
                    <div key={idx} className="relative">
                      {/* Timeline Dot */}
                      <span className="absolute -left-[29px] top-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white ring-4 ring-emerald-100"></span>

                      <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-md font-mono">
                        {ms.year}
                      </span>
                      <h4 className="font-extrabold text-slate-800 text-sm mt-2 mb-0.5">{ms.title}</h4>
                      <p className="text-[11px] md:text-xs text-slate-500 font-semibold leading-relaxed">{ms.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* INDIKATOR KINERJA UTAMA (KPI) */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center shrink-0">
                <Layers size={18} strokeWidth={2.5} />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-slate-800">
                Indikator Kinerja Utama
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {kpis.map((kpi) => (
                <div key={kpi.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.015)] hover:shadow-md transition-all duration-300 flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                    {kpi.icon}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm mb-1.5 uppercase tracking-wide">
                      {kpi.title}
                    </h4>
                    <p className="text-slate-500 text-xs md:text-sm leading-relaxed font-semibold">
                      {kpi.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-slate-600 text-sm md:text-base leading-relaxed text-justify mb-10 font-semibold">
            Pelaksanaan tugas dan fungsi didukung oleh struktur kelompok kerja yang dinamis. Silakan klik kotak kelompok kerja di bawah untuk membaca wewenang departemen secara terperinci.
          </p>

          {/* BAGAN STRUKTUR ORGANISASI */}
          <div className="relative">
              {/* Swipe Helper Badge on Mobile */}
              <div className="md:hidden flex items-center justify-center gap-1.5 text-[10px] font-bold text-[#2D7344] bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1.5 w-fit mx-auto mb-4 animate-bounce">
                <Info size={12} /> Geser Kanan-Kiri untuk melihat bagan
              </div>

              <div className="bg-white border border-slate-200/60 rounded-[2rem] p-6 md:p-10 overflow-x-auto shadow-sm custom-scrollbar relative">
                {/* Organogram wrapper */}
                <div className="min-w-[850px] flex flex-col items-center py-6 font-sans">

                  {/* Level 1: Direktur */}
                  <div
                    onClick={() => setSelectedNode(nodeDetails.direktur)}
                    className="w-60 bg-amber-100 border-2 border-amber-300/70 hover:border-amber-500 p-4 text-center rounded-2xl shadow-sm z-10 relative cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all group"
                  >
                    <p className="font-extrabold text-xs text-amber-900 tracking-wide leading-relaxed uppercase">
                      DIREKTUR
                      <br />
                      PENGGUNAAN
                      <br />
                      KAWASAN HUTAN
                    </p>
                    <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <HelpCircle size={12} className="text-amber-600" />
                    </div>
                  </div>

                  {/* Vertical Connector */}
                  <div className="w-0.5 h-10 bg-slate-300"></div>

                  {/* Level 2: Tata Usaha & Fungsional */}
                  <div className="flex justify-between w-[640px] relative">
                    {/* Horizontal Connector bar */}
                    <div className="absolute top-0 left-[20%] right-[20%] h-0.5 bg-slate-300"></div>

                    <div className="flex flex-col items-center w-1/2 pt-6 relative">
                      <div className="absolute top-0 w-0.5 h-6 bg-slate-300"></div>
                      <div
                        onClick={() => setSelectedNode(nodeDetails.tu)}
                        className="w-52 bg-white border border-slate-200 hover:border-emerald-500/40 p-3.5 text-center rounded-xl shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all group"
                      >
                        <p className="font-bold text-[10px] md:text-xs text-slate-700 uppercase tracking-wide">
                          KEPALA SUBBAGIAN TATA USAHA
                        </p>
                        <div className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <HelpCircle size={10} className="text-slate-400" />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center w-1/2 pt-6 relative">
                      <div className="absolute top-0 w-0.5 h-6 bg-slate-300"></div>
                      <div
                        onClick={() => setSelectedNode(nodeDetails.fungsional)}
                        className="w-52 bg-amber-50/50 border border-amber-200/60 hover:border-amber-400 p-3.5 text-center rounded-xl shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all group"
                      >
                        <p className="font-bold text-[10px] md:text-xs text-amber-800 uppercase tracking-wide leading-relaxed">
                          KELOMPOK JABATAN
                          <br />
                          FUNGSIONAL
                        </p>
                        <div className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <HelpCircle size={10} className="text-amber-600" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vertical Connector line from center */}
                  <div className="w-0.5 h-10 bg-slate-300 -mt-10"></div>

                  {/* Level 3: Subdirektorat */}
                  <div className="flex justify-between w-full mt-10 relative">
                    {/* Horizontal Connector Line */}
                    <div className="absolute top-0 left-[25%] right-[25%] h-0.5 bg-slate-300"></div>

                    {/* Kiri: Subdit Penyiapan */}
                    <div className="flex flex-col items-center w-1/2 pt-6 relative">
                      <div className="absolute top-0 w-0.5 h-6 bg-slate-300"></div>
                      <div
                        onClick={() => setSelectedNode(nodeDetails.subdit_penyiapan)}
                        className="w-80 bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-600 p-4 text-center rounded-2xl shadow-md mb-6 z-10 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all group"
                      >
                        <p className="font-extrabold text-xs uppercase tracking-wide leading-relaxed">
                          KEPALA SUBDIREKTORAT
                          <br />
                          PENYIAPAN PENGGUNAAN
                          <br />
                          KAWASAN HUTAN
                        </p>
                        <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <HelpCircle size={12} className="text-emerald-300" />
                        </div>
                      </div>

                      {/* Children nodes */}
                      <div className="flex gap-4 relative pt-4">
                        <div className="absolute top-0 left-[23%] right-[23%] h-0.5 bg-slate-300"></div>

                        <div className="flex flex-col items-center relative pt-4">
                          <div className="absolute top-0 w-0.5 h-4 bg-slate-300"></div>
                          <div
                            onClick={() => setSelectedNode(nodeDetails.tim_timur)}
                            className="w-40 bg-emerald-50 border border-emerald-100 hover:border-emerald-400 p-3 text-center rounded-xl text-[9px] font-bold text-emerald-800 leading-relaxed shadow-sm h-full flex items-center justify-center cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
                          >
                            <p>
                              TIM KERJA BIDANG PENYIAPAN PENGGUNAAN KAWASAN HUTAN
                              WILAYAH KALIMANTAN, SULAWESI DAN PAPUA
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-center relative pt-4">
                          <div className="absolute top-0 w-0.5 h-4 bg-slate-300"></div>
                          <div
                            onClick={() => setSelectedNode(nodeDetails.tim_barat)}
                            className="w-40 bg-emerald-50 border border-emerald-100 hover:border-emerald-400 p-3 text-center rounded-xl text-[9px] font-bold text-emerald-800 leading-relaxed shadow-sm h-full flex items-center justify-center cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
                          >
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
                      <div className="absolute top-0 w-0.5 h-6 bg-slate-300"></div>
                      <div
                        onClick={() => setSelectedNode(nodeDetails.subdit_pemantauan)}
                        className="w-80 bg-emerald-800 hover:bg-emerald-700 text-white border border-emerald-700 p-4 text-center rounded-2xl shadow-md mb-6 z-10 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all group"
                      >
                        <p className="font-extrabold text-xs uppercase tracking-wide leading-relaxed">
                          KEPALA SUBDIREKTORAT PEMANTAUAN
                          <br />
                          KEWAJIBAN DAN PENATAUSAHAAN
                          <br />
                          PENERIMAAN NEGARA BUKAN PAJAK
                          <br />
                          PENGGUNAAN KAWASAN HUTAN
                        </p>
                        <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <HelpCircle size={12} className="text-emerald-300" />
                        </div>
                      </div>

                      {/* Children nodes */}
                      <div className="flex gap-2.5 relative pt-4">
                        <div className="absolute top-0 left-[16%] right-[16%] h-0.5 bg-slate-300"></div>

                        <div className="flex flex-col items-center relative pt-4">
                          <div className="absolute top-0 w-0.5 h-4 bg-slate-300"></div>
                          <div
                            onClick={() => setSelectedNode(nodeDetails.tim_kewajiban)}
                            className="w-32 bg-emerald-50/50 border border-emerald-100 hover:border-emerald-400 p-3 text-center rounded-xl text-[9px] font-bold text-emerald-800 leading-relaxed shadow-sm h-full flex items-center justify-center cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
                          >
                            <p>
                              TIM KERJA BIDANG PEMANTAUAN KEWAJIBAN PERSETUJUAN
                              PENGGUNAAN KAWASAN HUTAN
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-center relative pt-4">
                          <div className="absolute top-0 w-0.5 h-4 bg-slate-300"></div>
                          <div
                            onClick={() => setSelectedNode(nodeDetails.tim_pnbp)}
                            className="w-32 bg-emerald-50/50 border border-emerald-100 hover:border-emerald-400 p-3 text-center rounded-xl text-[9px] font-bold text-emerald-800 leading-relaxed shadow-sm h-full flex items-center justify-center cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
                          >
                            <p>
                              TIM KERJA BIDANG PENATAUSAHAAN PENERIMAAN NEGARA
                              BUKAN PAJAK PENGGUNAAN KAWASAN HUTAN
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-center relative pt-4">
                          <div className="absolute top-0 w-0.5 h-4 bg-slate-300"></div>
                          <div
                            onClick={() => setSelectedNode(nodeDetails.tim_data)}
                            className="w-32 bg-emerald-50/50 border border-emerald-100 hover:border-emerald-400 p-3 text-center rounded-xl text-[9px] font-bold text-emerald-800 leading-relaxed shadow-sm h-full flex items-center justify-center cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
                          >
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
            </div>

          {/* SISTEM INFORMASI TERKAIT */}
          {/* <div className="mt-20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center shrink-0">
                <Layers size={18} strokeWidth={2.5} />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-slate-800">
                Sistem Informasi Terkait
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {systems.map((sys) => (
                <div
                  key={sys.name}
                  className={`p-6 rounded-[2rem] border transition-all duration-300 hover:shadow-lg cursor-pointer flex flex-col justify-between ${sys.themeClass}`}
                >
                  <div>
                    <span className="text-lg font-black tracking-wide leading-none">{sys.name}</span>
                    <h5 className="font-extrabold text-xs uppercase tracking-wider mt-1.5 opacity-90">{sys.fullName}</h5>
                    <p className="text-xs leading-relaxed mt-3 opacity-80 font-medium">
                      {sys.desc}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider mt-5 opacity-90 hover:opacity-100">
                    Kunjungi Portal <ChevronRight size={12} />
                  </div>
                </div>
              ))}
            </div>
          </div> */}

        </div>
      </div>

      {/* NODE DETAILS MODAL DIALOG */}
      {selectedNode && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-200/50 animate-in zoom-in-95 duration-200">
            {/* Emerald Accent Bar */}
            <div className="h-1.5 bg-gradient-to-r from-emerald-600 to-[#10B981]" />
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-start gap-4 mb-4">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-md uppercase tracking-wider">
                    {selectedNode.role}
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-800 mt-2 leading-snug">{selectedNode.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 font-sans text-xs md:text-sm text-slate-500 leading-relaxed font-semibold">
                <p className="text-slate-600">{selectedNode.desc}</p>
                <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-2 text-[11px] text-slate-400">
                  <FileText size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Wewenang diatur berlandaskan Peraturan Menteri Kehutanan RI No. 1 Tahun 2024.</span>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setSelectedNode(null)}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-[#2D7344] hover:bg-[#1E5230] rounded-xl transition-colors cursor-pointer"
                >
                  Tutup Rincian
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
  </HomeLayout>
);
};

export default AboutUs;
