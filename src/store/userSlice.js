import { createSlice } from "@reduxjs/toolkit";

// ============================================================
// SECURITY:
// - user_profile (non-sensitif) → localStorage (persist lintas tab)
// - refreshToken → localStorage (persist hard-refresh & lintas tab, untuk cross-tab auth sync)
// - accessToken → Redux memory SAJA (tidak pernah disimpan ke storage)
// ============================================================

const RT_KEY = "_rt"; // localStorage key untuk refreshToken

const savedUserData = (() => {
  try {
    const raw = localStorage.getItem("user_profile");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
})();

const savedRefreshToken = (() => {
  try {
    return localStorage.getItem(RT_KEY) || null;
  } catch {
    return null;
  }
})();

const initialState = {
  // Data profil (non-sensitif) — dipersist ke localStorage
  userId: savedUserData?.userId || null,
  username: savedUserData?.username || null,
  roles: savedUserData?.roles || [],
  permissions: savedUserData?.permissions || [],

  // accessToken — HANYA di Redux memory (hilang saat hard-refresh → di-recover via refreshToken)
  accessToken: null,
  // refreshToken — disimpan ke localStorage agar tahan hard-refresh & lintas tab
  refreshToken: savedRefreshToken,

  // Status session
  isSessionExpired: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (state, action) => {
      const { userId, username, roles, permissions, accessToken, refreshToken } =
        action.payload;

      state.accessToken = accessToken || null;
      state.refreshToken = refreshToken || null;

      // Simpan profil non-sensitif ke localStorage
      const profileData = { userId, username, roles, permissions };
      state.userId = userId || null;
      state.username = username || null;
      state.roles = roles || [];
      state.permissions = permissions || [];

      try {
        localStorage.setItem("user_profile", JSON.stringify(profileData));
      } catch {
        // Ignore storage errors
      }

      // Simpan refreshToken ke localStorage
      try {
        if (refreshToken) {
          localStorage.setItem(RT_KEY, refreshToken);
        } else {
          localStorage.removeItem(RT_KEY);
        }
      } catch {
        // Ignore storage errors
      }
    },

    setToken: (state, action) => {
      const { accessToken, refreshToken } = action.payload;
      if (accessToken) state.accessToken = accessToken;
      if (refreshToken) {
        state.refreshToken = refreshToken;
        // Perbarui localStorage dengan refreshToken terbaru
        try {
          localStorage.setItem(RT_KEY, refreshToken);
        } catch {
          // Ignore
        }
      }
      state.isSessionExpired = false;
    },

    triggerSessionExpired: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.isSessionExpired = true;
      try {
        localStorage.removeItem(RT_KEY);
      } catch {
        // Ignore
      }
    },

    // Sinkronisasi state dari tab lain: mengisi ulang profil & refreshToken
    // dari localStorage tanpa menyentuh accessToken (harus direcovery via refresh asli)
    hydrateFromStorage: (state) => {
      try {
        const raw = localStorage.getItem("user_profile");
        const profile = raw ? JSON.parse(raw) : null;
        state.userId = profile?.userId || null;
        state.username = profile?.username || null;
        state.roles = profile?.roles || [];
        state.permissions = profile?.permissions || [];
        state.refreshToken = localStorage.getItem(RT_KEY) || null;
      } catch {
        // Ignore storage errors
      }
    },

    clearUserData: () => {
      try {
        localStorage.removeItem("user_profile");
        localStorage.removeItem("user");
        localStorage.removeItem(RT_KEY);
      } catch {
        // Ignore
      }
      return {
        userId: null,
        username: null,
        roles: [],
        permissions: [],
        accessToken: null,
        refreshToken: null,
      };
    },
  },
});

export const { setUserData, clearUserData, setToken, hydrateFromStorage } =
  userSlice.actions;
export default userSlice.reducer;
