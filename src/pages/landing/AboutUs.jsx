import React, { useState } from "react";
import HomeLayout from "../../components/HomeLayout";
import { useQuery } from "@tanstack/react-query";
import { siteSettingService } from "../../services/auth/siteSettingService";
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
  HelpCircle,
  Loader2
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// SAFE PARSERS & HELPERS
// ─────────────────────────────────────────────────────────────
const tryParseJson = (str, fallback) => {
  if (!str) return fallback;
  if (typeof str === "object") return str;
  try {
    const parsed = JSON.parse(str);
    return parsed || fallback;
  } catch {
    return fallback;
  }
};

/**
 * Parsing data list: Mendukung format JSON array, HTML list (dari RichTextEditor),
 * atau baris teks dipisahkan newline.
 */
const parseListItems = (raw, defaultList) => {
  if (!raw) return defaultList;
  if (Array.isArray(raw)) return raw;
  const trimmed = String(raw).trim();

  // Coba parse jika format JSON array
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item) =>
          typeof item === "string" ? { title: item } : item
        );
      }
    } catch {}
  }

  // Jika input dari RichTextEditor mengandung tag <li>
  if (/<li[\s>]/i.test(trimmed)) {
    const items = trimmed
      .match(/<li[^>]*>([\s\S]*?)<\/li>/gi)
      ?.map((li) => li.replace(/<\/?li[^>]*>/gi, "").replace(/<[^>]*>?/gm, "").trim())
      .filter(Boolean);
    if (items && items.length > 0) {
      return items.map((title) => ({ title }));
    }
  }

  // Fallback: baris teks biasa per baris baru
  const lines = trimmed.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length > 0) {
    return lines.map((title) => ({ title }));
  }

  return defaultList;
};

const parseMilestones = (raw, defaultList) => {
  if (!raw) return defaultList;
  if (Array.isArray(raw)) return raw;
  const trimmed = String(raw).trim();
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {}
  }
  return defaultList;
};

const parseMilestoneTarget = (raw, defaultList) => {
  if (!raw) return defaultList;
  if (Array.isArray(raw)) return raw;
  const trimmed = String(raw).trim();
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {}
  }
  return defaultList;
};

// ─────────────────────────────────────────────────────────────
// DEFAULT / FALLBACK DATA
// ─────────────────────────────────────────────────────────────
const DEFAULT_TUPOKSI = [
  {
    title: "Penyusunan kebijakan teknis di bidang perencanaan, formulasi, dan fasilitasi penerapan sosial ekonomi masyarakat hutan",
  },
  {
    title: "Pelaksanaan perencanaan, formulasi, dan fasilitasi penerapan pengembangan sosial ekonomi masyarakat hutan",
  },
  {
    title: "Pelaksanaan pengelolaan laboratorium",
  },
  {
    title: "Pelaksanaan pengelolaan dan pembinaan kawasan hutan dengan tujuan khusus (KHDTK)",
  },
  {
    title: "Pelaksanaan pemantauan, evaluasi, dan pelaporan di bidang pengembangan sosial ekonomi masyarakat hutan, pengelolaan laboratorium serta pengelolaan dan pembinaan kawasan hutan dengan tujuan khusus",
  },
  {
    title: "Pelaksanaan urusan ketatausahaan pusat.",
  }
];

const DEFAULT_MILESTONES = [
  {
    year: "2024",
    title: "Perpes Nomor 175 Tahun 2024 tentang Kementerian Kehutanan",
  },
  {
    year: "2024",
    title: "Permenhut Nomor 1 Tahun 2024 tentang Organisasi dan Tata Kerja Kementerian Kehutanan",
  },
  {
    year: "2026",
    title: "Permenhut Nomor 9 Tahun 2026 tentang Perubahan atas Peraturan Menteri Kehutanan Nomor 1 Tahun 2024 tentang Organisasi dan Tata Kerja Kementerian Kehutanan",
  }
];

const DEFAULT_MILESTONE_TARGET = [
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

const DEFAULT_NODE_DETAILS = {
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

const AboutUs = () => {
  const [selectedNode, setSelectedNode] = useState(null);
  const staleTime = 5 * 60 * 1000;

  // ── Ambil Site Settings Kategori about_us ──
  const { data: aboutArr = [], isLoading } = useQuery({
    queryKey: ["siteSettings", "about_us"],
    queryFn: () => siteSettingService.getByCategory("about_us"),
    staleTime,
  });

  const about = siteSettingService.toMap(aboutArr);

  // Parsing data list dinamis dengan fallback ke data default
  const tupoksi = parseListItems(about.about_tupoksi_items, DEFAULT_TUPOKSI);
  const milestones = parseMilestones(about.about_dasar_hukum_items, DEFAULT_MILESTONES);
  const milestoneTarget = parseMilestoneTarget(about.about_milestone_items, DEFAULT_MILESTONE_TARGET);

  // Parsing rincian modal struktur organisasi
  const orgNodesFromDb = tryParseJson(about.about_org_nodes, null);

  const nodeDetails = {
    direktur: {
      title: about.about_org_direktur_title || orgNodesFromDb?.direktur?.title || DEFAULT_NODE_DETAILS.direktur.title,
      role: about.about_org_direktur_role || orgNodesFromDb?.direktur?.role || DEFAULT_NODE_DETAILS.direktur.role,
      desc: about.about_org_direktur_desc || orgNodesFromDb?.direktur?.desc || DEFAULT_NODE_DETAILS.direktur.desc,
    },
    tu: {
      title: about.about_org_tu_title || orgNodesFromDb?.tu?.title || DEFAULT_NODE_DETAILS.tu.title,
      role: about.about_org_tu_role || orgNodesFromDb?.tu?.role || DEFAULT_NODE_DETAILS.tu.role,
      desc: about.about_org_tu_desc || orgNodesFromDb?.tu?.desc || DEFAULT_NODE_DETAILS.tu.desc,
    },
    subdit_penyiapan: {
      title: about.about_org_perencanaan_title || orgNodesFromDb?.subdit_penyiapan?.title || DEFAULT_NODE_DETAILS.subdit_penyiapan.title,
      role: about.about_org_perencanaan_role || orgNodesFromDb?.subdit_penyiapan?.role || DEFAULT_NODE_DETAILS.subdit_penyiapan.role,
      desc: about.about_org_perencanaan_desc || orgNodesFromDb?.subdit_penyiapan?.desc || DEFAULT_NODE_DETAILS.subdit_penyiapan.desc,
    },
    subdit_pemantauan: {
      title: about.about_org_fasilitasi_title || orgNodesFromDb?.subdit_pemantauan?.title || DEFAULT_NODE_DETAILS.subdit_pemantauan.title,
      role: about.about_org_fasilitasi_role || orgNodesFromDb?.subdit_pemantauan?.role || DEFAULT_NODE_DETAILS.subdit_pemantauan.role,
      desc: about.about_org_fasilitasi_desc || orgNodesFromDb?.subdit_pemantauan?.desc || DEFAULT_NODE_DETAILS.subdit_pemantauan.desc,
    },
    jabatan_fungsional_pelaksana: {
      title: about.about_org_fungsional_title || orgNodesFromDb?.jabatan_fungsional_pelaksana?.title || DEFAULT_NODE_DETAILS.jabatan_fungsional_pelaksana.title,
      role: about.about_org_fungsional_role || orgNodesFromDb?.jabatan_fungsional_pelaksana?.role || DEFAULT_NODE_DETAILS.jabatan_fungsional_pelaksana.role,
      desc: about.about_org_fungsional_desc || orgNodesFromDb?.jabatan_fungsional_pelaksana?.desc || DEFAULT_NODE_DETAILS.jabatan_fungsional_pelaksana.desc,
    },
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
              {about.about_hero_badge || "Profil Instansi"}
            </span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
              {about.about_hero_title || "TENTANG KAMI"}
            </h1>
            <p className="text-sm md:text-lg text-emerald-100/80 mt-4 max-w-2xl font-medium leading-relaxed">
              {about.about_hero_subtitle || "Pusat Pengembangan Sosial Ekonomi Masyarakat Hutan (P2SEMH)."}
            </p>
            <p className="text-xs text-emerald-100/80 mt-0 max-w-2xl font-medium leading-relaxed">
              {about.about_hero_institution || "Kementerian Kehutanan"}
            </p>
          </div>
        </div>

        {/* CONTAINER UTAMA */}
        <div className="max-w-5xl mx-auto px-6 mt-12 md:mt-16">

          {/* VISI & PROFIL */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 md:p-12 shadow-[0_15px_40px_rgba(0,0,0,0.015)] mb-12 space-y-6">
            {about.about_profil_content ? (
              <div
                className="text-slate-600 text-base md:text-lg leading-relaxed font-medium text-justify space-y-4 [&_p]:mb-4 last:[&_p]:mb-0 [&_strong]:text-slate-800 [&_strong]:font-bold [&_blockquote]:font-bold [&_blockquote]:italic [&_blockquote]:text-slate-800 [&_blockquote]:px-6 [&_blockquote]:py-5 [&_blockquote]:border-l-4 [&_blockquote]:border-emerald-600 [&_blockquote]:bg-emerald-50/50 [&_blockquote]:rounded-r-2xl [&_blockquote]:shadow-inner"
                dangerouslySetInnerHTML={{ __html: about.about_profil_content }}
              />
            ) : (
              <>
                <p className="text-slate-600 text-base md:text-lg leading-relaxed font-medium text-justify">
                  {about.about_profil_p1 ? (
                    <span dangerouslySetInnerHTML={{ __html: about.about_profil_p1 }} />
                  ) : (
                    <>
                      <strong>Pusat Pengembangan Sosial Ekonomi Masyarakat Hutan (P2SEMH)</strong> merupakan unit kerja strategis di bawah naungan Kementerian Kehutanan, yang mempunyai tugas melaksanakan pengembangan sosial ekonomi masyarakat hutan. P2SEMH berkomitmen penuh dalam mendukung visi Kementerian Kehutanan, yaitu “Entitas Tapak Hutan yang Mengalirkan Manfaat Ekologi, Ekonomi, Sosial dalam mewujudkan Indonesia Maju Menuju Indonesia Emas 2045”. <br />
                      P2SEMH mendukung salah satu tujuan Kementerian Kehutanan yang dituangkan dalam Rencana Strategis 2025-2029, yaitu:
                    </>
                  )}
                </p>

                <blockquote className="font-bold italic text-slate-800 px-6 py-5 border-l-4 border-emerald-600 bg-emerald-50/50 rounded-r-2xl leading-relaxed text-sm md:text-base font-sans shadow-inner">
                  {about.about_profil_quote || '"“Meningkatkan peran hutan untuk peningkatan kemajuan dan kemandirian desa sekitar kawasan hutan”'}
                </blockquote>

                <p className="text-slate-600 text-base md:text-lg leading-relaxed font-medium text-justify">
                  {about.about_profil_p2 ? (
                    <span dangerouslySetInnerHTML={{ __html: about.about_profil_p2 }} />
                  ) : (
                    <>
                      Sebagai wujud komitmen tersebut, sasaran kegiatan P2SEMH yaitu “Pengembangan Sosial Ekonomi Masyarakat Sekitar Hutan” dengan indikator kinerja kegiatan (IKK) yaitu{" "}
                      <strong className="text-slate-800">
                        "Efektivitas Penerapan Kebijakan Teknis untuk Pengembangan Sosial Ekonomi Masyarakat Hutan termasuk Cadangan Pangan, Energi, dan Peningkatan Kemandirian Desa"
                      </strong>
                    </>
                  )}
                </p>
              </>
            )}
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
                  <h3 className="text-lg font-bold text-slate-800">
                    {about.about_tupoksi_title || "Fungsi P2SEMH"}
                  </h3>
                </div>

                <div className="space-y-5">
                  {tupoksi.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-start">
                      <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 text-emerald-600 text-xs font-bold font-sans">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-sm mb-1">{item.title}</h4>
                        {item.desc && (
                          <p className="text-xs md:text-sm text-slate-500 font-semibold leading-relaxed">{item.desc}</p>
                        )}
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
                  <h3 className="text-lg font-bold text-slate-800">
                    {about.about_dasar_hukum_title || "Dasar Hukum"}
                  </h3>
                </div>

                <div className="relative border-l-2 border-emerald-100 pl-5 ml-2.5 space-y-6">
                  {milestones.map((ms, idx) => (
                    <div key={idx} className="relative">
                      {/* Timeline Dot */}
                      <span className="absolute -left-[29px] top-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white ring-4 ring-emerald-100"></span>

                      {ms.year && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-md font-mono">
                          {ms.year}
                        </span>
                      )}
                      <h4 className="font-extrabold text-slate-800 text-sm mt-2 mb-0.5">{ms.title}</h4>
                      {ms.desc && (
                        <p className="text-[11px] md:text-xs text-slate-500 font-semibold leading-relaxed">{ms.desc}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* MILESTONE SECTION */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center shrink-0">
                <Calendar size={18} strokeWidth={2.5} />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-slate-800">
                {about.about_milestone_title ||
                  "Tolok Ukur Pencapaian (Milestone) Pengembangan Sosial Ekonomi Masyarakat Hutan termasuk Cadangan Pangan, Energi, dan Peningkatan Kemandirian Desa"}
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
            {about.about_struktur_desc ||
              "Pelaksanaan tugas dan fungsi didukung oleh struktur kelompok kerja yang dinamis. Silakan klik kotak kelompok kerja di bawah untuk membaca wewenang departemen secara terperinci."}
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
                  <p className="font-extrabold text-xs text-amber-900 tracking-wide leading-relaxed uppercase whitespace-pre-line">
                    {about.about_org_direktur_label || (
                      <>
                        PUSAT PENGEMBANGAN
                        <br />
                        SOSIAL EKONOMI
                        <br />
                        MASYARAKAT HUTAN
                      </>
                    )}
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
                        {about.about_org_tu_label || "SUBBAGIAN TATA USAHA"}
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
                      <p className="font-extrabold text-xs uppercase tracking-wide leading-relaxed whitespace-pre-line">
                        {about.about_org_perencanaan_label || (
                          <>
                            BIDANG PERENCANAAN DAN
                            <br />
                            FORMULASI PEGEMBANGAN
                            <br />
                            SOSIAL EKONOMI
                            <br />
                            MASYARAKAT HUTAN
                          </>
                        )}
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
                      <p className="font-extrabold text-xs uppercase tracking-wide leading-relaxed whitespace-pre-line">
                        {about.about_org_fasilitasi_label || (
                          <>
                            BIDANG FASILITASI
                            <br />
                            PENERAPAN PENGEMBANGAN
                            <br />
                            SOSIAL EKONOMI
                            <br />
                            MASYARAKAT HUTAN
                          </>
                        )}
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
                    <p className="uppercase tracking-wide whitespace-pre-line">
                      {about.about_org_fungsional_label || (
                        <>
                          JABATAN FUNGSIONAL DAN
                          <br />
                          JABATAN PELAKSANA
                        </>
                      )}
                    </p>
                    <div className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <HelpCircle size={10} className="text-emerald-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

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
