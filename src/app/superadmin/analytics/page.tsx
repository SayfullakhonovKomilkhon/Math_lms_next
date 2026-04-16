'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Bar, BarChart, CartesianGrid, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
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
                <CardHeader><h2 className="font-semibold text-slate-900">Посещаемость по группам</h2></CardHeader>
                <CardContent className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={attGroups} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="groupName" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                      <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                      <Tooltip formatter={(v) => [`${v}%`, 'Посещаемость']} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="percentage" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {attendance.byMonth.length > 0 && (
              <Card>
                <CardHeader><h2 className="font-semibold text-slate-900">Динамика по месяцам</h2></CardHeader>
                <CardContent className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={attendance.byMonth}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                      <Tooltip formatter={(v) => [`${v}%`, 'Посещаемость']} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                      <Line type="monotone" dataKey="percentage" stroke="#7c3aed" strokeWidth={2} dot={false} />
                    </LineChart>
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
                <CardContent className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={grades.byMonth}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                      <Tooltip formatter={(v) => [`${v}%`, 'Средний балл']} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                      <Line type="monotone" dataKey="averageScore" stroke="#7c3aed" strokeWidth={2} dot={false} />
                    </LineChart>
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
