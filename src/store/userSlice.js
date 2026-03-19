import { createSlice } from "@reduxjs/toolkit";

// ✅ Ambil dari localStorage jika ada
const savedUser = localStorage.getItem("user");
const initialState = savedUser
  ? JSON.parse(savedUser)
  : { userId: null, token: null, role: null, username: null, name: null };

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (state, action) => {
      // Simpan ke localStorage juga agar persist
      localStorage.setItem("user", JSON.stringify(action.payload));
      return action.payload;
    },
    clearUserData: () => {
      localStorage.removeItem("user");
      return {
        userId: null,
        token: null,
        role: null,
        username: null,
        name: null,
      };
    },
  },
});

export const { setUserData, clearUserData } = userSlice.actions;
export default userSlice.reducer;
