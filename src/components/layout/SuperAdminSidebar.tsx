'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart2,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  DollarSign,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Settings,
  ShieldCheck,
  TrendingUp,
  UserCog,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useCenterBranding } from '@/hooks/useCenterBranding';
import { useSidebarCollapsed } from '@/hooks/useSidebarCollapsed';
import { AccountSettingsDialog } from '@/components/account/AccountSettingsDialog';
import { AnnouncementsBadge } from '@/components/announcements/AnnouncementsBadge';

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: 'announcements';
};

const NAV: NavItem[] = [
  { href: '/superadmin/dashboard', label: 'Дашборд', icon: LayoutDashboard },
  { href: '/superadmin/staff', label: 'Персонал', icon: UserCog },
  { href: '/superadmin/groups', label: 'Группы', icon: BookOpen },
  { href: '/superadmin/finance', label: 'Финансы', icon: DollarSign },
  { href: '/superadmin/expenses', label: 'Расходы центра', icon: Wallet },
  { href: '/superadmin/analytics', label: 'Аналитика', icon: BarChart2 },
  { href: '/superadmin/salary', label: 'Зарплаты', icon: TrendingUp },
  {
    href: '/superadmin/announcements',
    label: 'Объявления',
    icon: Megaphone,
    badge: 'announcements',
  },
  { href: '/superadmin/settings', label: 'Настройки', icon: Settings },
  { href: '/superadmin/audit', label: 'Журнал действий', icon: ClipboardList },
];

export function SuperAdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const branding = useCenterBranding();
  const [collapsed, toggleCollapsed] = useSidebarCollapsed();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <aside
      className={cn(
        'relative hidden h-screen shrink-0 flex-col border-r border-violet-200/60 bg-white shadow-sm transition-[width] duration-200 ease-out md:flex',
        collapsed ? 'w-[68px]' : 'w-64',
      )}
      data-collapsed={collapsed}
    >
      <button
        type="button"
        onClick={toggleCollapsed}
        aria-label={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
        title={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
        className="absolute -right-3 top-7 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-1"
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" />
        )}
      </button>

      <div
        className={cn(
          'shrink-0 bg-gradient-to-br from-violet-600 to-purple-700 py-6 text-white shadow-inner',
          collapsed ? 'px-3' : 'px-5',
        )}
      >
        <div className={cn('flex items-center', collapsed ? 'justify-center' : 'gap-3')}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <span className="block truncate text-lg font-semibold tracking-tight">
                {branding.centerName}
              </span>
              <p className="text-xs font-medium text-white/80">Супер-Администратор</p>
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
        {NAV.map(({ href, label, icon: Icon, badge }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              aria-label={label}
              className={cn(
                'flex items-center rounded-lg border-l-[3px] border-transparent text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2',
                collapsed ? 'h-10 justify-center px-0' : 'gap-3 py-2.5 pl-3 pr-3',
                active
                  ? 'border-violet-600 bg-violet-50 text-violet-900'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              )}
            >
              <Icon
                className={cn('h-4 w-4 shrink-0', active ? 'text-violet-600' : 'text-slate-400')}
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
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              title="Настройки аккаунта"
              aria-label="Настройки аккаунта"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
            >
              <ShieldCheck className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={logout}
              title="Выйти"
              aria-label="Выйти"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
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
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
            >
              <ShieldCheck className="h-4 w-4" />
              Настройки аккаунта
            </button>
            <button
              type="button"
              onClick={logout}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-transparent px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
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
        accent="violet"
      />
    </aside>
  );
}
