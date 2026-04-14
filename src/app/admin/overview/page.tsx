'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  BookOpen,
  CreditCard,
  TrendingUp,
  UserCheck,
  UserCog,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Debtor, Group, Payment, Student, Teacher } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';

const PIE_COLORS = ['#4f46e5', '#f59e0b', '#ef4444'];

function MetricCard({
  title,
  value,
  hint,
  icon: Icon,
}: {
  title: string;
  value: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-start justify-between p-5">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">{title}</p>
          <p className="text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
          <p className="text-sm text-slate-500">{hint}</p>
        </div>
        <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminOverviewPage() {
  const { user } = useAuth();

  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['students'],
    queryFn: () => api.get('/students').then((r) => r.data.data as Student[]),
    enabled: user?.role === 'SUPER_ADMIN',
  });

  const { data: groups = [], isLoading: groupsLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: () => api.get('/groups').then((r) => r.data.data as Group[]),
    enabled: user?.role === 'SUPER_ADMIN',
  });

  const { data: teachers = [], isLoading: teachersLoading } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => api.get('/teachers').then((r) => r.data.data as Teacher[]),
    enabled: user?.role === 'SUPER_ADMIN',
  });

  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ['payments', 'dashboard'],
    queryFn: () => api.get('/payments').then((r) => r.data.data as Payment[]),
    enabled: user?.role === 'SUPER_ADMIN',
  });

  const { data: debtors = [], isLoading: debtorsLoading } = useQuery({
    queryKey: ['debtors'],
    queryFn: () => api.get('/payments/debtors').then((r) => r.data.data as Debtor[]),
    enabled: user?.role === 'SUPER_ADMIN',
  });

  const loading =
    studentsLoading || groupsLoading || teachersLoading || paymentsLoading || debtorsLoading;

  const dashboard = useMemo(() => {
    const activeStudents = students.filter((item) => item.isActive);
    const activeGroups = groups.filter((item) => item.isActive && !item.archivedAt);
    const activeTeachers = teachers.filter((item) => item.isActive);
    const paymentCoverage = activeStudents.length
      ? Math.round(((activeStudents.length - debtors.length) / activeStudents.length) * 100)
      : 0;
    const pendingPayments = payments.filter((item) => item.status === 'PENDING');
    const confirmedPayments = payments.filter((item) => item.status === 'CONFIRMED');
    const rejectedPayments = payments.filter((item) => item.status === 'REJECTED');
    const expectedMonthlyRevenue = activeStudents.reduce(
      (sum, item) => sum + Number(item.monthlyFee ?? 0),
      0,
    );
    const confirmedRevenue = confirmedPayments.reduce(
      (sum, item) => sum + Number(item.amount ?? 0),
      0,
    );

    const studentsByGroup = activeGroups
      .map((group) => ({
        name: group.name,
        students: students.filter((student) => student.groupId === group.id && student.isActive).length,
      }))
      .sort((a, b) => b.students - a.students);

    const paymentChart = [
      { name: 'Подтверждено', value: confirmedPayments.length },
      { name: 'На проверке', value: pendingPayments.length },
      { name: 'Отклонено', value: rejectedPayments.length },
    ].filter((item) => item.value > 0);

    const teacherLoad = teachers
      .map((teacher) => {
        const teacherGroups = groups.filter((group) => group.teacher?.id === teacher.id);
        const teacherStudents = students.filter(
          (student) => teacherGroups.some((group) => group.id === student.groupId) && student.isActive,
        ).length;

        return {
          id: teacher.id,
          fullName: teacher.fullName,
          students: teacherStudents,
          groups: teacherGroups.length,
        };
      })
      .sort((a, b) => b.students - a.students)
      .slice(0, 5);

    const recentStudents = [...students]
      .sort(
        (a, b) =>
          new Date(b.enrolledAt ?? b.createdAt).getTime() -
          new Date(a.enrolledAt ?? a.createdAt).getTime(),
      )
      .slice(0, 5);

    const recentPayments = [...payments]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return {
      activeStudents,
      activeGroups,
      activeTeachers,
      paymentCoverage,
      pendingPayments,
      expectedMonthlyRevenue,
      confirmedRevenue,
      studentsByGroup,
      paymentChart,
      teacherLoad,
      recentStudents,
      recentPayments,
    };
  }, [debtors.length, groups, payments, students, teachers]);

  if (!user) {
    return <div className="py-10 text-sm text-slate-500">Загрузка панели...</div>;
  }

  if (user.role !== 'SUPER_ADMIN') {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Супер-админ: аналитика"
        description="Общий обзор центра: ученики, учителя, группы и статус оплат."
        actions={
          <>
            <Link href="/admin/teachers/new">
              <Button>
                <UserCog className="mr-2 h-4 w-4" />
                Добавить учителя
              </Button>
            </Link>
            <Link href="/admin/groups">
              <Button variant="outline" accent="admin">
                <BookOpen className="mr-2 h-4 w-4" />
                К группам
              </Button>
            </Link>
          </>
        }
      />

      {loading ? (
        <p className="py-10 text-sm text-slate-500">Загрузка аналитики...</p>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            <MetricCard
              title="Активные ученики"
              value={String(dashboard.activeStudents.length)}
              hint={`Всего в системе: ${students.length}`}
              icon={Users}
            />
            <MetricCard
              title="Активные группы"
              value={String(dashboard.activeGroups.length)}
              hint={`Всего групп: ${groups.length}`}
              icon={BookOpen}
            />
            <MetricCard
              title="Учителя"
              value={String(dashboard.activeTeachers.length)}
              hint={`Всего аккаунтов: ${teachers.length}`}
              icon={UserCheck}
            />
            <MetricCard
              title="Платежное покрытие"
              value={`${dashboard.paymentCoverage}%`}
              hint={`Должников: ${debtors.length}`}
              icon={TrendingUp}
            />
            <MetricCard
              title="Чеки на проверке"
              value={String(dashboard.pendingPayments.length)}
              hint="Ожидают подтверждения"
              icon={CreditCard}
            />
            <MetricCard
              title="Ожидаемый сбор"
              value={formatCurrency(dashboard.expectedMonthlyRevenue)}
              hint="По активным ученикам"
              icon={BarChart3}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr_1fr]">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-slate-900">Наполняемость групп</h2>
                    <p className="text-sm text-slate-500">Сколько активных учеников в каждой группе</p>
                  </div>
                  <Badge variant="blue">{dashboard.activeGroups.length} групп</Badge>
                </div>
              </CardHeader>
              <CardContent className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboard.studentsByGroup}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#eef2ff' }} />
                    <Bar dataKey="students" radius={[8, 8, 0, 0]} fill="#4f46e5" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="font-semibold text-slate-900">Статус оплат</h2>
                <p className="text-sm text-slate-500">Распределение всех платежей</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-[210px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dashboard.paymentChart}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={58}
                        outerRadius={84}
                        paddingAngle={3}
                      >
                        {dashboard.paymentChart.map((entry, index) => (
                          <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {dashboard.paymentChart.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                        />
                        {item.name}
                      </div>
                      <span className="font-medium text-slate-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="font-semibold text-slate-900">Финансовая сводка</h2>
                <p className="text-sm text-slate-500">Ключевые показатели по оплатам</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl bg-emerald-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-700/80">
                    Подтверждено
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-emerald-900">
                    {formatCurrency(dashboard.confirmedRevenue)}
                  </p>
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-slate-500">Текущее покрытие оплат</span>
                    <span className="font-medium text-slate-900">{dashboard.paymentCoverage}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-indigo-600"
                      style={{ width: `${Math.max(dashboard.paymentCoverage, 6)}%` }}
                    />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-sm text-slate-500">Должники</p>
                    <p className="mt-1 text-xl font-semibold text-slate-900">{debtors.length}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-sm text-slate-500">Чеки на проверке</p>
                    <p className="mt-1 text-xl font-semibold text-slate-900">
                      {dashboard.pendingPayments.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr_1fr]">
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-slate-900">Нагрузка учителей</h2>
                <p className="text-sm text-slate-500">Топ по числу закреплённых учеников</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboard.teacherLoad.length === 0 ? (
                  <p className="text-sm text-slate-500">Данные по учителям пока недоступны.</p>
                ) : (
                  dashboard.teacherLoad.map((teacher, index) => {
                    const maxStudents = dashboard.teacherLoad[0]?.students || 1;
                    return (
                      <div key={teacher.id} className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-medium text-slate-900">{teacher.fullName}</p>
                            <p className="text-xs text-slate-500">
                              Групп: {teacher.groups} · Ученики: {teacher.students}
                            </p>
                          </div>
                          <Badge variant={index === 0 ? 'blue' : 'gray'}>#{index + 1}</Badge>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100">
                          <div
                            className="h-2 rounded-full bg-indigo-500"
                            style={{ width: `${Math.max((teacher.students / maxStudents) * 100, 8)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="font-semibold text-slate-900">Новые ученики</h2>
                <p className="text-sm text-slate-500">Последние добавленные записи</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboard.recentStudents.map((student) => (
                  <div key={student.id} className="rounded-xl border border-slate-200 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">{student.fullName}</p>
                        <p className="text-xs text-slate-500">{student.group?.name ?? 'Без группы'}</p>
                      </div>
                      <Badge variant={student.isActive ? 'green' : 'gray'}>
                        {student.isActive ? 'Активен' : 'Неактивен'}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      Дата поступления: {formatDate(student.enrolledAt)}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="font-semibold text-slate-900">Последние оплаты</h2>
                <p className="text-sm text-slate-500">Последние движения по платежам</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboard.recentPayments.map((payment) => (
                  <div key={payment.id} className="rounded-xl border border-slate-200 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">
                          {payment.student?.fullName ?? 'Без ученика'}
                        </p>
                        <p className="text-xs text-slate-500">{formatDate(payment.createdAt)}</p>
                      </div>
                      <Badge
                        variant={
                          payment.status === 'CONFIRMED'
                            ? 'green'
                            : payment.status === 'PENDING'
                              ? 'yellow'
                              : 'red'
                        }
                      >
                        {payment.status}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm font-medium text-slate-900">
                      {formatCurrency(Number(payment.amount))}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
