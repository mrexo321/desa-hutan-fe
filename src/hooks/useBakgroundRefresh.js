import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import environment from "../config/environment";
import { setToken, clearUserData } from "../store/userSlice";

export const useBackgroundRefresh = () => {
  const dispatch = useDispatch();
  const refreshToken = useSelector((state) => state.user?.refreshToken);

  useEffect(() => {
    if (!refreshToken) return;

    const interval = setInterval(
      async () => {
        try {
          console.log("🔄 Menjalankan Background Token Refresh...");

          const res = await axios.post(
            `${environment.AUTH_URL}/auth/refresh-token`,
            { refreshToken: refreshToken },
          );

          const newAccessToken = res.data.data.accessToken;
          const newRefreshToken = res.data.data.refreshToken || refreshToken;

          dispatch(
            setToken({
              accessToken: newAccessToken,
              refreshToken: newRefreshToken,
            }),
          );

          console.log("✅ Token berhasil diperbarui di latar belakang!");
        } catch (error) {
          console.error("❌ Gagal memperbarui token di latar belakang", error);
          dispatch(clearUserData());
          window.location.href = "/login";
        }
      },
      10 * 60 * 1000,
    ); // 10 Menit

    return () => clearInterval(interval);
  }, [refreshToken, dispatch]);
};
