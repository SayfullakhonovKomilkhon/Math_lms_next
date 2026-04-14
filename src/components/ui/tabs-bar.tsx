'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Accent = 'admin' | 'teacher';

const activeStyles: Record<Accent, string> = {
  admin: 'border-indigo-600 text-indigo-600',
  teacher: 'border-emerald-600 text-emerald-600',
};

export function TabsBar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn('flex gap-1 border-b border-slate-200 bg-white/50 rounded-t-lg px-1', className)}
      role="tablist"
    >
      {children}
    </div>
  );
}

export function TabsBarButton({
  accent,
  active,
  children,
  onClick,
}: {
  accent: Accent;
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'relative px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px',
        active
          ? activeStyles[accent]
          : 'border-transparent text-slate-500 hover:text-slate-800',
      )}
    >
      {children}
    </button>
  );
}
