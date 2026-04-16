'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart2,
  Book,
  BookOpen,
  CalendarCheck2,
  CreditCard,
  Home,
  Megaphone,
  Settings,
  Trophy,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type MobileNavVariant = 'admin' | 'teacher' | 'student' | 'parent' | 'superadmin';

type MobileNavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const NAV_ITEMS: Record<MobileNavVariant, MobileNavItem[]> = {
  admin: [
    { href: '/admin', label: 'Главная', icon: Home },
    { href: '/admin/students', label: 'Ученики', icon: Users },
    { href: '/admin/groups', label: 'Группы', icon: BookOpen },
    { href: '/admin/payments', label: 'Оплаты', icon: CreditCard },
    { href: '/admin/attendance', label: 'Учёт', icon: CalendarCheck2 },
  ],
  teacher: [
    { href: '/teacher', label: 'Главная', icon: Home },
    { href: '/teacher/groups', label: 'Группы', icon: Users },
    { href: '/teacher/salary', label: 'Зарплата', icon: CreditCard },
    { href: '/teacher/notifications', label: 'Новости', icon: Megaphone },
    { href: '/teacher/settings/telegram', label: 'Настройки', icon: Settings },
  ],
  student: [
    { href: '/student/dashboard', label: 'Главная', icon: Home },
    { href: '/student/homework', label: 'ДЗ', icon: Book },
    { href: '/student/grades', label: 'Оценки', icon: BarChart2 },
    { href: '/student/achievements', label: 'Награды', icon: Trophy },
    { href: '/student/payment', label: 'Оплата', icon: CreditCard },
  ],
  parent: [
    { href: '/parent/dashboard', label: 'Главная', icon: Home },
    { href: '/parent/attendance', label: 'Учёт', icon: CalendarCheck2 },
    { href: '/parent/grades', label: 'Оценки', icon: BarChart2 },
    { href: '/parent/payment', label: 'Оплата', icon: CreditCard },
    { href: '/parent/announcements', label: 'Объявл.', icon: Megaphone },
  ],
  superadmin: [
    { href: '/superadmin/dashboard', label: 'Главная', icon: Home },
    { href: '/superadmin/staff', label: 'Персонал', icon: Users },
    { href: '/superadmin/groups', label: 'Группы', icon: BookOpen },
    { href: '/superadmin/finance', label: 'Финансы', icon: CreditCard },
    { href: '/superadmin/analytics', label: 'Аналитика', icon: BarChart2 },
  ],
};

export function MobileNav({ variant }: { variant: MobileNavVariant }) {
  const pathname = usePathname();
  const items = NAV_ITEMS[variant];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-200 bg-white/95 backdrop-blur md:hidden">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-2 py-2 text-[11px] font-medium',
              active ? 'text-indigo-600' : 'text-slate-500',
            )}
          >
            <Icon className={cn('h-4 w-4', active && 'text-indigo-600')} />
            <span className="truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

