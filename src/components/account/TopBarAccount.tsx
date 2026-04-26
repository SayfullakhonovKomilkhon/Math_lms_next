'use client';

import { useState } from 'react';
import { LogOut, Settings, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { AccountSettingsDialog } from '@/components/account/AccountSettingsDialog';

type Accent = 'indigo' | 'violet' | 'emerald' | 'blue' | 'orange';

interface Props {
  /** Panel accent colour for the dialog primary action. */
  accent?: Accent;
  /**
   * When `compact` is true, shows only an icon button — useful for narrow
   * headers. When false (default), shows the user phone next to the icon on
   * wider screens.
   */
  compact?: boolean;
}

const accentRing: Record<Accent, string> = {
  indigo: 'focus-visible:ring-indigo-500',
  violet: 'focus-visible:ring-violet-500',
  emerald: 'focus-visible:ring-emerald-500',
  blue: 'focus-visible:ring-blue-500',
  orange: 'focus-visible:ring-orange-500',
};

export function TopBarAccount({ accent = 'indigo', compact = false }: Props) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) return null;

  return (
    <>
      <div className="relative ml-auto flex items-center">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
          className={`flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${accentRing[accent]}`}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-slate-600">
            <User className="h-3.5 w-3.5" aria-hidden />
          </span>
          {!compact && (
            <span className="hidden max-w-[160px] truncate sm:inline">{user.phone}</span>
          )}
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 top-full z-50 mt-1 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-lg"
          >
            <div className="border-b border-slate-100 px-3 py-2">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Вошли как</p>
              <p className="mt-0.5 truncate text-sm font-medium text-slate-900">{user.phone}</p>
            </div>
            <button
              type="button"
              role="menuitem"
              onMouseDown={(e) => {
                e.preventDefault();
                setMenuOpen(false);
                setOpen(true);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
            >
              <Settings className="h-4 w-4 text-slate-400" />
              Настройки аккаунта
            </button>
            <button
              type="button"
              role="menuitem"
              onMouseDown={(e) => {
                e.preventDefault();
                setMenuOpen(false);
                logout();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Выйти
            </button>
          </div>
        )}
      </div>

      <AccountSettingsDialog open={open} onClose={() => setOpen(false)} accent={accent} />
    </>
  );
}
