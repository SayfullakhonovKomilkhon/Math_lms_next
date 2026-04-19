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
import { PlaceholderTab } from './_components/PlaceholderTab';

interface GroupStudent {
  id: string;
  fullName: string;
  phone?: string;
  gender: string;
  isActive: boolean;
  monthlyFee: number | string;
  user?: { email: string };
}

type TabId =
  | 'davomat'
  | 'homework'
  | 'participation'
  | 'practice'
  | 'online'
  | 'discount'
  | 'exams'
  | 'history'
  | 'notes';

const TABS: { id: TabId; label: string }[] = [
  { id: 'davomat', label: 'Davomat' },
  { id: 'homework', label: 'Uy vazifalari(test)' },
  { id: 'participation', label: 'Faol qatnashuv' },
  { id: 'practice', label: 'Amaliyot' },
  { id: 'online', label: 'Onlayn Darslar va materiallar' },
  { id: 'discount', label: 'Chegirmali Narx' },
  { id: 'exams', label: 'Imtihonlar' },
  { id: 'history', label: 'Tarix' },
  { id: 'notes', label: 'Izohlar' },
];

const UZ_DAY_LABELS: Record<string, string> = {
  MONDAY: 'Dushanba',
  TUESDAY: 'Seshanba',
  WEDNESDAY: 'Chorshanba',
  THURSDAY: 'Payshanba',
  FRIDAY: 'Juma',
  SATURDAY: 'Shanba',
  SUNDAY: 'Yakshanba',
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

            {activeTab === 'homework' && (
              <PlaceholderTab
                groupId={groupId}
                label="Домашние задания"
                description="Тесты и задания для учеников. Временно доступно через старую страницу ДЗ."
                redirectHref={`/teacher/groups/${groupId}/homework`}
                redirectLabel="Открыть ДЗ"
              />
            )}
            {activeTab === 'participation' && (
              <PlaceholderTab
                groupId={groupId}
                label="Faol qatnashuv"
                description="Активность учеников на уроках. Скоро добавим."
              />
            )}
            {activeTab === 'practice' && (
              <PlaceholderTab
                groupId={groupId}
                label="Amaliyot"
                description="Оценки за практику. Временно доступно через текущую страницу оценок."
                redirectHref={`/teacher/groups/${groupId}/grades`}
                redirectLabel="Открыть оценки"
              />
            )}
            {activeTab === 'online' && (
              <PlaceholderTab
                groupId={groupId}
                label="Онлайн уроки и материалы"
                description="Ссылки на материалы будут доступны здесь."
                redirectHref={`/teacher/groups/${groupId}/topics`}
                redirectLabel="Открыть темы уроков"
              />
            )}
            {activeTab === 'discount' && (
              <PlaceholderTab
                groupId={groupId}
                label="Chegirmali Narx"
                description="Индивидуальные скидки ученикам. Скоро."
              />
            )}
            {activeTab === 'exams' && (
              <PlaceholderTab
                groupId={groupId}
                label="Imtihonlar"
                description="Список контрольных и экзаменов. Скоро."
              />
            )}
            {activeTab === 'history' && (
              <PlaceholderTab
                groupId={groupId}
                label="Tarix"
                description="История изменений по группе. Скоро."
              />
            )}
            {activeTab === 'notes' && (
              <PlaceholderTab
                groupId={groupId}
                label="Izohlar"
                description="Заметки и комментарии учителя. Скоро."
              />
            )}
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
        Asosiy menyu
      </Link>
      <ChevronRight className="h-3 w-3" />
      <Link
        href="/teacher/groups"
        className="rounded px-1 py-0.5 hover:text-slate-600"
      >
        Guruhlar
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
  if (allOdd && days.length === ODD_DAYS.size) daysLabel = 'Toq kunlar';
  else if (allEven && days.length === EVEN_DAYS.size) daysLabel = 'Juft kunlar';
  else daysLabel = days.map((d) => UZ_DAY_LABELS[d] ?? d).join(', ');
  if (schedule.time) return `${daysLabel} · ${schedule.time}`;
  return daysLabel;
}
