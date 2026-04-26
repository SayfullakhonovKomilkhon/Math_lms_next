'use client';

import { useRouter } from 'next/navigation';
import { ROLE_HOME_PATHS } from '@/lib/auth-routing';
import { useAuthStore } from '@/store/auth.store';

export function useAuth() {
  const router = useRouter();
  const { user, isAuthenticated, login: storeLogin, logout: storeLogout } = useAuthStore();

  const login = async (phone: string, password: string) => {
    await storeLogin(phone, password);
    const role = useAuthStore.getState().user?.role;
    router.push((role && ROLE_HOME_PATHS[role]) || '/login');
  };

  const logout = () => {
    storeLogout();
    router.push('/login');
  };

  return { user, isAuthenticated, login, logout };
}
