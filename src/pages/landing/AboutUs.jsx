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
      title: "Penyusunan kebijakan teknis di bidang perencanaan, formulasi, dan fasilitasi penerapan sosial ekonomi masyarakat hutan",
      // desc: "Merumuskan standar dan instrumen kebijakan peningkatan pendapatan masyarakat adat sekitar hutan."
    },
    {
      title: "Pelaksanaan perencanaan, formulasi, dan fasilitasi penerapan pengembangan sosial ekonomi masyarakat hutan",
      // desc: "Membangun kerja sama kemitraan konservasi antara kelompok tani hutan (KTH) dengan unit pengelola tapak."
    },
    {
      title: "Pelaksanaan pengelolaan laboratorium",
      // desc: "Penyusunan rencana teknis pengelolaan hasil hutan bukan kayu (HHBK) dan jasa lingkungan berkelanjutan."
    },
    {
      title: "Pelaksanaan pengelolaan dan pembinaan kawasan hutan dengan tujuan khusus (KHDTK)",
      // desc: "Melakukan pemantauan real-time perkembangan indeks desa hutan mandiri menggunakan sistem informasi geografis."
    },
    {
      title: "Pelaksanaan pemantauan, evaluasi, dan pelaporan di bidang pengembangan sosial ekonomi masyarakat hutan, pengelolaan laboratorium serta pengelolaan dan pembinaan kawasan hutan dengan tujuan khusus"
    },
    {
      title: "Pelaksanaan urusan ketatausahaan pusat."
    }
  ];

  // Milestones Timeline
  const milestones = [
    {
      // year: "2024",
      title: "Perpes Nomor 175 Tahun 2024 tentang Kementerian Kehutanan",
      // desc: "Pengesahan struktur tata kerja baru Kementerian Kehutanan Republik Indonesia."
    },
    {
      // year: "2025",
      title: "Permenhut Nomor 1 Tahun 2024 tentang Organisasi dan Tata Kerja Kementerian Kehutanan",
      // desc: "Pendampingan gelombang pertama KTH di 1.200 desa perbatasan hutan."
    },
    {
      // year: "2026",
      title: "Permenhut Nomor 9 Tahun 2026 tentang Perubahan atas Peraturan Menteri Kehutanan Nomor 1 Tahun 2024 tentang Organisasi dan Tata Kerja Kementerian Kehutanan",
      // desc: "Peluncuran geoportal peta interaktif dan modul verifikasi ekspor data."
    }
  ];

  // Milestone 2025 - 2029
  const milestoneTarget = [
    {
      year: "2025",
      desc: "Pengembangan penerapan kebijakan pengembangan sosial ekonomi masyarakat hutan untuk ketahanan pangan, energi dan kemandirian desa dengan tahapan yaitu identifikasi kebutuhan kebijakan teknis, dialog kerja, penyiapan enabling, penerapan kebijakan."
    },
    {
      year: "2026",
      desc: "Penguatan efektivitas penerapan kebijakan pengembangan sosial ekonomi masyarakat hutan dengan tahapan yaitu sosialisasi, pendampingan, peningkatan kapasitas, untuk mendorong peran aktif masyarakat hutan."
    },
    {
      year: "2027",
      desc: "Peningkatan kemandirian desa di dalam dan sekitar kawasan hutan, didorong dan diintervensi dengan kebijakan teknis sosial ekonomi masyarakat sekitar hutan serta peningkatan kelembagaan masyarakat hutan dengan tahapan meningkatnya indeks kemandirian desa yang mendapat intervensi program kehutanan."
    },
    {
      year: "2028",
      desc: "Pemerataan intervensi kebijakan dan direplikasikan ke wilayah lain yang belum diintervensi dengan tahapan kebijakan teknis direplikasi di daerah lain yang belum diintervensi, dan meningkatnya kemajuan dan kemandirian desa yang dapat mendorong ketercapaian."
    },
    {
      year: "2029",
      desc: "Tercapai peningkatan kemandirian desa yang berkelanjutan dengan tahapan kontribusi kelompok masyarakat hutan terhadap peningkatan dan pemerataan kesejahteraan masyarakat sekitar hutan."
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
      title: "Pusat Pengembangan Sosial Ekonomi Masyarakat Hutan",
      role: "Pimpinan Puncak / Pengambil Keputusan",
      desc: "Bertanggung jawab memimpin seluruh pelaksanaan kebijakan teknis, koordinasi perumusan strategi, serta penerapan pengembangan sosial ekonomi masyarakat hutan."
    },
    tu: {
      title: "Subbagian Tata Usaha",
      role: "Manajemen Administrasi & Keuangan",
      desc: "Melakukan pelaksanaan urusan administrasi sumber daya manusia, administrasi keuangan, administrasi barang milik negara, tata persuratan, kearsipan, kerumahtanggaan, koordinasi data dan informasi, penyiapan bahan penyusunan rencana, program, anggaran, serta koordinasi administrasi penerapan sistem pengendalian intern pusat."
    },
    subdit_penyiapan: {
      title: "Bidang Perencanaan dan Formulasi Pengembangan Sosial Ekonomi Masyarakat Hutan",
      role: "Perencanaan & Kebijakan Teknis",
      desc: "Melaksanakan penyiapan penyusunan kebijakan teknis dan pelaksanaan di bidang perencanaan dan formulasi pengembangan sosial ekonomi masyarakat hutan."
    },
    subdit_pemantauan: {
      title: "Bidang Fasilitasi Penerapan Pengembangan Sosial Ekonomi Masyarakat Hutan",
      role: "Fasilitasi & Pelaksanaan Teknis",
      desc: "Melaksanakan penyiapan penyusunan kebijakan teknis dan pelaksanaan di bidang fasilitasi penerapan masyarakat hutan pengembangan sosial ekonomi pengelolaan laboratorium serta pengelolaan dan pembinaan kawasan hutan dengan tujuan khusus."
    },
    jabatan_fungsional_pelaksana: {
      title: "Jabatan Fungsional dan Jabatan Pelaksana",
      role: "Pelayanan Fungsional & Analis Teknis",
      desc: "Jabatan fungsional mempunyai tugas memberikan pelayanan fungsional dalam pelaksanaan tugas dan fungsi Jabatan pimpinan tinggi pratama sesuai dengan bidang keahlian dan keterampilan."
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
              Pusat Pengembangan Sosial Ekonomi Masyarakat Hutan (P2SEMH).
            </p>
            <p className="text-xs text-emerald-100/80 mt-0 max-w-2xl font-medium leading-relaxed">Kementerian Kehutanan</p>
          </div>
        </div>

        {/* CONTAINER UTAMA */}
        <div className="max-w-5xl mx-auto px-6 mt-12 md:mt-16">

          {/* VISI & PROFIL */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 md:p-12 shadow-[0_15px_40px_rgba(0,0,0,0.015)] mb-12 space-y-6">
            <p className="text-slate-600 text-base md:text-lg leading-relaxed font-medium text-justify">
              <strong>Pusat Pengembangan Sosial Ekonomi Masyarakat Hutan (P2SEMH)</strong> merupakan unit kerja strategis di bawah naungan Kementerian Kehutanan, yang mempunyai tugas melaksanakan pengembangan sosial ekonomi masyarakat hutan. P2SEMH berkomitmen penuh dalam mendukung visi Kementerian Kehutanan, yaitu “Entitas Tapak Hutan yang Mengalirkan Manfaat Ekologi, Ekonomi, Sosial dalam mewujudkan Indonesia Maju Menuju Indonesia Emas 2045”. <br />
              P2SEMH mendukung salah satu tujuan Kementerian Kehutanan yang dituangkan dalam Rencana Strategis 2025-2029, yaitu:
            </p>

            <blockquote className="font-bold italic text-slate-800 px-6 py-5 border-l-4 border-emerald-600 bg-emerald-50/50 rounded-r-2xl leading-relaxed text-sm md:text-base font-sans shadow-inner">
              "“Meningkatkan peran hutan untuk peningkatan kemajuan dan kemandirian desa sekitar kawasan hutan”
            </blockquote>

            <p className="text-slate-600 text-base md:text-lg leading-relaxed font-medium text-justify">
              Sebagai wujud komitmen tersebut, sasaran kegiatan P2SEMH yaitu “Pengembangan Sosial Ekonomi Masyarakat Sekitar Hutan” dengan indikator kinerja kegiatan (IKK) yaitu{" "}
              <strong className="text-slate-800">
                "Efektivitas Penerapan Kebijakan Teknis untuk Pengembangan Sosial Ekonomi Masyarakat Hutan termasuk Cadangan Pangan, Energi, dan Peningkatan Kemandirian Desa"
              </strong>
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
                  <h3 className="text-lg font-bold text-slate-800">Fungsi P2SEMH</h3>
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
                  <h3 className="text-lg font-bold text-slate-800">Dasar Hukum</h3>
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
          {/* <div className="mb-16">
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
          </div> */}

          {/* MILESTONE SECTION */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center shrink-0">
                <Calendar size={18} strokeWidth={2.5} />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-slate-800">
                Tolok Ukur Pencapaian (Milestone) Pengembangan Sosial Ekonomi Masyarakat Hutan termasuk Cadangan Pangan, Energi, dan Peningkatan Kemandirian Desa
              </h3>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.015)]">
              <div className="relative border-l-2 border-emerald-200/80 ml-3 md:ml-5 pl-6 md:pl-8 space-y-6">
                {milestoneTarget.map((item, index) => (
                  <div key={index} className="relative group">
                    {/* Timeline Node */}
                    <div className="absolute -left-[37px] md:-left-[45px] top-0 w-8 h-8 md:w-9 md:h-9 bg-emerald-600 text-white font-extrabold text-xs rounded-full border-4 border-white shadow-md flex items-center justify-center group-hover:scale-110 transition-transform">
                      {index + 1}
                    </div>

                    <div className="bg-slate-50/70 hover:bg-emerald-50/40 p-5 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-extrabold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-mono">
                          Tahun {item.year}
                        </span>
                      </div>
                      <p className="text-slate-600 text-xs md:text-sm leading-relaxed font-medium text-justify">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
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

                {/* Level 1: Pusat */}
                <div
                  onClick={() => setSelectedNode(nodeDetails.direktur)}
                  className="w-64 bg-amber-100 border-2 border-amber-300/70 hover:border-amber-500 p-4 text-center rounded-2xl shadow-sm z-20 relative cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all group"
                >
                  <p className="font-extrabold text-xs text-amber-900 tracking-wide leading-relaxed uppercase">
                    PUSAT PENGEMBANGAN
                    <br />
                    SOSIAL EKONOMI
                    <br />
                    MASYARAKAT HUTAN
                  </p>
                  <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <HelpCircle size={12} className="text-amber-600" />
                  </div>
                </div>

                {/* Vertical Trunk Line to Level 2 */}
                <div className="w-0.5 h-8 bg-slate-300 z-0"></div>

                {/* Level 2: Subbagian Tata Usaha (Di Taruh di Kanan) */}
                <div className="w-[640px] flex justify-end relative items-center py-2 z-10">
                  {/* Continuous Center Vertical Line */}
                  <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-slate-300 z-0"></div>

                  {/* Horizontal Branch to Subbagian Tata Usaha */}
                  <div className="absolute top-1/2 left-[50%] right-[25%] h-0.5 bg-slate-300 z-0"></div>

                  {/* Subbagian Tata Usaha Node */}
                  <div className="w-1/2 flex justify-center relative z-20">
                    <div
                      onClick={() => setSelectedNode(nodeDetails.tu)}
                      className="w-52 bg-white border border-slate-200 hover:border-emerald-500/40 p-3.5 text-center rounded-xl shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all group z-20 relative"
                    >
                      <p className="font-bold text-[10px] md:text-xs text-slate-700 uppercase tracking-wide">
                        SUBBAGIAN TATA USAHA
                      </p>
                      <div className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <HelpCircle size={10} className="text-slate-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vertical Trunk Line to Level 3 */}
                <div className="w-0.5 h-8 bg-slate-300 z-0"></div>

                {/* Level 3: Bidang Perencanaan & Bidang Fasilitasi */}
                <div className="flex justify-between w-full relative pt-6 pb-2 z-10">
                  {/* Horizontal Connector Line for the 2 Bidang */}
                  <div className="absolute top-0 left-[25%] right-[25%] h-0.5 bg-slate-300 z-0"></div>

                  {/* Continuous Center Vertical Line through Level 3 */}
                  <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-slate-300 z-0"></div>

                  {/* Kiri: Bidang Perencanaan */}
                  <div className="flex flex-col items-center w-1/2 relative z-20">
                    <div className="absolute top-0 w-0.5 h-6 bg-slate-300 z-0"></div>
                    <div
                      onClick={() => setSelectedNode(nodeDetails.subdit_penyiapan)}
                      className="w-80 bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-600 p-4 text-center rounded-2xl shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all group z-20 relative"
                    >
                      <p className="font-extrabold text-xs uppercase tracking-wide leading-relaxed">
                        BIDANG PERENCANAAN DAN
                        <br />
                        FORMULASI PEGEMBANGAN
                        <br />
                        SOSIAL EKONOMI
                        <br />
                        MASYARAKAT HUTAN
                      </p>
                      <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <HelpCircle size={12} className="text-emerald-300" />
                      </div>
                    </div>
                  </div>

                  {/* Kanan: Bidang Fasilitasi */}
                  <div className="flex flex-col items-center w-1/2 relative z-20">
                    <div className="absolute top-0 w-0.5 h-6 bg-slate-300 z-0"></div>
                    <div
                      onClick={() => setSelectedNode(nodeDetails.subdit_pemantauan)}
                      className="w-80 bg-emerald-800 hover:bg-emerald-700 text-white border border-emerald-700 p-4 text-center rounded-2xl shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all group z-20 relative"
                    >
                      <p className="font-extrabold text-xs uppercase tracking-wide leading-relaxed">
                        BIDANG FASILITASI
                        <br />
                        PENERAPAN PENGEMBANGAN
                        <br />
                        SOSIAL EKONOMI
                        <br />
                        MASYARAKAT HUTAN
                      </p>
                      <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <HelpCircle size={12} className="text-emerald-300" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vertical Trunk Line to Level 4 */}
                <div className="w-0.5 h-8 bg-slate-300 z-0"></div>

                {/* Level 4: Jabatan Fungsional dan Jabatan Pelaksana */}
                <div className="flex justify-center w-full relative z-20">
                  <div
                    onClick={() => setSelectedNode(nodeDetails.jabatan_fungsional_pelaksana)}
                    className="w-72 bg-emerald-50 border-2 border-emerald-200 hover:border-emerald-400 p-3.5 text-center rounded-xl text-[10px] md:text-xs font-bold text-emerald-900 leading-relaxed shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all group relative z-20"
                  >
                    <p className="uppercase tracking-wide">
                      JABATAN FUNGSIONAL DAN
                      <br />
                      JABATAN PELAKSANA
                    </p>
                    <div className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <HelpCircle size={10} className="text-emerald-600" />
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
                {/* <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-2 text-[11px] text-slate-400">
                  <FileText size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Wewenang diatur berlandaskan Peraturan Menteri Kehutanan RI No. 1 Tahun 2024.</span>
                </div> */}
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
