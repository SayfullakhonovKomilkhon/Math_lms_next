'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ApiResponse, GroupSchedule } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, User, BookOpen, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface ScheduleData {
  groupId: string;
  groupName: string;
  schedule: GroupSchedule;
  teacher: { fullName: string; phone?: string };
  nextTopic: { date: string; topic: string; materials?: any } | null;
}

const DAY_MAP: Record<string, string> = {
  MON: 'Понедельник',
  TUE: 'Вторник',
  WED: 'Среда',
  THU: 'Четверг',
  FRI: 'Пятница',
  SAT: 'Суббота',
  SUN: 'Воскресенье',
};

const DAY_ORDER = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export default function StudentSchedulePage() {
  const { data: scheduleRes, isLoading } = useQuery({
    queryKey: ['student-schedule-page'],
    queryFn: () => api.get<ApiResponse<ScheduleData>>('/schedule/my').then(res => res.data),
  });

  if (isLoading) {
    return <div className="flex h-[400px] items-center justify-center">Загрузка расписания...</div>;
  }

  const data = scheduleRes?.data;
  if (!data) return null;

  const sortedSchedule = [...(data.schedule?.days || [])].sort(
    (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day)
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 leading-tight flex items-center gap-3">
          <Calendar className="h-8 w-8 text-blue-600" />
          Моё расписание
        </h1>
        <p className="text-slate-500 mt-1 ml-11">
          Группа: <span className="font-bold text-blue-700">{data.groupName}</span>
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Weekly Schedule */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 px-1">
            <Clock className="h-5 w-5 text-slate-400" /> Еженедельные занятия
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {sortedSchedule.length > 0 ? (
              sortedSchedule.map((item, i) => (
                <Card key={i} className="border-slate-200 transition-all hover:border-blue-300 hover:shadow-md group">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1 group-hover:text-blue-700 transition-colors">
                        {DAY_MAP[item.day]}
                      </p>
                      <p className="text-2xl font-black text-slate-900">
                        {item.startTime}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">до {item.endTime}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-blue-50 transition-colors">
                      <Clock className="h-6 w-6 text-slate-300 group-hover:text-blue-400 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="col-span-2 text-center py-12 text-slate-400 italic bg-white rounded-xl border border-dashed">
                Расписание пока не заполнено
              </p>
            )}
          </div>

          <Card className="bg-blue-600 text-white overflow-hidden shadow-xl shadow-blue-100 border-none mt-8">
            <CardContent className="p-8 relative">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black">MathCenter Филиал</h3>
                  <div className="flex items-center gap-2 text-blue-100 italic">
                    <MapPin className="h-4 w-4" />
                    <span>ул. Махтумкули, 79 (ориентир: Экопарк)</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/30 flex items-center justify-center bg-white/10">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-200 uppercase tracking-widest">Ваш учитель</p>
                    <p className="font-bold text-lg">{data.teacher.fullName}</p>
                    <p className="text-xs text-blue-100">{data.teacher.phone || 'Нет телефона'}</p>
                  </div>
                </div>
              </div>
              <div className="absolute top-[-30px] right-[-30px] w-64 h-64 bg-white/5 rounded-full blur-3xl" />
            </CardContent>
          </Card>
        </div>

        {/* Next Topic and Notes */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 px-1">
            <BookOpen className="h-5 w-5 text-slate-400" /> Ближайшая тема
          </h2>
          <Card className="border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            {data.nextTopic ? (
              <>
                <div className="bg-slate-50 px-6 py-4 border-b flex items-center justify-between font-sans">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-white text-blue-600 border-blue-200">
                      {format(new Date(data.nextTopic.date), 'd MMMM', { locale: ru })}
                    </Badge>
                  </div>
                  <span className="text-xs font-bold text-slate-400">
                    {format(new Date(data.nextTopic.date), 'EEEE', { locale: ru })}
                  </span>
                </div>
                <CardContent className="p-6">
                  <h4 className="text-lg font-bold text-slate-900 leading-tight">
                    {data.nextTopic.topic}
                  </h4>
                  <div className="mt-8 space-y-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Материалы к уроку</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 border rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <FileText className="h-4 w-4 text-orange-600" />
                          </div>
                          <span className="text-sm font-medium text-slate-700">Конспект урока</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-600" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="p-12 text-center">
                <p className="text-slate-400 italic">Тема ближайшего урока скоро появится</p>
              </CardContent>
            )}
          </Card>

          <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 font-sans">
            <h5 className="font-bold text-amber-800 flex items-center gap-2 mb-2 text-sm">
              <Info className="h-4 w-4" /> Важная информация
            </h5>
            <p className="text-xs text-amber-700 leading-relaxed">
              Пожалуйста, приходите за 5-10 минут до начала урока, чтобы подготовить свои материалы и вовремя начать занятие.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FileText(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  );
}

function Info(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </svg>
    );
  }
