import { createSlice } from "@reduxjs/toolkit";

const emptyUser = {
  id: null,
  userId: null,
  username: null,
  roles: [],
  permissions: [],
  accessToken: null,
  refreshToken: null,
  isSessionExpired: false,
};

const normalizeList = (value) => {
  const source = Array.isArray(value) ? value : value ? [value] : [];

  return [
    ...new Set(
      source
        .flatMap((item) => {
          if (Array.isArray(item)) return normalizeList(item);

          if (typeof item === "string" || typeof item === "number") {
            return String(item);
          }

          if (!item || typeof item !== "object") return [];

          const direct =
            item.name ??
            item.nama ??
            item.code ??
            item.kode ??
            item.slug ??
            item.value ??
            item.role?.name ??
            item.role?.nama ??
            item.permission?.name ??
            item.permission?.nama ??
            item.permission?.code ??
            item.permission?.kode;

          return direct ? String(direct) : [];
        })
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
};

const getStoredProfile = () => {
  try {
    const profile = localStorage.getItem("user_profile");
    const legacyUser = localStorage.getItem("user");
    return profile
      ? JSON.parse(profile)
      : legacyUser
        ? JSON.parse(legacyUser)
        : null;
  } catch {
    return null;
  }
};

const normalizeUserPayload = (payload = {}) => {
  const source = payload && typeof payload === "object" ? payload : {};
  const user = source.user && typeof source.user === "object" ? source.user : {};
  const rawRoles = source.roles ?? user.roles ?? source.role ?? user.role;
  const roleItems = Array.isArray(rawRoles) ? rawRoles : rawRoles ? [rawRoles] : [];
  const roleNames = normalizeList(
    roleItems.map((role) =>
      role && typeof role === "object" && role.role ? role.role : role,
    ),
  );
  const rawPermissions =
    source.permissions ??
    user.permissions ??
    source.permission ??
    user.permission;
  const permissionsFromRoles = normalizeList(
    roleItems.flatMap((role) => {
      if (!role || typeof role !== "object") return [];
      return [
        role.permission,
        role.permissions,
        role.role?.permission,
        role.role?.permissions,
      ].filter(Boolean);
    }),
  );

  const id = source.id ?? source.userId ?? user.id ?? null;

  return {
    ...emptyUser,
    ...source,
    id,
    userId: source.userId ?? source.id ?? user.id ?? null,
    username:
      source.username ??
      user.username ??
      source.name ??
      user.name ??
      source.nama ??
      user.nama ??
      null,
    accessToken:
      source.accessToken ?? source.token ?? source.access_token ?? null,
    refreshToken: source.refreshToken ?? source.refresh_token ?? null,
    roles: roleNames,
    permissions: normalizeList([rawPermissions, permissionsFromRoles]),
    isSessionExpired: false,
  };
};

const initialProfile = normalizeUserPayload(getStoredProfile());
const initialState = {
  ...emptyUser,
  id: initialProfile.id,
  userId: initialProfile.userId,
  username: initialProfile.username,
  roles: initialProfile.roles,
  permissions: initialProfile.permissions,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (state, action) => {
      const normalized = normalizeUserPayload(action.payload);
      const profileData = {
        id: normalized.id,
        userId: normalized.userId,
        username: normalized.username,
        roles: normalized.roles,
        permissions: normalized.permissions,
      };

      Object.assign(state, normalized, { isSessionExpired: false });

      try {
        localStorage.setItem("user_profile", JSON.stringify(profileData));
        localStorage.removeItem("user");
      } catch {
        // Ignore storage errors.
      }
    },

    setToken: (state, action) => {
      const { accessToken, refreshToken } = action.payload;
      if (accessToken) state.accessToken = accessToken;
      if (refreshToken) state.refreshToken = refreshToken;
      state.isSessionExpired = false;
    },

    triggerSessionExpired: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.isSessionExpired = true;
    },

    clearUserData: () => {
      try {
        localStorage.removeItem("user_profile");
        localStorage.removeItem("user");
      } catch {
        // Ignore storage errors.
      }
      return { ...emptyUser };
    },
  },
});

export const { setUserData, clearUserData, setToken, triggerSessionExpired } =
  userSlice.actions;
export default userSlice.reducer;
