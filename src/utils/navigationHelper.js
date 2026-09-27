import {
  homeMenus,
  calculationMenus,
  metadataMenus,
} from "../constants/sidebarMenus";

export const allAccessibleMenus = [
  ...homeMenus,
  ...calculationMenus,
  ...metadataMenus,
];

/**
 * Mendapatkan route default yang dapat diakses oleh user berdasarkan permissions & roles.
 * @param {string[]} permissions - Array of permission strings (misal: ["ai:view", "desa_psn:view"])
 * @param {string[]} roles - Array of role strings (misal: ["superadmin"])
 * @returns {{ path: string, name: string }} Objek route default dengan path dan nama menu
 */
export const getDefaultAccessibleRoute = (permissions = [], roles = []) => {
  const isSuperadmin = Array.isArray(roles) && roles.includes("superadmin");

  // Jika superadmin, dashboard utama selalu menjadi default
  if (isSuperadmin) {
    return { path: "/dashboard", name: "Dashboard" };
  }

  const userPerms = Array.isArray(permissions) ? permissions : [];

  // Jika user memiliki izin dashboard:view, arahkan ke /dashboard
  if (userPerms.includes("dashboard:view")) {
    return { path: "/dashboard", name: "Dashboard" };
  }

  // Cari menu pertama yang diizinkan sesuai urutan di sidebar
  const firstAccessible = allAccessibleMenus.find(
    (menu) => menu.permission && userPerms.includes(menu.permission)
  );

  if (firstAccessible) {
    return { path: firstAccessible.path, name: firstAccessible.name };
  }

  // Fallback jika tidak memiliki izin ke menu dashboard apapun
  return { path: "/", name: "Beranda" };
};
