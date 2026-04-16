import { Role } from '@/types';

export const ROLE_HOME_PATHS: Record<Role, string> = {
  SUPER_ADMIN: '/superadmin/dashboard',
  ADMIN: '/admin/students',
  TEACHER: '/teacher/groups',
  STUDENT: '/student/dashboard',
  PARENT: '/parent/dashboard',
};

export const ROLE_ALLOWED_PREFIXES: Record<Role, string[]> = {
  SUPER_ADMIN: ['/superadmin', '/admin'],
  ADMIN: ['/admin'],
  TEACHER: ['/teacher'],
  STUDENT: ['/student'],
  PARENT: ['/parent'],
};

export function isRoleAllowedPath(role: Role, pathname: string): boolean {
  return ROLE_ALLOWED_PREFIXES[role].some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

