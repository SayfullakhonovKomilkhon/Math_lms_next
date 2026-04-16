'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Group, AttendanceSummary } from '@/types';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { TabsBar, TabsBarButton } from '@/components/ui/tabs-bar';
import {
  Calendar,
  Clock,
  Users,
  BookOpen,
  TrendingUp,
  Phone,
} from 'lucide-react';

interface GroupStudent {
  id: string;
  fullName: string;
  phone?: string;
  gender: string;
  isActive: boolean;
  monthlyFee: number;
  user?: { email: string };
}

interface GroupDetailPanelProps {
  group: Group | null;
  onClose: () => void;
}

const DAY_LABELS: Record<string, string> = {
  MONDAY: 'Пн', TUESDAY: 'Вт', WEDNESDAY: 'Ср',
  THURSDAY: 'Чт', FRIDAY: 'Пт', SATURDAY: 'Сб', SUNDAY: 'Вс',
  MON: 'Пн', TUE: 'Вт', WED: 'Ср',
  THU: 'Чт', FRI: 'Пт', SAT: 'Сб', SUN: 'Вс',
};

function ScheduleInfo({ schedule }: { schedule: Record<string, unknown> }) {
  if (!schedule) return <span className="text-slate-400">—</span>;

  // Format: { days: [{day, startTime, endTime}] }
  if (Array.isArray(schedule.days) && schedule.days.length > 0 && typeof schedule.days[0] === 'object') {
    return (
      <div className="space-y-1">
        {(schedule.days as { day: string; startTime: string; endTime: string }[]).map((d) => (
          <div key={d.day} className="flex items-center gap-2 text-sm text-slate-700">
            <span className="w-6 font-medium text-slate-900">{DAY_LABELS[d.day] ?? d.day}</span>
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>{d.startTime} – {d.endTime}</span>
          </div>
        ))}
      </div>
    );
  }

  // Format: { days: ['MONDAY', ...], time: '09:00', duration: 90 }
  if (Array.isArray(schedule.days)) {
    const days = (schedule.days as string[]).map((d) => DAY_LABELS[d] ?? d).join(', ');
    return (
      <div className="text-sm text-slate-700">
        <span>{days}</span>
        {!!schedule.time && (
          <span className="ml-2 text-slate-500">
            <Clock className="mr-1 inline h-3.5 w-3.5" />
            {String(schedule.time)}
            {!!schedule.duration && ` (${String(schedule.duration)} мин)`}
          </span>
        )}
      </div>
    );
  }

  return <span className="text-sm text-slate-400">Нет данных</span>;
}

const TABS = ['Информация', 'Ученики', 'Посещаемость'];

export function GroupDetailPanel({ group, onClose }: GroupDetailPanelProps) {
  const [activeTab, setActiveTab] = useState('Информация');

  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['group-students', group?.id],
    queryFn: () =>
      api.get(`/groups/${group!.id}/students`).then((r) => r.data.data as GroupStudent[]),
    enabled: !!group && activeTab === 'Ученики',
  });

  const { data: summary = [], isLoading: summaryLoading } = useQuery({
    queryKey: ['group-attendance-summary', group?.id],
    queryFn: () =>
      api
        .get('/attendance/summary', { params: { groupId: group!.id } })
        .then((r) => r.data.data as AttendanceSummary[]),
    enabled: !!group && activeTab === 'Посещаемость',
  });

  return (
    <Sheet open={!!group} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        title={group?.name ?? 'Группа'}
        description="Детальная информация о группе"
        className="flex flex-col"
      >
        {group && (
          <>
            {/* Header */}
            <div className="border-b border-slate-100 px-6 pb-4 pt-5 pr-12">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold text-slate-900">{group.name}</h2>
                  <p className="text-sm text-slate-500">{group.teacher?.fullName ?? '—'}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Badge variant={group.isActive ? 'green' : 'gray'}>
                  {group.isActive ? 'Активна' : 'Архив'}
                </Badge>
                <Badge variant="secondary">
                  <Users className="mr-1 inline h-3 w-3" />
                  {group._count?.students ?? 0} / {group.maxStudents}
                </Badge>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-6">
              <TabsBar>
                {TABS.map((tab) => (
                  <TabsBarButton
                    key={tab}
                    accent="admin"
                    active={activeTab === tab}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </TabsBarButton>
                ))}
              </TabsBar>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {activeTab === 'Информация' && (
                <div className="space-y-5">
                  <InfoRow icon={BookOpen} label="Название" value={group.name} />
                  <InfoRow icon={Users} label="Учитель" value={group.teacher?.fullName ?? '—'} />
                  <InfoRow
                    icon={Users}
                    label="Мест"
                    value={`${group._count?.students ?? 0} из ${group.maxStudents}`}
                  />
                  <div>
                    <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
                      Расписание
                    </p>
                    <div className="flex items-start gap-2">
                      <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <ScheduleInfo schedule={group.schedule} />
                    </div>
                  </div>
                  {group.archivedAt && (
                    <InfoRow
                      icon={Calendar}
                      label="Архивирована"
                      value={new Date(group.archivedAt).toLocaleDateString('ru-RU')}
                    />
                  )}
                </div>
              )}

              {activeTab === 'Ученики' && (
                <div>
                  {studentsLoading ? (
                    <p className="text-sm text-slate-400">Загрузка...</p>
                  ) : students.length === 0 ? (
                    <p className="text-sm text-slate-400">В группе нет учеников</p>
                  ) : (
                    <ul className="divide-y divide-slate-100">
                      {students.map((s) => (
                        <li key={s.id} className="flex items-center gap-3 py-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-700">
                            {s.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-900">
                              {s.fullName}
                            </p>
                            {s.phone && (
                              <p className="flex items-center gap-1 text-xs text-slate-500">
                                <Phone className="h-3 w-3" />
                                {s.phone}
                              </p>
                            )}
                          </div>
                          <div className="shrink-0 text-right">
                            <Badge variant={s.isActive ? 'green' : 'gray'} className="text-xs">
                              {s.isActive ? 'Активен' : 'Неактивен'}
                            </Badge>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {activeTab === 'Посещаемость' && (
                <div>
                  {summaryLoading ? (
                    <p className="text-sm text-slate-400">Загрузка...</p>
                  ) : summary.length === 0 ? (
                    <p className="text-sm text-slate-400">Нет данных о посещаемости</p>
                  ) : (
                    <ul className="divide-y divide-slate-100">
                      {summary.map((s) => (
                        <li key={s.studentId} className="py-3">
                          <div className="mb-1.5 flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-slate-900">{s.fullName}</p>
                            <span
                              className={`text-sm font-semibold ${
                                s.percentage >= 80
                                  ? 'text-green-600'
                                  : s.percentage >= 60
                                    ? 'text-yellow-600'
                                    : 'text-red-600'
                              }`}
                            >
                              {s.percentage}%
                            </span>
                          </div>
                          {/* Progress bar */}
                          <div className="mb-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-full rounded-full transition-all ${
                                s.percentage >= 80
                                  ? 'bg-green-500'
                                  : s.percentage >= 60
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                              }`}
                              style={{ width: `${s.percentage}%` }}
                            />
                          </div>
                          <div className="flex gap-3 text-xs text-slate-500">
                            <span className="text-green-600">{s.present} присутствовал</span>
                            <span className="text-yellow-600">{s.late} опоздал</span>
                            <span className="text-red-600">{s.absent} отсутствовал</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Footer stats */}
            {activeTab === 'Посещаемость' && summary.length > 0 && (
              <div className="border-t border-slate-100 px-6 py-4">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>
                    Средняя посещаемость:{' '}
                    <span className="font-semibold text-slate-700">
                      {Math.round(summary.reduce((acc, s) => acc + s.percentage, 0) / summary.length)}%
                    </span>
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 shrink-0 text-slate-400" />
        <span className="text-sm text-slate-800">{value}</span>
      </div>
    </div>
  );
}
