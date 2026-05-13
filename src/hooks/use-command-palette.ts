import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectCommandPaletteOpen,
  toggleCommandPalette,
  openCommandPalette,
  closeCommandPalette,
} from "@/store/slices/uiSlice";

export function useCommandPalette() {
  const dispatch = useAppDispatch();
  const open = useAppSelector(selectCommandPaletteOpen);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        dispatch(toggleCommandPalette());
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [dispatch]);

  return {
    open,
    setOpen: (v: boolean) => dispatch(v ? openCommandPalette() : closeCommandPalette()),
  };
}
