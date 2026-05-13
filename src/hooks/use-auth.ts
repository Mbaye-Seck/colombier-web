import { useAppDispatch, useAppSelector } from "@/store";
import { selectUser, selectIsAuthenticated, setSession, clearAuth } from "@/store/slices/authSlice";
import type { AuthSession } from "@/lib/auth";

export function useAuth() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  return {
    user,
    isAuthenticated,
    login: (session: AuthSession) => dispatch(setSession(session)),
    logout: () => dispatch(clearAuth()),
  };
}
