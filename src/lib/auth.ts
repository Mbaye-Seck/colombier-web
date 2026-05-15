const AUTH_KEY = "colombier_auth";

export type AuthUser = {
  id: number;
  nom: string;
  prenom: string;
  nom_complet: string;
  email: string;
  role: "admin" | "eleveur";
  photo_profil: string | null;
  langue: string;
  timezone: string;
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
