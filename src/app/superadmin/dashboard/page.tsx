'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Bar, BarChart, CartesianGrid, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  BookOpen, TrendingDown, TrendingUp, Users,
  UserPlus, DollarSign, AlertTriangle, Activity,
  UserCog, Trophy,
} from 'lucide-react';
import api from '@/lib/api';
import { useHasMounted } from '@/hooks/useHasMounted';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Overview {
  totalStudents: number; totalGroups: number; totalTeachers: number;
  newStudentsThisWeek: number; debtorsCount: number;
  currentMonthRevenue: number; lastMonthRevenue: number;
  nextMonthForecast: number; centerAttendancePercent: number;
}
interface RevenueMonth { month: string; revenue: number; studentsCount: number }
interface GrowthEntry { date: string; newStudents: number; totalStudents: number }
interface AttendanceMonth { month: string; percentage: number }
interface Debtor {
  studentId: string; fullName: string; groupName: string; teacherName: string;
  monthlyFee: number; lastPaymentDate: string | null; daysSinceLastPayment: number | null;
  parentPhone: string | null;
}
interface TeacherLoad {
  teacherId: string; fullName: string; groupsCount: number;
  studentsCount: number; ratePerStudent: number; totalSalary: number; attendancePercent: number;
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KpiCard({
  title, value, sub, icon: Icon, trend, accent = 'violet',
}: {
  title: string; value: string; sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
  accent?: 'violet' | 'green' | 'red' | 'amber';
}) {
  const bg = { violet: 'bg-violet-50 text-violet-600', green: 'bg-green-50 text-green-600', red: 'bg-red-50 text-red-600', amber: 'bg-amber-50 text-amber-600' }[accent];
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-start justify-between p-5">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-400">{title}</p>
          <p className="text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
          {sub && <p className="flex items-center gap-1 text-sm text-slate-500">
            {trend === 'up' && <TrendingUp className="h-3.5 w-3.5 text-green-500" />}
            {trend === 'down' && <TrendingDown className="h-3.5 w-3.5 text-red-500" />}
            {sub}
          </p>}
        </div>
        <div className={`rounded-xl p-3 ${bg}`}><Icon className="h-5 w-5" /></div>
      </CardContent>
    </Card>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function SuperAdminDashboard() {
  const [revenueYear, setRevenueYear] = useState(new Date().getFullYear());
  const hasMounted = useHasMounted();

  const { data: overview, isLoading: ovLoading } = useQuery<Overview>({
    queryKey: ['sa-overview'],
    queryFn: () => api.get('/analytics/overview').then((r) => r.data.data),
  });

  const { data: revenue = [] } = useQuery<RevenueMonth[]>({
    queryKey: ['sa-revenue', revenueYear],
    queryFn: () => api.get(`/analytics/revenue?year=${revenueYear}`).then((r) => r.data.data),
  });

  const { data: growth = [] } = useQuery<GrowthEntry[]>({
    queryKey: ['sa-growth'],
    queryFn: () => api.get('/analytics/students-growth?period=monthly').then((r) => r.data.data),
  });

  const { data: attendanceCenter } = useQuery<{ byMonth: AttendanceMonth[] }>({
    queryKey: ['sa-attendance-center'],
    queryFn: () => api.get('/analytics/attendance-center').then((r) => r.data.data),
  });

  const { data: debtors = [] } = useQuery<Debtor[]>({
    queryKey: ['sa-debtors'],
    queryFn: () => api.get('/analytics/debtors').then((r) => r.data.data),
  });

  const { data: teachersLoad = [] } = useQuery<TeacherLoad[]>({
    queryKey: ['sa-teachers-load'],
    queryFn: () => api.get('/analytics/teachers-load').then((r) => r.data.data),
  });

  const { data: topStudents = [] } = useQuery<{
    studentId: string; fullName: string; groupName: string; totalAchievements: number; goldCount: number;
  }[]>({
    queryKey: ['sa-top-students'],
    queryFn: () => api.get('/achievements/center/top?limit=5').then((r) => r.data.data),
  });

  const revDiff = overview
    ? overview.currentMonthRevenue - overview.lastMonthRevenue
    : 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Дашборд"
        description="Ключевые показатели центра"
        actions={
          <Link href="/superadmin/staff/new">
            <Button className="bg-violet-600 hover:bg-violet-700">
              <UserPlus className="mr-2 h-4 w-4" />
              Добавить сотрудника
            </Button>
          </Link>
        }
      />

      {/* ── Блок 1: KPI ── */}
      {ovLoading ? (
        <p className="text-sm text-slate-400">Загрузка...</p>
      ) : overview ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KpiCard title="Активных учеников" value={String(overview.totalStudents)} icon={Users} accent="violet" />
            <KpiCard title="Активных групп" value={String(overview.totalGroups)} icon={BookOpen} accent="violet" />
            <KpiCard title="Учителей" value={String(overview.totalTeachers)} icon={UserCog} accent="violet" />
            <KpiCard title="Новых за неделю" value={`+${overview.newStudentsThisWeek}`} icon={UserPlus} accent="green" trend="up" />
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KpiCard
              title="Выручка (месяц)"
              value={formatCurrency(overview.currentMonthRevenue)}
              sub={revDiff >= 0 ? `+${formatCurrency(revDiff)} vs прошлый` : `${formatCurrency(revDiff)} vs прошлый`}
              icon={DollarSign}
              accent={revDiff >= 0 ? 'green' : 'red'}
              trend={revDiff >= 0 ? 'up' : 'down'}
            />
            <KpiCard title="Прогноз (след. месяц)" value={formatCurrency(overview.nextMonthForecast)} icon={TrendingUp} accent="violet" />
            <KpiCard
              title="Должников"
              value={String(overview.debtorsCount)}
              sub="Без оплаты в этом месяце"
              icon={AlertTriangle}
              accent={overview.debtorsCount > 0 ? 'red' : 'green'}
            />
            <KpiCard title="Посещаемость %" value={`${overview.centerAttendancePercent}%`} icon={Activity} accent={overview.centerAttendancePercent >= 80 ? 'green' : 'amber'} />
          </div>
        </div>
      ) : null}

      {/* ── Блок 2: Revenue bar chart ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-slate-900">Выручка по месяцам</h2>
              <p className="text-sm text-slate-500">Подтверждённые оплаты за {revenueYear} год</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRevenueYear((y) => y - 1)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                {revenueYear - 1}
              </button>
              <span className="rounded-lg bg-violet-50 px-3 py-1.5 text-sm font-semibold text-violet-700">{revenueYear}</span>
              <button
                onClick={() => setRevenueYear((y) => y + 1)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                disabled={revenueYear >= new Date().getFullYear()}
              >
                {revenueYear + 1}
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-72">
          {hasMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenue} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis
                  axisLine={false} tickLine={false} tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value, name) => [
                    name === 'revenue' ? formatCurrency(Number(value)) : value,
                    name === 'revenue' ? 'Выручка' : 'Оплат',
                  ]}
                  contentStyle={{ borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="revenue" fill="#7c3aed" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full rounded-xl bg-slate-100" />
          )}
        </CardContent>
      </Card>

      {/* ── Блок 3: Two line charts ── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-slate-900">Прирост учеников</h2>
            <p className="text-sm text-slate-500">Новые ученики по месяцам</p>
          </CardHeader>
          <CardContent className="h-56">
            {hasMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growth} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10 }}
                    tickFormatter={(v: string) => v.slice(5)} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} formatter={(v) => [v, 'Новых']} />
                  <Line type="monotone" dataKey="newStudents" stroke="#7c3aed" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full rounded-xl bg-slate-100" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-slate-900">Посещаемость по центру</h2>
            <p className="text-sm text-slate-500">Средний процент по месяцам</p>
          </CardHeader>
          <CardContent className="h-56">
            {hasMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceCenter?.byMonth ?? []} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10 }}
                    tickFormatter={(v) => `${v}%`} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} formatter={(v) => [`${v}%`, 'Посещаемость']} />
                  <Line type="monotone" dataKey="percentage" stroke="#059669" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full rounded-xl bg-slate-100" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Блок 4 & 5: Debtors + Teachers ── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">Топ-5 должников</h2>
                <p className="text-sm text-slate-500">Дольше всего без оплаты</p>
              </div>
              <Link href="/superadmin/finance?tab=debtors">
                <Button variant="ghost" size="sm" className="text-xs text-violet-600">
                  Все должники
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {debtors.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-400">Должников нет</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs text-slate-400">
                    <th className="pb-2 text-left font-medium">Ученик</th>
                    <th className="pb-2 text-left font-medium">Группа</th>
                    <th className="pb-2 text-right font-medium">Посл. оплата</th>
                    <th className="pb-2 text-right font-medium">Дней</th>
                  </tr>
                </thead>
                <tbody>
                  {debtors.slice(0, 5).map((d) => (
                    <tr key={d.studentId} className="border-b border-slate-50">
                      <td className="py-2.5 pr-3 font-medium text-slate-900">{d.fullName}</td>
                      <td className="py-2.5 pr-3 text-slate-500">{d.groupName}</td>
                      <td className="py-2.5 pr-3 text-right text-slate-500">
                        {d.lastPaymentDate ? formatDate(d.lastPaymentDate) : '—'}
                      </td>
                      <td className="py-2.5 text-right">
                        {d.daysSinceLastPayment !== null ? (
                          <Badge variant={d.daysSinceLastPayment > 30 ? 'red' : 'yellow'}>
                            {d.daysSinceLastPayment}д
                          </Badge>
                        ) : <Badge variant="red">Никогда</Badge>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">Топ-5 учителей</h2>
                <p className="text-sm text-slate-500">По количеству учеников</p>
              </div>
              <Link href="/superadmin/salary">
                <Button variant="ghost" size="sm" className="text-xs text-violet-600">
                  Все зарплаты
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {teachersLoad.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-400">Нет данных</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs text-slate-400">
                    <th className="pb-2 text-left font-medium">Учитель</th>
                    <th className="pb-2 text-right font-medium">Учеников</th>
                    <th className="pb-2 text-right font-medium">Групп</th>
                    <th className="pb-2 text-right font-medium">Зарплата</th>
                  </tr>
                </thead>
                <tbody>
                  {teachersLoad.slice(0, 5).map((t) => (
                    <tr key={t.teacherId} className="border-b border-slate-50">
                      <td className="py-2.5 pr-3 font-medium text-slate-900">{t.fullName}</td>
                      <td className="py-2.5 pr-3 text-right text-slate-700">{t.studentsCount}</td>
                      <td className="py-2.5 pr-3 text-right text-slate-500">{t.groupsCount}</td>
                      <td className="py-2.5 text-right text-slate-700">{formatCurrency(t.totalSalary)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Топ достижений ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <div>
                <h2 className="font-semibold text-slate-900">Топ-5 самых титулованных учеников</h2>
                <p className="text-sm text-slate-500">По количеству ежемесячных достижений</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {topStudents.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-400">Достижения ещё не выданы</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-400">
                  <th className="pb-2 text-left font-medium">Место</th>
                  <th className="pb-2 text-left font-medium">Ученик</th>
                  <th className="pb-2 text-left font-medium">Группа</th>
                  <th className="pb-2 text-right font-medium">🥇 Золото</th>
                  <th className="pb-2 text-right font-medium">Всего</th>
                </tr>
              </thead>
              <tbody>
                {topStudents.map((s, idx) => (
                  <tr key={s.studentId} className="border-b border-slate-50">
                    <td className="py-2.5 pr-3 font-bold text-slate-500">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                    </td>
                    <td className="py-2.5 pr-3 font-medium text-slate-900">{s.fullName}</td>
                    <td className="py-2.5 pr-3 text-slate-500">{s.groupName || '—'}</td>
                    <td className="py-2.5 pr-3 text-right text-amber-600 font-semibold">{s.goldCount}</td>
                    <td className="py-2.5 text-right font-semibold text-slate-800">{s.totalAchievements}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
