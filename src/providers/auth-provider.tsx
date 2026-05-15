import { useEffect, type ReactNode } from "react";
import { useRouter } from "@tanstack/react-router";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectIsAuthenticated, updateUser, clearAuth } from "@/store/slices/authSlice";
import { useGetMeQuery } from "@/store/api/authApi";

export { useAuth } from "@/hooks/use-auth";

function AuthValidator({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const { data: freshUser, isError } = useGetMeQuery(undefined, {
    skip: !isAuthenticated,
  });

  useEffect(() => {
    if (isError) {
      dispatch(clearAuth());
    } else if (freshUser) {
      dispatch(updateUser(freshUser));
    }
  }, [freshUser, isError, dispatch]);

  // When auth is lost from any source (logout, 401, session expiry),
  // force the router to re-evaluate the current route's beforeLoad guards.
  // This triggers requireAuth to redirect to /login even without an explicit navigate() call.
  useEffect(() => {
    if (!isAuthenticated) {
      void router.invalidate();
    }
  }, [isAuthenticated, router]);

  return <>{children}</>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return <AuthValidator>{children}</AuthValidator>;
}
