'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  BookOpen,
  CreditCard,
  ClipboardList,
  LogOut,
  GraduationCap,
  DollarSign,
  Home,
  Book,
  BarChart2,
  Trophy,
  Calendar,
  Megaphone,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { AccountSettingsDialog } from '@/components/account/AccountSettingsDialog';
import { AnnouncementsBadge } from '@/components/announcements/AnnouncementsBadge';

export type PanelVariant = 'admin' | 'teacher' | 'student' | 'parent';

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: 'announcements';
};

const ADMIN_NAV: NavItem[] = [
  { href: '/admin/students', label: 'Ученики', icon: Users },
  { href: '/admin/groups', label: 'Группы', icon: BookOpen },
  { href: '/admin/payments', label: 'Оплаты', icon: CreditCard },
  { href: '/admin/attendance', label: 'Посещаемость', icon: ClipboardList },
  { href: '/admin/announcements', label: 'Объявления', icon: Megaphone, badge: 'announcements' },
];

const TEACHER_NAV: NavItem[] = [
  { href: '/teacher/groups', label: 'Мои группы', icon: BookOpen },
  { href: '/teacher/salary', label: 'Зарплата', icon: DollarSign },
  { href: '/teacher/announcements', label: 'Объявления', icon: Megaphone, badge: 'announcements' },
];

const STUDENT_NAV: NavItem[] = [
  { href: '/student/dashboard', label: 'Главная', icon: Home },
  { href: '/student/homework', label: 'Домашние задания', icon: Book },
  { href: '/student/grades', label: 'Оценки', icon: BarChart2 },
  { href: '/student/achievements', label: 'Достижения', icon: Trophy },
  { href: '/student/payment', label: 'Оплата', icon: CreditCard },
  { href: '/student/schedule', label: 'Расписание', icon: Calendar },
  { href: '/student/announcements', label: 'Объявления', icon: Megaphone, badge: 'announcements' },
];

const PARENT_NAV: NavItem[] = [
  { href: '/parent/dashboard', label: 'Главная', icon: Home },
  { href: '/parent/attendance', label: 'Посещаемость', icon: ClipboardList },
  { href: '/parent/grades', label: 'Успеваемость', icon: BarChart2 },
  { href: '/parent/homework', label: 'Домашние задания', icon: Book },
  { href: '/parent/achievements', label: 'Достижения', icon: Trophy },
  { href: '/parent/payment', label: 'Оплата', icon: CreditCard },
  { href: '/parent/announcements', label: 'Объявления', icon: Megaphone, badge: 'announcements' },
];

const styles = {
  admin: {
    header: 'from-indigo-600 to-indigo-700',
    active: 'border-indigo-600 bg-indigo-50 text-indigo-900',
    iconActive: 'text-indigo-600',
    ring: 'focus-visible:ring-indigo-500',
  },
  teacher: {
    header: 'from-emerald-600 to-teal-700',
    active: 'border-emerald-600 bg-emerald-50 text-emerald-900',
    iconActive: 'text-emerald-600',
    ring: 'focus-visible:ring-emerald-500',
  },
  student: {
    header: 'from-orange-500 to-orange-600',
    active: 'border-orange-600 bg-orange-50 text-orange-900',
    iconActive: 'text-orange-600',
    ring: 'focus-visible:ring-orange-500',
  },
  parent: {
    header: 'from-blue-600 to-blue-700',
    active: 'border-blue-600 bg-blue-50 text-blue-900',
    iconActive: 'text-blue-600',
    ring: 'focus-visible:ring-blue-500',
  },
} as const;

const dialogAccent = {
  admin: 'indigo',
  teacher: 'emerald',
  student: 'orange',
  parent: 'blue',
} as const;

export function AppSidebar({ variant }: { variant: PanelVariant }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const navItems = (() => {
    if (variant === 'admin') return ADMIN_NAV;
    return { teacher: TEACHER_NAV, student: STUDENT_NAV, parent: PARENT_NAV }[variant];
  })();

  const t = styles[variant];
  const subtitle = {
    admin: 'Панель администратора',
    teacher: 'Панель учителя',
    student: 'Панель ученика',
    parent: 'Панель родителя',
  }[variant];

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200/90 bg-white shadow-sm md:flex">
      <div
        className={cn(
          'px-5 py-6 text-white shadow-inner',
          'bg-gradient-to-br',
          t.header,
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="text-lg font-semibold tracking-tight">MathCenter</span>
            <p className="text-xs font-medium text-white/80">{subtitle}</p>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 p-3 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, badge }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg border-l-[3px] border-transparent py-2.5 pl-3 pr-3 text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                t.ring,
                active
                  ? t.active
                  : 'border-l-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0',
                  active ? t.iconActive : 'text-slate-400',
                )}
              />
              <span className="flex-1">{label}</span>
              {badge === 'announcements' && <AnnouncementsBadge />}
            </Link>
          );
        })}

      </nav>

      <div className="p-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 shadow-sm">
          <p className="truncate text-xs font-medium text-slate-500">Вошли как</p>
          <p className="mt-0.5 truncate text-sm font-medium text-slate-900">{user?.email}</p>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className={cn(
              'mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors',
              'hover:bg-slate-50 hover:text-slate-900',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
              t.ring,
            )}
          >
            <Settings className="h-4 w-4" />
            Настройки аккаунта
          </button>
          <button
            type="button"
            onClick={logout}
            className={cn(
              'mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-transparent px-3 py-2 text-sm font-medium text-slate-500 transition-colors',
              'hover:bg-slate-100 hover:text-slate-900',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2',
            )}
          >
            <LogOut className="h-4 w-4" />
            Выйти
          </button>
        </div>
      </div>

      <AccountSettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        accent={dialogAccent[variant]}
      />
    </aside>
  );
}
