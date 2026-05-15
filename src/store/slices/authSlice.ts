import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { getSession, saveSession, clearSession } from "@/lib/auth";
import type { AuthSession, AuthUser } from "@/lib/auth";
import type { RootState } from "@/store";

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
};

const session = getSession();

const initialState: AuthState = {
  user: session?.user ?? null,
  token: session?.token ?? null,
  isAuthenticated: session !== null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession(state, action: PayloadAction<AuthSession>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      saveSession(action.payload);
    },
    updateUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      if (state.token) {
        saveSession({ user: action.payload, token: state.token });
      }
    },
    clearAuth(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      clearSession();
    },
  },
});

export const { setSession, updateUser, clearAuth } = authSlice.actions;

export const selectUser = (state: RootState) => state.auth.user;
export const selectToken = (state: RootState) => state.auth.token;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
