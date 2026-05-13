import type { ReactNode } from "react";

export { useAuth } from "@/hooks/use-auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
