import React from "react";
import { Navigate } from "react-router-dom";
import { usePermission } from "../hooks/usePermission"; // Pastikan path ini benar!
import { toast } from "sonner"; // Opsional, untuk memunculkan notifikasi merah

// Parameter 'allowedPermissions' ini adalah ARRAY yang dimaksud temanmu
const ProtectedRoute = ({ children, allowedPermissions }) => {
  const { canAny } = usePermission();

  // 1. CEK LOGIN DASAR: Apakah user sudah login?
  const authDataString = localStorage.getItem("user_data");
  if (!authDataString) {
    // Kalau belum login, tendang ke halaman login
    return <Navigate to="/login" replace />;
  }

  // 2. CEK HAK AKSES KHUSUS (Jika parameternya diisi)
  if (allowedPermissions && allowedPermissions.length > 0) {
    const isAllowed = canAny(allowedPermissions);
    
    if (!isAllowed) {
      // Kalau user login tapi TIDAK punya akses ke halaman ini, tendang ke Dashboard awal
      toast.error("Akses Ditolak: Anda tidak memiliki izin untuk membuka halaman ini.");
      return <Navigate to="/dashboard" replace />;
    }
  }

  // 3. JIKA LOLOS SEMUA CEGATAN, SILAKAN MASUK KE HALAMAN
  return children;
};

export default ProtectedRoute;