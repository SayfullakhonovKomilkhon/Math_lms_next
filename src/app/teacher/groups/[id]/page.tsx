'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ChevronRight, Home } from 'lucide-react';
import api from '@/lib/api';
import { Group } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { GroupSidebar } from './_components/GroupSidebar';
import { AttendanceTab } from './_components/AttendanceTab';
import { HomeworkTab } from './_components/HomeworkTab';
import { PracticeTab } from './_components/PracticeTab';
import { TopicsTab } from './_components/TopicsTab';

interface GroupStudent {
  id: string;
  fullName: string;
  phone?: string;
  gender: string;
  isActive: boolean;
  monthlyFee: number | string;
  hasPaidThisMonth?: boolean;
  user?: { email: string };
}

type TabId = 'davomat' | 'homework' | 'practice' | 'online';

const TABS: { id: TabId; label: string }[] = [
  { id: 'davomat', label: 'Посещаемость' },
  { id: 'homework', label: 'Домашние задания' },
  { id: 'practice', label: 'Практика' },
  { id: 'online', label: 'Темы уроков' },
];

const RU_DAY_LABELS: Record<string, string> = {
  MONDAY: 'Понедельник',
  TUESDAY: 'Вторник',
  WEDNESDAY: 'Среда',
  THURSDAY: 'Четверг',
  FRIDAY: 'Пятница',
  SATURDAY: 'Суббота',
  SUNDAY: 'Воскресенье',
};

const ODD_DAYS = new Set(['MONDAY', 'WEDNESDAY', 'FRIDAY']);
const EVEN_DAYS = new Set(['TUESDAY', 'THURSDAY', 'SATURDAY']);

export default function TeacherGroupHubPage() {
  const { id: groupId } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabId>('davomat');

  const { data: group, isLoading: groupLoading } = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => api.get(`/groups/${groupId}`).then((r) => r.data.data as Group),
    enabled: !!groupId,
  });

  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['group-students', groupId],
    queryFn: () =>
      api
        .get(`/groups/${groupId}/students`)
        .then((r) => r.data.data as GroupStudent[]),
    enabled: !!groupId,
  });

  const { data: scheduleWrap } = useQuery({
    queryKey: ['group-schedule', groupId],
    queryFn: () =>
      api
        .get(`/schedule/group/${groupId}`)
        .then(
          (r) =>
            r.data.data as {
              schedule: { days?: string[]; time?: string; duration?: number };
            },
        ),
    enabled: !!groupId,
  });

  const schedule = scheduleWrap?.schedule ??
    (group?.schedule as { days?: string[]; time?: string; duration?: number } | undefined);

  const scheduleLabel = useMemo(() => formatScheduleLabel(schedule), [schedule]);

  const priceLabel = useMemo(() => {
    const fees = students
      .filter((s) => s.isActive)
      .map((s) => Number(s.monthlyFee))
      .filter((n) => Number.isFinite(n) && n > 0);
    if (fees.length === 0) return undefined;
    const freq = new Map<number, number>();
    fees.forEach((f) => freq.set(f, (freq.get(f) ?? 0) + 1));
    let mostCommon = fees[0];
    let bestCount = 0;
    freq.forEach((count, value) => {
      if (count > bestCount) {
        bestCount = count;
        mostCommon = value;
      }
    });
    return formatCurrency(mostCommon).replace(' сум', ' UZS');
  }, [students]);

  const sidebarStudents = useMemo(
    () =>
      students.map((s) => ({
        id: s.id,
        fullName: s.fullName,
        phone: s.phone,
        isActive: s.isActive,
        hasPaidThisMonth: s.hasPaidThisMonth,
      })),
    [students],
  );

  return (
    <div className="space-y-4">
      {/* Page header with breadcrumbs */}
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/teacher/groups">
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0" aria-label="Назад к группам">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-rose-600">
          {groupLoading ? 'Загрузка…' : group?.name ?? 'Группа'}
        </h1>
        <Breadcrumb groupName={group?.name ?? ''} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <GroupSidebar
          groupName={group?.name ?? '—'}
          teacherName={group?.teacher?.fullName}
          priceLabel={priceLabel}
          scheduleLabel={scheduleLabel}
          students={sidebarStudents}
        />

        <Card className="overflow-hidden">
          <div className="overflow-x-auto border-b border-slate-200">
            <div className="flex min-w-max">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={cn(
                    'relative whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                    activeTab === t.id
                      ? 'border-rose-500 text-rose-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800',
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 sm:p-5">
            {activeTab === 'davomat' && (
              <AttendanceTab
                groupId={groupId}
                students={sidebarStudents}
                schedule={schedule}
                studentsLoading={studentsLoading}
              />
            )}

            {activeTab === 'homework' && <HomeworkTab groupId={groupId} />}
            {activeTab === 'practice' && <PracticeTab groupId={groupId} />}
            {activeTab === 'online' && <TopicsTab groupId={groupId} />}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Breadcrumb({ groupName }: { groupName: string }) {
  return (
    <nav
      className="ml-1 flex items-center gap-1 text-xs text-slate-400"
      aria-label="Хлебные крошки"
    >
      <Link
        href="/teacher/dashboard"
        className="inline-flex items-center gap-1 rounded px-1 py-0.5 hover:text-slate-600"
      >
        <Home className="h-3 w-3" />
        Главное меню
      </Link>
      <ChevronRight className="h-3 w-3" />
      <Link
        href="/teacher/groups"
        className="rounded px-1 py-0.5 hover:text-slate-600"
      >
        Группы
      </Link>
      {groupName && (
        <>
          <ChevronRight className="h-3 w-3" />
          <span className="px-1 py-0.5 text-slate-500">{groupName}</span>
        </>
      )}
    </nav>
  );
}

function formatScheduleLabel(
  schedule?: { days?: string[]; time?: string },
): string {
  if (!schedule?.days || schedule.days.length === 0) return '—';
  const days = schedule.days;
  const allOdd = days.every((d) => ODD_DAYS.has(d));
  const allEven = days.every((d) => EVEN_DAYS.has(d));
  let daysLabel: string;
  if (allOdd && days.length === ODD_DAYS.size) daysLabel = 'Нечётные дни';
  else if (allEven && days.length === EVEN_DAYS.size) daysLabel = 'Чётные дни';
  else daysLabel = days.map((d) => RU_DAY_LABELS[d] ?? d).join(', ');
  if (schedule.time) return `${daysLabel} · ${schedule.time}`;
  return daysLabel;
}
