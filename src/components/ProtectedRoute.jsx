import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { usePermission } from "../hooks/usePermission";
import { toast } from "sonner";

const ProtectedRoute = ({ children, allowedPermissions }) => {
  const { canAny } = usePermission();
  const isSessionExpired = useSelector((state) => state.user?.isSessionExpired);

  // 1. Jika session expired (token gagal di-refresh) → cukup return null,
  //    SessionExpiredScreen sudah mounted secara global di App.jsx
  if (isSessionExpired) {
    return null;
  }

  // 2. CEK LOGIN: Apakah ada profil user di localStorage?
  const profileString = localStorage.getItem("user_profile");
  if (!profileString) {
    return <Navigate to="/login" replace />;
  }

  // 3. CEK HAK AKSES KHUSUS (Jika parameternya diisi)
  if (allowedPermissions && allowedPermissions.length > 0) {
    const isAllowed = canAny(allowedPermissions);

    if (!isAllowed) {
      toast.error(
        "Akses Ditolak: Anda tidak memiliki izin untuk membuka halaman ini.",
      );
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // 4. JIKA LOLOS SEMUA CEGATAN, SILAKAN MASUK KE HALAMAN
  return children;
};

export default ProtectedRoute;
