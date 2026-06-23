import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import environment from "../config/environment";
import { setToken, clearUserData } from "../store/userSlice";

// ============================================================
// useBackgroundRefresh
//
// 1. Saat mount: jika ada refreshToken (dari sessionStorage) tapi
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

  // Ref untuk selalu baca nilai terbaru di dalam interval/closure
  const refreshTokenRef = useRef(refreshToken);
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    refreshTokenRef.current = refreshToken;
  }, [refreshToken]);

  const doRefresh = async () => {
    const token = refreshTokenRef.current;
    if (!token || isRefreshingRef.current) return;
    isRefreshingRef.current = true;
    try {
      const res = await axios.post(
        `${environment.AUTH_URL}/auth/refresh-token`,
        { refreshToken: token },
      );

      const newAccessToken = res.data.data.accessToken;
      const newRefreshToken = res.data.data.refreshToken || token;

      dispatch(
        setToken({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        }),
      );
    } catch {
      // Refresh token sudah tidak valid → bersihkan state & redirect login
      dispatch(clearUserData());
      navigate("/login", { replace: true });
    } finally {
      isRefreshingRef.current = false;
    }
  };

  // 1. Recovery saat hard-refresh: ada refreshToken tapi belum ada accessToken
  useEffect(() => {
    if (refreshToken && !accessToken) {
      doRefresh();
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
};
