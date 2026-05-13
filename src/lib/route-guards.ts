import { redirect } from "@tanstack/react-router";
import type { RouterContext } from "@/router";

export function requireAuth({
  context,
  location,
}: {
  context: RouterContext;
  location: { pathname: string };
}) {
  // Auth lives in localStorage — not available during SSR. Skip server-side.
  if (typeof window === "undefined") return;

  if (!context.isAuthenticated) {
    // Root is the default post-login destination, no need to encode it as a redirect param.
    const search = location.pathname !== "/" ? { redirect: location.pathname } : undefined;
    throw redirect({ to: "/login", search });
  }
}

export function requireGuest({ context }: { context: RouterContext }) {
  // Skip during SSR.
  if (typeof window === "undefined") return;

  if (context.isAuthenticated) {
    throw redirect({ to: "/" });
  }
}
