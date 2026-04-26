'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  UsersRound,
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
  Wallet,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useCenterBranding } from '@/hooks/useCenterBranding';
import { useSidebarCollapsed } from '@/hooks/useSidebarCollapsed';
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
  { href: '/admin/parents', label: 'Родители', icon: UsersRound },
  { href: '/admin/groups', label: 'Группы', icon: BookOpen },
  { href: '/admin/payments', label: 'Оплаты', icon: CreditCard },
  { href: '/admin/expenses', label: 'Расходы центра', icon: Wallet },
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
  const branding = useCenterBranding();
  const [collapsed, toggleCollapsed] = useSidebarCollapsed();
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
    <aside
      className={cn(
        'relative hidden h-screen shrink-0 flex-col border-r border-slate-200/90 bg-white shadow-sm transition-[width] duration-200 ease-out md:flex',
        collapsed ? 'w-[68px]' : 'w-64',
      )}
      data-collapsed={collapsed}
    >
      {/* Floating collapse toggle, anchored to the right edge so it stays
          visible whether the sidebar is collapsed or expanded. */}
      <button
        type="button"
        onClick={toggleCollapsed}
        aria-label={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
        title={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
        className={cn(
          'absolute -right-3 top-7 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors',
          'hover:bg-slate-50 hover:text-slate-900',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
          t.ring,
        )}
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" />
        )}
      </button>

      <div
        className={cn(
          'shrink-0 py-6 text-white shadow-inner',
          'bg-gradient-to-br',
          t.header,
          collapsed ? 'px-3' : 'px-5',
        )}
      >
        <div
          className={cn(
            'flex items-center',
            collapsed ? 'justify-center' : 'gap-3',
          )}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <span className="block truncate text-lg font-semibold tracking-tight">
                {branding.centerName}
              </span>
              <p className="text-xs font-medium text-white/80">{subtitle}</p>
            </div>
          )}
        </div>
      </div>

      <nav
        className={cn(
          'flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto',
          collapsed ? 'p-2' : 'p-3',
        )}
      >
        {navItems.map(({ href, label, icon: Icon, badge }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              aria-label={label}
              className={cn(
                'flex items-center rounded-lg border-l-[3px] border-transparent text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                t.ring,
                collapsed
                  ? 'h-10 justify-center px-0'
                  : 'gap-3 py-2.5 pl-3 pr-3',
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
              {!collapsed && (
                <>
                  <span className="flex-1">{label}</span>
                  {badge === 'announcements' && <AnnouncementsBadge />}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      <div className={cn('shrink-0', collapsed ? 'p-2' : 'p-3')}>
        {collapsed ? (
          // Compact footer: only the two action icons, no username card.
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              title="Настройки аккаунта"
              aria-label="Настройки аккаунта"
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors',
                'hover:bg-slate-50 hover:text-slate-900',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                t.ring,
              )}
            >
              <Settings className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={logout}
              title="Выйти"
              aria-label="Выйти"
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-colors',
                'hover:bg-slate-100 hover:text-slate-900',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2',
              )}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 shadow-sm">
            <p className="truncate text-xs font-medium text-slate-500">Вошли как</p>
            <p className="mt-0.5 truncate text-sm font-medium text-slate-900">{user?.phone}</p>
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
        )}
      </div>

      <AccountSettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        accent={dialogAccent[variant]}
      />
    </aside>
  );
}
