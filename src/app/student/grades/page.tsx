'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ApiResponse, GradeRecord, GradeStats, MyRating } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable, DataTableCell, DataTableHead, DataTableHeaderCell, DataTableRow } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ScoreChart } from '@/components/grades/ScoreChart';
import { RatingTable } from '@/components/grades/RatingTable';
import { useState } from 'react';
import { BarChart2, TrendingUp, Award, ListFilter } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function StudentGradesPage() {
  const [ratingPeriod, setRatingPeriod] = useState<'month' | 'quarter' | 'all'>('month');

  const { data: gradesRes, isLoading: gradesLoading } = useQuery({
    queryKey: ['student-grades'],
    queryFn: () => api.get<ApiResponse<GradeRecord[]>>('/grades/my').then(res => res.data),
  });

  const { data: statsRes, isLoading: statsLoading } = useQuery({
    queryKey: ['student-grade-stats'],
    queryFn: () => api.get<ApiResponse<GradeStats>>('/grades/my/stats').then(res => res.data),
  });

  const { data: ratingRes, isLoading: ratingLoading } = useQuery({
    queryKey: ['student-rating', ratingPeriod],
    queryFn: () => api.get<ApiResponse<MyRating>>(`/grades/my/rating?period=${ratingPeriod}`).then(res => res.data),
  });

  if (gradesLoading || statsLoading) {
    return <div className="flex h-[400px] items-center justify-center">Загрузка данных...</div>;
  }

  const grades = gradesRes?.data || [];
  const stats = statsRes?.data;
  const rating = ratingRes?.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 leading-tight flex items-center gap-3">
            <BarChart2 className="h-8 w-8 text-indigo-600" />
            Оценки и рейтинг
          </h1>
          <p className="text-slate-500 mt-1 ml-11">
            Анализ вашей успеваемости и прогресса
          </p>
        </div>
        {rating && (
          <div className="bg-indigo-50 border border-indigo-100 px-6 py-3 rounded-2xl flex items-center gap-4">
            <div className="p-2 bg-white rounded-xl shadow-sm">
              <Award className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Место в группе</p>
              <p className="text-xl font-black text-indigo-900">
                {rating.myPlace} <span className="text-sm font-medium text-slate-400">из {rating.totalStudents}</span>
              </p>
            </div>
          </div>
        )}
      </div>

      <Tabs defaultValue="my-grades" className="w-full">
        <TabsList className="bg-slate-100 p-1 mb-6">
          <TabsTrigger value="my-grades" className="px-8 flex items-center gap-2">
            <ListFilter className="h-4 w-4" /> Мои оценки
          </TabsTrigger>
          <TabsTrigger value="stats" className="px-8 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Аналитика
          </TabsTrigger>
          <TabsTrigger value="rating" className="px-8 flex items-center gap-2">
            <Award className="h-4 w-4" /> Рейтинг
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-grades" className="space-y-6 outline-none">
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <DataTable>
              <table className="w-full text-sm">
                <DataTableHead className="bg-slate-50/80">
                  <DataTableHeaderCell>Дата</DataTableHeaderCell>
                  <DataTableHeaderCell>Тип урока</DataTableHeaderCell>
                  <DataTableHeaderCell className="text-right">Балл</DataTableHeaderCell>
                  <DataTableHeaderCell className="text-right">Процент</DataTableHeaderCell>
                  <DataTableHeaderCell>Комментарий</DataTableHeaderCell>
                </DataTableHead>
                <tbody>
                  {grades.length === 0 ? (
                    <DataTableRow>
                      <DataTableCell colSpan={5} className="py-12 text-center text-slate-400 italic">
                        Оценок пока нет. Усердно занимайтесь!
                      </DataTableCell>
                    </DataTableRow>
                  ) : (
                    grades.map((grade) => (
                      <DataTableRow key={grade.id} className="hover:bg-slate-50/50 transition-colors">
                        <DataTableCell className="text-slate-500 font-medium">
                          {format(new Date(grade.date), 'd MMM yyyy', { locale: ru })}
                        </DataTableCell>
                        <DataTableCell>
                          <Badge variant="outline" className={cnLessonType(grade.lessonType)}>
                            {grade.lessonType}
                          </Badge>
                        </DataTableCell>
                        <DataTableCell className="text-right font-bold text-slate-900">
                          {grade.score} / {grade.maxScore}
                        </DataTableCell>
                        <DataTableCell className="text-right font-black">
                          <span className={cnScore(grade.scorePercent)}>
                            {grade.scorePercent}%
                          </span>
                        </DataTableCell>
                        <DataTableCell className="text-slate-500 italic max-w-xs truncate">
                          {grade.comment || '—'}
                        </DataTableCell>
                      </DataTableRow>
                    ))
                  )}
                </tbody>
              </table>
            </DataTable>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6 outline-none">
          <div className="grid lg:grid-cols-2 gap-6">
            <ScoreChart data={stats?.byMonth || []} />
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-medium">Успеваемость по типам</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                {stats && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.byType}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="lessonType" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                      />
                      <YAxis 
                        domain={[0, 100]} 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        formatter={(val) => [`${Number(val ?? 0)}%`, 'Средний балл']}
                      />
                      <Bar 
                        dataKey="averageScore" 
                        fill="#6366f1" 
                        radius={[4, 4, 0, 0]} 
                        barSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rating" className="space-y-6 outline-none">
          {rating ? (
            rating.isVisible ? (
              <Card className="border-slate-200 shadow-sm p-6">
                <RatingTable 
                  data={rating.rating} 
                  period={ratingPeriod} 
                  onPeriodChange={setRatingPeriod} 
                />
              </Card>
            ) : (
              <Card className="border-dashed border-2 py-20 flex flex-col items-center justify-center">
                <Award className="h-12 w-12 text-slate-200 mb-4" />
                <p className="text-slate-500 font-medium">Рейтинг группы скрыт учителем</p>
                <p className="text-sm text-slate-400 mt-1">Ориентируйтесь на свои личные достижения</p>
              </Card>
            )
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function cnLessonType(type: string) {
  switch (type) {
    case 'TEST': return 'border-red-200 text-red-700 bg-red-50';
    case 'CONTROL': return 'border-orange-200 text-orange-700 bg-orange-50';
    case 'PRACTICE': return 'border-blue-200 text-blue-700 bg-blue-50';
    default: return 'border-slate-200 text-slate-600 bg-slate-50';
  }
}

function cnScore(percent: number) {
  if (percent >= 90) return 'text-emerald-600';
  if (percent >= 70) return 'text-blue-600';
  if (percent >= 50) return 'text-amber-600';
  return 'text-red-600';
}
