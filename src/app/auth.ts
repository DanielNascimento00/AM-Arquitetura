const TOKEN_KEY = "am_admin_token";

export async function login(email: string, password: string): Promise<boolean> {
  try {
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) return false;
    const data = await res.json() as { token?: string };
    if (!data.token) return false;
    sessionStorage.setItem(TOKEN_KEY, data.token);
    return true;
  } catch {
    return false;
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
