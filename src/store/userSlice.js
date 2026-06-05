import { createSlice } from "@reduxjs/toolkit";

// ============================================================
// SECURITY: Hanya simpan data non-sensitif ke localStorage.
// accessToken & refreshToken TIDAK disimpan di localStorage
// untuk mencegah serangan XSS.
// ============================================================
const savedUserData = (() => {
  try {
    const raw = localStorage.getItem("user_profile");
    return raw ? JSON.parse(raw) : null;
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

  // Token — HANYA di Redux memory, TIDAK di localStorage
  accessToken: null,
  refreshToken: null,

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

      // Simpan data sensitif HANYA di Redux memory
      state.accessToken = accessToken || null;
      state.refreshToken = refreshToken || null;
      state.isSessionExpired = false;

      // Simpan data profil non-sensitif ke localStorage
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
    },

    setToken: (state, action) => {
      const { accessToken, refreshToken } = action.payload;
      // Update token HANYA di Redux memory
      if (accessToken) state.accessToken = accessToken;
      if (refreshToken) state.refreshToken = refreshToken;
      state.isSessionExpired = false;
    },

    triggerSessionExpired: (state) => {
      // Tampilkan layar session expired yang profesional
      // Token di-clear dari memory, tapi TIDAK langsung redirect
      state.accessToken = null;
      state.refreshToken = null;
      state.isSessionExpired = true;
    },

    clearUserData: () => {
      try {
        localStorage.removeItem("user_profile");
        // Bersihkan juga key lama jika masih ada
        localStorage.removeItem("user");
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
