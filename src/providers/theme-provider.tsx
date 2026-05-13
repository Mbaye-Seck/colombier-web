import { useEffect, type ReactNode } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectTheme, setTheme } from "@/store/slices/themeSlice";
import { applyDomTheme, readStoredTheme } from "@/lib/theme-storage";

export { useTheme } from "@/hooks/use-theme";

function ThemeSync() {
  const dispatch = useAppDispatch();
  const resolved = useAppSelector(selectTheme);

  useEffect(() => {
    applyDomTheme(resolved);
  }, [resolved]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (readStoredTheme() !== null) return;
      dispatch(setTheme(mq.matches ? "dark" : "light"));
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [dispatch]);

  return null;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <>
      <ThemeSync />
      {children}
    </>
  );
}
