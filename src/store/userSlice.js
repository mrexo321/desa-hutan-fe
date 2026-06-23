import { createSlice } from "@reduxjs/toolkit";

// ============================================================
// SECURITY:
// - user_profile (non-sensitif) → localStorage (persist lintas tab)
// - refreshToken → sessionStorage (persist hard-refresh, hilang saat tab tutup)
// - accessToken → Redux memory SAJA (tidak pernah disimpan ke storage)
// ============================================================

const RT_KEY = "_rt"; // sessionStorage key untuk refreshToken

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
    return sessionStorage.getItem(RT_KEY) || null;
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
  // refreshToken — disimpan ke sessionStorage agar tahan hard-refresh
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
      state.isSessionExpired = false;

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

      // Simpan refreshToken ke sessionStorage
      try {
        if (refreshToken) {
          sessionStorage.setItem(RT_KEY, refreshToken);
        } else {
          sessionStorage.removeItem(RT_KEY);
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
        // Perbarui sessionStorage dengan refreshToken terbaru
        try {
          sessionStorage.setItem(RT_KEY, refreshToken);
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
        sessionStorage.removeItem(RT_KEY);
      } catch {
        // Ignore
      }
    },

    clearUserData: () => {
      try {
        localStorage.removeItem("user_profile");
        localStorage.removeItem("user");
        sessionStorage.removeItem(RT_KEY);
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
        isSessionExpired: false,
      };
    },
  },
});

export const { setUserData, clearUserData, setToken, triggerSessionExpired } =
  userSlice.actions;
export default userSlice.reducer;
