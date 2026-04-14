'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ApiResponse, ParentProfile, PaymentSummary, GradeRecord, AttendanceRecord } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Users, 
  Calendar, 
  BarChart, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { PaymentStatusBadge } from '@/components/payments/PaymentStatusBadge';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function ParentDashboard() {
  const { data: profileRes, isLoading: profileLoading } = useQuery({
    queryKey: ['parent-profile'],
    queryFn: () => api.get<ApiResponse<ParentProfile>>('/parents/me').then(res => res.data),
  });

  const { data: paymentRes } = useQuery({
    queryKey: ['parent-child-payment'],
    queryFn: () => api.get<ApiResponse<PaymentSummary>>('/parents/me/child/payments').then(res => res.data),
  });

  const { data: gradesRes } = useQuery({
    queryKey: ['parent-child-grades-latest'],
    queryFn: () => api.get<ApiResponse<GradeRecord[]>>('/parents/me/child/grades').then(res => res.data),
  });

  if (profileLoading) {
    return <div className="flex h-[400px] items-center justify-center">Загрузка данных...</div>;
  }

  const profile = profileRes?.data;
  const payment = paymentRes?.data;
  const grades = (gradesRes?.data || []).slice(0, 3);

  if (!profile) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 leading-tight">
            Здравствуйте, {profile.fullName}!
          </h1>
          <p className="text-slate-500 mt-1">
            Контроль обучения вашего ребенка: <span className="font-bold text-blue-600">{profile.child.fullName}</span>
          </p>
        </div>
        <div className="bg-white border rounded-2xl px-5 py-3 shadow-sm flex items-center gap-4">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Группа</p>
            <p className="text-sm font-bold text-slate-800">{profile.child.group.name}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Child Info Card */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="border-b bg-slate-50/50">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Обучение ребенка
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <span className="text-sm text-slate-500">Зачислен:</span>
              <span className="text-sm font-bold text-slate-800">
                {format(new Date(profile.child.enrolledAt), 'LLLL yyyy', { locale: ru })}
              </span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b">
              <span className="text-sm text-slate-500">Преподаватель:</span>
              <span className="text-sm font-bold text-slate-800">{profile.child.group.teacher.fullName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 font-sans">Телефон учителя:</span>
              <span className="text-sm font-bold text-blue-600">{profile.child.group.teacher.phone || '—'}</span>
            </div>
            <Link 
              href="/parent/attendance" 
              className="mt-4 flex items-center justify-center gap-2 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group"
            >
              <Calendar className="h-4 w-4 text-slate-400 group-hover:text-blue-600" />
              <span className="text-xs font-bold text-slate-600">Проверить посещаемость</span>
              <ArrowRight className="h-3 w-3 ml-auto text-slate-300" />
            </Link>
          </CardContent>
        </Card>

        {/* Latest Grades */}
        <Card className="lg:col-span-1 shadow-sm border-slate-200">
          <CardHeader className="border-b bg-slate-50/50 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <BarChart className="h-5 w-5 text-indigo-600" />
              Последние оценки
            </CardTitle>
            <Link href="/parent/grades">
              <ArrowRight className="h-4 w-4 text-slate-400 hover:text-indigo-600 transition-colors" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {grades.length === 0 ? (
                <div className="p-10 text-center text-slate-400 italic text-sm">Нет оценок</div>
              ) : (
                grades.map((grade) => (
                  <div key={grade.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="text-xs font-bold text-slate-400 capitalize">{grade.lessonType}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{format(new Date(grade.date), 'd MMMM', { locale: ru })}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-lg font-black text-slate-900">{grade.score}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">из {grade.maxScore}</p>
                      </div>
                      <div className={`w-1 h-8 rounded-full ${grade.scorePercent >= 80 ? 'bg-green-500' : grade.scorePercent >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment & Action */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="border-b bg-slate-50/50">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Статус оплаты
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="flex flex-col items-center justify-center py-4 px-2 space-y-3">
              <PaymentStatusBadge status={payment?.currentMonth.status || 'UNPAID'} />
              <div className="text-center">
                <p className="text-2xl font-black text-slate-900">{payment?.currentMonth.amount} сум</p>
                <p className="text-xs text-slate-400 font-medium">Сумма за текущий месяц</p>
              </div>
            </div>

            {payment?.currentMonth.status === 'UNPAID' && (
              <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-xl text-red-700">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="text-xs font-medium">Оплата просрочена или не загружена</p>
              </div>
            )}

            <Link 
              href="/parent/payment" 
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              Загрузить чек об оплате
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Announcements */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
           Новости и новости центра
        </h2>
        {/* Placeholder or real query */}
        <div className="p-10 border-2 border-dashed rounded-3xl text-center">
            <p className="text-slate-400 italic">Сводка новостей в разработке</p>
            <Link href="/parent/announcements" className="text-sm font-bold text-blue-600 hover:underline mt-2 inline-block">Перейти к объявлениям</Link>
        </div>
      </div>
    </div>
  );
}
