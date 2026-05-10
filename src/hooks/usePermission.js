import { useCallback } from 'react';

export const usePermission = () => {
  // 1. Ambil data dari localStorage (atau state management seperti Zustand/Redux jika kamu pakai)
  // Sesuaikan 'user_data' dengan key yang kamu gunakan saat proses login berhasil.
  const authDataString = localStorage.getItem('user');
  const authData = authDataString ? JSON.parse(authDataString) : null;

  // 2. Ekstrak array permissions dan roles dari object user
  const userPermissions = authData?.permissions || [];
  const userRoles = authData?.roles || [];

  // 3. (Opsional tapi disarankan) Buat bypass khusus untuk 'superadmin' 
  // agar tidak perlu dicek satu-satu hak aksesnya.
  const isSuperadmin = userRoles.includes('superadmin');

  // =========================================================
  // VARIABEL 1: `can`
  // Untuk mengecek 1 aksi spesifik. (Contoh: can('role:create'))
  // =========================================================
  const can = useCallback((action) => {
    if (isSuperadmin) return true;
    return userPermissions.includes(action);
  }, [userPermissions, isSuperadmin]);

  // =========================================================
  // VARIABEL 2: `canAny`
  // Untuk mengecek apakah user punya minimal 1 dari beberapa aksi.
  // (Contoh: canAny(['role:update', 'role:delete']))
  // =========================================================
  const canAny = useCallback((actionsArray) => {
    if (isSuperadmin) return true;
    return actionsArray.some((action) => userPermissions.includes(action));
  }, [userPermissions, isSuperadmin]);

  // Ekspor agar bisa digunakan secara global
  return { can, canAny };
};
