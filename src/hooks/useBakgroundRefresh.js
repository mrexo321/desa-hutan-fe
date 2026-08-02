import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearUserData } from "../store/userSlice";
import { refreshAccessToken } from "../api/refreshCoordinator";

// ============================================================
// useBackgroundRefresh
//
// 1. Saat mount: jika ada refreshToken (dari localStorage) tapi
//    belum ada accessToken (kondisi setelah hard-refresh) →
//    langsung hit refresh-token untuk recover sesi.
//
// 2. Interval setiap 15 menit untuk proaktif memperbarui token
//    agar sesi tidak expired di tengah penggunaan.
//
// Jika refresh gagal → clearUserData + redirect /login.
// ============================================================
export const useBackgroundRefresh = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const accessToken = useSelector((state) => state.user?.accessToken);
  const refreshToken = useSelector((state) => state.user?.refreshToken);

  // Loading guard: true hanya selama recovery accessToken pertama kali
  // (mencegah komponen anak fetch data sebelum accessToken tersedia → 401 dini)
  const [isRecovering, setIsRecovering] = useState(
    () => Boolean(refreshToken && !accessToken),
  );

  // Ref untuk selalu baca nilai terbaru di dalam interval/closure
  const refreshTokenRef = useRef(refreshToken);

  useEffect(() => {
    refreshTokenRef.current = refreshToken;
  }, [refreshToken]);

  const doRefresh = async () => {
    if (!refreshTokenRef.current) return;
    try {
      await refreshAccessToken();
    } catch {
      // Refresh token sudah tidak valid → bersihkan state & redirect login
      dispatch(clearUserData());
      navigate("/login", { replace: true });
    }
  };

  // 1. Recovery saat hard-refresh: ada refreshToken tapi belum ada accessToken
  useEffect(() => {
    if (refreshToken && !accessToken) {
      doRefresh().finally(() => setIsRecovering(false));
    } else {
      setIsRecovering(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // hanya saat mount

  // 2. Interval proaktif setiap 15 menit
  useEffect(() => {
    if (!refreshToken) return;
    const interval = setInterval(doRefresh, 15 * 60 * 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshToken]);

  return { isRecovering };
};
