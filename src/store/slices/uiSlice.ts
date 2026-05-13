import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "@/store";

type UiState = {
  commandPaletteOpen: boolean;
};

const uiSlice = createSlice({
  name: "ui",
  initialState: { commandPaletteOpen: false } as UiState,
  reducers: {
    openCommandPalette: (state) => {
      state.commandPaletteOpen = true;
    },
    closeCommandPalette: (state) => {
      state.commandPaletteOpen = false;
    },
    toggleCommandPalette: (state) => {
      state.commandPaletteOpen = !state.commandPaletteOpen;
    },
  },
});

export const { openCommandPalette, closeCommandPalette, toggleCommandPalette } = uiSlice.actions;

export const selectCommandPaletteOpen = (state: RootState) => state.ui.commandPaletteOpen;

export { uiSlice };
