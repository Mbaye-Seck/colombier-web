import { redirect } from "@tanstack/react-router";
import type { RouterContext } from "@/router";

export function requireAuth({
  context,
  location,
}: {
  context: RouterContext;
  location: { pathname: string };
}) {
  if (!context.isAuthenticated) {
    throw redirect({ to: "/login", search: { redirect: location.pathname } });
  }
}

export function requireGuest({ context }: { context: RouterContext }) {
  if (context.isAuthenticated) {
    throw redirect({ to: "/" });
  }
}
