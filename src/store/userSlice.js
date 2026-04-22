import { createSlice, current } from "@reduxjs/toolkit";

const savedUser = localStorage.getItem("user");

const initialState = savedUser
  ? JSON.parse(savedUser)
  : {
      id: null,
      username: null,
      roles: [],
      permissions: [],
      accessToken: null, // Ubah ke camelCase
      refreshToken: null, // Ubah ke camelCase
    };

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (state, action) => {
      localStorage.setItem("user", JSON.stringify(action.payload));
      return action.payload;
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
