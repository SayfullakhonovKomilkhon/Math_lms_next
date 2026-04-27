'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ApiResponse, GradeRecord } from '@/types';
import { ScoreChart } from '@/components/grades/ScoreChart';
import { BarChart, BookOpen, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  useParentProfile,
  useSelectedChild,
  PARENT_CHILD_QUERY_DEFAULTS,
} from '@/hooks/useParentProfile';
import { ChildSelector } from '@/components/parent/ChildSelector';
import { CardSkeleton } from '@/components/ui/Skeleton';

const TYPE_LABEL: Record<string, string> = {
  TEST: 'Тест',
  CONTROL: 'Контрольная',
  PRACTICE: 'Практика',
  HOMEWORK: 'Домашняя',
  EXAM: 'Экзамен',
};

const TYPE_TONE: Record<string, string> = {
  TEST: 'bg-rose-50 text-rose-700',
  CONTROL: 'bg-orange-50 text-orange-700',
  PRACTICE: 'bg-blue-50 text-blue-700',
  HOMEWORK: 'bg-emerald-50 text-emerald-700',
  EXAM: 'bg-violet-50 text-violet-700',
};

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
    ...PARENT_CHILD_QUERY_DEFAULTS,
  });

  if (isLoading) {
    return (
      <div className="space-y-5">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  const grades = gradesRes?.data || [];
  const totalPoints = grades.reduce((acc, g) => acc + Number(g.score || 0), 0);
  const totalMax = grades.reduce(
    (acc, g) => acc + Number(g.maxScore || 0),
    0,
  );
  // Show the average as a percentage so it stays meaningful when exam
  // ceilings vary (e.g. 50/50 should rank above 60/100).
  const avgPct =
    totalMax > 0 ? Math.round((totalPoints / totalMax) * 100) : 0;

  const months: Record<string, { total: number; max: number; count: number }> = {};
  grades.forEach((g) => {
    const month = g.date.substring(0, 7);
    if (!months[month]) months[month] = { total: 0, max: 0, count: 0 };
    months[month].total += Number(g.score || 0);
    months[month].max += Number(g.maxScore || 0);
    months[month].count += 1;
  });
  const chartData = Object.entries(months)
    .map(([month, data]) => ({
      month,
      averageScore:
        data.max > 0 ? Math.round((data.total / data.max) * 100) : 0,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return (
    <div className="space-y-5 pb-2">
      <ChildSelector children={children} selectedId={selectedId} onSelect={select} />

      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <BarChart className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold leading-tight text-slate-900 sm:text-2xl">
            Успеваемость
          </h1>
          <p className="mt-0.5 text-[12px] text-slate-500 sm:text-sm">
            Результаты тестов, контрольных и работы
          </p>
        </div>
      </div>

      {/* Hero stats */}
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 p-5 text-white shadow-[0_8px_24px_-12px_rgba(79,70,229,0.45)] sm:p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-indigo-100/80">
              <TrendingUp className="h-3 w-3" /> Сумма баллов
            </p>
            <p className="mt-1 text-5xl font-black tracking-tight sm:text-6xl">
              {totalPoints}
              {totalMax > 0 ? (
                <span className="ml-1 text-xl font-semibold text-indigo-100/80 sm:text-2xl">
                  / {totalMax}
                </span>
              ) : null}
            </p>
            <p className="mt-2 text-xs text-indigo-100/85">
              {grades.length} {pluralWorks(grades.length)} · средний {avgPct}%
            </p>
          </div>
          <div className="rounded-2xl bg-white/15 px-3 py-2 text-center backdrop-blur-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-100/80">
              Средний
            </p>
            <p className="mt-0.5 text-xl font-black">{avgPct}%</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white p-2 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <ScoreChart data={chartData} />
        </div>
      )}

      {/* Grades list */}
      <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <header className="flex items-center gap-2 px-4 py-3">
          <BookOpen className="h-4 w-4 text-slate-400" />
          <h2 className="text-sm font-bold text-slate-800">Все оценки</h2>
          <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
            {grades.length}
          </span>
        </header>
        <div className="border-t border-slate-100">
          {grades.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-slate-400">
              Оценок пока не зафиксировано
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {grades.map((g) => {
                const tone =
                  g.scorePercent >= 80
                    ? 'text-emerald-600'
                    : g.scorePercent >= 60
                      ? 'text-amber-600'
                      : 'text-rose-600';
                const dot =
                  g.scorePercent >= 80
                    ? 'bg-emerald-500'
                    : g.scorePercent >= 60
                      ? 'bg-amber-500'
                      : 'bg-rose-500';
                const label = TYPE_LABEL[g.lessonType] || g.lessonType;
                const tagTone = TYPE_TONE[g.lessonType] || 'bg-slate-100 text-slate-700';
                return (
                  <li key={g.id} className="px-4 py-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${tagTone}`}
                          >
                            {label}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {format(new Date(g.date), 'd MMM', { locale: ru })}
                          </span>
                        </div>
                        {g.comment && (
                          <p className="mt-1.5 line-clamp-2 text-[13px] italic text-slate-500">
                            {g.comment}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        <p className={`text-xl font-black leading-none ${tone}`}>
                          {g.score}
                        </p>
                        <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          из {g.maxScore}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function pluralWorks(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'работа';
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return 'работы';
  return 'работ';
}
