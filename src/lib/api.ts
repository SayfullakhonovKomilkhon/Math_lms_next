import axios from 'axios';
import { clearClientSession } from '@/lib/auth-session';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
});

let redirectingToLogin = false;

function redirectToLogin(): void {
  if (typeof window === 'undefined' || redirectingToLogin) return;
  redirectingToLogin = true;
  clearClientSession();
  window.location.href = '/login?reason=session-expired';
}

let refreshPromise: Promise<string> | null = null;
let refreshBlockedUntil = 0;
let lastRefreshError: unknown;

async function refreshSession(failedAccessToken: string): Promise<string> {
  if (refreshPromise) return refreshPromise;
  const run = async () => {
    // Another tab may have refreshed while we were waiting for its lock.
    const current = localStorage.getItem('accessToken');
    if (current && current !== failedAccessToken) return current;
    if (Date.now() < refreshBlockedUntil) throw lastRefreshError;
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) { redirectToLogin(); throw new Error('Session expired'); }
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/auth/refresh`,
        { refreshToken }, { timeout: 20_000 },
      );
      // Never restore a session after logout or overwrite a different login.
      if (localStorage.getItem('refreshToken') !== refreshToken) {
        throw new Error('Session changed during refresh');
      }
      const { accessToken, refreshToken: nextRefresh } = res.data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', nextRefresh);
      refreshBlockedUntil = 0;
      return accessToken as string;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401 && localStorage.getItem('refreshToken') === refreshToken) {
          redirectToLogin();
        } else {
          const retryAfter = Number(error.response?.headers?.['retry-after']);
          refreshBlockedUntil = Date.now() + (Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 5000);
          lastRefreshError = error;
        }
      }
      throw error;
    }
  };
  // Web Locks coordinates refresh across tabs; the promise coordinates this tab.
  const pending: Promise<string> = (async () => {
    if (typeof navigator !== 'undefined' && navigator.locks) {
      return await navigator.locks.request('khanovmath-auth-refresh', run);
    }
    return run();
  })();
  refreshPromise = pending.finally(() => { refreshPromise = null; });
  return refreshPromise;
}

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = String(originalRequest?.url ?? '');
    const isAuthenticationRequest =
      requestUrl.includes('/auth/login') || requestUrl.includes('/auth/refresh');

    // A 401 during login means "wrong credentials", not "expired session".
    // Refresh failures are handled by the caller that initiated the refresh.
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthenticationRequest
    ) {
      originalRequest._retry = true;
      const failedToken = String(originalRequest.headers?.Authorization ?? '').replace(/^Bearer\s+/i, '');
      try {
        const accessToken = await refreshSession(failedToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 429) {
      const seconds = Math.max(1, Number(error.response.headers?.['retry-after']) || 60);
      const message = `Слишком много запросов. Повторите через ${seconds} сек.`;
      error.message = message;
      if (error.response.data && typeof error.response.data === 'object') error.response.data.message = message;
    }
    return Promise.reject(error);
  },
);

export default api;
