'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ApiResponse, StudentProfile, PaymentSummary, Homework, GroupSchedule } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  User, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  TrendingUp,
  Percent
} from 'lucide-react';
import Link from 'next/link';
import { PaymentBanner } from '@/components/payments/PaymentBanner';
import { PaymentStatusBadge } from '@/components/payments/PaymentStatusBadge';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function StudentDashboard() {
  const { data: profileRes, isLoading: profileLoading } = useQuery({
    queryKey: ['student-profile'],
    queryFn: () => api.get<ApiResponse<StudentProfile>>('/students/me').then(res => res.data),
  });

  const { data: paymentRes } = useQuery({
    queryKey: ['student-payment'],
    queryFn: () => api.get<ApiResponse<PaymentSummary>>('/payments/my').then(res => res.data),
  });

  const { data: homeworkRes } = useQuery({
    queryKey: ['student-homework-latest'],
    queryFn: () => api.get<ApiResponse<Homework>>('/homework/my/latest').then(res => res.data),
  });

  const { data: scheduleRes } = useQuery({
    queryKey: ['student-schedule'],
    queryFn: () => api.get<ApiResponse<any>>('/schedule/my').then(res => res.data),
  });

  if (profileLoading) {
    return <div className="flex h-[400px] items-center justify-center">Загрузка...</div>;
  }

  const profile = profileRes?.data;
  const payment = paymentRes?.data;
  const homework = homeworkRes?.data;
  const schedule = scheduleRes?.data;

  if (!profile) return null;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 leading-tight">
            Привет, {profile.fullName}! 👋
          </h1>
          <p className="text-slate-500 mt-1">
            Группа: <span className="font-semibold text-orange-600">{profile.group?.name}</span> • 
            Учитель: <span className="font-medium text-slate-700">{profile.group?.teacher.fullName}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-full border border-orange-200">
          <span className="text-xl">🌱</span>
          <span className="text-sm font-bold text-orange-700 uppercase tracking-wider">Новичок</span>
        </div>
      </div>

      <PaymentBanner 
        daysUntilPayment={payment?.currentMonth.daysUntilPayment ?? null} 
        status={payment?.currentMonth.status ?? 'UNPAID'} 
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<BookOpen className="text-blue-600" />} 
          label="Уроков проведено" 
          value={profile.totalLessons} 
          subValue="Всего в группе" 
        />
        <StatCard 
          icon={<CheckCircle2 className="text-green-600" />} 
          label="Посещаемость" 
          value={`${profile.attendanceStats.percentage}%`} 
          subValue={`${profile.attendanceStats.present} посещений`} 
        />
        <StatCard 
          icon={<Percent className="text-purple-600" />} 
          label="Средний балл" 
          value="—" // This will be from grades stats if desired
          subValue="За всё время" 
        />
        <Card className="shadow-sm border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Clock className="h-5 w-5 text-slate-600" />
              </div>
              <PaymentStatusBadge status={payment?.currentMonth.status || 'UNPAID'} />
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-500 text-nowrap">Статус оплаты</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {payment?.currentMonth.status === 'PAID' ? 'Оплачено' : 'Нужна оплата'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Latest Homework */}
        <Card className="lg:col-span-2 shadow-sm border-slate-200 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-orange-600" />
              Актуальное ДЗ
            </CardTitle>
            <Link href="/student/homework" className="text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1">
              Все задания <ArrowRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent className="pt-6">
            {homework ? (
              <div className="space-y-4">
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap line-clamp-4">
                  {homework.text}
                </p>
                {homework.dueDate && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-slate-800">Срок сдачи:</span>
                    <Badge variant={new Date(homework.dueDate) < new Date() ? "destructive" : "secondary"}>
                      {format(new Date(homework.dueDate), 'd MMMM HH:mm', { locale: ru })}
                    </Badge>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center py-8 text-slate-400 italic">На данный момент домашних заданий нет</p>
            )}
          </CardContent>
        </Card>

        {/* Next Lesson */}
        <Card className="shadow-sm border-slate-200 h-full">
          <CardHeader className="border-b bg-slate-50/50">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Ближайший урок
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {schedule && schedule.schedule ? (
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium text-slate-500">Тема урока:</p>
                  <p className="text-base font-bold text-slate-800 mt-1">
                    {schedule.nextTopic?.topic || 'Тема не указана'}
                  </p>
                </div>
                <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-blue-700 uppercase tracking-wider">Следующее занятие</p>
                    <p className="text-sm font-bold text-blue-900 mt-0.5">
                      {schedule.nextTopic ? format(new Date(schedule.nextTopic.date), 'EEEE, d MMMM', { locale: ru }) : 'Скоро в расписании'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center py-8 text-slate-400 italic">Расписание уточняется</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, subValue }: { icon: React.ReactNode, label: string, value: string | number, subValue: string }) {
  return (
    <Card className="shadow-sm border-slate-200">
      <CardContent className="pt-6">
        <div className="p-2 bg-slate-100 w-fit rounded-lg mb-4">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          <p className="text-xs text-slate-400 mt-1">{subValue}</p>
        </div>
      </CardContent>
    </Card>
  );
}
