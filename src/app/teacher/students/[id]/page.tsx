'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Cake,
  CircleUser,
  Mail,
  Phone,
  Users,
  Wallet,
} from 'lucide-react';
import api from '@/lib/api';
import { AttendanceRecord, Student } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatCurrency, formatDate, cn } from '@/lib/utils';

export default function TeacherStudentProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: student, isLoading } = useQuery({
    queryKey: ['teacher-student', id],
    queryFn: () => api.get(`/students/${id}`).then((r) => r.data.data as Student),
    enabled: !!id,
  });

  const groupId = student?.groupId ?? student?.group?.id;

  const { data: attendanceRecords = [] } = useQuery({
    queryKey: ['student-attendance', id, groupId],
    queryFn: () =>
      api
        .get('/attendance', { params: { studentId: id, groupId } })
        .then((r) => r.data.data as AttendanceRecord[]),
    enabled: !!id && !!groupId,
  });

  const stats = useMemo(() => {
    const total = attendanceRecords.length;
    const present = attendanceRecords.filter(
      (r) => r.status === 'PRESENT' || r.status === 'LATE',
    ).length;
    const absent = attendanceRecords.filter((r) => r.status === 'ABSENT').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    return { total, present, absent, percentage };
  }, [attendanceRecords]);

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Загрузка...</div>;
  }
  if (!student) {
    return <div className="p-8 text-center text-slate-500">Ученик не найден</div>;
  }

  const initials = getInitials(student.fullName);

  return (
    <div className="max-w-4xl space-y-5">
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          aria-label="Назад"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Назад
        </Button>
      </div>

      {/* Hero card */}
      <Card className="relative overflow-hidden p-0">
        <div className="h-28 bg-gradient-to-br from-rose-500 via-rose-400 to-amber-300" />
        <div className="relative px-5 pb-5 pt-0 sm:px-7">
          <div className="-mt-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-5">
            <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl bg-white text-3xl font-bold text-rose-500 shadow-lg ring-4 ring-white sm:h-32 sm:w-32">
              {initials}
            </div>
            <div className="flex-1 min-w-0 pt-2 sm:pb-1">
              <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                {student.fullName}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StatusPill
                  active={student.isActive}
                  activeLabel="Активен"
                  inactiveLabel="Неактивен"
                />
                {student.group?.name && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
                    <Users className="h-3 w-3" />
                    {student.group.name}
                  </span>
                )}
                {student.gender && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
                    <CircleUser className="h-3 w-3" />
                    {student.gender === 'MALE' ? 'Мужской' : 'Женский'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          label="Посещаемость"
          value={
            stats.total > 0 ? `${stats.percentage}%` : '—'
          }
          hint={
            stats.total > 0
              ? `${stats.present} из ${stats.total} занятий`
              : 'Пока нет записей'
          }
          tone={stats.total === 0 ? 'neutral' : stats.percentage >= 80 ? 'good' : stats.percentage >= 60 ? 'warn' : 'bad'}
        />
        <StatCard
          label="Пропусков"
          value={String(stats.absent)}
          hint={stats.absent === 0 ? 'Ни одного' : 'за всё время'}
          tone={stats.absent === 0 ? 'good' : stats.absent <= 3 ? 'warn' : 'bad'}
        />
        <StatCard
          label="Абонемент"
          value={formatCurrency(Number(student.monthlyFee ?? 0))}
          hint="в месяц"
          tone="neutral"
        />
      </div>

      {/* Details */}
      <Card className="overflow-hidden p-0">
        <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/70 px-5 py-3">
          <h2 className="text-sm font-semibold text-slate-700">
            Информация об ученике
          </h2>
        </div>
        <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          <div className="divide-y divide-slate-100">
            <InfoRow
              icon={<Mail className="h-4 w-4" />}
              tint="bg-slate-100 text-slate-600"
              label="Email"
              value={student.user?.email ?? '—'}
            />
            <InfoRow
              icon={<Phone className="h-4 w-4" />}
              tint="bg-emerald-100 text-emerald-600"
              label="Телефон"
              value={formatPhone(student.phone) ?? '—'}
            />
            <InfoRow
              icon={<Cake className="h-4 w-4" />}
              tint="bg-pink-100 text-pink-600"
              label="Дата рождения"
              value={student.birthDate ? formatDate(student.birthDate) : '—'}
            />
          </div>
          <div className="divide-y divide-slate-100">
            <InfoRow
              icon={<Users className="h-4 w-4" />}
              tint="bg-sky-100 text-sky-600"
              label="Группа"
              value={student.group?.name ?? '—'}
            />
            <InfoRow
              icon={<Wallet className="h-4 w-4" />}
              tint="bg-amber-100 text-amber-600"
              label="Абонемент / мес"
              value={formatCurrency(Number(student.monthlyFee ?? 0))}
            />
            <InfoRow
              icon={<CalendarDays className="h-4 w-4" />}
              tint="bg-violet-100 text-violet-600"
              label="Дата поступления"
              value={student.enrolledAt ? formatDate(student.enrolledAt) : '—'}
            />
          </div>
        </div>
      </Card>

      {groupId && (
        <div className="flex justify-end">
          <Link href={`/teacher/groups/${groupId}`}>
            <Button variant="ghost" accent="teacher">
              К группе {student.group?.name ?? ''}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

function StatusPill({
  active,
  activeLabel,
  inactiveLabel,
}: {
  active: boolean;
  activeLabel: string;
  inactiveLabel: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
        active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500',
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          active ? 'bg-emerald-500' : 'bg-slate-400',
        )}
        aria-hidden
      />
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}

function StatCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone: 'good' | 'warn' | 'bad' | 'neutral';
}) {
  const toneClasses: Record<typeof tone, string> = {
    good: 'text-emerald-600',
    warn: 'text-amber-600',
    bad: 'text-rose-600',
    neutral: 'text-slate-700',
  };
  return (
    <Card className="p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className={cn('mt-1 text-2xl font-bold', toneClasses[tone])}>{value}</p>
      {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
    </Card>
  );
}

function InfoRow({
  icon,
  tint,
  label,
  value,
}: {
  icon: React.ReactNode;
  tint: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 px-5 py-4">
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
          tint,
        )}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <p className="mt-0.5 break-words text-sm font-medium text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
}

function formatPhone(phone?: string): string | undefined {
  if (!phone) return undefined;
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('998')) {
    const r = digits.slice(3);
    return `+998 ${r.slice(0, 2)} ${r.slice(2, 5)} ${r.slice(5, 7)} ${r.slice(7)}`;
  }
  if (digits.length === 9) {
    return `+998 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`;
  }
  return phone;
}
