import { useAppDispatch, useAppSelector } from "@/store";
import { selectTheme, toggleTheme } from "@/store/slices/themeSlice";

export function useTheme() {
  const dispatch = useAppDispatch();
  const resolved = useAppSelector(selectTheme);

  return {
    resolved,
    toggle: () => dispatch(toggleTheme()),
  };
}
