import {
  LayoutDashboard,
  Trees,
  LineChart,
  Target,
  Calculator,
  Layers,
  Map,
  Users,
  ShieldCheck,
  MapPinned,
  Database,
  BrainCircuit,
  FileSpreadsheet,
  ClipboardList,
  Settings2,
} from "lucide-react";

export const homeMenus = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    permission: "dashboard:view",
  },
  {
    name: "Desa PSN",
    path: "/dashboard/desa-psn",
    icon: Layers,
    permission: "desa_psn:view",
  },
  {
    name: "Permintaan Data",
    path: "/dashboard/permintaan-data",
    icon: FileSpreadsheet,
    permission: "permintaan_data:view",
  },
];

export const calculationMenus = [
  {
    name: "Indikator",
    path: "/dashboard/indikator",
    icon: Target,
    permission: "indikator:view",
  },
  {
    name: "Rumus Indeks",
    path: "/dashboard/tahun-indikator-perhitungan",
    icon: Calculator,
    permission: "master_tahun_indikator_perhitungan:view",
  },
  {
    name: "Perhitungan Indeks",
    path: "/dashboard/performa-desa",
    icon: LineChart,
    permission: "performa_desa:view",
  },
  {
    name: "Indeks Desa Hutan",
    path: "/dashboard/desa-hutan",
    icon: Trees,
    permission: "performa_desa_hutan:view",
  },
];

export const metadataMenus = [
  {
    name: "Klasifikasi",
    path: "/dashboard/klasifikasi",
    icon: Layers,
    permission: "master_klasifikasi:view",
  },
  {
    name: "Wilayah",
    path: "/dashboard/wilayah",
    icon: Map,
    permission: "wilayah:view",
  },
  {
    name: "Wilayah Administrasi",
    path: "/dashboard/master-wilayah",
    icon: MapPinned,
    permission: "wilayah_administrasi:view",
  },
  {
    name: "Master Potensi",
    path: "/dashboard/master-potensi",
    icon: Database,
    permission: "potensi:view",
  },
  {
    name: "Master Intervensi Desa",
    path: "/dashboard/master-intervensi-desa",
    icon: ClipboardList,
    permission: "intervensi_desa:view",
  },
  {
    name: "Manajemen User",
    path: "/dashboard/manajemen-user",
    icon: Users,
    permission: "user:view",
  },
  {
    name: "Manajemen Role",
    path: "/dashboard/manajemen-role",
    icon: ShieldCheck,
    permission: "role:view",
  },
  {
    name: "Site Settings",
    path: "/dashboard/site-settings",
    icon: Settings2,
    permission: "site:view",
  },
  {
    name: "AI Asisten",
    path: "/dashboard/ai-asisten",
    icon: BrainCircuit,
    permission: "ai:view",
    isNew: true,
  },
];
