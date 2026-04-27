'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
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
import {
  AttendanceRecord,
  AttendanceStatus,
  Grade,
  LessonTopic,
} from '@/types';
import { InputField, SelectField } from '@/components/ui/input-field';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import {
  GroupSchedule,
  getScheduleWeekdayIndexes,
} from '@/lib/group-schedule';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  IconMenuItem,
} from '@/components/ui/dropdown-menu';

type UiStatus = AttendanceStatus; // 'PRESENT' | 'ABSENT' | 'LATE'
type AttendanceMap = Record<string, Record<string, UiStatus>>;

// Default upper bound used when the teacher hasn't picked an explicit one
// for the given exam date yet.
const DEFAULT_EXAM_MAX_SCORE = 100;
const EXAM_LESSON_TYPE = 'TEST';

function isExamTopic(topic?: string | null): boolean {
  if (!topic) return false;
  const lowered = topic.toLowerCase();
  return lowered.includes('экзамен') || lowered.includes('exam');
}

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
  const [currentMonth, setCurrentMonth] = useState<Date>(() => startOfMonth(today));
  const [selectedDate, setSelectedDate] = useState<string>(() => format(today, 'yyyy-MM-dd'));
  const [topicInput, setTopicInput] = useState<string>('');
  const [syncedDate, setSyncedDate] = useState<string | null>(null);
  const [attendanceMap, setAttendanceMap] = useState<AttendanceMap>({});

  const monthStart = useMemo(() => startOfMonth(currentMonth), [currentMonth]);
  const monthEnd = useMemo(() => endOfMonth(currentMonth), [currentMonth]);

  // Take every weekday the group meets — supports both the legacy single-slot
  // shape (`schedule.days`) and the new multi-slot shape (`schedule.slots`).
  // If nothing is configured we fall back to "every day", otherwise the
  // calendar would be empty.
  const scheduleWeekdayIndexes = useMemo(
    () => getScheduleWeekdayIndexes(schedule),
    [schedule],
  );

  const lessonDays: Date[] = useMemo(() => {
    const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    if (scheduleWeekdayIndexes.length === 0) return allDays;
    return allDays.filter((date) =>
      scheduleWeekdayIndexes.includes(date.getDay()),
    );
  }, [monthStart, monthEnd, scheduleWeekdayIndexes]);

  // Lesson days that the teacher is actually allowed to pick in the date
  // selector — those that are not in the future. Returned as yyyy-MM-dd
  // strings so the <select> can compare values without timezone surprises.
  const selectableLessonDayStrs = useMemo(
    () =>
      lessonDays
        .filter((d) => !isAfter(startOfDay(d), todayStart))
        .map((d) => format(d, 'yyyy-MM-dd')),
    [lessonDays, todayStart],
  );

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

  const { data: monthGrades = [] } = useQuery({
    queryKey: [
      'grades-month',
      groupId,
      format(monthStart, 'yyyy-MM-dd'),
      format(monthEnd, 'yyyy-MM-dd'),
      EXAM_LESSON_TYPE,
    ],
    queryFn: () =>
      api
        .get('/grades', {
          params: {
            groupId,
            from: format(monthStart, 'yyyy-MM-dd'),
            to: format(monthEnd, 'yyyy-MM-dd'),
            lessonType: EXAM_LESSON_TYPE,
          },
        })
        .then((r) => r.data.data as Grade[]),
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

  // Map yyyy-MM-dd -> lesson topic for that date, used as tooltip on header cells.
  const topicByDate = useMemo(() => {
    const map = new Map<string, string>();
    topics.forEach((t) => {
      if (!t.date || !t.topic) return;
      const key = format(new Date(t.date), 'yyyy-MM-dd');
      map.set(key, t.topic);
    });
    return map;
  }, [topics]);

  const examDates = useMemo(() => {
    const set = new Set<string>();
    topicByDate.forEach((topic, date) => {
      if (isExamTopic(topic)) set.add(date);
    });
    // Live-detect exam mode for the currently selected date based on the
    // typed-but-not-yet-saved value of the topic input. This way the score
    // field appears as soon as the teacher types "экзамен", not only after
    // they explicitly save the topic.
    if (selectedDate && isExamTopic(topicInput)) {
      set.add(selectedDate);
    }
    return set;
  }, [topicByDate, selectedDate, topicInput]);

  // studentId__yyyy-MM-dd -> { score, maxScore }
  const remoteGradeMap = useMemo(() => {
    const map = new Map<string, { score: number; maxScore: number }>();
    monthGrades.forEach((g) => {
      const dateStr = format(new Date(g.date), 'yyyy-MM-dd');
      map.set(`${g.studentId}__${dateStr}`, {
        score: Number(g.score),
        maxScore: Number(g.maxScore) || DEFAULT_EXAM_MAX_SCORE,
      });
    });
    return map;
  }, [monthGrades]);

  // yyyy-MM-dd -> max score from the server (most common value across the
  // students of that date). Used as a starting point for the per-date max
  // input shown inside the cell popover.
  const remoteMaxByDate = useMemo(() => {
    const map = new Map<string, number>();
    monthGrades.forEach((g) => {
      const dateStr = format(new Date(g.date), 'yyyy-MM-dd');
      const next = Number(g.maxScore) || DEFAULT_EXAM_MAX_SCORE;
      // First write wins — backend already keeps it consistent per date.
      if (!map.has(dateStr)) map.set(dateStr, next);
    });
    return map;
  }, [monthGrades]);

  // Local override (latest unsaved/just-saved score) so UI updates instantly.
  const [scoreMap, setScoreMap] = useState<
    Record<string, Record<string, number | null>>
  >({});

  // Local override of the per-date max score. Persists in-memory until
  // the next bulk save, which propagates the new max to all existing
  // grades for that date so they stay consistent.
  const [localMaxByDate, setLocalMaxByDate] = useState<
    Record<string, number>
  >({});

  const getExamMaxScore = (dateStr: string): number => {
    const local = localMaxByDate[dateStr];
    if (typeof local === 'number' && local > 0) return local;
    const remote = remoteMaxByDate.get(dateStr);
    if (remote && remote > 0) return remote;
    return DEFAULT_EXAM_MAX_SCORE;
  };

  const getExamScore = (studentId: string, dateStr: string): number | null => {
    const local = scoreMap[studentId]?.[dateStr];
    if (local !== undefined) return local;
    const remote = remoteGradeMap.get(`${studentId}__${dateStr}`);
    return remote ? remote.score : null;
  };

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

    // If student gets marked ABSENT on an exam day, clear their score.
    if (next === 'ABSENT' && examDates.has(dateStr)) {
      const existing = getExamScore(studentId, dateStr);
      if (existing != null) {
        void persistExamScore(studentId, date, null);
      }
    }
  };

  const persistExamScore = async (
    studentId: string,
    date: Date,
    next: number | null,
  ) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const maxScore = getExamMaxScore(dateStr);
    setScoreMap((prev) => {
      const studentMap = { ...(prev[studentId] ?? {}) };
      studentMap[dateStr] = next;
      return { ...prev, [studentId]: studentMap };
    });
    try {
      await api.post('/grades/bulk', {
        groupId,
        date: dateStr,
        lessonType: EXAM_LESSON_TYPE,
        maxScore,
        records: [{ studentId, score: next }],
      });
      qc.invalidateQueries({
        queryKey: [
          'grades-month',
          groupId,
          format(monthStart, 'yyyy-MM-dd'),
          format(monthEnd, 'yyyy-MM-dd'),
          EXAM_LESSON_TYPE,
        ],
      });
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : undefined;
      toast(msg || 'Не удалось сохранить балл', 'error');
      // Revert optimistic update
      setScoreMap((prev) => {
        const studentMap = { ...(prev[studentId] ?? {}) };
        delete studentMap[dateStr];
        return { ...prev, [studentId]: studentMap };
      });
    }
  };

  // Updates the per-date max score and re-saves any existing grades for
  // that date so they stay consistent (back-end stores `maxScore` per
  // grade, not per date, so we have to push the new ceiling to every
  // record that already exists).
  const persistExamMaxScore = async (date: Date, nextMax: number) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const safe = Math.max(1, Math.round(nextMax));
    if (safe === getExamMaxScore(dateStr)) return;

    const previousMax = getExamMaxScore(dateStr);
    setLocalMaxByDate((prev) => ({ ...prev, [dateStr]: safe }));

    // Collect all currently-known scores for this date and clamp them to
    // the new ceiling so the teacher can shrink the maximum without
    // invalid records being left in the DB.
    const records = activeStudents
      .map((s) => {
        const score = getExamScore(s.id, dateStr);
        if (score == null) return null;
        return { studentId: s.id, score: Math.min(score, safe) };
      })
      .filter(
        (r): r is { studentId: string; score: number } => r !== null,
      );

    // Reflect any clamping locally so the UI updates immediately.
    if (records.length > 0) {
      setScoreMap((prev) => {
        const next = { ...prev };
        for (const r of records) {
          const studentMap = { ...(next[r.studentId] ?? {}) };
          studentMap[dateStr] = r.score;
          next[r.studentId] = studentMap;
        }
        return next;
      });
    }

    try {
      if (records.length > 0) {
        await api.post('/grades/bulk', {
          groupId,
          date: dateStr,
          lessonType: EXAM_LESSON_TYPE,
          maxScore: safe,
          records,
        });
      }
      qc.invalidateQueries({
        queryKey: [
          'grades-month',
          groupId,
          format(monthStart, 'yyyy-MM-dd'),
          format(monthEnd, 'yyyy-MM-dd'),
          EXAM_LESSON_TYPE,
        ],
      });
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : undefined;
      toast(msg || 'Не удалось сохранить макс. балл', 'error');
      setLocalMaxByDate((prev) => {
        const next = { ...prev };
        next[dateStr] = previousMax;
        return next;
      });
    }
  };

  const persistTopic = async (topic: string) => {
    if (!selectedDate || !topic.trim()) return;
    const trimmed = topic.trim();
    const existing = topics.find((t) => t.date.startsWith(selectedDate));
    if (existing && existing.topic === trimmed) return;

    // Optimistically update the lesson-topics cache so the column header
    // turns orange / shows the tooltip without waiting for a refetch.
    const optimisticKey: ['lesson-topics', string] = ['lesson-topics', groupId];
    qc.setQueryData<LessonTopic[]>(optimisticKey, (prev) => {
      const list = prev ?? [];
      const withoutDate = list.filter(
        (t) => !t.date.startsWith(selectedDate),
      );
      return [
        ...withoutDate,
        {
          id: existing?.id ?? `optimistic-${selectedDate}`,
          date: existing?.date ?? `${selectedDate}T00:00:00.000Z`,
          topic: trimmed,
          materials: existing?.materials,
          group: existing?.group,
          teacher: existing?.teacher,
        } satisfies LessonTopic,
      ];
    });

    try {
      await api.post('/lesson-topics', {
        groupId,
        date: selectedDate,
        topic: trimmed,
      });
      qc.invalidateQueries({ queryKey: ['lesson-topics', groupId] });
      qc.invalidateQueries({ queryKey: ['lesson-topic-suggestions'] });
      toast('Тема сохранена');
    } catch (e: unknown) {
      // Roll back optimistic update on failure.
      qc.invalidateQueries({ queryKey: ['lesson-topics', groupId] });
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
          {/*
            Restrict the date picker to the actual lesson days for the
            current month (and not in the future). The native `<input
            type="date">` allows arbitrary dates which made it possible to
            jump to a day that has no schedule entry — confusing for the
            teacher. Using a `<select>` keeps the UX simple and the values
            valid by construction.
          */}
          <SelectField
            accent="teacher"
            value={selectableLessonDayStrs.includes(selectedDate) ? selectedDate : ''}
            onChange={(e) => {
              const v = e.target.value;
              if (!v) return;
              setSelectedDate(v);
              setCurrentMonth(startOfMonth(parseISO(v)));
            }}
            disabled={selectableLessonDayStrs.length === 0}
          >
            {selectableLessonDayStrs.length === 0 && (
              <option value="">Нет прошедших уроков в этом месяце</option>
            )}
            {!selectableLessonDayStrs.includes(selectedDate) &&
              selectableLessonDayStrs.length > 0 && (
                <option value="">Выберите день урока…</option>
              )}
            {selectableLessonDayStrs.map((dateStr) => {
              const d = parseISO(dateStr);
              return (
                <option key={dateStr} value={dateStr}>
                  {format(d, 'dd MMMM yyyy, EEEE', { locale: ru })}
                </option>
              );
            })}
          </SelectField>
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
                <th
                  className={cn(
                    // The sticky names column needs a SOLID background +
                    // higher z-index than the date columns; otherwise the
                    // attendance circles slide visibly under the column when
                    // the user scrolls horizontally.
                    'sticky left-0 z-20 min-w-[180px] border-b border-slate-200 bg-white px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500',
                    'shadow-[1px_0_0_0_rgb(226_232_240)]',
                  )}
                >
                  ИМЕНА
                </th>
                {lessonDays.map((day, idx) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const isSelected =
                    isWithinInterval(day, { start: monthStart, end: monthEnd }) &&
                    dateStr === selectedDate;
                  const topic = topicByDate.get(dateStr);
                  const isExam = examDates.has(dateStr);
                  const dateLabel = format(day, 'dd MMMM yyyy', { locale: ru });
                  const tooltip = topic
                    ? `${dateLabel} — ${topic}${isExam ? ' (введите баллы)' : ''}`
                    : `${dateLabel} — тема не указана`;
                  // For the last few columns the centered tooltip would
                  // overflow the table on the right and force a horizontal
                  // scrollbar. Anchor it to the right instead so it grows
                  // toward the inside of the table.
                  const isNearEnd = idx >= lessonDays.length - 2;
                  const isNearStart = idx <= 1;
                  return (
                    <th
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(dateStr)}
                      className={cn(
                        'group relative cursor-pointer border-b border-slate-200 px-2 py-3 text-center text-xs font-bold transition-colors',
                        isExam
                          ? 'text-amber-600 hover:text-amber-700'
                          : isSelected
                            ? 'text-emerald-700'
                            : 'text-slate-600 hover:text-slate-900',
                        topic && 'underline decoration-dotted underline-offset-4',
                      )}
                    >
                      <span>{format(day, 'dd.MM')}</span>
                      <span
                        role="tooltip"
                        className={cn(
                          'pointer-events-none absolute top-full z-30 mt-1 hidden whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 text-[11px] font-medium text-white shadow-lg group-hover:block group-focus-within:block',
                          isNearEnd
                            ? 'right-0'
                            : isNearStart
                              ? 'left-0'
                              : 'left-1/2 -translate-x-1/2',
                        )}
                      >
                        {tooltip}
                        <span
                          className={cn(
                            'absolute -top-1 h-2 w-2 rotate-45 bg-slate-900',
                            isNearEnd
                              ? 'right-3'
                              : isNearStart
                                ? 'left-3'
                                : 'left-1/2 -translate-x-1/2',
                          )}
                        />
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {activeStudents.map((student, idx) => {
                // IMPORTANT: row background MUST be fully opaque, otherwise
                // the sticky names column (which inherits this background)
                // shows through to the horizontally-scrolling attendance
                // cells beneath. We pass the same color explicitly to the
                // sticky <td> so it doesn't depend on `bg-inherit` (some
                // Safari builds don't propagate <tr> backgrounds reliably).
                const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-slate-50';
                return (
                  <tr
                    key={student.id}
                    className={cn('border-t border-slate-100', rowBg)}
                  >
                    <td
                      className={cn(
                        'sticky left-0 z-10 whitespace-nowrap px-4 py-2.5 text-sm font-medium text-slate-800',
                        rowBg,
                        'shadow-[1px_0_0_0_rgb(226_232_240)]',
                      )}
                    >
                      {student.fullName}
                    </td>
                  {lessonDays.map((day) => {
                    const status = getUiStatus(student.id, day);
                    const isFuture = isAfter(startOfDay(day), todayStart);
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const isExam = examDates.has(dateStr);
                    const examScore = isExam
                      ? getExamScore(student.id, dateStr)
                      : null;
                    return (
                      <td
                        key={`${student.id}-${day.toISOString()}`}
                        className="px-2 py-2 text-center"
                      >
                        <AttendanceCell
                          status={status}
                          disabled={isFuture}
                          onSelect={(next) => setCellStatus(student.id, day, next)}
                          isExam={isExam}
                          examScore={examScore}
                          examMaxScore={getExamMaxScore(dateStr)}
                          onSaveScore={(next) =>
                            persistExamScore(student.id, day, next)
                          }
                          onSaveMaxScore={(nextMax) =>
                            persistExamMaxScore(day, nextMax)
                          }
                        />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
        <LegendItem color="bg-emerald-500" label="Был на уроке" />
        <LegendItem color="bg-amber-500" label="Опоздал" />
        <LegendItem color="bg-rose-500" label="Не был на уроке" />
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">
          <span className="font-semibold">Экзамен</span>
          <span className="text-amber-600/80">— в день экзамена в окне отметки появится поле «Балл»</span>
        </span>
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
  isExam,
  examScore,
  examMaxScore,
  onSaveScore,
  onSaveMaxScore,
}: {
  status: UiStatus | null;
  disabled?: boolean;
  onSelect: (next: UiStatus) => void;
  isExam?: boolean;
  examScore?: number | null;
  examMaxScore?: number;
  onSaveScore?: (next: number | null) => void;
  onSaveMaxScore?: (nextMax: number) => void;
}) {
  const showScoreBadge = isExam && examScore != null;

  const trigger = (
    <button
      type="button"
      disabled={disabled}
      aria-label={cellAriaLabel(status, disabled)}
      className={cn(
        'relative inline-flex h-7 w-7 items-center justify-center rounded-full border transition-transform',
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
      {showScoreBadge ? (
        <span className="absolute -right-2 -top-2 inline-flex min-w-[18px] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white shadow ring-1 ring-white">
          {examScore}
        </span>
      ) : null}
    </button>
  );

  if (disabled) return trigger;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="center" accent="teacher" className="min-w-[240px]">
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
        {isExam ? (
          <ExamScoreInput
            disabled={status === 'ABSENT' || status == null}
            score={examScore ?? null}
            maxScore={examMaxScore ?? DEFAULT_EXAM_MAX_SCORE}
            onSave={onSaveScore ?? (() => undefined)}
            onSaveMax={onSaveMaxScore}
          />
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ExamScoreInput({
  score,
  maxScore,
  disabled,
  onSave,
  onSaveMax,
}: {
  score: number | null;
  maxScore: number;
  disabled?: boolean;
  onSave: (next: number | null) => void;
  onSaveMax?: (nextMax: number) => void;
}) {
  const [value, setValue] = useState<string>(score == null ? '' : String(score));
  const [maxValue, setMaxValue] = useState<string>(String(maxScore));

  // Resync if the prop score updates from elsewhere.
  const lastScoreRef = useRef<number | null>(score);
  if (lastScoreRef.current !== score) {
    lastScoreRef.current = score;
    setValue(score == null ? '' : String(score));
  }

  // Resync the max input when the parent's max changes (e.g. another
  // teacher action updated it, or another date is opened).
  const lastMaxRef = useRef<number>(maxScore);
  if (lastMaxRef.current !== maxScore) {
    lastMaxRef.current = maxScore;
    setMaxValue(String(maxScore));
  }

  const commit = () => {
    const trimmed = value.trim();
    if (trimmed === '') {
      if (score != null) onSave(null);
      return;
    }
    const parsed = Number(trimmed.replace(',', '.'));
    if (!Number.isFinite(parsed)) {
      toast('Введите число', 'error');
      setValue(score == null ? '' : String(score));
      return;
    }
    if (parsed < 0 || parsed > maxScore) {
      toast(`Балл должен быть от 0 до ${maxScore}`, 'error');
      setValue(score == null ? '' : String(score));
      return;
    }
    if (parsed === score) return;
    onSave(parsed);
  };

  const commitMax = () => {
    if (!onSaveMax) return;
    const trimmed = maxValue.trim();
    if (trimmed === '') {
      setMaxValue(String(maxScore));
      return;
    }
    const parsed = Number(trimmed.replace(',', '.'));
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast('Макс. балл должен быть положительным числом', 'error');
      setMaxValue(String(maxScore));
      return;
    }
    const rounded = Math.max(1, Math.round(parsed));
    if (rounded === maxScore) {
      setMaxValue(String(maxScore));
      return;
    }
    onSaveMax(rounded);
  };

  return (
    <div
      className="border-t border-slate-100 px-3 py-2"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-amber-700">
        Балл за экзамен
      </label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={maxScore}
          step="0.5"
          disabled={disabled}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commit();
              (e.target as HTMLInputElement).blur();
            }
            if (e.key === 'Escape') {
              setValue(score == null ? '' : String(score));
              (e.target as HTMLInputElement).blur();
            }
          }}
          placeholder="—"
          className={cn(
            'w-full rounded-md border border-slate-300 px-2 py-1 text-sm',
            'focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200',
            disabled && 'cursor-not-allowed bg-slate-100 text-slate-400',
          )}
        />
        <span className="text-xs text-slate-500">из</span>
        <input
          type="number"
          inputMode="numeric"
          min={1}
          step="1"
          disabled={!onSaveMax}
          value={maxValue}
          onChange={(e) => setMaxValue(e.target.value)}
          onBlur={commitMax}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commitMax();
              (e.target as HTMLInputElement).blur();
            }
            if (e.key === 'Escape') {
              setMaxValue(String(maxScore));
              (e.target as HTMLInputElement).blur();
            }
          }}
          aria-label="Максимальный балл за экзамен"
          className={cn(
            'w-16 rounded-md border border-slate-300 px-2 py-1 text-sm',
            'focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200',
            !onSaveMax && 'cursor-not-allowed bg-slate-100 text-slate-400',
          )}
        />
      </div>
      {disabled ? (
        <p className="mt-1 text-[10px] text-slate-400">
          Сначала отметьте посещаемость (Был / Опоздал).
        </p>
      ) : (
        <p className="mt-1 text-[10px] text-slate-400">
          Нажмите Enter или кликните вне поля — балл сохранится автоматически.
          Макс. балл общий для всех учеников этой даты.
        </p>
      )}
    </div>
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
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const [popoverRect, setPopoverRect] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const updateRect = useCallback(() => {
    if (!rootRef.current) return;
    const r = rootRef.current.getBoundingClientRect();
    setPopoverRect({
      top: r.bottom + 4,
      left: r.left,
      width: r.width,
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updateRect();
  }, [open, updateRect]);

  useEffect(() => {
    if (!open) return;
    const onScrollOrResize = () => updateRect();
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [open, updateRect]);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      const target = e.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (popoverRef.current?.contains(target)) return;
      setOpen(false);
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
          onBlur={(e) => {
            // Auto-save typed topic when focus leaves the field. We always
            // commit (backend dedupes), because exactMatch can be true when
            // the topic merely exists in the global suggestion list while
            // still being unsaved for the currently selected date.
            const next = e.relatedTarget as Node | null;
            if (next && popoverRef.current?.contains(next)) return;
            if (next && rootRef.current?.contains(next)) return;
            const trimmed = value.trim();
            if (trimmed.length >= 3) {
              void onCommit(trimmed);
            }
          }}
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
      {open && popoverRect && typeof document !== 'undefined'
        ? createPortal(
            <div
              ref={popoverRef}
              role="listbox"
              style={{
                position: 'fixed',
                top: popoverRect.top,
                left: popoverRect.left,
                width: popoverRect.width,
                maxHeight: 'min(360px, 50vh)',
              }}
              className="z-[60] flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl"
            >
              {canAdd && (
                <button
                  type="button"
                  onClick={handleAdd}
                  className="flex w-full shrink-0 items-center gap-2 border-b border-slate-100 px-3 py-2 text-left text-sm text-emerald-700 hover:bg-emerald-50"
                >
                  <Plus className="h-4 w-4 shrink-0" />
                  <span>
                    Добавить новую тему:{' '}
                    <span className="font-semibold">«{value.trim()}»</span>
                  </span>
                </button>
              )}
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
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
                          <span className="font-medium text-slate-800">
                            {t.topic}
                          </span>
                          <span className="text-xs text-slate-400">
                            {t.isGroupTopic
                              ? t.date
                                ? format(new Date(t.date), 'dd MMM yyyy', {
                                    locale: ru,
                                  })
                                : ''
                              : 'Из общего списка'}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {filtered.length > 0 ? (
                <div className="shrink-0 border-t border-slate-100 bg-slate-50/80 px-3 py-1 text-[11px] text-slate-400">
                  Показано {filtered.length}
                  {filtered.length === 50 ? ' (макс.)' : ''} · прокрутите список
                </div>
              ) : null}
            </div>,
            document.body,
          )
        : null}
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
