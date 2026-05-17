import { useCallback } from "react";

export const usePermission = () => {
  const authDataString = localStorage.getItem("user");
  const authData = authDataString ? JSON.parse(authDataString) : null;

  // PERBAIKAN DI SINI: Langsung akses authData.permissions dan authData.roles
  // (Tetap menggunakan fallback .user untuk berjaga-jaga jika format API terkadang berbeda)
  const userPermissions =
    authData?.permissions || authData?.user?.permissions || [];
  const userRoles = authData?.roles || authData?.user?.roles || [];

  const isSuperadmin = userRoles.includes("superadmin");

  const can = useCallback(
    (action) => {
      if (isSuperadmin) return true;
      return userPermissions.includes(action);
    },
    [userPermissions, isSuperadmin],
  );

  const canAny = useCallback(
    (actionsArray) => {
      if (isSuperadmin) return true;
      return actionsArray.some((action) => userPermissions.includes(action));
    },
    [userPermissions, isSuperadmin],
  );

  return { can, canAny };
};
