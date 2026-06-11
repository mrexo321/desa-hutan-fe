import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import environment from "../config/environment";
import { setToken, triggerSessionExpired } from "../store/userSlice";

// ============================================================
// Background Token Refresh
// Memperbarui access token secara otomatis setiap 10 menit
// agar sesi tidak expired di tengah penggunaan aktif.
// ============================================================
export const useBackgroundRefresh = () => {
  const dispatch = useDispatch();
  const refreshToken = useSelector((state) => state.user?.refreshToken);

  useEffect(() => {
    if (!refreshToken) return;

    const interval = setInterval(async () => {
      try {
        const res = await axios.post(
          `${environment.AUTH_URL}/auth/refresh-token`,
          { refreshToken },
        );

        const newAccessToken = res.data.data.accessToken;
        const newRefreshToken = res.data.data.refreshToken || refreshToken;

        dispatch(
          setToken({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          }),
        );
      } catch {
        // Refresh token sudah tidak valid → tampilkan session expired screen
        dispatch(triggerSessionExpired());
      }
    }, 10 * 60 * 1000); // Setiap 10 menit

    return () => clearInterval(interval);
  }, [refreshToken, dispatch]);
};
