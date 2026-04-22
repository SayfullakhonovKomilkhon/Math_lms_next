'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Activity,
  AlertTriangle,
  BookOpen,
  CalendarClock,
  ChevronRight,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Trophy,
  UserCog,
  UserPlus,
  Users,
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
  totalStudents: number;
  totalGroups: number;
  totalTeachers: number;
  newStudentsThisWeek: number;
  debtorsCount: number;
  currentMonthRevenue: number;
  lastMonthRevenue: number;
  nextMonthForecast: number;
  centerAttendancePercent: number;
}
interface RevenueMonth {
  month: string;
  revenue: number;
  studentsCount: number;
}
interface GrowthEntry {
  date: string;
  newStudents: number;
  totalStudents: number;
}
interface AttendanceMonth {
  month: string;
  percentage: number;
}
interface AttendanceCenter {
  overall: { present: number; absent: number; late: number; percentage: number };
  byMonth: AttendanceMonth[];
}
interface Debtor {
  studentId: string;
  fullName: string;
  groupName: string;
  teacherName: string;
  monthlyFee: number;
  lastPaymentDate: string | null;
  daysSinceLastPayment: number | null;
  parentPhone: string | null;
}
interface TeacherLoad {
  teacherId: string;
  fullName: string;
  groupsCount: number;
  studentsCount: number;
  ratePerStudent: number;
  totalSalary: number;
  attendancePercent: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MONTH_SHORT = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
const MONTH_LONG = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

function fmtShortSum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.0', '') + ' млн';
  if (n >= 1_000) return (n / 1_000).toFixed(0) + ' тыс';
  return String(n);
}
const fmtShortCurrency = (n: number) => `${fmtShortSum(n)} сум`;

function formatGrowthTick(raw: string, period: 'monthly' | 'weekly'): string {
  if (period === 'monthly') {
    const m = /^\d{4}-(\d{2})$/.exec(raw);
    if (m) return MONTH_SHORT[Number(m[1]) - 1] ?? raw;
    return raw;
  }
  const parts = raw.split('-');
  if (parts.length === 3) return `${parts[2]}.${parts[1]}`;
  return raw;
}

function formatGrowthTooltipLabel(
  raw: string,
  period: 'monthly' | 'weekly',
): string {
  if (period === 'monthly') {
    const m = /^(\d{4})-(\d{2})$/.exec(raw);
    if (m) return `${MONTH_LONG[Number(m[2]) - 1]} ${m[1]}`;
    return raw;
  }
  const parts = raw.split('-');
  if (parts.length === 3) return `Неделя с ${parts[2]}.${parts[1]}.${parts[0]}`;
  return raw;
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

type AccentKey = 'violet' | 'green' | 'red' | 'amber' | 'blue';

const ACCENT_ICON: Record<AccentKey, string> = {
  violet: 'bg-violet-50 text-violet-600',
  green: 'bg-green-50 text-green-600',
  red: 'bg-red-50 text-red-600',
  amber: 'bg-amber-50 text-amber-600',
  blue: 'bg-blue-50 text-blue-600',
};

function KpiCard({
  title,
  value,
  sub,
  icon: Icon,
  trend,
  accent = 'violet',
}: {
  title: string;
  value: string;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
  accent?: AccentKey;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            {title}
          </p>
          <p className="truncate text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
          {sub && (
            <p className="flex items-center gap-1 text-xs text-slate-500">
              {trend === 'up' && (
                <TrendingUp className="h-3.5 w-3.5 shrink-0 text-green-500" strokeWidth={2.5} />
              )}
              {trend === 'down' && (
                <TrendingDown className="h-3.5 w-3.5 shrink-0 text-red-500" strokeWidth={2.5} />
              )}
              <span className="truncate">{sub}</span>
            </p>
          )}
        </div>
        <div className={`shrink-0 rounded-xl p-3 ${ACCENT_ICON[accent]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Custom Tooltip ─────────────────────────────────────────────────────────

type ChartFormatter = (value: number, name?: string) => [string, string];

interface ChartTooltipItem {
  value?: number | string;
  name?: string;
  color?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: ChartTooltipItem[];
  label?: string | number;
  formatter?: ChartFormatter;
  labelFormatter?: (label: string | number) => string;
}

function ChartTooltip({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const labelText =
    labelFormatter && label !== undefined ? labelFormatter(label) : label;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs shadow-lg">
      <p className="mb-1 font-semibold text-slate-700">{labelText}</p>
      {payload.map((p, i) => {
        const raw = typeof p.value === 'number' ? p.value : Number(p.value ?? 0);
        const [text] = formatter
          ? formatter(raw, p.name)
          : [`${p.name}: ${raw}`];
        return (
          <p
            key={i}
            className="flex items-center gap-1.5"
            style={{ color: p.color }}
          >
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: p.color }}
            />
            {text}
          </p>
        );
      })}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function SuperAdminDashboard() {
  const now = useMemo(() => new Date(), []);
  const [revenueYear, setRevenueYear] = useState(() => new Date().getFullYear());
  const [growthPeriod, setGrowthPeriod] = useState<'monthly' | 'weekly'>('monthly');
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
    queryKey: ['sa-growth', growthPeriod],
    queryFn: () =>
      api
        .get(`/analytics/students-growth?period=${growthPeriod}`)
        .then((r) => r.data.data),
  });

  const { data: attendanceCenter } = useQuery<AttendanceCenter>({
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

  const { data: topStudents = [] } = useQuery<
    {
      studentId: string;
      fullName: string;
      groupName: string;
      totalAchievements: number;
      goldCount: number;
    }[]
  >({
    queryKey: ['sa-top-students'],
    queryFn: () => api.get('/achievements/center/top?limit=5').then((r) => r.data.data),
  });

  // ── Derived: revenue change ──
  const revDiff = overview ? overview.currentMonthRevenue - overview.lastMonthRevenue : 0;
  const revDiffPct =
    overview && overview.lastMonthRevenue > 0
      ? ((revDiff / overview.lastMonthRevenue) * 100).toFixed(1)
      : null;

  // ── Derived: revenue with forecast bar ──
  const forecastMonthIdx = useMemo(() => {
    if (revenueYear !== now.getFullYear()) return -1;
    const next = now.getMonth() + 1;
    return next <= 11 ? next : -1;
  }, [revenueYear, now]);

  const revenueWithForecast = useMemo(() => {
    if (!revenue.length) return [] as (RevenueMonth & { isForecast: boolean; displayRevenue: number })[];
    return revenue.map((m, i) => {
      const isForecast = i === forecastMonthIdx;
      return {
        ...m,
        isForecast,
        displayRevenue: isForecast ? overview?.nextMonthForecast ?? 0 : m.revenue,
      };
    });
  }, [revenue, forecastMonthIdx, overview?.nextMonthForecast]);

  const totalYearRevenue = useMemo(
    () => revenue.reduce((s, r) => s + r.revenue, 0),
    [revenue],
  );
  const bestMonth = useMemo(() => {
    if (!revenue.length) return null;
    let best: RevenueMonth | null = null;
    for (const r of revenue) {
      if (r.revenue > 0 && (!best || r.revenue > best.revenue)) best = r;
    }
    return best;
  }, [revenue]);

  // ── Derived: attendance breakdown ──
  const attOverall = attendanceCenter?.overall;
  const attByMonth = useMemo(
    () => attendanceCenter?.byMonth ?? [],
    [attendanceCenter?.byMonth],
  );
  const attDeltaPct = useMemo(() => {
    if (attByMonth.length < 2) return null;
    const cur = attByMonth[attByMonth.length - 1]?.percentage ?? 0;
    const prev = attByMonth[attByMonth.length - 2]?.percentage ?? 0;
    return cur - prev;
  }, [attByMonth]);

  const attAverageYear = useMemo(() => {
    if (!attByMonth.length) return null;
    const sum = attByMonth.reduce((s, m) => s + m.percentage, 0);
    return (sum / attByMonth.length).toFixed(1);
  }, [attByMonth]);

  const attBestMonth = useMemo(() => {
    if (!attByMonth.length) return null;
    return attByMonth.reduce((best, m) => (m.percentage > best.percentage ? m : best), attByMonth[0]);
  }, [attByMonth]);

  // ── Derived: total debt ──
  const totalDebtAmount = useMemo(
    () => debtors.reduce((s, d) => s + d.monthlyFee, 0),
    [debtors],
  );

  // ── Derived: growth stats ──
  const growthStats = useMemo(() => {
    if (!growth.length) return null;
    const last = growth[growth.length - 1];
    const avg = growth.reduce((s, g) => s + g.newStudents, 0) / growth.length;
    return {
      total: last?.totalStudents ?? 0,
      avgPerMonth: avg.toFixed(1).replace('.0', ''),
      lastPeriod: last?.newStudents ?? 0,
    };
  }, [growth]);

  // ── Derived: padded growth series ──
  // Фиксируем "скелет" временной шкалы, чтобы с одной точкой график
  // рисовался как полноценная кривая от начала года / 12 недель назад.
  const paddedGrowth = useMemo((): GrowthEntry[] => {
    if (growthPeriod === 'monthly') {
      const year = now.getFullYear();
      const currentMonth = now.getMonth() + 1; // 1..12
      const byKey = new Map(growth.map((g) => [g.date, g]));
      const out: GrowthEntry[] = [];
      let rollingTotal = 0;
      for (let m = 1; m <= currentMonth; m++) {
        const key = `${year}-${String(m).padStart(2, '0')}`;
        const entry = byKey.get(key);
        if (entry) {
          out.push(entry);
          rollingTotal = entry.totalStudents;
        } else {
          out.push({ date: key, newStudents: 0, totalStudents: rollingTotal });
        }
      }
      return out;
    }
    // weekly: 12 недель назад → сейчас
    const weekStart = new Date(now);
    const day = weekStart.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    weekStart.setDate(weekStart.getDate() + diff);
    weekStart.setHours(0, 0, 0, 0);
    const byKey = new Map(growth.map((g) => [g.date, g]));
    const out: GrowthEntry[] = [];
    let rollingTotal = 0;
    for (let i = 11; i >= 0; i--) {
      const wk = new Date(weekStart);
      wk.setDate(weekStart.getDate() - i * 7);
      const key = wk.toISOString().slice(0, 10);
      const entry = byKey.get(key);
      if (entry) {
        out.push(entry);
        rollingTotal = entry.totalStudents;
      } else {
        out.push({ date: key, newStudents: 0, totalStudents: rollingTotal });
      }
    }
    return out;
  }, [growth, growthPeriod, now]);

  // ── Derived: padded attendance series ──
  type AttendancePoint = {
    month: string;
    percentage: number | null;
    isReal: boolean;
  };
  const paddedAttendance = useMemo((): AttendancePoint[] => {
    const currentMonth = now.getMonth(); // 0..11
    const byKey = new Map(attByMonth.map((a) => [a.month, a]));
    const out: AttendancePoint[] = [];
    for (let m = 0; m <= currentMonth; m++) {
      const name = MONTH_LONG[m];
      const entry = byKey.get(name);
      if (entry) {
        out.push({ month: name, percentage: entry.percentage, isReal: true });
      } else {
        out.push({ month: name, percentage: null, isReal: false });
      }
    }
    return out;
  }, [attByMonth, now]);

  const attendanceMin = useMemo(() => {
    const values = paddedAttendance
      .map((a) => a.percentage)
      .filter((v): v is number => typeof v === 'number');
    if (!values.length) return 60;
    return Math.max(0, Math.min(...values) - 10);
  }, [paddedAttendance]);

  const pageDescription = `Ключевые показатели центра • ${MONTH_LONG[now.getMonth()]} ${now.getFullYear()}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Дашборд"
        description={pageDescription}
        actions={
          <Link href="/superadmin/staff/new">
            <Button className="bg-violet-600 hover:bg-violet-700">
              <UserPlus className="mr-2 h-4 w-4" />
              Добавить сотрудника
            </Button>
          </Link>
        }
      />

      {/* ── Row 1: KPI Cards (top-level counts) ── */}
      {ovLoading ? (
        <p className="text-sm text-slate-400">Загрузка…</p>
      ) : overview ? (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KpiCard
              title="Активных учеников"
              value={String(overview.totalStudents)}
              sub="В активных группах"
              icon={Users}
              accent="violet"
            />
            <KpiCard
              title="Активных групп"
              value={String(overview.totalGroups)}
              sub="Во всех направлениях"
              icon={BookOpen}
              accent="violet"
            />
            <KpiCard
              title="Учителей"
              value={String(overview.totalTeachers)}
              sub="Активных преподавателей"
              icon={UserCog}
              accent="violet"
            />
            <KpiCard
              title="Новых за неделю"
              value={`+${overview.newStudentsThisWeek}`}
              sub="За текущую неделю"
              icon={UserPlus}
              accent="green"
              trend="up"
            />
          </div>

          {/* ── Row 2: Finance KPIs ── */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KpiCard
              title="Выручка (текущий)"
              value={fmtShortCurrency(overview.currentMonthRevenue)}
              sub={
                revDiffPct !== null
                  ? `${revDiff >= 0 ? '+' : ''}${revDiffPct}% vs прошлый`
                  : 'Нет данных за прошлый месяц'
              }
              trend={revDiff >= 0 ? 'up' : 'down'}
              icon={DollarSign}
              accent={revDiff >= 0 ? 'green' : 'red'}
            />
            <KpiCard
              title="Прошлый месяц"
              value={fmtShortCurrency(overview.lastMonthRevenue)}
              sub={`${MONTH_LONG[(now.getMonth() + 11) % 12]} ${now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()}`}
              icon={CalendarClock}
              accent="violet"
            />
            <KpiCard
              title="Прогноз (след.)"
              value={fmtShortCurrency(overview.nextMonthForecast)}
              sub="На основе активных учеников"
              trend="up"
              icon={TrendingUp}
              accent="blue"
            />
            <KpiCard
              title="Должников"
              value={`${overview.debtorsCount} чел.`}
              sub={
                totalDebtAmount > 0
                  ? `Долг: ${fmtShortCurrency(totalDebtAmount)}`
                  : 'Все оплатили в этом месяце'
              }
              trend={overview.debtorsCount > 0 ? 'down' : 'up'}
              icon={AlertTriangle}
              accent={overview.debtorsCount > 0 ? 'red' : 'green'}
            />
          </div>
        </>
      ) : null}

      {/* ── Attendance hero card ── */}
      {overview && (
        <Card>
          <CardContent className="px-5 py-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 shrink-0">
                  <svg className="-rotate-90 h-16 w-16" viewBox="0 0 64 64">
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="7"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      fill="none"
                      stroke="#059669"
                      strokeWidth="7"
                      strokeDasharray={`${(2 * Math.PI * 26 * overview.centerAttendancePercent) / 100} ${2 * Math.PI * 26}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-slate-900">
                      {overview.centerAttendancePercent}%
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Посещаемость по центру
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {overview.centerAttendancePercent}%
                  </p>
                  {attDeltaPct !== null && (
                    <p
                      className={`mt-0.5 flex items-center gap-1 text-xs ${attDeltaPct >= 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {attDeltaPct >= 0 ? (
                        <TrendingUp className="h-3.5 w-3.5" strokeWidth={2.5} />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5" strokeWidth={2.5} />
                      )}
                      {attDeltaPct >= 0 ? '+' : ''}
                      {attDeltaPct}% vs прошлый месяц
                    </p>
                  )}
                </div>
              </div>
              <div className="min-w-[200px] flex-1">
                <div className="mb-1.5 flex items-center justify-between text-xs text-slate-500">
                  <span>Прогресс к цели (95%)</span>
                  <span className="font-medium text-slate-700">
                    {overview.centerAttendancePercent}% / 95%
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all"
                    style={{
                      width: `${Math.min((overview.centerAttendancePercent / 95) * 100, 100)}%`,
                    }}
                  />
                </div>
                {attOverall && (
                  <div className="mt-3 flex flex-wrap gap-4">
                    <div className="text-xs">
                      <span className="font-semibold text-slate-900">{attOverall.present}</span>{' '}
                      <span className="text-slate-500">присутствовало</span>
                    </div>
                    <div className="text-xs">
                      <span className="font-semibold text-slate-900">{attOverall.absent}</span>{' '}
                      <span className="text-slate-500">отсутствовало</span>
                    </div>
                    <div className="text-xs">
                      <span className="font-semibold text-slate-900">{attOverall.late}</span>{' '}
                      <span className="text-slate-500">опоздало</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Row 3: Growth + Attendance area charts ── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-semibold text-slate-900">Прирост учеников</h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Новые ученики {growthPeriod === 'weekly' ? 'по неделям' : 'по месяцам'},{' '}
                  {now.getFullYear()}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setGrowthPeriod('weekly')}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    growthPeriod === 'weekly'
                      ? 'bg-violet-50 text-violet-700'
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  По неделям
                </button>
                <button
                  type="button"
                  onClick={() => setGrowthPeriod('monthly')}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    growthPeriod === 'monthly'
                      ? 'bg-violet-50 text-violet-700'
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  По месяцам
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[220px]">
              {hasMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={paddedGrowth} margin={{ top: 8, right: 12, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.28} />
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      tickFormatter={(v: string) => formatGrowthTick(v, growthPeriod)}
                      interval={0}
                      minTickGap={0}
                    />
                    <YAxis
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                    />
                    <Tooltip
                      content={
                        <ChartTooltip
                          labelFormatter={(v) =>
                            formatGrowthTooltipLabel(String(v), growthPeriod)
                          }
                          formatter={(v) => [`${v} чел.`, 'Новых']}
                        />
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="newStudents"
                      stroke="#7c3aed"
                      strokeWidth={2.5}
                      fill="url(#growthGrad)"
                      dot={{ r: 4, fill: '#7c3aed', stroke: '#fff', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: '#7c3aed', stroke: '#fff', strokeWidth: 3 }}
                      isAnimationActive
                      animationDuration={750}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full rounded-xl bg-slate-100" />
              )}
            </div>
            {growthStats && (
              <div className="mt-3 flex flex-wrap items-center gap-4 px-1">
                <div className="text-xs text-slate-500">
                  Всего учеников:{' '}
                  <span className="font-semibold text-slate-900">{growthStats.total}</span>
                </div>
                <div className="text-xs text-slate-500">
                  {growthPeriod === 'weekly' ? 'Среднее/нед' : 'Среднее/мес'}:{' '}
                  <span className="font-semibold text-slate-900">~{growthStats.avgPerMonth}</span>
                </div>
                {overview && (
                  <div className="flex items-center gap-0.5 text-xs text-green-600">
                    <TrendingUp className="h-3.5 w-3.5" strokeWidth={2.5} />
                    +{overview.newStudentsThisWeek} за неделю
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <h2 className="font-semibold text-slate-900">Посещаемость по центру</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Средний процент по месяцам, {now.getFullYear()}
              </p>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[220px]">
              {hasMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={paddedAttendance}
                    margin={{ top: 8, right: 12, bottom: 0, left: -20 }}
                  >
                    <defs>
                      <linearGradient id="attendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.28} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      interval={0}
                      minTickGap={0}
                      tickFormatter={(v: string) => v.slice(0, 3)}
                    />
                    <YAxis
                      domain={[attendanceMin, 100]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <ReferenceLine
                      y={85}
                      stroke="#f59e0b"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{
                        value: 'Цель 85%',
                        position: 'right',
                        fill: '#b45309',
                        fontSize: 10,
                        fontWeight: 600,
                      }}
                    />
                    <Tooltip
                      content={
                        <ChartTooltip
                          formatter={(v) => [`${v}%`, 'Посещаемость']}
                        />
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="percentage"
                      stroke="#059669"
                      strokeWidth={2.5}
                      fill="url(#attendGrad)"
                      connectNulls
                      dot={(props: {
                        cx?: number;
                        cy?: number;
                        payload?: AttendancePoint;
                        index?: number;
                      }) => {
                        const key = `att-dot-${props.index ?? 0}`;
                        if (!props.payload?.isReal) {
                          return <g key={key} />;
                        }
                        return (
                          <circle
                            key={key}
                            cx={props.cx}
                            cy={props.cy}
                            r={5}
                            fill="#059669"
                            stroke="#fff"
                            strokeWidth={2.5}
                          />
                        );
                      }}
                      activeDot={{
                        r: 7,
                        fill: '#059669',
                        stroke: '#fff',
                        strokeWidth: 3,
                      }}
                      isAnimationActive
                      animationDuration={750}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full rounded-xl bg-slate-100" />
              )}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-4 px-1">
              {overview && (
                <div className="text-xs text-slate-500">
                  Текущий:{' '}
                  <span className="font-semibold text-green-700">
                    {overview.centerAttendancePercent}%
                  </span>
                </div>
              )}
              {attAverageYear && (
                <div className="text-xs text-slate-500">
                  Среднее за год:{' '}
                  <span className="font-semibold text-slate-900">{attAverageYear}%</span>
                </div>
              )}
              {attBestMonth && (
                <div className="text-xs text-slate-500">
                  Лучший:{' '}
                  <span className="font-semibold text-slate-900">
                    {attBestMonth.month} ({attBestMonth.percentage}%)
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Revenue bar chart ── */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-slate-900">Выручка по месяцам</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Подтверждённые оплаты за {revenueYear} год
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRevenueYear((y) => y - 1)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                {revenueYear - 1}
              </button>
              <span className="rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
                {revenueYear}
              </span>
              <button
                onClick={() => setRevenueYear((y) => y + 1)}
                disabled={revenueYear >= now.getFullYear()}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                {revenueYear + 1}
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {/* Summary pills */}
          <div className="mb-4 flex flex-wrap gap-3">
            <div className="rounded-lg bg-violet-50 px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-500">
                Итого за год
              </p>
              <p className="text-base font-bold text-violet-900">
                {fmtShortCurrency(totalYearRevenue)}
              </p>
            </div>
            {bestMonth && (
              <div className="rounded-lg bg-green-50 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-green-600">
                  Лучший месяц
                </p>
                <p className="text-base font-bold text-green-900">
                  {bestMonth.month} • {fmtShortSum(bestMonth.revenue)}
                </p>
              </div>
            )}
            {overview && forecastMonthIdx >= 0 && (
              <div className="rounded-lg bg-amber-50 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-600">
                  Прогноз {MONTH_SHORT[forecastMonthIdx].toLowerCase()}.
                </p>
                <p className="text-base font-bold text-amber-900">
                  {fmtShortCurrency(overview.nextMonthForecast)}
                </p>
              </div>
            )}
          </div>
          <div className="h-[280px]">
            {hasMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={revenueWithForecast}
                  margin={{ top: 4, right: 4, bottom: 0, left: -10 }}
                  barSize={28}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`}
                  />
                  <Tooltip
                    content={
                      <ChartTooltip
                        formatter={(v, name) =>
                          name === 'displayRevenue'
                            ? [`${fmtShortCurrency(v)}`, 'Выручка']
                            : [`${v}`, 'Оплат']
                        }
                      />
                    }
                  />
                  <Bar dataKey="displayRevenue" radius={[5, 5, 0, 0]}>
                    {revenueWithForecast.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.isForecast ? '#c4b5fd' : '#7c3aed'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full rounded-xl bg-slate-100" />
            )}
          </div>
          <div className="mt-2 flex items-center gap-4 px-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="inline-block h-3 w-3 rounded-sm bg-violet-600" />
              Подтверждено
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="inline-block h-3 w-3 rounded-sm bg-violet-300" />
              Прогноз
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Debtors table ── */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <h2 className="font-semibold text-slate-900">Должники</h2>
                {overview && (
                  <Badge variant="red">{overview.debtorsCount} чел.</Badge>
                )}
              </div>
              {totalDebtAmount > 0 && (
                <p className="mt-0.5 text-xs text-slate-500">
                  Общая сумма долга:{' '}
                  <span className="font-semibold text-red-600">
                    {formatCurrency(totalDebtAmount)}
                  </span>
                </p>
              )}
            </div>
            <Link
              href="/superadmin/finance?tab=debtors"
              className="flex items-center gap-1 text-xs font-medium text-violet-600 hover:underline"
            >
              Все должники
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {debtors.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">Должников нет</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Ученик
                    </th>
                    <th className="hidden px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:table-cell">
                      Группа
                    </th>
                    <th className="hidden px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400 lg:table-cell">
                      Учитель
                    </th>
                    <th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Долг
                    </th>
                    <th className="px-3 py-3 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Дней
                    </th>
                    <th className="hidden px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-wide text-slate-400 md:table-cell">
                      Посл. оплата
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {debtors.slice(0, 5).map((d) => {
                    const days = d.daysSinceLastPayment;
                    const daysBadgeVariant: 'red' | 'yellow' | 'gray' =
                      days === null || days > 45 ? 'red' : days > 30 ? 'yellow' : 'gray';
                    return (
                      <tr
                        key={d.studentId}
                        className="border-b border-slate-50 transition-colors hover:bg-slate-50/60"
                      >
                        <td className="px-5 py-3 font-medium text-slate-900">{d.fullName}</td>
                        <td className="hidden px-3 py-3 text-slate-500 sm:table-cell">
                          {d.groupName}
                        </td>
                        <td className="hidden px-3 py-3 text-slate-500 lg:table-cell">
                          {d.teacherName}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-right font-semibold text-red-600">
                          {formatCurrency(d.monthlyFee)}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <Badge variant={daysBadgeVariant}>
                            {days === null ? 'Никогда' : `${days}д`}
                          </Badge>
                        </td>
                        <td className="hidden px-5 py-3 text-right text-xs text-slate-500 md:table-cell">
                          {d.lastPaymentDate ? (
                            formatDate(d.lastPaymentDate)
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {overview && (
                  <tfoot>
                    <tr className="border-t border-slate-200 bg-slate-50/40">
                      <td colSpan={2} className="px-5 py-3 text-xs text-slate-500">
                        Показано {Math.min(debtors.length, 5)} из {overview.debtorsCount} должников
                      </td>
                      <td
                        colSpan={4}
                        className="px-5 py-3 text-right text-xs font-semibold text-red-600"
                      >
                        Итого:{' '}
                        {formatCurrency(
                          debtors.slice(0, 5).reduce((s, d) => s + d.monthlyFee, 0),
                        )}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Teachers load + Top students ── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">Топ-5 учителей</h2>
                <p className="mt-0.5 text-xs text-slate-500">По количеству учеников</p>
              </div>
              <Link href="/superadmin/salary">
                <Button variant="ghost" size="sm" className="text-xs text-violet-600">
                  Все зарплаты
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {teachersLoad.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">Нет данных</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Учитель
                    </th>
                    <th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Учеников
                    </th>
                    <th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Групп
                    </th>
                    <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Зарплата
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {teachersLoad.slice(0, 5).map((t) => (
                    <tr
                      key={t.teacherId}
                      className="border-b border-slate-50 transition-colors hover:bg-slate-50/60"
                    >
                      <td className="px-5 py-3 font-medium text-slate-900">{t.fullName}</td>
                      <td className="px-3 py-3 text-right text-slate-700">{t.studentsCount}</td>
                      <td className="px-3 py-3 text-right text-slate-500">{t.groupsCount}</td>
                      <td className="whitespace-nowrap px-5 py-3 text-right text-slate-700">
                        {formatCurrency(t.totalSalary)}
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
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                <div>
                  <h2 className="font-semibold text-slate-900">Топ-5 учеников</h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    По количеству достижений
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {topStudents.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">
                Достижения ещё не выданы
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Место
                    </th>
                    <th className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Ученик
                    </th>
                    <th className="hidden px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:table-cell">
                      Группа
                    </th>
                    <th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Золото
                    </th>
                    <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Всего
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topStudents.map((s, idx) => (
                    <tr
                      key={s.studentId}
                      className="border-b border-slate-50 transition-colors hover:bg-slate-50/60"
                    >
                      <td className="px-5 py-3 font-bold text-slate-500">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                      </td>
                      <td className="px-3 py-3 font-medium text-slate-900">{s.fullName}</td>
                      <td className="hidden px-3 py-3 text-slate-500 sm:table-cell">
                        {s.groupName || '—'}
                      </td>
                      <td className="px-3 py-3 text-right font-semibold text-amber-600">
                        {s.goldCount}
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-slate-800">
                        {s.totalAchievements}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Quick link: Activity (audit) ── */}
      <div className="flex justify-end">
        <Link
          href="/superadmin/audit"
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-violet-600"
        >
          <Activity className="h-3.5 w-3.5" />
          Журнал действий
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
