'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ApiResponse, AttendanceRecord } from '@/types';
import { AttendanceCalendar } from '@/components/attendance/AttendanceCalendar';
import { ClipboardList, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function ParentAttendancePage() {
  const { data: attendanceRes, isLoading } = useQuery({
    queryKey: ['parent-child-attendance'],
    queryFn: () => api.get<ApiResponse<AttendanceRecord[]>>('/parents/me/child/attendance').then(res => res.data),
  });

  if (isLoading) {
    return <div className="flex h-[400px] items-center justify-center">Загрузка данных...</div>;
  }

  const records = attendanceRes?.data || [];

  const stats = {
    present: records.filter(r => r.status === 'PRESENT').length,
    absent: records.filter(r => r.status === 'ABSENT').length,
    late: records.filter(r => r.status === 'LATE').length,
    total: records.length,
    percent: records.length > 0 
      ? Math.round(((records.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length) / records.length) * 100) 
      : 0
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 leading-tight flex items-center gap-3">
          <ClipboardList className="h-8 w-8 text-blue-600" />
          Посещаемость ребенка
        </h1>
        <p className="text-slate-500 mt-1 ml-11">
          Контроль визитов и причины пропусков
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatItem title="Всего уроков" value={stats.total} icon={<ClipboardList className="text-slate-400" />} />
        <StatItem title="Посещаемость" value={`${stats.percent}%`} icon={<TrendingUp className="text-blue-500" />} />
        <StatItem title="Пропуски" value={stats.absent} icon={<AlertCircle className="text-red-500" />} />
        <StatItem title="Присутствие" value={stats.present + stats.late} icon={<CheckCircle2 className="text-green-500" />} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <AttendanceCalendar records={records} />
        </div>
        <div>
            <Card className="shadow-sm border-slate-200">
                <CardContent className="pt-6">
                    <h3 className="font-bold text-slate-800 mb-4">Журнал последних визитов</h3>
                    <div className="space-y-3">
                        {records.slice(0, 5).map(r => (
                            <div key={r.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <div>
                                    <p className="text-sm font-bold text-slate-700">
                                        {new Date(r.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">{r.lessonType}</p>
                                </div>
                                <Badge variant="outline" className={cnStatus(r.status)}>
                                    {r.status}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

function StatItem({ title, value, icon }: any) {
    return (
        <Card className="shadow-sm border-slate-100">
            <CardContent className="pt-6 flex flex-row items-center gap-4">
                <div className="p-3 bg-slate-50 rounded-xl">
                    {icon}
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</p>
                    <p className="text-xl font-black text-slate-900">{value}</p>
                </div>
            </CardContent>
        </Card>
    )
}

function Badge({ children, className, variant }: any) {
    return <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${className}`}>{children}</div>
}

function cnStatus(status: string) {
    switch(status) {
        case 'PRESENT': return 'bg-green-100 text-green-700 border-green-200';
        case 'ABSENT': return 'bg-red-100 text-red-700 border-red-200';
        case 'LATE': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        default: return 'bg-slate-100 text-slate-400 border-slate-200';
    }
}
