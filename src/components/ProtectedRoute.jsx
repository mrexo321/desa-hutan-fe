import React from "react";
import { Navigate } from "react-router-dom";
import { usePermission } from "../hooks/usePermission";
import { toast } from "sonner";

const ProtectedRoute = ({ children, allowedPermissions }) => {
  const { canAny } = usePermission();

  // 1. CEK LOGIN: Apakah ada profil user di localStorage?
  const profileString = localStorage.getItem("user_profile");
  if (!profileString) {
    return <Navigate to="/login" replace />;
  }

  // 2. CEK HAK AKSES KHUSUS (Jika parameternya diisi)
  if (allowedPermissions && allowedPermissions.length > 0) {
    const isAllowed = canAny(allowedPermissions);

    if (!isAllowed) {
      toast.error(
        "Akses Ditolak: Anda tidak memiliki izin untuk membuka halaman ini.",
      );
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // 3. JIKA LOLOS SEMUA CEGATAN, SILAKAN MASUK KE HALAMAN
  return children;
};

export default ProtectedRoute;
