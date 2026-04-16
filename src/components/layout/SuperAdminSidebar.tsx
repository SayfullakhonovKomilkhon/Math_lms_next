'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart2,
  BookOpen,
  ClipboardList,
  DollarSign,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Settings,
  TrendingUp,
  UserCog,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/superadmin/dashboard', label: 'Дашборд', icon: LayoutDashboard },
  { href: '/superadmin/staff', label: 'Персонал', icon: UserCog },
  { href: '/superadmin/groups', label: 'Группы', icon: BookOpen },
  { href: '/superadmin/finance', label: 'Финансы', icon: DollarSign },
  { href: '/superadmin/analytics', label: 'Аналитика', icon: BarChart2 },
  { href: '/superadmin/salary', label: 'Зарплаты', icon: TrendingUp },
  { href: '/superadmin/settings', label: 'Настройки', icon: Settings },
  { href: '/superadmin/audit', label: 'Журнал действий', icon: ClipboardList },
];

export function SuperAdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-violet-200/60 bg-white shadow-sm md:flex">
      <div className="bg-gradient-to-br from-violet-600 to-purple-700 px-5 py-6 text-white shadow-inner">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="text-lg font-semibold tracking-tight">MathCenter</span>
            <p className="text-xs font-medium text-white/80">Супер-Администратор</p>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg border-l-[3px] border-transparent py-2.5 pl-3 pr-3 text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2',
                active
                  ? 'border-violet-600 bg-violet-50 text-violet-900'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              )}
            >
              <Icon
                className={cn('h-4 w-4 shrink-0', active ? 'text-violet-600' : 'text-slate-400')}
              />
              {label}
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
            onClick={logout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
          >
            <LogOut className="h-4 w-4" />
            Выйти
          </button>
        </div>
      </div>
    </aside>
  );
}
