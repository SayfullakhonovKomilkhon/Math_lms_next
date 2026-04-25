'use client';

import { Users } from 'lucide-react';
import type { ParentChild } from '@/types';

interface Props {
  children: ParentChild[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

// Child picker shown on every parent page when the parent has more than
// one child linked to their account. For a single child it renders nothing,
// so layouts stay identical for the common case.
export function ChildSelector({ children, selectedId, onSelect }: Props) {
  if (children.length <= 1) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
        <Users className="h-3.5 w-3.5" />
        Выберите ребёнка
      </div>
      <div className="flex flex-wrap gap-2">
        {children.map((child) => {
          const active = child.id === selectedId;
          return (
            <button
              key={child.id}
              type="button"
              onClick={() => onSelect(child.id)}
              className={[
                'rounded-full border px-3 py-1.5 text-sm transition',
                active
                  ? 'border-blue-500 bg-blue-50 font-semibold text-blue-700'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300',
              ].join(' ')}
            >
              {child.fullName}
              {child.group?.name && (
                <span className="ml-2 text-xs text-slate-400">
                  · {child.group.name}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
