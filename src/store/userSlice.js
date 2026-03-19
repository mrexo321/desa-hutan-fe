import { createSlice } from "@reduxjs/toolkit";

const savedUser = localStorage.getItem("user");

// Sesuaikan struktur awal dengan format API
const initialState = savedUser
  ? JSON.parse(savedUser)
  : {
      id: null,
      username: null,
      roles: [],
      permissions: [],
      access_token: null,
      refresh_token: null,
    };

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (state, action) => {
      localStorage.setItem("user", JSON.stringify(action.payload));
      return action.payload;
    },
    clearUserData: () => {
      localStorage.removeItem("user");
      // Kembalikan ke nilai kosong yang sesuai
      return {
        id: null,
        username: null,
        roles: [],
        permissions: [],
        access_token: null,
        refresh_token: null,
      };
    },
  },
});

export const { setUserData, clearUserData } = userSlice.actions;
export default userSlice.reducer;
