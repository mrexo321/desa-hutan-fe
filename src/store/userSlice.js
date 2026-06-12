import { createSlice, current } from "@reduxjs/toolkit";

const emptyUser = {
  id: null,
  userId: null,
  username: null,
  roles: [],
  permissions: [],
  accessToken: null,
  refreshToken: null,
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
            item.value;

          return direct ? String(direct) : [];
        })
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
};

const getStoredUser = () => {
  try {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
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

  return {
    ...emptyUser,
    ...source,
    id: source.id ?? source.userId ?? user.id ?? null,
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
  };
};

const initialState = normalizeUserPayload(getStoredUser());

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (state, action) => {
      const normalizedPayload = normalizeUserPayload(action.payload);
      localStorage.setItem("user", JSON.stringify(normalizedPayload));
      return normalizedPayload;
    },
    // Di dalam store/userSlice.js, ubah bagian setToken menjadi seperti ini:

    setToken: (state, action) => {
      const { accessToken, refreshToken } = action.payload;

      // Update state jika nilainya dikirimkan
      if (accessToken) state.accessToken = accessToken;
      if (refreshToken) state.refreshToken = refreshToken;

      // Baca data proxy menjadi objek JS biasa
      const currentState = current(state);

      // Gantikan/Timpa data di localStorage secara utuh
      localStorage.setItem("user", JSON.stringify(currentState));
    },
    clearUserData: () => {
      localStorage.removeItem("user");
      return {
        id: null,
        username: null,
        roles: [],
        permissions: [],
        accessToken: null,
        refreshToken: null,
      };
    },
  },
});

export const { setUserData, clearUserData, setToken } = userSlice.actions;
export default userSlice.reducer;
