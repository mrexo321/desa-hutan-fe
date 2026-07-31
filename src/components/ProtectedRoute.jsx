import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { usePermission } from "../hooks/usePermission";
import { toast } from "sonner";

const hasStoredProfile = () => {
  try {
    return Boolean(localStorage.getItem("user_profile"));
  } catch {
    return false;
  }
};

const ProtectedRoute = ({ children, allowedPermissions }) => {
  const { canAny } = usePermission();
  const user = useSelector((state) => state.user);
  const isSessionExpired = user?.isSessionExpired;
  const requiredPermissions = Array.isArray(allowedPermissions)
    ? allowedPermissions
    : [];
  const isLoggedIn = Boolean(
    user?.accessToken ||
      user?.refreshToken ||
      user?.username ||
      user?.id ||
      user?.userId ||
      hasStoredProfile(),
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

  if (isSessionExpired) return null;

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (!isAllowed) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
