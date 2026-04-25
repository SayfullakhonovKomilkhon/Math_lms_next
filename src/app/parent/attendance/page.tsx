'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ApiResponse, AttendanceRecord } from '@/types';
import { AttendanceCalendar } from '@/components/attendance/AttendanceCalendar';
import {
  ClipboardList,
  AlertCircle,
  CheckCircle2,
  Clock3,
} from 'lucide-react';
import {
  useParentProfile,
  useSelectedChild,
  PARENT_CHILD_QUERY_DEFAULTS,
} from '@/hooks/useParentProfile';
import { ChildSelector } from '@/components/parent/ChildSelector';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { CardSkeleton } from '@/components/ui/Skeleton';

export default function ParentAttendancePage() {
  const { data: profile } = useParentProfile();
  const { children, selectedId, select } = useSelectedChild(profile);

  const { data: attendanceRes, isLoading } = useQuery({
    queryKey: ['parent-child-attendance', selectedId],
    queryFn: () =>
      api
        .get<ApiResponse<AttendanceRecord[]>>('/parents/me/child/attendance', {
          params: selectedId ? { studentId: selectedId } : {},
        })
        .then((res) => res.data),
    enabled: !!selectedId,
    ...PARENT_CHILD_QUERY_DEFAULTS,
  });

  if (isLoading) {
    return (
      <div className="space-y-5">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  const records = attendanceRes?.data || [];

  const presentCount = records.filter((r) => r.status === 'PRESENT').length;
  const lateCount = records.filter((r) => r.status === 'LATE').length;
  const absentCount = records.filter((r) => r.status === 'ABSENT').length;
  const total = records.length;
  const attended = presentCount + lateCount;
  const percent = total > 0 ? Math.round((attended / total) * 100) : 0;

  const ringStops: { from: string; to: string } =
    percent >= 90
      ? { from: '#10b981', to: '#0d9488' }
      : percent >= 70
        ? { from: '#3b82f6', to: '#4f46e5' }
        : { from: '#f43f5e', to: '#f97316' };

  return (
    <div className="space-y-5 pb-2">
      <ChildSelector children={children} selectedId={selectedId} onSelect={select} />

      <Header
        icon={ClipboardList}
        title="Посещаемость"
        subtitle="Контроль визитов и причины пропусков"
      />

      {/* Hero attendance ring */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-6">
        <div className="flex items-center gap-5">
          <RingBadge percent={percent} stops={ringStops} />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Общая посещаемость
            </p>
            <p className="mt-1 text-3xl font-black text-slate-900">{percent}%</p>
            <p className="mt-1 text-xs text-slate-500">
              {attended} из {total}{' '}
              {total === 1 ? 'урока' : total < 5 && total > 0 ? 'уроков' : 'уроков'} посещено
            </p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          tone="bg-emerald-50 text-emerald-600"
          icon={CheckCircle2}
          value={presentCount}
          label="Присутствие"
        />
        <StatCard
          tone="bg-amber-50 text-amber-600"
          icon={Clock3}
          value={lateCount}
          label="Опоздания"
        />
        <StatCard
          tone="bg-rose-50 text-rose-600"
          icon={AlertCircle}
          value={absentCount}
          label="Пропуски"
        />
      </div>

      {/* Calendar */}
      <AttendanceCalendar records={records} />

      {/* Recent visits */}
      <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <header className="px-4 py-3">
          <h2 className="text-sm font-bold text-slate-800">Журнал последних визитов</h2>
        </header>
        <div className="border-t border-slate-100">
          {records.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-400">
              Записей пока нет
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {records.slice(0, 8).map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800">
                      {format(new Date(r.date), 'd MMMM, EEEE', { locale: ru })}
                    </p>
                    <p className="mt-0.5 text-[11px] uppercase tracking-wide text-slate-400">
                      {r.lessonType?.toLowerCase?.() || '—'}
                    </p>
                  </div>
                  <StatusPill status={r.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function Header({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <h1 className="text-xl font-bold leading-tight text-slate-900 sm:text-2xl">
          {title}
        </h1>
        <p className="mt-0.5 text-[12px] text-slate-500 sm:text-sm">{subtitle}</p>
      </div>
    </div>
  );
}

function RingBadge({
  percent,
  stops,
}: {
  percent: number;
  stops: { from: string; to: string };
}) {
  const r = 38;
  const c = 2 * Math.PI * r;
  const dashOffset = c - (percent / 100) * c;
  const gradId = `ringGrad-${stops.from.slice(1)}`;
  return (
    <div className="relative h-24 w-24 shrink-0">
      <svg className="-rotate-90" viewBox="0 0 100 100">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={stops.from} />
            <stop offset="100%" stopColor={stops.to} />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r={r} fill="none" stroke="#f1f5f9" strokeWidth="10" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-slate-900">{percent}</span>
        <span className="text-[10px] font-semibold tracking-wider text-slate-400">%</span>
      </div>
    </div>
  );
}

function StatCard({
  tone,
  icon: Icon,
  value,
  label,
}: {
  tone: string;
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-xl ${tone}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-xl font-black leading-none text-slate-900">{value}</p>
      <p className="mt-1 text-[11px] font-medium text-slate-500">{label}</p>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { tone: string; label: string }> = {
    PRESENT: { tone: 'bg-emerald-50 text-emerald-700', label: 'Присутствовал' },
    LATE: { tone: 'bg-amber-50 text-amber-700', label: 'Опоздал' },
    ABSENT: { tone: 'bg-rose-50 text-rose-700', label: 'Пропуск' },
  };
  const it = map[status] ?? { tone: 'bg-slate-100 text-slate-500', label: status };
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${it.tone}`}
    >
      {it.label}
    </span>
  );
}
