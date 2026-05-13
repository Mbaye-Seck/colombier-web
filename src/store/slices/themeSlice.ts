import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { readStoredTheme, writeStoredTheme, type StoredTheme } from "@/lib/theme-storage";
import type { RootState } from "@/store";

function getInitialTheme(): StoredTheme {
  if (typeof window === "undefined") return "light";
  const stored = readStoredTheme();
  if (stored) return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

type ThemeState = { resolved: StoredTheme };

const themeSlice = createSlice({
  name: "theme",
  initialState: (): ThemeState => ({ resolved: getInitialTheme() }),
  reducers: {
    setTheme(state, action: PayloadAction<StoredTheme>) {
      state.resolved = action.payload;
      writeStoredTheme(action.payload);
    },
    toggleTheme(state) {
      const next: StoredTheme = state.resolved === "dark" ? "light" : "dark";
      state.resolved = next;
      writeStoredTheme(next);
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;

export const selectTheme = (state: RootState) => state.theme.resolved;

export { themeSlice };
