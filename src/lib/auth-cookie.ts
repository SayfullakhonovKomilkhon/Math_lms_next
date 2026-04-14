const COOKIE_NAME = 'auth-storage';
const MAX_AGE_SEC = 60 * 60 * 24 * 7;

export interface AuthCookieUser {
  id: string;
  email: string;
  role: string;
}

/** Sync minimal auth state for Next.js middleware (mirrors zustand persist shape). */
export function syncAuthCookie(
  user: AuthCookieUser | null,
  isAuthenticated: boolean,
): void {
  if (typeof document === 'undefined') return;

  if (!user || !isAuthenticated) {
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
    return;
  }

  const payload = JSON.stringify({
    state: { user, isAuthenticated: true },
    version: 0,
  });

  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(payload)}; path=/; max-age=${MAX_AGE_SEC}; SameSite=Lax`;
}
