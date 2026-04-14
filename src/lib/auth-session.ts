import { syncAuthCookie } from '@/lib/auth-cookie';

/** Must match zustand persist `name` in `auth.store.ts`. */
const ZUSTAND_AUTH_KEY = 'auth-storage';

/**
 * Clears tokens, persisted auth, and the middleware cookie.
 * Use before a hard redirect to /login so middleware cannot immediately bounce back to a protected route.
 */
export function clearClientSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem(ZUSTAND_AUTH_KEY);
  syncAuthCookie(null, false);
}
