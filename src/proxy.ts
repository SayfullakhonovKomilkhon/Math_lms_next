import { NextRequest, NextResponse } from 'next/server';
import { ROLE_HOME_PATHS, isRoleAllowedPath } from './lib/auth-routing';
import { Role } from './types';

type AuthSnapshot = {
  state?: {
    user?: {
      role?: Role;
    };
    isAuthenticated?: boolean;
  };
};

function readRoleFromCookie(value: string | undefined): Role | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as AuthSnapshot;
    if (!parsed.state?.isAuthenticated) return null;
    return parsed.state.user?.role ?? null;
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authData = request.cookies.get('auth-storage')?.value;
  const role = readRoleFromCookie(authData);

  // Public landing pages — must stay crawlable by search engines and visible
  // to anonymous visitors regardless of locale. Logged-in users still see
  // them (they can navigate to their dashboard via the CTA on the page).
  if (pathname === '/' || pathname === '/uz' || pathname === '/uz/') {
    return NextResponse.next();
  }

  if (pathname.startsWith('/login')) {
    if (role) {
      return NextResponse.redirect(new URL(ROLE_HOME_PATHS[role], request.url));
    }
    return NextResponse.next();
  }

  if (!role) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (!isRoleAllowedPath(role, pathname)) {
    const isProtectedPanel =
      pathname.startsWith('/superadmin') ||
      pathname.startsWith('/admin') ||
      pathname.startsWith('/teacher') ||
      pathname.startsWith('/student') ||
      pathname.startsWith('/parent');

    if (isProtectedPanel) {
      return NextResponse.redirect(new URL(ROLE_HOME_PATHS[role], request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)'],
};

