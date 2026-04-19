'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import api from '@/lib/api';
import { Student, AttendanceStatus, AttendanceRecord } from '@/types';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type AttendanceMap = Record<string, Record<string, AttendanceStatus>>;

interface GroupSchedule {
  days: string[];
  time: string;
  duration: number;
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

export default function AttendancePage() {
  const qc = useQueryClient();
  const { id: groupId } = useParams<{ id: string }>();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [attendanceMap, setAttendanceMap] = useState<AttendanceMap>({});

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['group-students', groupId],
    queryFn: () => api.get(`/groups/${groupId}/students`).then((r) => r.data.data as Student[]),
  });

  const { data: groupData } = useQuery({
    queryKey: ['group-schedule', groupId],
    queryFn: () => api.get(`/schedule/group/${groupId}`).then((r) => r.data.data as { schedule: GroupSchedule }),
    enabled: !!groupId,
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const allMonthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getLessonDays = (): Date[] => {
    if (!groupData?.schedule) {
      console.log('No groupData.schedule, showing all days');
      return allMonthDays;
    }

    const schedule = groupData.schedule as GroupSchedule;

    if (!schedule.days || !Array.isArray(schedule.days) || schedule.days.length === 0) {
      console.log('No schedule.days or empty array, showing all days', schedule);
      return allMonthDays;
    }
    
    const scheduleDays = schedule.days
      .map((day: string) => DAY_MAP[day as keyof typeof DAY_MAP])
      .filter((d: number | undefined) => d !== undefined);
    
    console.log('Schedule days:', schedule.days, '-> Day numbers:', scheduleDays);
    
    if (scheduleDays.length === 0) {
      console.log('No valid schedule days found, showing all days');
      return allMonthDays;
    }
    
    const lessonDays = allMonthDays.filter(date => {
      const dayOfWeek = date.getDay();
      return scheduleDays.includes(dayOfWeek);
    });
    
    console.log(`Filtered ${lessonDays.length} lesson days from ${allMonthDays.length} total days`);
    return lessonDays;
  };

  const monthDays = getLessonDays();

  const { data: monthAttendance = [], isLoading: isLoadingAttendance } = useQuery({
    queryKey: ['attendance-month', groupId, format(monthStart, 'yyyy-MM-dd'), format(monthEnd, 'yyyy-MM-dd')],
    queryFn: () =>
      api
        .get('/attendance', { 
          params: { 
            groupId, 
            from: format(monthStart, 'yyyy-MM-dd'),
            to: format(monthEnd, 'yyyy-MM-dd')
          } 
        })
        .then((r) => r.data.data as AttendanceRecord[]),
    enabled: !!groupId,
  });

  const activeStudents = students.filter((s) => s.isActive);

  const getAttendanceStatus = (studentId: string, date: Date): AttendanceStatus | null => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const localStatus = attendanceMap[studentId]?.[dateStr];
    if (localStatus) return localStatus;
    
    const record = monthAttendance.find(
      (r) => r.studentId === studentId && isSameDay(new Date(r.date), date)
    );
    return record?.status || null;
  };

  const toggleAttendanceStatus = (studentId: string, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const currentStatus = getAttendanceStatus(studentId, date);

    // Two-state toggle: PRESENT -> ABSENT -> PRESENT.
    const newStatus: AttendanceStatus =
      currentStatus === 'PRESENT' ? 'ABSENT' : 'PRESENT';

    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [dateStr]: newStatus,
      },
    }));
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const updates: Array<{ date: string; records: Array<{ studentId: string; status: AttendanceStatus }> }> = [];
      
      Object.entries(attendanceMap).forEach(([studentId, dates]) => {
        Object.entries(dates).forEach(([dateStr, status]) => {
          let dayUpdate = updates.find(u => u.date === dateStr);
          if (!dayUpdate) {
            dayUpdate = { date: dateStr, records: [] };
            updates.push(dayUpdate);
          }
          dayUpdate.records.push({ studentId, status });
        });
      });

      for (const update of updates) {
        await api.post('/attendance/bulk', {
          groupId,
          date: update.date,
          lessonType: 'REGULAR',
          records: update.records,
        });
      }

      return updates.length;
    },
    onSuccess: (count) => {
      toast(`Сохранено отметок: ${count}`);
      setAttendanceMap({});
      qc.invalidateQueries({ queryKey: ['attendance-month', groupId] });
    },
    onError: (e: unknown) => {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast(msg || 'Ошибка сохранения', 'error');
    },
  });

  const hasChanges = Object.keys(attendanceMap).length > 0;

  const StatusIcon = ({ status }: { status: AttendanceStatus | null }) => {
    if (!status) return <div className="w-6 h-6 rounded-full border-2 border-slate-200" />;

    if (status === 'ABSENT') {
      return (
        <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
          <X className="w-4 h-4 text-white" strokeWidth={3} />
        </div>
      );
    }

    // Legacy LATE records are displayed as PRESENT (was on lesson).
    return (
      <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
        <Check className="w-4 h-4 text-white" strokeWidth={3} />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/teacher/groups/${groupId}`}>
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0" aria-label="Назад">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Журнал посещаемости</h1>
        </div>
        
        {hasChanges && (
          <Button 
            variant="success" 
            onClick={() => saveMutation.mutate()}
            loading={saveMutation.isPending}
          >
            Сохранить изменения
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 capitalize">
              {format(currentMonth, 'LLLL yyyy', { locale: ru })}
            </h3>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentMonth(new Date())}
              >
                Сегодня
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {groupData?.schedule && (() => {
            const schedule = groupData.schedule as GroupSchedule;
            const hasDays = !!schedule.days && Array.isArray(schedule.days) && schedule.days.length > 0;
            
            return (
              <div className="mb-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                {hasDays ? (
                  <>
                    <p className="text-sm text-slate-700">
                      <strong className="text-emerald-800">Расписание:</strong>{' '}
                      {schedule.days.map((day: string, idx: number) => {
                        const dayNames: Record<string, string> = {
                          MONDAY: 'Понедельник',
                          TUESDAY: 'Вторник',
                          WEDNESDAY: 'Среда',
                          THURSDAY: 'Четверг',
                          FRIDAY: 'Пятница',
                          SATURDAY: 'Суббота',
                          SUNDAY: 'Воскресенье',
                        };
                        return (
                          <span key={day}>
                            {dayNames[day] || day}
                            {idx < schedule.days.length - 1 ? ', ' : ''}
                          </span>
                        );
                      })}
                      {schedule.time && (
                        <>
                          {' • '}
                          {schedule.time}
                        </>
                      )}
                      {schedule.duration && (
                        <>
                          {' • '}
                          {schedule.duration} мин
                        </>
                      )}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      Показываются только дни уроков по расписанию ({monthDays.length} {monthDays.length === 1 ? 'день' : monthDays.length < 5 ? 'дня' : 'дней'} в этом месяце)
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-amber-700">
                    ⚠️ Расписание не настроено для этой группы. Показываются все дни месяца.
                  </p>
                )}
              </div>
            );
          })()}

          {isLoading || isLoadingAttendance ? (
            <p className="py-8 text-center text-slate-400">Загрузка...</p>
          ) : activeStudents.length === 0 ? (
            <p className="py-8 text-center text-slate-400">В этой группе нет активных учеников</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-10 bg-white border-r-2 border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-700 min-w-[200px]">
                      Ученик
                    </th>
                    {monthDays.map((day) => {
                      const isToday = isSameDay(day, new Date());
                      return (
                        <th 
                          key={day.toString()} 
                          className={cn(
                            'border-l border-slate-200 px-2 py-2 text-center text-xs font-medium',
                            isToday ? 'bg-emerald-50' : 'bg-slate-50'
                          )}
                        >
                          <div className={cn('font-bold', isToday && 'text-emerald-700')}>
                            {format(day, 'd')}
                          </div>
                          <div className="text-[10px] text-slate-500 uppercase">
                            {format(day, 'EEE', { locale: ru })}
                          </div>
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
                        'border-t border-slate-200',
                        idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                      )}
                    >
                      <td className="sticky left-0 z-10 bg-inherit border-r-2 border-slate-200 px-4 py-3 text-sm font-medium text-slate-900">
                        {student.fullName}
                      </td>
                      {monthDays.map((day) => {
                        const status = getAttendanceStatus(student.id, day);
                        const isToday = isSameDay(day, new Date());
                        return (
                          <td 
                            key={`${student.id}-${day.toString()}`}
                            className={cn(
                              'border-l border-slate-200 px-2 py-3 text-center',
                              isToday && 'bg-emerald-50/50'
                            )}
                          >
                            <button
                              type="button"
                              onClick={() => toggleAttendanceStatus(student.id, day)}
                              className="inline-flex items-center justify-center hover:scale-110 transition-transform"
                            >
                              <StatusIcon status={status} />
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-6 pt-4 border-t flex items-center justify-between">
            <div className="flex flex-wrap gap-4 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" strokeWidth={3} />
                <span>Был на уроке</span>
              </div>
              <div className="flex items-center gap-2">
                <X className="w-4 h-4 text-red-600" strokeWidth={3} />
                <span>Не был на уроке</span>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Кликайте на кружки для изменения статуса
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
