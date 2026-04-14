import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

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
    return parsed.state.user?.role ?? null;
  } catch {
    return null;
  }
}

export default async function AdminPage() {
  const cookieStore = await cookies();
  const role = readRoleFromCookie(cookieStore.get('auth-storage')?.value);

  if (role === 'SUPER_ADMIN') {
    redirect('/admin/overview');
  }

  if (role === 'ADMIN') {
    redirect('/admin/students');
  }

  redirect('/login');
}
