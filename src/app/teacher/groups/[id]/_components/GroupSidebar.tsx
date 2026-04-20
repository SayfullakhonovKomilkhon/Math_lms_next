'use client';

import Link from 'next/link';
import { Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarStudent {
  id: string;
  fullName: string;
  phone?: string;
  isActive: boolean;
  hasPaidThisMonth?: boolean;
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
        <div className="mb-3 min-w-0">
          <h2 className="truncate text-base font-bold text-rose-600">
            {groupName}
          </h2>
          {teacherName && (
            <p className="mt-0.5 truncate text-sm text-slate-500">· {teacherName}</p>
          )}
        </div>

        <dl className="space-y-3 text-sm">
          <InfoLine term="Цена" value={priceLabel ?? '—'} />
          <InfoLine term="Время" value={scheduleLabel} />
          <InfoLine term="Кабинет" value={roomLabel ?? '—'} />
          <InfoLine term="Даты" value={dateRangeLabel ?? '—'} />
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
          {students.map((student, idx) => {
            const paid = student.hasPaidThisMonth === true;
            const dotLabel = paid
              ? 'Оплата за месяц подтверждена'
              : 'Оплата за месяц не получена';
            return (
              <li
                key={student.id}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50/60"
              >
                <span
                  className={cn(
                    'h-2.5 w-2.5 shrink-0 rounded-full',
                    paid ? 'bg-emerald-500' : 'bg-rose-500',
                  )}
                  title={dotLabel}
                  aria-label={dotLabel}
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
                <Link
                  href={`/teacher/students/${student.id}`}
                  aria-label={`Открыть профиль ученика ${student.fullName}`}
                  className="rounded p-1 text-slate-300 hover:bg-slate-100 hover:text-slate-600"
                >
                  <MoreIcon />
                </Link>
              </li>
            );
          })}
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

export type { SidebarStudent };
