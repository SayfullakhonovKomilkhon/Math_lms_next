'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isAfter,
  isSameDay,
  isWithinInterval,
  parseISO,
  startOfDay,
  startOfMonth,
} from 'date-fns';
import { ru } from 'date-fns/locale';
import { Check, ChevronDown, Clock3, Plus, Search, UserRound, UserX } from 'lucide-react';
import api from '@/lib/api';
import { AttendanceRecord, AttendanceStatus, LessonTopic } from '@/types';
import { InputField } from '@/components/ui/input-field';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  IconMenuItem,
} from '@/components/ui/dropdown-menu';

type UiStatus = AttendanceStatus; // 'PRESENT' | 'ABSENT' | 'LATE'
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
  const todayStart = useMemo(() => startOfDay(today), [today]);
  const todayStr = useMemo(() => format(today, 'yyyy-MM-dd'), [today]);
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

  const { data: topicSuggestions = [] } = useQuery({
    queryKey: ['lesson-topic-suggestions'],
    queryFn: () =>
      api
        .get('/lesson-topics/suggestions?limit=200')
        .then(
          (r) =>
            r.data.data as { topic: string; lastUsedAt: string }[],
        ),
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
    return remote ?? null;
  };

  const latestRequestRef = useRef<Record<string, number>>({});

  const persistAttendance = async (
    studentId: string,
    date: Date,
    next: UiStatus,
  ) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const cellKey = `${studentId}__${dateStr}`;
    const reqId = (latestRequestRef.current[cellKey] ?? 0) + 1;
    latestRequestRef.current[cellKey] = reqId;
    try {
      await api.post('/attendance/bulk', {
        groupId,
        date: dateStr,
        lessonType: 'REGULAR',
        records: [{ studentId, status: next }],
      });
    } catch {
      if (latestRequestRef.current[cellKey] === reqId) {
        setAttendanceMap((prev) => {
          const copy = { ...prev };
          const studentMap = { ...(copy[studentId] ?? {}) };
          delete studentMap[dateStr];
          copy[studentId] = studentMap;
          return copy;
        });
        toast('Не удалось сохранить отметку', 'error');
      }
    }
  };

  const setCellStatus = (studentId: string, date: Date, next: UiStatus) => {
    if (isAfter(startOfDay(date), todayStart)) return;
    const dateStr = format(date, 'yyyy-MM-dd');
    const current = getUiStatus(studentId, date);
    if (current === next) return;

    setAttendanceMap((prev) => {
      const studentMap = { ...(prev[studentId] ?? {}) };
      studentMap[dateStr] = next;
      return { ...prev, [studentId]: studentMap };
    });

    void persistAttendance(studentId, date, next);
  };

  const persistTopic = async (topic: string) => {
    if (!selectedDate || !topic.trim()) return;
    const existing = topics.find((t) => t.date.startsWith(selectedDate));
    if (existing && existing.topic === topic.trim()) return;
    try {
      await api.post('/lesson-topics', {
        groupId,
        date: selectedDate,
        topic: topic.trim(),
      });
      qc.invalidateQueries({ queryKey: ['lesson-topics', groupId] });
      qc.invalidateQueries({ queryKey: ['lesson-topic-suggestions'] });
      toast('Тема сохранена');
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast(msg || 'Не удалось сохранить тему', 'error');
    }
  };

  // Month chips - показываем только прошедшие месяцы и текущий (до 12 назад).
  const monthChips = useMemo(() => {
    const base = startOfMonth(today);
    const chips: Date[] = [];
    for (let i = 11; i >= 0; i -= 1) chips.push(addMonths(base, -i));
    return chips;
  }, [today]);

  return (
    <div className="space-y-4">
      {/* Month chips */}
      <div className="flex flex-wrap items-center gap-2">
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

      {/* Date & topic selector row */}
      <div className="grid gap-3 md:grid-cols-[minmax(200px,1fr)_minmax(280px,2fr)]">
        <div className="relative">
          <InputField
            accent="teacher"
            type="date"
            max={todayStr}
            value={selectedDate}
            onChange={(e) => {
              const v = e.target.value;
              if (v && v > todayStr) return;
              setSelectedDate(v);
              if (v) {
                setCurrentMonth(startOfMonth(parseISO(v)));
              }
            }}
          />
        </div>

        <TopicCombobox
          value={topicInput}
          onChange={setTopicInput}
          onCommit={persistTopic}
          topics={topics}
          suggestions={topicSuggestions}
        />
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
                  ИМЕНА
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
                    const isFuture = isAfter(startOfDay(day), todayStart);
                    return (
                      <td
                        key={`${student.id}-${day.toISOString()}`}
                        className="px-2 py-2 text-center"
                      >
                        <AttendanceCell
                          status={status}
                          disabled={isFuture}
                          onSelect={(next) => setCellStatus(student.id, day, next)}
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

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
        <LegendItem color="bg-emerald-500" label="Был на уроке" />
        <LegendItem color="bg-amber-500" label="Опоздал" />
        <LegendItem color="bg-rose-500" label="Не был на уроке" />
        <span className="text-slate-400">Нажмите на кружок — выберите статус. Изменения сохраняются автоматически.</span>
      </div>
    </div>
  );
}

const STATUS_OPTIONS: {
  value: UiStatus;
  label: string;
  description: string;
  icon: typeof Check;
  iconClass: string;
}[] = [
  {
    value: 'PRESENT',
    label: 'Был на уроке',
    description: 'Присутствовал',
    icon: Check,
    iconClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  {
    value: 'LATE',
    label: 'Опоздал',
    description: 'Пришёл, но с опозданием',
    icon: Clock3,
    iconClass: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  {
    value: 'ABSENT',
    label: 'Не был на уроке',
    description: 'Отсутствовал',
    icon: UserX,
    iconClass: 'border-rose-200 bg-rose-50 text-rose-700',
  },
];

function cellAriaLabel(status: UiStatus | null, disabled?: boolean): string {
  if (disabled) return 'Урок ещё не прошёл';
  switch (status) {
    case 'PRESENT':
      return 'Был на уроке. Открыть выбор статуса';
    case 'LATE':
      return 'Опоздал. Открыть выбор статуса';
    case 'ABSENT':
      return 'Не был на уроке. Открыть выбор статуса';
    default:
      return 'Не отмечен. Открыть выбор статуса';
  }
}

function AttendanceCell({
  status,
  disabled,
  onSelect,
}: {
  status: UiStatus | null;
  disabled?: boolean;
  onSelect: (next: UiStatus) => void;
}) {
  const trigger = (
    <button
      type="button"
      disabled={disabled}
      aria-label={cellAriaLabel(status, disabled)}
      className={cn(
        'inline-flex h-7 w-7 items-center justify-center rounded-full border transition-transform',
        'focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1',
        !disabled && 'hover:scale-110',
        disabled && 'cursor-not-allowed opacity-40',
        status === null && 'border-dashed border-slate-300 bg-white text-slate-300',
        status === 'PRESENT' && 'border-emerald-500 bg-emerald-500 text-white',
        status === 'LATE' && 'border-amber-500 bg-amber-500 text-white',
        status === 'ABSENT' && 'border-rose-500 bg-rose-500 text-white',
      )}
    >
      {status === 'LATE' ? (
        <Clock3 className="h-3.5 w-3.5" strokeWidth={2.5} />
      ) : status === 'ABSENT' ? (
        <UserX className="h-3.5 w-3.5" strokeWidth={2.5} />
      ) : status === 'PRESENT' ? (
        <UserRound className="h-3.5 w-3.5" strokeWidth={2.5} />
      ) : (
        <ChevronDown className="h-3 w-3" strokeWidth={2.5} />
      )}
    </button>
  );

  if (disabled) return trigger;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="center" accent="teacher" className="min-w-[220px]">
        {STATUS_OPTIONS.map((o) => (
          <IconMenuItem
            key={o.value}
            accent="teacher"
            icon={o.icon}
            label={o.label}
            description={o.description}
            iconClassName={o.iconClass}
            data-selected={status === o.value}
            onSelect={() => onSelect(o.value)}
          />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={cn(
          'inline-flex h-4 w-4 items-center justify-center rounded-full text-white',
          color,
        )}
        aria-hidden
      >
        <UserRound className="h-2.5 w-2.5" strokeWidth={2.75} />
      </span>
      <span>{label}</span>
    </div>
  );
}

interface TopicSuggestion {
  topic: string;
  lastUsedAt: string;
}

interface CombinedTopicOption {
  topic: string;
  date?: string;
  isGroupTopic: boolean;
}

function TopicCombobox({
  value,
  onChange,
  onCommit,
  topics,
  suggestions,
}: {
  value: string;
  onChange: (v: string) => void;
  onCommit: (v: string) => void | Promise<void>;
  topics: LessonTopic[];
  suggestions: TopicSuggestion[];
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

  // Combine group-specific topics (with dates) + global suggestions.
  // Group topics appear first, then global suggestions, deduped by topic name.
  const combined: CombinedTopicOption[] = useMemo(() => {
    const seen = new Set<string>();
    const out: CombinedTopicOption[] = [];
    topics.forEach((t) => {
      if (!t.topic) return;
      const key = t.topic.trim().toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      out.push({ topic: t.topic, date: t.date, isGroupTopic: true });
    });
    suggestions.forEach((s) => {
      if (!s.topic) return;
      const key = s.topic.trim().toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      out.push({ topic: s.topic, date: s.lastUsedAt, isGroupTopic: false });
    });
    return out;
  }, [topics, suggestions]);

  const filtered = useMemo(() => {
    if (!query) return combined.slice(0, 50);
    return combined
      .filter((o) => o.topic.toLowerCase().includes(query))
      .slice(0, 50);
  }, [combined, query]);

  const exactMatch = useMemo(
    () =>
      query
        ? combined.some((o) => o.topic.trim().toLowerCase() === query)
        : false,
    [combined, query],
  );

  const canAdd = value.trim().length >= 3 && !exactMatch;

  const handleAdd = () => {
    const trimmed = value.trim();
    if (trimmed.length < 3) return;
    onChange(trimmed);
    setOpen(false);
    void onCommit(trimmed);
  };

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
          onKeyDown={(e) => {
            if (e.key === 'Enter' && canAdd) {
              e.preventDefault();
              handleAdd();
            } else if (e.key === 'Escape') {
              setOpen(false);
            }
          }}
          placeholder="Поиск темы или добавление новой..."
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
          {canAdd && (
            <button
              type="button"
              onClick={handleAdd}
              className="flex w-full items-center gap-2 border-b border-slate-100 px-3 py-2 text-left text-sm text-emerald-700 hover:bg-emerald-50"
            >
              <Plus className="h-4 w-4 shrink-0" />
              <span>
                Добавить новую тему:{' '}
                <span className="font-semibold">«{value.trim()}»</span>
              </span>
            </button>
          )}
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-slate-400">
              {query
                ? canAdd
                  ? 'Совпадений нет. Нажмите «Добавить» выше, чтобы сохранить тему.'
                  : 'Нет совпадений.'
                : 'Пока нет сохранённых тем. Начните вводить название.'}
            </div>
          ) : (
            <ul className="py-1">
              {filtered.map((t, idx) => (
                <li key={`${t.topic}-${idx}`}>
                  <button
                    type="button"
                    className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-emerald-50"
                    onClick={() => {
                      onChange(t.topic);
                      setOpen(false);
                      void onCommit(t.topic);
                    }}
                  >
                    <span className="font-medium text-slate-800">{t.topic}</span>
                    <span className="text-xs text-slate-400">
                      {t.isGroupTopic
                        ? t.date
                          ? format(new Date(t.date), 'dd MMM yyyy', { locale: ru })
                          : ''
                        : 'Из общего списка'}
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
