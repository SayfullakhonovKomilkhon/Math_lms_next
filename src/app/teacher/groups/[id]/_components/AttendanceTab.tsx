'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  isWithinInterval,
  parseISO,
  startOfMonth,
} from 'date-fns';
import { ru } from 'date-fns/locale';
import { Check, ChevronDown, Search } from 'lucide-react';
import api from '@/lib/api';
import { AttendanceRecord, AttendanceStatus, LessonTopic } from '@/types';
import { Button } from '@/components/ui/button';
import { InputField } from '@/components/ui/input-field';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

type UiStatus = 'PRESENT' | 'ABSENT';
type AttendanceMap = Record<string, Record<string, UiStatus>>;

interface GroupSchedule {
  days?: string[];
  time?: string;
  duration?: number;
}

const DAY_MAP: Record<string, number> = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 0,
};

export interface AttendanceTabStudent {
  id: string;
  fullName: string;
  isActive: boolean;
}

interface Props {
  groupId: string;
  students: AttendanceTabStudent[];
  schedule?: GroupSchedule;
  studentsLoading?: boolean;
}

export function AttendanceTab({ groupId, students, schedule, studentsLoading }: Props) {
  const qc = useQueryClient();
  const today = useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = useState<Date>(() => startOfMonth(today));
  const [selectedDate, setSelectedDate] = useState<string>(() => format(today, 'yyyy-MM-dd'));
  const [topicInput, setTopicInput] = useState<string>('');
  const [syncedDate, setSyncedDate] = useState<string | null>(null);
  const [attendanceMap, setAttendanceMap] = useState<AttendanceMap>({});

  const monthStart = useMemo(() => startOfMonth(currentMonth), [currentMonth]);
  const monthEnd = useMemo(() => endOfMonth(currentMonth), [currentMonth]);

  const lessonDays: Date[] = useMemo(() => {
    const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const days = schedule?.days ?? [];
    if (days.length === 0) return allDays;
    const indexes = days
      .map((d) => DAY_MAP[d])
      .filter((n) => n !== undefined);
    if (indexes.length === 0) return allDays;
    return allDays.filter((date) => indexes.includes(date.getDay()));
  }, [monthStart, monthEnd, schedule?.days]);

  const { data: monthAttendance = [], isLoading: attendanceLoading } = useQuery({
    queryKey: [
      'attendance-month',
      groupId,
      format(monthStart, 'yyyy-MM-dd'),
      format(monthEnd, 'yyyy-MM-dd'),
    ],
    queryFn: () =>
      api
        .get('/attendance', {
          params: {
            groupId,
            from: format(monthStart, 'yyyy-MM-dd'),
            to: format(monthEnd, 'yyyy-MM-dd'),
          },
        })
        .then((r) => r.data.data as AttendanceRecord[]),
    enabled: !!groupId,
  });

  const { data: topics = [] } = useQuery({
    queryKey: ['lesson-topics', groupId],
    queryFn: () =>
      api
        .get(`/lesson-topics?groupId=${groupId}`)
        .then((r) => r.data.data as LessonTopic[]),
    enabled: !!groupId,
  });

  // Reset topic input to the stored topic whenever the selected date changes.
  // Following the React docs pattern to avoid `react-hooks/set-state-in-effect`.
  if (syncedDate !== selectedDate) {
    const existing = selectedDate
      ? topics.find((t) => t.date.startsWith(selectedDate))
      : undefined;
    setSyncedDate(selectedDate);
    setTopicInput(existing?.topic ?? '');
  }

  const activeStudents = students.filter((s) => s.isActive);

  const recordMap = useMemo(() => {
    const map = new Map<string, AttendanceStatus>();
    monthAttendance.forEach((r) => {
      const key = `${r.studentId}__${format(new Date(r.date), 'yyyy-MM-dd')}`;
      map.set(key, r.status);
    });
    return map;
  }, [monthAttendance]);

  const getUiStatus = (studentId: string, date: Date): UiStatus | null => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const local = attendanceMap[studentId]?.[dateStr];
    if (local) return local;
    const remote = recordMap.get(`${studentId}__${dateStr}`);
    if (!remote) return null;
    // Map any existing "LATE" records to PRESENT in the UI (see task: keep only was/wasn't)
    if (remote === 'ABSENT') return 'ABSENT';
    return 'PRESENT';
  };

  const toggleCell = (studentId: string, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const current = getUiStatus(studentId, date);
    const next: UiStatus | null =
      current === null ? 'PRESENT' : current === 'PRESENT' ? 'ABSENT' : null;

    setAttendanceMap((prev) => {
      const studentMap = { ...(prev[studentId] ?? {}) };
      if (next === null) {
        delete studentMap[dateStr];
      } else {
        studentMap[dateStr] = next;
      }
      return { ...prev, [studentId]: studentMap };
    });
  };

  const hasAttendanceChanges = Object.values(attendanceMap).some(
    (m) => Object.keys(m).length > 0,
  );

  const saveAttendance = useMutation({
    mutationFn: async () => {
      const updates: Array<{
        date: string;
        records: Array<{ studentId: string; status: AttendanceStatus }>;
      }> = [];
      Object.entries(attendanceMap).forEach(([studentId, dates]) => {
        Object.entries(dates).forEach(([dateStr, status]) => {
          let day = updates.find((u) => u.date === dateStr);
          if (!day) {
            day = { date: dateStr, records: [] };
            updates.push(day);
          }
          day.records.push({ studentId, status });
        });
      });
      for (const u of updates) {
        await api.post('/attendance/bulk', {
          groupId,
          date: u.date,
          lessonType: 'REGULAR',
          records: u.records,
        });
      }
      return updates.length;
    },
    onSuccess: (n) => {
      toast(`Сохранено отметок на ${n} ${dayWord(n)}`);
      setAttendanceMap({});
      qc.invalidateQueries({ queryKey: ['attendance-month', groupId] });
    },
    onError: () => toast('Ошибка сохранения', 'error'),
  });

  const saveTopic = useMutation({
    mutationFn: async () => {
      if (!selectedDate || !topicInput.trim()) return;
      await api.post('/lesson-topics', {
        groupId,
        date: selectedDate,
        topic: topicInput.trim(),
      });
    },
    onSuccess: () => {
      toast('Тема урока сохранена');
      qc.invalidateQueries({ queryKey: ['lesson-topics', groupId] });
    },
    onError: (e: unknown) => {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast(msg || 'Не удалось сохранить тему', 'error');
    },
  });

  // Month chips - show a rolling 13-month window around current month
  const monthChips = useMemo(() => {
    const base = startOfMonth(today);
    const chips: Date[] = [];
    for (let i = -6; i <= 6; i += 1) chips.push(addMonths(base, i));
    return chips;
  }, [today]);

  const confirmDisabled = !selectedDate || !topicInput.trim() || saveTopic.isPending;

  return (
    <div className="space-y-4">
      {/* Month chips */}
      <div className="-mx-1 overflow-x-auto">
        <div className="flex min-w-max items-center gap-2 px-1">
          {monthChips.map((m) => {
            const active = isSameDay(startOfMonth(m), startOfMonth(currentMonth));
            return (
              <button
                key={m.toISOString()}
                type="button"
                onClick={() => setCurrentMonth(m)}
                className={cn(
                  'whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors',
                  active
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
                )}
              >
                {formatMonthChip(m)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Date & topic selector row */}
      <div className="grid gap-3 md:grid-cols-[minmax(200px,1fr)_minmax(280px,2fr)_auto]">
        <div className="relative">
          <InputField
            accent="teacher"
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              if (e.target.value) {
                setCurrentMonth(startOfMonth(parseISO(e.target.value)));
              }
            }}
          />
        </div>

        <TopicCombobox
          value={topicInput}
          onChange={setTopicInput}
          topics={topics}
        />

        <Button
          type="button"
          variant="outline"
          accent="teacher"
          className="border-rose-200 text-rose-500 hover:bg-rose-50 hover:text-rose-600"
          onClick={() => saveTopic.mutate()}
          disabled={confirmDisabled}
          loading={saveTopic.isPending}
          aria-label="Сохранить тему"
        >
          <Check className="h-4 w-4" />
        </Button>
      </div>

      {/* Attendance table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        {studentsLoading || attendanceLoading ? (
          <p className="py-10 text-center text-sm text-slate-400">Загрузка...</p>
        ) : activeStudents.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">
            В этой группе нет активных учеников
          </p>
        ) : lessonDays.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">
            В этом месяце нет уроков по расписанию
          </p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 min-w-[180px] border-b border-slate-200 bg-white px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  ISMLAR
                </th>
                {lessonDays.map((day) => {
                  const isSelected =
                    isWithinInterval(day, { start: monthStart, end: monthEnd }) &&
                    format(day, 'yyyy-MM-dd') === selectedDate;
                  return (
                    <th
                      key={day.toISOString()}
                      className={cn(
                        'border-b border-slate-200 px-2 py-3 text-center text-xs font-medium',
                        isSelected ? 'text-emerald-700' : 'text-slate-600',
                      )}
                    >
                      {format(day, 'dd.MM')}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {activeStudents.map((student, idx) => (
                <tr
                  key={student.id}
                  className={cn(
                    'border-t border-slate-100',
                    idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40',
                  )}
                >
                  <td className="sticky left-0 z-10 whitespace-nowrap bg-inherit px-4 py-2.5 text-sm font-medium text-slate-800">
                    {student.fullName}
                  </td>
                  {lessonDays.map((day) => {
                    const status = getUiStatus(student.id, day);
                    return (
                      <td
                        key={`${student.id}-${day.toISOString()}`}
                        className="px-2 py-2 text-center"
                      >
                        <AttendanceDot
                          status={status}
                          onClick={() => toggleCell(student.id, day)}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {hasAttendanceChanges && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
          <p className="text-sm text-emerald-700">
            Есть несохранённые отметки
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAttendanceMap({})}
            >
              Отменить
            </Button>
            <Button
              variant="success"
              size="sm"
              loading={saveAttendance.isPending}
              onClick={() => saveAttendance.mutate()}
            >
              Сохранить
            </Button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
        <LegendItem color="bg-emerald-500" label="Был на уроке" />
        <LegendItem color="bg-rose-500" label="Не был на уроке" />
        <span>Клик по кружку меняет статус</span>
      </div>
    </div>
  );
}

function AttendanceDot({
  status,
  onClick,
}: {
  status: UiStatus | null;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-bold transition-transform hover:scale-110',
        status === null && 'border-slate-200 bg-white text-transparent',
        status === 'PRESENT' && 'border-emerald-500 bg-emerald-500 text-white',
        status === 'ABSENT' && 'border-rose-500 bg-rose-500 text-white',
      )}
      aria-label={
        status === 'PRESENT'
          ? 'Был на уроке'
          : status === 'ABSENT'
            ? 'Не был на уроке'
            : 'Не отмечен'
      }
    >
      A
    </button>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={cn(
          'inline-flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold text-white',
          color,
        )}
        aria-hidden
      >
        A
      </span>
      <span>{label}</span>
    </div>
  );
}

function TopicCombobox({
  value,
  onChange,
  topics,
}: {
  value: string;
  onChange: (v: string) => void;
  topics: LessonTopic[];
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const query = value.trim().toLowerCase();
  const filtered = useMemo(() => {
    const seen = new Set<string>();
    return topics
      .filter((t) => {
        if (!t.topic) return false;
        const key = t.topic.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        if (!query) return true;
        return key.includes(query);
      })
      .slice(0, 30);
  }, [topics, query]);

  return (
    <div className="relative" ref={rootRef}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <InputField
          accent="teacher"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Mavzu qidirish..."
          className="pl-9 pr-9"
        />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
          aria-label="Открыть список"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
      {open && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-slate-400">
              {query
                ? 'Нет совпадений. Нажмите «✓» чтобы сохранить свою тему.'
                : 'Пока нет сохранённых тем. Введите свою.'}
            </div>
          ) : (
            <ul className="py-1">
              {filtered.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-emerald-50"
                    onClick={() => {
                      onChange(t.topic);
                      setOpen(false);
                    }}
                  >
                    <span className="font-medium text-slate-800">{t.topic}</span>
                    <span className="text-xs text-slate-400">
                      {format(new Date(t.date), 'dd MMM yyyy', { locale: ru })}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function formatMonthChip(date: Date): string {
  const m = format(date, 'LLL', { locale: ru });
  const year = format(date, 'yyyy');
  return `${capitalize(m.replace('.', ''))} ${year}`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function dayWord(n: number): string {
  if (n === 1) return 'день';
  if (n >= 2 && n <= 4) return 'дня';
  return 'дней';
}
