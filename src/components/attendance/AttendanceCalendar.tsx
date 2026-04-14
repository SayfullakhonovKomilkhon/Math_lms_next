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
    <div className="bg-white rounded-xl border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900 capitalize">
          {format(currentDate, 'LLLL yyyy', { locale: ru })}
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-slate-400 py-2">
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
              className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-colors ${status ? colorClass : 'hover:bg-slate-50 border border-transparent'}`}
            >
              <span className={status ? 'font-bold' : 'text-slate-600'}>
                {format(day, 'd')}
              </span>
              {status && (
                <span className="text-[10px] opacity-90 leading-none mt-1">
                  {status === 'PRESENT' ? 'Был' : status === 'ABSENT' ? 'Нет' : 'Опз'}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-4 pt-4 border-t text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span>Был (Present)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-500" />
          <span>Отсутствовал (Absent)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-yellow-500" />
          <span>Опоздал (Late)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-slate-100" />
          <span>Нет урока</span>
        </div>
      </div>
    </div>
  );
}
