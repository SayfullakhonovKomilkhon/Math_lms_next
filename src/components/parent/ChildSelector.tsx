'use client';

import { Users } from 'lucide-react';
import type { ParentChild } from '@/types';

interface Props {
  children: ParentChild[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

// Compact, mobile-first child picker. For a single child it renders nothing
// so layouts stay clean for the common case. For multiple children we show
// a horizontally scrollable strip of soft pill buttons that's easy to tap.
export function ChildSelector({ children, selectedId, onSelect }: Props) {
  if (children.length <= 1) return null;

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="mb-2 flex items-center gap-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        <Users className="h-3.5 w-3.5" />
        Ребёнок
      </div>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children.map((child) => {
          const active = child.id === selectedId;
          const initials = child.fullName
            .split(' ')
            .map((s) => s[0])
            .filter(Boolean)
            .slice(0, 2)
            .join('')
            .toUpperCase();

          return (
            <button
              key={child.id}
              type="button"
              onClick={() => onSelect(child.id)}
              className={[
                'flex shrink-0 items-center gap-2.5 rounded-2xl border px-3 py-2 text-left text-sm transition-all',
                active
                  ? 'border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-[0_1px_2px_rgba(37,99,235,0.08)]'
                  : 'border-slate-100 bg-white hover:border-slate-200 active:scale-[0.98]',
              ].join(' ')}
            >
              <span
                className={[
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold',
                  active
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600',
                ].join(' ')}
              >
                {initials || '?'}
              </span>
              <span className="min-w-0">
                <span
                  className={[
                    'block truncate text-[13px] font-semibold leading-tight',
                    active ? 'text-blue-900' : 'text-slate-800',
                  ].join(' ')}
                >
                  {child.fullName}
                </span>
                {child.group?.name && (
                  <span
                    className={[
                      'block truncate text-[11px] leading-tight',
                      active ? 'text-blue-500/80' : 'text-slate-400',
                    ].join(' ')}
                  >
                    {child.group.name}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
