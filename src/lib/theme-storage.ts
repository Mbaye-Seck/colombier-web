export const THEME_STORAGE_KEY = "colombier-theme";

export type StoredTheme = "light" | "dark";

export function readStoredTheme(): StoredTheme | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    return v === "dark" || v === "light" ? v : null;
  } catch {
    return null;
  }
}

export function writeStoredTheme(theme: StoredTheme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* private mode, etc. */
  }
}

/** Applique la classe `dark` sur `<html>` et `color-scheme`. */
export function applyDomTheme(mode: "light" | "dark") {
  document.documentElement.classList.toggle("dark", mode === "dark");
  document.documentElement.style.colorScheme = mode;
}

export const THEME_BOOT_SCRIPT = `(function(){try{var k='${THEME_STORAGE_KEY}';var s=localStorage.getItem(k);var d=s==='dark'||(s!=='light'&&(s===null||s==='')&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);document.documentElement.style.colorScheme=d?'dark':'light';}catch(e){}})();`;
