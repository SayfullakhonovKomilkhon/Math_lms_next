'use client';

import Link from 'next/link';
import { Pencil, Trash2, Mail, Plus, DollarSign, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarStudent {
  id: string;
  fullName: string;
  phone?: string;
  isActive: boolean;
}

interface Props {
  groupName: string;
  teacherName?: string;
  priceLabel?: string;
  scheduleLabel: string;
  roomLabel?: string;
  dateRangeLabel?: string;
  students: SidebarStudent[];
  studentsLink?: string;
}

export function GroupSidebar({
  groupName,
  teacherName,
  priceLabel,
  scheduleLabel,
  roomLabel,
  dateRangeLabel,
  students,
  studentsLink,
}: Props) {
  return (
    <aside className="flex w-full flex-col gap-4 lg:max-w-[320px]">
      <Card className="p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold text-rose-600">
              {groupName}
            </h2>
            {teacherName && (
              <p className="mt-0.5 truncate text-sm text-slate-500">· {teacherName}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <ActionIconButton label="Изменить" className="border-amber-200 text-amber-500 hover:bg-amber-50">
              <Pencil className="h-4 w-4" />
            </ActionIconButton>
            <ActionIconButton label="Удалить" className="border-rose-200 text-rose-500 hover:bg-rose-50">
              <Trash2 className="h-4 w-4" />
            </ActionIconButton>
            <ActionIconButton label="Сообщение" className="border-emerald-200 text-emerald-500 hover:bg-emerald-50">
              <Mail className="h-4 w-4" />
            </ActionIconButton>
            <ActionIconButton label="Добавить" className="border-sky-200 text-sky-500 hover:bg-sky-50">
              <Plus className="h-4 w-4" />
            </ActionIconButton>
            <ActionIconButton label="Оплата" className="border-rose-200 text-rose-500 hover:bg-rose-50">
              <DollarSign className="h-4 w-4" />
            </ActionIconButton>
          </div>
        </div>

        <dl className="space-y-3 text-sm">
          <InfoLine term="Narx" value={priceLabel ?? '—'} />
          <InfoLine term="Vaqt" value={scheduleLabel} />
          <InfoLine term="Xona" value={roomLabel ?? '—'} />
          <InfoLine term="Sanalar" value={dateRangeLabel ?? '—'} />
        </dl>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-center gap-2 border-b border-slate-100 bg-slate-50/70 py-2.5 text-slate-400">
          <Users className="h-4 w-4" />
        </div>

        <ul className="divide-y divide-slate-100">
          {students.length === 0 && (
            <li className="px-5 py-6 text-center text-sm text-slate-400">
              В группе нет учеников
            </li>
          )}
          {students.map((student, idx) => (
            <li
              key={student.id}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50/60"
            >
              <span
                className={cn(
                  'h-2.5 w-2.5 shrink-0 rounded-full',
                  student.isActive ? 'bg-rose-500' : 'bg-slate-300',
                )}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800">
                  <span className="mr-1 text-slate-400">{idx + 1}.</span>
                  {student.fullName}
                </p>
              </div>
              {student.phone && (
                <span className="shrink-0 text-xs text-slate-500 tabular-nums">
                  {formatPhone(student.phone)}
                </span>
              )}
              <button
                type="button"
                className="rounded p-1 text-slate-300 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Меню ученика"
              >
                <MoreIcon />
              </button>
            </li>
          ))}
        </ul>

        {studentsLink && (
          <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-2 text-right">
            <Link href={studentsLink}>
              <Button variant="ghost" size="sm" accent="teacher">
                Все ученики
              </Button>
            </Link>
          </div>
        )}
      </Card>
    </aside>
  );
}

function InfoLine({ term, value }: { term: string; value: string }) {
  return (
    <div className="flex flex-wrap gap-x-2 gap-y-0.5">
      <dt className="font-semibold text-slate-700">{term}:</dt>
      <dd className="text-slate-600">{value}</dd>
    </div>
  );
}

function ActionIconButton({
  label,
  className,
  children,
  onClick,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-full border bg-white shadow-sm transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-1',
        className,
      )}
    >
      {children}
    </button>
  );
}

function MoreIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="currentColor"
      aria-hidden
    >
      <circle cx="7" cy="3" r="1.1" />
      <circle cx="7" cy="7" r="1.1" />
      <circle cx="7" cy="11" r="1.1" />
    </svg>
  );
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('998')) {
    const rest = digits.slice(3);
    return `${rest.slice(0, 2)} ${rest.slice(2, 5)} ${rest.slice(5, 7)} ${rest.slice(7)}`;
  }
  if (digits.length === 9) {
    return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`;
  }
  return phone;
}

// Used to keep type re-exported from the page if needed.
export type { SidebarStudent };
