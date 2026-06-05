import { useCallback } from "react";
import { useSelector } from "react-redux";

export const usePermission = () => {
  // Baca data permission dari Redux state (sumber of truth)
  const userPermissions = useSelector(
    (state) => state.user?.permissions || []
  );
  const userRoles = useSelector(
    (state) => state.user?.roles || []
  );

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
