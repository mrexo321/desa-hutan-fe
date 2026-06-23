import { useSelector } from "react-redux";

// ============================================================
// useAuthReady
// Returns true ketika accessToken sudah tersedia di Redux.
//
// Digunakan sebagai guard pada `enabled` di useQuery agar
// query tidak jalan sebelum token recovery selesai
// (kondisi setelah hard-refresh / Ctrl+Shift+R).
//
// Usage:
//   const isAuthReady = useAuthReady();
//   useQuery({ ..., enabled: isAuthReady && !!someParam })
// ============================================================
export const useAuthReady = () => {
  const accessToken = useSelector((state) => state.user?.accessToken);
  return !!accessToken;
};
