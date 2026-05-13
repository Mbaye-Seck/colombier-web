/**
 * Couche auth côté client — simule un token JWT en localStorage.
 * À remplacer par un vrai appel Laravel Sanctum / Passport.
 */

const AUTH_KEY = "colombier_auth";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "eleveur";
};

export type AuthSession = {
  user: AuthUser;
  token: string;
};

export function getSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: AuthSession): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(AUTH_KEY);
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}

/** Simule une connexion — à remplacer par POST /api/auth/login */
export async function loginMock(email: string, _password: string): Promise<AuthSession> {
  await new Promise((r) => setTimeout(r, 600)); // latence réseau simulée
  const session: AuthSession = {
    token: "mock-jwt-token-" + Math.random().toString(36).slice(2),
    user: {
      id: "1",
      name: "Jean Dupont",
      email,
      role: "eleveur",
    },
  };
  saveSession(session);
  return session;
}
