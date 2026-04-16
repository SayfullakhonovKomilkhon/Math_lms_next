import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ROLE_HOME_PATHS } from '@/lib/auth-routing';
import { Role } from '@/types';

type AuthSnapshot = {
  state?: {
    user?: {
      role?: string;
    };
    isAuthenticated?: boolean;
  };
};

function readRoleFromCookie(value: string | undefined) {
  if (!value) return null;

  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as AuthSnapshot;
    if (!parsed.state?.isAuthenticated) return null;
    return (parsed.state.user?.role as Role | undefined) ?? null;
  } catch {
    return null;
  }
}

export default async function AdminPage() {
  const cookieStore = await cookies();
  const role = readRoleFromCookie(cookieStore.get('auth-storage')?.value);

  if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
    redirect(ROLE_HOME_PATHS[role]);
  }

  redirect('/login');
}
