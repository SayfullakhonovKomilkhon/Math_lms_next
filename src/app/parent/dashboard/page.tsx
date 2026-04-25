'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ApiResponse, PaymentSummary, GradeRecord } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  User,
  Users,
  Calendar,
  BarChart,
  CreditCard,
  AlertCircle,
  ArrowRight,
  Trophy,
  Megaphone,
} from 'lucide-react';
import { useMyAnnouncements } from '@/hooks/useAnnouncements';
import {
  useParentProfile,
  useSelectedChild,
  PARENT_CHILD_QUERY_DEFAULTS,
} from '@/hooks/useParentProfile';
import { ChildSelector } from '@/components/parent/ChildSelector';
import Link from 'next/link';
import { PaymentStatusBadge } from '@/components/payments/PaymentStatusBadge';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { CardSkeleton, ProfileSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';

interface AchievementGridEntry {
  unlocked?: boolean;
  icon?: string;
  title?: string;
}

export default function ParentDashboard() {
  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
    refetch,
  } = useParentProfile();

  const { children, selected, selectedId, select } = useSelectedChild(profile);

  const { data: announcementsData } = useMyAnnouncements({ limit: 3 });
  const latestAnnouncements = announcementsData?.data ?? [];

  const { data: paymentRes } = useQuery({
    queryKey: ['parent-child-payment', selectedId],
    queryFn: () =>
      api
        .get<ApiResponse<PaymentSummary>>('/parents/me/child/payments', {
          params: selectedId ? { studentId: selectedId } : {},
        })
        .then((res) => res.data),
    enabled: !!selectedId,
    ...PARENT_CHILD_QUERY_DEFAULTS,
  });

  const { data: gradesRes } = useQuery({
    queryKey: ['parent-child-grades-latest', selectedId],
    queryFn: () =>
      api
        .get<ApiResponse<GradeRecord[]>>('/parents/me/child/grades', {
          params: selectedId ? { studentId: selectedId } : {},
        })
        .then((res) => res.data),
    enabled: !!selectedId,
    ...PARENT_CHILD_QUERY_DEFAULTS,
  });

  const childId = selected?.id;
  const { data: achievementsRes } = useQuery({
    queryKey: ['child-achievements', childId],
    queryFn: () => api.get(`/achievements/student/${childId}`).then((r) => r.data.data),
    enabled: !!childId,
    staleTime: 1000 * 60 * 10,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  if (profileLoading) {
    return (
      <div className="space-y-6">
        <ProfileSkeleton />
        <div className="grid gap-6 lg:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <ErrorState
        message="Не удалось загрузить панель родителя"
        description="Данные о ребёнке временно недоступны."
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  const payment = paymentRes?.data;
  const grades = (gradesRes?.data || []).slice(0, 3);
  const latestAchievement =
    (achievementsRes?.monthGrid as AchievementGridEntry[] | undefined)?.find((entry) => entry.unlocked) ??
    null;

  if (!profile) {
    return (
      <EmptyState
        icon="👨‍👩‍👧"
        message="Профиль родителя пока недоступен"
        description="Попробуйте войти снова или обратитесь к администратору."
      />
    );
  }

  const child = selected;
  const group = child?.group;
  const teacher = group?.teacher;

  // Some legacy parents were imported without `fullName`; show the email as
  // a graceful fallback so the greeting never reads "Здравствуйте, !".
  const greetName =
    (profile.fullName && profile.fullName.trim()) || profile.email || 'родитель';

  if (!child) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 leading-tight">
            Здравствуйте, {greetName}!
          </h1>
          <p className="text-slate-500 mt-1">
            Ваш аккаунт пока не связан с учеником.
          </p>
        </div>
        <EmptyState
          icon="👧"
          message="Ребёнок ещё не привязан"
          description="Обратитесь к администратору, чтобы связать ваш профиль с учеником."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ChildSelector
        children={children}
        selectedId={selectedId}
        onSelect={select}
      />
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 leading-tight">
            Здравствуйте, {greetName}!
          </h1>
          <p className="text-slate-500 mt-1">
            Контроль обучения вашего ребенка:{' '}
            <span className="font-bold text-blue-600">{child.fullName}</span>
          </p>
        </div>
        <div className="bg-white border rounded-2xl px-5 py-3 shadow-sm flex items-center gap-4">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Группа</p>
            <p className="text-sm font-bold text-slate-800">{group?.name ?? '—'}</p>
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
                {child.enrolledAt
                  ? format(new Date(child.enrolledAt), 'LLLL yyyy', { locale: ru })
                  : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b">
              <span className="text-sm text-slate-500">Преподаватель:</span>
              <span className="text-sm font-bold text-slate-800">
                {teacher?.fullName ?? '—'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 font-sans">Телефон учителя:</span>
              <span className="text-sm font-bold text-blue-600">{teacher?.phone || '—'}</span>
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

      {/* Latest Achievement */}
      {latestAchievement && (
        <Link href="/parent/achievements">
          <Card className="cursor-pointer border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-xl">
                {latestAchievement.icon}
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-amber-600">
                  🏆 {child.fullName} получил новое достижение
                </p>
                <p className="font-semibold text-slate-900">{latestAchievement.title}</p>
              </div>
              <Trophy className="h-5 w-5 text-amber-500" />
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Announcements */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-800">
            <Megaphone className="h-5 w-5 text-blue-600" />
            Последние объявления
          </h2>
          <Link
            href="/parent/announcements"
            className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            Все <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {latestAnnouncements.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-8 text-center">
            <Megaphone className="mx-auto mb-2 h-8 w-8 text-slate-300" />
            <p className="text-sm text-slate-400">Объявлений пока нет</p>
          </div>
        ) : (
          <Card>
            <CardContent className="divide-y divide-slate-100 p-0">
              {latestAnnouncements.map((a) => (
                <Link
                  key={a.id}
                  href="/parent/announcements"
                  className="flex items-start gap-3 p-4 transition-colors hover:bg-slate-50"
                >
                  {!a.isRead && (
                    <span
                      aria-hidden
                      className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-sm ${
                        a.isRead ? 'font-medium text-slate-700' : 'font-semibold text-slate-900'
                      }`}
                    >
                      {a.title}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-400">
                      {a.authorName} · {format(new Date(a.createdAt), 'd MMMM, HH:mm', { locale: ru })}
                    </p>
                  </div>
                  {a.isPinned && (
                    <span className="mt-0.5 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-700">
                      Закреплено
                    </span>
                  )}
                </Link>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
