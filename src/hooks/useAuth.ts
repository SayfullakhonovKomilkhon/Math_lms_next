'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

export function useAuth() {
  const router = useRouter();
  const { user, isAuthenticated, login: storeLogin, logout: storeLogout } = useAuthStore();

  const login = async (email: string, password: string) => {
    await storeLogin(email, password);
    const role = useAuthStore.getState().user?.role;
    const redirectMap: Record<string, string> = {
      ADMIN: '/admin/students',
      SUPER_ADMIN: '/admin/overview',
      TEACHER: '/teacher/groups',
      STUDENT: '/student/dashboard',
      PARENT: '/parent/dashboard',
    };
    router.push(redirectMap[role ?? ''] || '/login');
  };

  const logout = () => {
    storeLogout();
    router.push('/login');
  };

  return { user, isAuthenticated, login, logout };
}
