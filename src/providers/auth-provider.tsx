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
      void router.invalidate();
    } else if (freshUser) {
      dispatch(updateUser(freshUser));
    }
  }, [freshUser, isError, dispatch, router]);

  return <>{children}</>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return <AuthValidator>{children}</AuthValidator>;
}
