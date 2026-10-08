import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: string | number;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
}

const initialState: AuthState = {
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("user", JSON.stringify(action.payload));
        } catch (e) {
          console.error(e);
        }
      }
    },
    logout: (state) => {
      state.user = null;
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        } catch (e) {
          console.error(e);
        }
      }
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const { login, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;