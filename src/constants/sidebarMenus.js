import {
  LayoutDashboard,
  Trees,
  LineChart,
  Sprout,
  Target,
  Calculator,
  Layers,
  Map,
  Users,
  ShieldCheck,
  MapPinned,
  Database,
} from "lucide-react";

export const homeMenus = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    // Dashboard biasanya dapat diakses oleh semua user yang login,
    // jadi kita kosongkan agar tidak difilter.
    permission: "",
  },
  {
    name: "Desa Hutan",
    path: "/dashboard/desa-hutan",
    icon: Trees,
    permission: "wilayah_desa:read",
  },
  {
    name: "Performa Desa",
    path: "/dashboard/performa-desa",
    icon: LineChart,
    permission: "performa_desa_hutan:read",
  },
  {
    name: "Potensi Desa",
    path: "/dashboard/potensi-desa",
    icon: Sprout,
    permission: "analisis_spasial:read", // Memakai ini karena erat kaitannya dengan potensi spasial
  },
];

export const metadataMenus = [
  {
    name: "Indikator",
    path: "/dashboard/indikator",
    icon: Target,
    permission: "master_indikator_utama:read",
  },
  {
    name: "Tahun Indikator Perhitungan",
    path: "/dashboard/tahun-indikator-perhitungan",
    icon: Calculator,
    permission: "master_tahun_indikator:read",
  },
  {
    name: "Klasifikasi",
    path: "/dashboard/klasifikasi",
    icon: Layers,
    permission: "master_klasifikasi_desa:read",
  },
  {
    name: "Wilayah",
    path: "/dashboard/wilayah",
    icon: Map,
    permission: "wilayah_hutan:read",
  },
  {
    name: "Manajemen User",
    path: "/dashboard/manajemen-user",
    icon: Users,
    permission: "user:read",
  },
  {
    name: "Manajemen Role",
    path: "/dashboard/manajemen-role",
    icon: ShieldCheck,
    permission: "role:read",
  },
  {
    name: "Master Wilayah",
    path: "/dashboard/master-wilayah",
    icon: MapPinned,
    permission: "master_provinsi:read",
  },
  {
    name: "Master Potensi",
    path: "/dashboard/master-potensi",
    icon: Database,
    permission: "master_fungsi_kawasan_hutan:read",
  },
];
