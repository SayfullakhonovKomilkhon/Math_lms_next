'use client';

import Link from 'next/link';
import { BookOpen, Sparkles } from 'lucide-react';

interface Props {
  groupId: string;
  /** Optional deep link - if provided, render a call-to-action to the existing page. */
  redirectHref?: string;
  redirectLabel?: string;
  label: string;
  description?: string;
}

export function PlaceholderTab({ groupId, redirectHref, redirectLabel, label, description }: Props) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
        <Sparkles className="h-5 w-5" />
      </div>
      <h3 className="text-base font-semibold text-slate-800">{label}</h3>
      <p className="max-w-md text-sm text-slate-500">
        {description ?? 'Эта вкладка пока в разработке. Мы скоро её добавим.'}
      </p>
      {redirectHref && (
        <Link
          href={redirectHref}
          className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-medium text-emerald-700 shadow-sm hover:bg-emerald-50"
        >
          <BookOpen className="h-3.5 w-3.5" />
          {redirectLabel ?? 'Открыть текущую страницу'}
        </Link>
      )}
      <p className="text-[11px] text-slate-400">groupId · {groupId.slice(0, 8)}…</p>
    </div>
  );
}
