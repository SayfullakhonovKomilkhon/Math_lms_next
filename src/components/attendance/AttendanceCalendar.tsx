'use client';

import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AttendanceRecord } from '@/types';

interface AttendanceCalendarProps {
  records: AttendanceRecord[];
}

export function AttendanceCalendar({ records }: AttendanceCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarDays = eachDayOfInterval({
    start: monthStart,
    end: monthEnd,
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Determine status color
  const getDayStatus = (day: Date) => {
    const record = records.find((r) => isSameDay(new Date(r.date), day));
    if (!record) return null;
    return record.status;
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'PRESENT': return 'bg-green-500 text-white';
      case 'ABSENT': return 'bg-red-500 text-white';
      case 'LATE': return 'bg-yellow-500 text-white';
      default: return 'bg-slate-100 text-slate-400';
    }
  };

  // Skip leading days to align weekday
  const startDay = getDay(monthStart); // 0 (Sun) to 6 (Sat)
  // Convert to 0 (Mon) to 6 (Sun)
  const adjustedStartDay = (startDay + 6) % 7;
  const blanks = Array(adjustedStartDay).fill(null);

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-6">
      <div className="mb-4 flex items-center justify-between sm:mb-6">
        <h3 className="text-base font-bold capitalize text-slate-900 sm:text-lg">
          {format(currentDate, 'LLLL yyyy', { locale: ru })}
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth} className="h-9 w-9 rounded-xl">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth} className="h-9 w-9 rounded-xl">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="py-1 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-400 sm:text-xs"
          >
            {day}
          </div>
        ))}

        {blanks.map((_, i) => (
          <div key={`blank-${i}`} className="aspect-square" />
        ))}

        {calendarDays.map((day) => {
          const status = getDayStatus(day);
          const colorClass = getStatusColor(status);

          return (
            <div
              key={day.toString()}
              className={`flex aspect-square flex-col items-center justify-center rounded-xl text-sm transition-colors ${
                status ? colorClass : 'border border-transparent hover:bg-slate-50'
              }`}
            >
              <span className={status ? 'font-bold' : 'text-slate-600'}>
                {format(day, 'd')}
              </span>
              {status && (
                <span className="mt-0.5 hidden text-[9px] leading-none opacity-90 sm:block">
                  {status === 'PRESENT' ? 'Был' : status === 'ABSENT' ? 'Нет' : 'Опз'}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-slate-100 pt-3 text-[11px] text-slate-500 sm:mt-6 sm:pt-4 sm:text-xs">
        <Legend color="bg-green-500" label="Был" />
        <Legend color="bg-yellow-500" label="Опоздал" />
        <Legend color="bg-red-500" label="Пропуск" />
        <Legend color="bg-slate-100" label="Нет урока" />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`h-3 w-3 rounded ${color}`} />
      <span>{label}</span>
    </div>
  );
}
