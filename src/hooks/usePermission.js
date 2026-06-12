import { useCallback, useMemo } from "react";
import { useSelector } from "react-redux";

const normalizeList = (value) => {
  const source = Array.isArray(value) ? value : value ? [value] : [];

  return [
    ...new Set(
      source
        .flatMap((item) => {
          if (Array.isArray(item)) return normalizeList(item);

          if (typeof item === "string" || typeof item === "number") {
            return String(item);
          }

          if (!item || typeof item !== "object") return [];

          const direct =
            item.name ??
            item.nama ??
            item.code ??
            item.kode ??
            item.slug ??
            item.value ??
            item.role?.name ??
            item.role?.nama ??
            item.permission?.name ??
            item.permission?.nama ??
            item.permission?.code ??
            item.permission?.kode;

          return direct ? String(direct) : [];
        })
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
};

const normalizeKey = (value) => String(value || "").trim();

export const usePermission = () => {
  const roles = useSelector((state) => state.user?.roles || []);
  const permissions = useSelector((state) => state.user?.permissions || []);

  const userRoles = useMemo(() => normalizeList(roles), [roles]);
  const userPermissions = useMemo(
    () => normalizeList(permissions),
    [permissions],
  );

  const permissionSet = useMemo(
    () => new Set(userPermissions.map(normalizeKey)),
    [userPermissions],
  );

  const isSuperadmin = useMemo(
    () =>
      userRoles.some((role) =>
        ["superadmin", "super admin", "super-admin"].includes(
          role.toLowerCase(),
        ),
      ),
    [userRoles],
  );

  // =========================================================
  // VARIABEL 1: `can`
  // Untuk mengecek 1 aksi spesifik. (Contoh: can('role:create'))
  // =========================================================
  const can = useCallback(
    (action) => {
      if (isSuperadmin) return true;
      if (!action) return true;
      return permissionSet.has(normalizeKey(action));
    },
    [permissionSet, isSuperadmin],
  );

  // =========================================================
  // VARIABEL 2: `canAny`
  // Untuk mengecek apakah user punya minimal 1 dari beberapa aksi.
  // (Contoh: canAny(['role:update', 'role:delete']))
  // =========================================================
  const canAny = useCallback(
    (actionsArray) => {
      if (isSuperadmin) return true;
      const actions = Array.isArray(actionsArray) ? actionsArray : [actionsArray];
      return actions.some((action) => permissionSet.has(normalizeKey(action)));
    },
    [permissionSet, isSuperadmin],
  );

  // Ekspor agar bisa digunakan secara global
  return { can, canAny, isSuperadmin, userPermissions, userRoles };
};
