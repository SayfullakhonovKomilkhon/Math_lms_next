'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, LabelList,
  ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { FileSpreadsheet } from 'lucide-react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { TabsBar, TabsBarButton } from '@/components/ui/tabs-bar';
import { InputField, SelectField } from '@/components/ui/input-field';
import { KpiCard } from '@/components/analytics/KpiCard';
import { GradesByGroupChart } from '@/components/charts/GradesByGroupChart';
import { toast } from '@/components/ui/toast';

type Tab = 'attendance' | 'grades' | 'ratings';

interface AttendanceCenter {
  overall: { present: number; absent: number; late: number; percentage: number };
  byGroup: { groupId: string; groupName: string; teacherName: string; totalLessons: number; percentage: number }[];
  byMonth: { month: string; percentage: number }[];
}

interface GradesCenter {
  centerAverage: number;
  byGroup: { groupId: string; groupName: string; teacherName: string; averageScore: number; totalWorks: number }[];
  byTeacher: { teacherId: string; teacherName: string; groupsCount: number; studentsCount: number; averageScore: number }[];
  topStudents: { studentId: string; fullName: string; groupName: string; averageScore: number; totalWorks: number }[];
  byMonth: { month: string; averageScore: number }[];
}

const MONTH_LONG = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];
const MONTH_SHORT = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

type TrendPoint<K extends string> = { month: string; isReal: boolean } & { [P in K]: number | null };

function padMonthly<K extends string>(
  data: { month: string }[] | undefined,
  key: K,
  valueGetter: (row: Record<string, unknown>) => number,
): TrendPoint<K>[] {
  const now = new Date();
  const currentMonth = now.getMonth();
  const byKey = new Map<string, Record<string, unknown>>(
    (data ?? []).map((d) => [d.month, d as unknown as Record<string, unknown>]),
  );
  const out: TrendPoint<K>[] = [];
  for (let m = 0; m <= currentMonth; m++) {
    const name = MONTH_LONG[m];
    const entry = byKey.get(name);
    if (entry) {
      out.push({ month: name, isReal: true, [key]: valueGetter(entry) } as TrendPoint<K>);
    } else {
      out.push({ month: name, isReal: false, [key]: null } as TrendPoint<K>);
    }
  }
  return out;
}

async function downloadBlob(url: string, filename: string) {
  try {
    const token = document.cookie.split('; ').find((r) => r.startsWith('auth-storage='));
    const authData = token ? JSON.parse(decodeURIComponent(token.split('=')[1])) : null;
    const accessToken = authData?.state?.accessToken;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}${url}`, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });
    if (!res.ok) throw new Error('Export failed');
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  } catch {
    toast('Ошибка экспорта', 'error');
  }
}

export default function AnalyticsPage() {
  const [tab, setTab] = useState<Tab>('attendance');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [groupId, setGroupId] = useState('');

  const params = new URLSearchParams();
  if (from) params.append('from', from);
  if (to) params.append('to', to);
  const qs = params.toString();

  const { data: attendance, isLoading: attLoading } = useQuery<AttendanceCenter>({
    queryKey: ['sa-attendance-center-full', from, to],
    queryFn: () => api.get(`/analytics/attendance-center?${qs}`).then((r) => r.data.data),
    enabled: tab === 'attendance',
  });

  const { data: grades, isLoading: gradesLoading } = useQuery<GradesCenter>({
    queryKey: ['sa-grades-center', from, to],
    queryFn: () => api.get(`/analytics/grades-center?${qs}`).then((r) => r.data.data),
    enabled: tab === 'grades' || tab === 'ratings',
  });

  const attGroups = groupId
    ? (attendance?.byGroup ?? []).filter((g) => g.groupId === groupId)
    : (attendance?.byGroup ?? []);

  const paddedAttendanceMonths = useMemo(
    () => padMonthly(attendance?.byMonth, 'percentage', (r) => Number(r.percentage) || 0),
    [attendance?.byMonth],
  );
  const paddedGradesMonths = useMemo(
    () => padMonthly(grades?.byMonth, 'averageScore', (r) => Number(r.averageScore) || 0),
    [grades?.byMonth],
  );

  const colorForScore = (v: number) =>
    v >= 80 ? '#059669' : v >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="space-y-6">
      <PageHeader title="Аналитика" description="Посещаемость и успеваемость по центру" />

      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1 block text-xs text-slate-500">От</label>
          <InputField accent="admin" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-36" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500">До</label>
          <InputField accent="admin" type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-36" />
        </div>
        {tab === 'attendance' && (
          <div>
            <label className="mb-1 block text-xs text-slate-500">Группа</label>
            <SelectField accent="admin" value={groupId} onChange={(e) => setGroupId(e.target.value)} className="w-44">
              <option value="">Все группы</option>
              {attendance?.byGroup.map((g) => (
                <option key={g.groupId} value={g.groupId}>{g.groupName}</option>
              ))}
            </SelectField>
          </div>
        )}
      </div>

      <TabsBar>
        <TabsBarButton accent="admin" active={tab === 'attendance'} onClick={() => setTab('attendance')}>Посещаемость</TabsBarButton>
        <TabsBarButton accent="admin" active={tab === 'grades'} onClick={() => setTab('grades')}>Успеваемость</TabsBarButton>
        <TabsBarButton accent="admin" active={tab === 'ratings'} onClick={() => setTab('ratings')}>Рейтинги</TabsBarButton>
      </TabsBar>

      {/* ── Посещаемость ── */}
      {tab === 'attendance' && (
        attLoading ? <p className="text-sm text-slate-400">Загрузка...</p> :
        attendance ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <KpiCard title="Общая посещаемость" value={`${attendance.overall.percentage}%`} valueClassName="text-violet-700" />
              <KpiCard title="Присутствовал" value={attendance.overall.present} valueClassName="text-green-700" />
              <KpiCard title="Опоздал" value={attendance.overall.late} valueClassName="text-amber-700" />
              <KpiCard title="Отсутствовал" value={attendance.overall.absent} valueClassName="text-red-700" />
            </div>

            {attGroups.length > 0 && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <h2 className="font-semibold text-slate-900">Посещаемость по группам</h2>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-emerald-600" />≥ 80%</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-amber-500" />60–79%</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-red-500" />&lt; 60%</span>
                  </div>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={attGroups} margin={{ top: 20, right: 12, bottom: 4, left: 0 }} barCategoryGap="28%">
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="groupName" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => `${v}%`} />
                      <ReferenceLine y={80} stroke="#10b981" strokeDasharray="4 4" strokeWidth={1}
                        label={{ value: '80%', position: 'right', fill: '#047857', fontSize: 10, fontWeight: 600 }} />
                      <Tooltip cursor={{ fill: 'rgba(124,58,237,0.06)' }}
                        formatter={(v) => [`${v}%`, 'Посещаемость']}
                        contentStyle={{ borderRadius: 10, fontSize: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }} />
                      <Bar dataKey="percentage" radius={[8, 8, 0, 0]} isAnimationActive animationDuration={700}>
                        {attGroups.map((g) => (
                          <Cell key={g.groupId} fill={colorForScore(g.percentage)} />
                        ))}
                        <LabelList dataKey="percentage" position="top" formatter={(v) => `${v}%`}
                          style={{ fontSize: 11, fontWeight: 600, fill: '#334155' }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {attendance.byMonth.length > 0 && (
              <Card>
                <CardHeader><h2 className="font-semibold text-slate-900">Динамика по месяцам</h2></CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={paddedAttendanceMonths} margin={{ top: 10, right: 16, bottom: 0, left: -20 }}>
                      <defs>
                        <linearGradient id="attMonthGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false}
                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                        interval={0} minTickGap={0}
                        tickFormatter={(v: string) => {
                          const idx = MONTH_LONG.indexOf(v);
                          return idx >= 0 ? MONTH_SHORT[idx] : v.slice(0, 3);
                        }} />
                      <YAxis domain={[0, 100]} axisLine={false} tickLine={false}
                        tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => `${v}%`} />
                      <ReferenceLine y={85} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1.5}
                        label={{ value: 'Цель 85%', position: 'right', fill: '#b45309', fontSize: 10, fontWeight: 600 }} />
                      <Tooltip formatter={(v) => [`${v}%`, 'Посещаемость']}
                        contentStyle={{ borderRadius: 10, fontSize: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }} />
                      <Area type="monotone" dataKey="percentage" stroke="#7c3aed" strokeWidth={2.5}
                        fill="url(#attMonthGrad)" connectNulls
                        dot={(props: { cx?: number; cy?: number; payload?: { isReal?: boolean }; index?: number }) => {
                          const key = `att-dot-${props.index ?? 0}`;
                          if (!props.payload?.isReal) return <g key={key} />;
                          return <circle key={key} cx={props.cx} cy={props.cy} r={5} fill="#7c3aed" stroke="#fff" strokeWidth={2.5} />;
                        }}
                        activeDot={{ r: 7, fill: '#7c3aed', stroke: '#fff', strokeWidth: 3 }}
                        isAnimationActive animationDuration={750} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <h2 className="font-semibold text-slate-900">По группам</h2>
                <Button variant="secondary" size="sm"
                  onClick={() => downloadBlob(`/reports/attendance/excel?${qs}`, `attendance-${new Date().toISOString().slice(0, 10)}.xlsx`)}>
                  <FileSpreadsheet className="mr-1.5 h-4 w-4 text-green-600" />Excel
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60 text-xs text-slate-500">
                      <th className="px-4 py-3 text-left font-medium">Группа</th>
                      <th className="px-4 py-3 text-left font-medium">Учитель</th>
                      <th className="px-4 py-3 text-right font-medium">Занятий</th>
                      <th className="px-4 py-3 text-right font-medium">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attGroups.map((g) => (
                      <tr key={g.groupId} className="border-b border-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">{g.groupName}</td>
                        <td className="px-4 py-3 text-slate-500">{g.teacherName}</td>
                        <td className="px-4 py-3 text-right text-slate-700">{g.totalLessons}</td>
                        <td className="px-4 py-3 text-right">
                          <Badge variant={g.percentage >= 80 ? 'green' : g.percentage >= 60 ? 'yellow' : 'red'}>
                            {g.percentage}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        ) : null
      )}

      {/* ── Успеваемость ── */}
      {tab === 'grades' && (
        gradesLoading ? <p className="text-sm text-slate-400">Загрузка...</p> :
        grades ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <KpiCard title="Средний балл центра" value={`${grades.centerAverage}%`} valueClassName="text-violet-700" />
              {grades.byGroup.length > 0 && (() => {
                const best = grades.byGroup.reduce((a, b) => a.averageScore > b.averageScore ? a : b);
                return <KpiCard title="Лучшая группа" value={best.groupName} subtitle={`${best.averageScore}%`} valueClassName="text-green-700 text-base" />;
              })()}
              {grades.byTeacher.length > 0 && (() => {
                const best = grades.byTeacher.reduce((a, b) => a.averageScore > b.averageScore ? a : b);
                return <KpiCard title="Лучший учитель" value={best.teacherName} subtitle={`${best.averageScore}%`} valueClassName="text-blue-700 text-base" />;
              })()}
            </div>

            {grades.byMonth.length > 0 && (
              <Card>
                <CardHeader><h2 className="font-semibold text-slate-900">Динамика по месяцам</h2></CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={paddedGradesMonths} margin={{ top: 10, right: 16, bottom: 0, left: -20 }}>
                      <defs>
                        <linearGradient id="gradesMonthGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false}
                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                        interval={0} minTickGap={0}
                        tickFormatter={(v: string) => {
                          const idx = MONTH_LONG.indexOf(v);
                          return idx >= 0 ? MONTH_SHORT[idx] : v.slice(0, 3);
                        }} />
                      <YAxis domain={[0, 100]} axisLine={false} tickLine={false}
                        tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => `${v}%`} />
                      <ReferenceLine y={80} stroke="#10b981" strokeDasharray="4 4" strokeWidth={1.5}
                        label={{ value: 'Цель 80%', position: 'right', fill: '#047857', fontSize: 10, fontWeight: 600 }} />
                      <Tooltip formatter={(v) => [`${v}%`, 'Средний балл']}
                        contentStyle={{ borderRadius: 10, fontSize: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }} />
                      <Area type="monotone" dataKey="averageScore" stroke="#7c3aed" strokeWidth={2.5}
                        fill="url(#gradesMonthGrad)" connectNulls
                        dot={(props: { cx?: number; cy?: number; payload?: { isReal?: boolean }; index?: number }) => {
                          const key = `grades-dot-${props.index ?? 0}`;
                          if (!props.payload?.isReal) return <g key={key} />;
                          return <circle key={key} cx={props.cx} cy={props.cy} r={5} fill="#7c3aed" stroke="#fff" strokeWidth={2.5} />;
                        }}
                        activeDot={{ r: 7, fill: '#7c3aed', stroke: '#fff', strokeWidth: 3 }}
                        isAnimationActive animationDuration={750} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4 lg:grid-cols-2">
              {grades.byGroup.length > 0 && (
                <Card>
                  <CardHeader><h2 className="font-semibold text-slate-900">По группам</h2></CardHeader>
                  <CardContent className="h-64">
                    <GradesByGroupChart data={grades.byGroup.map((g) => ({ groupName: g.groupName, averageScore: g.averageScore }))} />
                  </CardContent>
                </Card>
              )}
              <Card>
                <CardHeader><h2 className="font-semibold text-slate-900">По учителям</h2></CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/60 text-xs text-slate-500">
                        <th className="px-4 py-2 text-left font-medium">Учитель</th>
                        <th className="px-4 py-2 text-right font-medium">Групп</th>
                        <th className="px-4 py-2 text-right font-medium">Учеников</th>
                        <th className="px-4 py-2 text-right font-medium">Балл</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grades.byTeacher.map((t) => (
                        <tr key={t.teacherId} className="border-b border-slate-50">
                          <td className="px-4 py-2.5 font-medium text-slate-900">{t.teacherName}</td>
                          <td className="px-4 py-2.5 text-right text-slate-500">{t.groupsCount}</td>
                          <td className="px-4 py-2.5 text-right text-slate-500">{t.studentsCount}</td>
                          <td className="px-4 py-2.5 text-right">
                            <Badge variant={t.averageScore >= 80 ? 'green' : t.averageScore >= 60 ? 'yellow' : 'red'}>{t.averageScore}%</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <h2 className="font-semibold text-slate-900">Топ-10 учеников</h2>
                <Button variant="secondary" size="sm"
                  onClick={() => downloadBlob(`/reports/grades/excel?${qs}`, `grades-${new Date().toISOString().slice(0, 10)}.xlsx`)}>
                  <FileSpreadsheet className="mr-1.5 h-4 w-4 text-green-600" />Excel
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60 text-xs text-slate-500">
                      <th className="px-4 py-2 text-left font-medium">#</th>
                      <th className="px-4 py-2 text-left font-medium">Ученик</th>
                      <th className="px-4 py-2 text-left font-medium">Группа</th>
                      <th className="px-4 py-2 text-right font-medium">Работ</th>
                      <th className="px-4 py-2 text-right font-medium">Балл</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grades.topStudents.map((s, i) => (
                      <tr key={s.studentId} className="border-b border-slate-50">
                        <td className="px-4 py-2.5 text-slate-400">{i + 1}</td>
                        <td className="px-4 py-2.5 font-medium text-slate-900">{s.fullName}</td>
                        <td className="px-4 py-2.5 text-slate-500">{s.groupName}</td>
                        <td className="px-4 py-2.5 text-right text-slate-500">{s.totalWorks}</td>
                        <td className="px-4 py-2.5 text-right">
                          <Badge variant={s.averageScore >= 80 ? 'green' : s.averageScore >= 60 ? 'yellow' : 'red'}>{s.averageScore}%</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        ) : null
      )}

      {/* ── Рейтинги ── */}
      {tab === 'ratings' && (
        gradesLoading ? <p className="text-sm text-slate-400">Загрузка...</p> :
        grades ? (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Топ-10 учеников */}
              <Card>
                <CardHeader><h2 className="font-semibold text-slate-900">Топ-10 учеников центра</h2></CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/60 text-xs text-slate-500">
                        <th className="px-4 py-2 text-left font-medium">Место</th>
                        <th className="px-4 py-2 text-left font-medium">Ученик</th>
                        <th className="px-4 py-2 text-left font-medium">Группа</th>
                        <th className="px-4 py-2 text-right font-medium">Балл</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grades.topStudents.slice(0, 10).map((s, i) => (
                        <tr key={s.studentId} className={`border-b border-slate-50 ${i < 3 ? 'bg-amber-50/30' : ''}`}>
                          <td className="px-4 py-2.5 font-bold">
                            <span className={i === 0 ? 'text-amber-500' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-orange-400' : 'text-slate-300'}>
                              {i + 1}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 font-medium text-slate-900">{s.fullName}</td>
                          <td className="px-4 py-2.5 text-slate-500">{s.groupName}</td>
                          <td className="px-4 py-2.5 text-right">
                            <Badge variant={s.averageScore >= 80 ? 'green' : s.averageScore >= 60 ? 'yellow' : 'red'}>{s.averageScore}%</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              {/* Топ-5 групп */}
              <Card>
                <CardHeader><h2 className="font-semibold text-slate-900">Топ-5 групп по успеваемости</h2></CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/60 text-xs text-slate-500">
                        <th className="px-4 py-2 text-left font-medium">#</th>
                        <th className="px-4 py-2 text-left font-medium">Группа</th>
                        <th className="px-4 py-2 text-left font-medium">Учитель</th>
                        <th className="px-4 py-2 text-right font-medium">Балл</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...grades.byGroup]
                        .sort((a, b) => b.averageScore - a.averageScore)
                        .slice(0, 5)
                        .map((g, i) => (
                          <tr key={g.groupId} className={`border-b border-slate-50 ${i < 3 ? 'bg-amber-50/30' : ''}`}>
                            <td className="px-4 py-2.5 font-bold text-slate-400">{i + 1}</td>
                            <td className="px-4 py-2.5 font-medium text-slate-900">{g.groupName}</td>
                            <td className="px-4 py-2.5 text-slate-500">{g.teacherName}</td>
                            <td className="px-4 py-2.5 text-right">
                              <Badge variant={g.averageScore >= 80 ? 'green' : g.averageScore >= 60 ? 'yellow' : 'red'}>{g.averageScore}%</Badge>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>

            {/* Топ-5 активных (chart) */}
            {grades.topStudents.length > 0 && (
              <Card>
                <CardHeader><h2 className="font-semibold text-slate-900">Топ-5 активных учеников</h2></CardHeader>
                <CardContent className="h-56">
                  <GradesByGroupChart
                    data={grades.topStudents.slice(0, 5).map((s) => ({ groupName: s.fullName, averageScore: s.averageScore }))}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        ) : null
      )}
    </div>
  );
}
