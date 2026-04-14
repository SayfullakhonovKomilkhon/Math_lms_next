import { NextRequest, NextResponse } from 'next/server';

const ROLE_REDIRECTS: Record<string, string> = {
  ADMIN: '/admin/students',
  SUPER_ADMIN: '/admin/overview',
  TEACHER: '/teacher',
  STUDENT: '/student/dashboard',
  PARENT: '/parent/dashboard',
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const authData = request.cookies.get('auth-storage')?.value;

  const parseAuth = () => {
    if (!authData) return null;
    try {
      const parsed = JSON.parse(decodeURIComponent(authData));
      const user = parsed?.state?.user;
      if (!user || !parsed?.state?.isAuthenticated) return null;
      return user as { role: string };
    } catch {
      return null;
    }
  };

  // Logged-in users should not stay on /login
  if (pathname.startsWith('/login')) {
    const user = parseAuth();
    if (user) {
      const base = ROLE_REDIRECTS[user.role] || '/admin';
      return NextResponse.redirect(new URL(base, request.url));
    }
    return NextResponse.next();
  }

  if (!authData) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(authData));
    const user = parsed?.state?.user;

    if (!user || !parsed?.state?.isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const role = user.role as string;
    const targetBase = ROLE_REDIRECTS[role];

    // Redirect root to role panel
    if (pathname === '/') {
      return NextResponse.redirect(new URL(targetBase || '/login', request.url));
    }

    // Super-admin home is /admin/overview, but they must access all /admin/* sections (students, groups, …).
    // Without this, /admin/students matches another role's base path and was wrongly redirecting to overview.
    if (role === 'SUPER_ADMIN' && pathname.startsWith('/admin')) {
      return NextResponse.next();
    }

    // Enforce role-based access
    if (targetBase && !pathname.startsWith(targetBase)) {
      // Allow if accessing own panel
      const allowedBases = Object.values(ROLE_REDIRECTS);
      const isAnyPanel = allowedBases.some((b) => pathname.startsWith(b));
      if (isAnyPanel) {
        return NextResponse.redirect(new URL(targetBase, request.url));
      }
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!api|_next|favicon.ico|.*\\..*).*)'],
};
