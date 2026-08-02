import axios from "axios";
import environment from "../config/environment";
import { reduxStore } from "../store/store";
import { setToken } from "../store/userSlice";

// ============================================================
// Lock refresh tunggal lintas caller (useBakgroundRefresh,
// authInstance, masterInstance) agar tidak ada beberapa request
// POST /auth/refresh-token berjalan paralel yang saling
// invalidasi (backend melakukan refresh-token rotation).
// ============================================================

let refreshPromise = null;

const doRefresh = async () => {
  const state = reduxStore.getState();
  const currentRefreshToken = state.user?.refreshToken;

  if (!currentRefreshToken) {
    throw new Error("No refresh token");
  }

  const res = await axios.post(
    `${environment.AUTH_URL}/auth/refresh-token`,
    { refreshToken: currentRefreshToken },
  );

  const newAccessToken = res.data.data.accessToken;
  const newRefreshToken = res.data.data.refreshToken || currentRefreshToken;

  reduxStore.dispatch(
    setToken({ accessToken: newAccessToken, refreshToken: newRefreshToken }),
  );

  return newAccessToken;
};

export const refreshAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};
