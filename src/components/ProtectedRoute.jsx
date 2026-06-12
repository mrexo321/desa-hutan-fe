import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { usePermission } from "../hooks/usePermission";
import { toast } from "sonner";

// Parameter 'allowedPermissions' ini adalah ARRAY yang dimaksud temanmu
const ProtectedRoute = ({ children, allowedPermissions }) => {
  const { canAny } = usePermission();
  const user = useSelector((state) => state.user);
  const requiredPermissions = Array.isArray(allowedPermissions)
    ? allowedPermissions
    : [];
  const isLoggedIn = Boolean(
    user?.accessToken || user?.refreshToken || user?.username || user?.id || user?.userId,
  );
  const isAllowed =
    requiredPermissions.length === 0 || canAny(requiredPermissions);

  useEffect(() => {
    if (isLoggedIn && !isAllowed) {
      toast.error(
        "Akses Ditolak: Anda tidak memiliki izin untuk membuka halaman ini.",
      );
    }
  }, [isLoggedIn, isAllowed]);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (!isAllowed) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
