'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ApiResponse, GradeRecord } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, DataTableCell, DataTableHead, DataTableHeaderCell, DataTableRow } from '@/components/ui/data-table';
import { ScoreChart } from '@/components/grades/ScoreChart';
import { BarChart, TrendingUp, BookOpen, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useParentProfile, useSelectedChild } from '@/hooks/useParentProfile';
import { ChildSelector } from '@/components/parent/ChildSelector';

export default function ParentGradesPage() {
  const { data: profile } = useParentProfile();
  const { children, selectedId, select } = useSelectedChild(profile);

  const { data: gradesRes, isLoading } = useQuery({
    queryKey: ['parent-child-grades', selectedId],
    queryFn: () =>
      api
        .get<ApiResponse<GradeRecord[]>>('/parents/me/child/grades', {
          params: selectedId ? { studentId: selectedId } : {},
        })
        .then((res) => res.data),
    enabled: !!selectedId,
  });

  if (isLoading) {
    return <div className="flex h-[400px] items-center justify-center">Загрузка данных...</div>;
  }

  const grades = gradesRes?.data || [];

  // Total points earned + average raw score (per work).
  const totalPoints = grades.reduce((acc, g) => acc + Number(g.score || 0), 0);
  const avgRaw = grades.length > 0
    ? Math.round(totalPoints / grades.length)
    : 0;

  // Monthly stats for chart — average raw score per month.
  const months: Record<string, { total: number, count: number }> = {};
  grades.forEach(g => {
    const month = g.date.substring(0, 7); // YYYY-MM
    if (!months[month]) months[month] = { total: 0, count: 0 };
    months[month].total += Number(g.score || 0);
    months[month].count += 1;
  });
  const chartData = Object.entries(months).map(([month, data]) => ({
    month,
    averageScore: Math.round(data.total / data.count)
  })).sort((a,b) => a.month.localeCompare(b.month));

  return (
    <div className="space-y-6">
      <ChildSelector children={children} selectedId={selectedId} onSelect={select} />
      <div>
        <h1 className="text-3xl font-bold text-slate-900 leading-tight flex items-center gap-3">
          <BarChart className="h-8 w-8 text-indigo-600" />
          Успеваемость ребенка
        </h1>
        <p className="text-slate-500 mt-1 ml-11">
          Результаты тестов, контрольных и работы на уроке
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1 shadow-sm border-slate-200 bg-indigo-600 text-white">
          <CardContent className="pt-8 text-center pb-8">
            <TrendingUp className="h-8 w-8 mx-auto mb-4 opacity-70" />
            <p className="text-sm font-bold text-indigo-100 uppercase tracking-widest">Сумма баллов</p>
            <p className="text-6xl font-black mt-2">{totalPoints}</p>
            <p className="text-xs text-indigo-200 mt-4 px-4 leading-relaxed font-medium">
              {grades.length} {grades.length === 1 ? 'работа' : 'работ'} · средний балл {avgRaw}
            </p>
          </CardContent>
        </Card>

        <div className="lg:col-span-3">
            <ScoreChart data={chartData} />
        </div>
      </div>

      <Card className="shadow-sm border-slate-200 overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-slate-400" />
            Список всех оценок
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable>
            <table className="w-full text-sm">
              <DataTableHead className="bg-slate-50/80">
                <DataTableHeaderCell>Дата</DataTableHeaderCell>
                <DataTableHeaderCell>Тип</DataTableHeaderCell>
                <DataTableHeaderCell className="text-right">Результат</DataTableHeaderCell>
                <DataTableHeaderCell>Комментарий учителя</DataTableHeaderCell>
              </DataTableHead>
              <tbody>
                {grades.length === 0 ? (
                  <DataTableRow>
                    <DataTableCell colSpan={4} className="py-12 text-center text-slate-400 italic">
                      Оценок пока не зафиксировано
                    </DataTableCell>
                  </DataTableRow>
                ) : (
                  grades.map((grade) => (
                    <DataTableRow key={grade.id} className="hover:bg-slate-50/50 transition-colors">
                      <DataTableCell className="text-slate-500 font-medium whitespace-nowrap">
                        {format(new Date(grade.date), 'd MMMM yyyy', { locale: ru })}
                      </DataTableCell>
                      <DataTableCell className="whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${cnType(grade.lessonType)}`}>
                          {grade.lessonType}
                        </span>
                      </DataTableCell>
                      <DataTableCell className="text-right">
                        <div className="flex flex-col items-end">
                            <span className={`text-base font-black ${cnScore(grade.scorePercent)}`}>
                                {grade.score} <span className="text-xs font-bold text-slate-400">/ {grade.maxScore}</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">
                                балл.
                            </span>
                        </div>
                      </DataTableCell>
                      <DataTableCell className="text-slate-600 italic">
                        {grade.comment || (
                            <span className="text-slate-300 text-xs">Комментарий отсутствует</span>
                        )}
                      </DataTableCell>
                    </DataTableRow>
                  ))
                )}
              </tbody>
            </table>
          </DataTable>
        </CardContent>
      </Card>
      
      <div className="p-6 bg-slate-900 text-white rounded-3xl flex flex-col md:flex-row items-center gap-8 border shadow-xl shadow-slate-100">
          <div className="p-4 bg-white/10 rounded-2xl">
              <AlertCircle className="h-10 w-10 text-white" />
          </div>
          <div className="space-y-2">
              <h4 className="text-xl font-black">Нужна помощь с предметом?</h4>
              <p className="text-slate-400 text-sm max-w-xl">
                  Если вы заметили снижение успеваемости вашего ребенка, пожалуйста, свяжитесь с нашим академическим куратором для разбора ситуации.
              </p>
          </div>
          <Link href="#" className="md:ml-auto bg-white text-slate-900 px-8 py-3 rounded-xl font-bold hover:bg-white/90 transition-colors">
              Связаться
          </Link>
      </div>
    </div>
  );
}

function cnType(type: string) {
    switch(type) {
        case 'TEST': return 'bg-red-100 text-red-700 border-red-200';
        case 'CONTROL': return 'bg-orange-100 text-orange-700 border-orange-200';
        case 'PRACTICE': return 'bg-blue-100 text-blue-700 border-blue-200';
        default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
}

function cnScore(percent: number) {
  if (percent >= 80) return 'text-emerald-600';
  if (percent >= 60) return 'text-amber-600';
  return 'text-red-600';
}

function Link({ children, className, href }: any) {
    return <a className={className} href={href}>{children}</a>
}
