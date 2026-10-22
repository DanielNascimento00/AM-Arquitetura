const TOKEN_KEY = "am_admin_token";

export type LoginResult = "ok" | "invalid" | "blocked" | "unavailable" | "network";

export async function login(email: string, password: string): Promise<LoginResult> {
  try {
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.status === 429) return "blocked";
    if (res.status >= 500) return "unavailable";
    if (!res.ok) return "invalid";
    const data = await res.json() as { token?: string };
    if (!data.token) return "unavailable";
    sessionStorage.setItem(TOKEN_KEY, data.token);
    return "ok";
  } catch {
    return "network";
  }
}

export function logout() {
  sessionStorage.removeItem(TOKEN_KEY);
}

export function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}

export function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { "x-admin-token": token } : {};
}
