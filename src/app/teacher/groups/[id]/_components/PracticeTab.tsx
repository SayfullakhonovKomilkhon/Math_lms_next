'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink } from 'lucide-react';
import api from '@/lib/api';
import { Grade, RatingEntry } from '@/types';
import { Button } from '@/components/ui/button';
import { GradeTable } from '@/components/grades/GradeTable';
import { RatingTable } from '@/components/grades/RatingTable';
import { ErrorState } from '@/components/ui/ErrorState';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

interface Props {
  groupId: string;
}

const SUB_TABS = [
  { key: 'journal', label: 'Журнал оценок' },
  { key: 'rating', label: 'Рейтинг группы' },
] as const;

type SubTab = (typeof SUB_TABS)[number]['key'];

export function PracticeTab({ groupId }: Props) {
  const [tab, setTab] = useState<SubTab>('journal');
  const [period, setPeriod] = useState<'month' | 'quarter' | 'all'>('month');

  const {
    data: grades = [],
    isLoading: gradesLoading,
    isError: gradesError,
    refetch: refetchGrades,
  } = useQuery({
    queryKey: ['grades', groupId],
    queryFn: () =>
      api
        .get(`/grades?groupId=${groupId}`)
        .then((r) => r.data.data as Grade[]),
    enabled: !!groupId && tab === 'journal',
  });

  const {
    data: rating = [],
    isLoading: ratingLoading,
    isError: ratingError,
    refetch: refetchRating,
  } = useQuery({
    queryKey: ['rating', groupId, period],
    queryFn: () =>
      api
        .get(`/grades/rating/${groupId}?period=${period}`)
        .then((r) => r.data.data as RatingEntry[]),
    enabled: !!groupId && tab === 'rating',
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Практика</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Журнал оценок и рейтинг этой группы.
          </p>
        </div>
        <Link href={`/teacher/groups/${groupId}/grades`}>
          <Button variant="ghost" size="sm" accent="teacher">
            <ExternalLink className="mr-1.5 h-4 w-4" />
            Открыть отдельно
          </Button>
        </Link>
      </div>

      {/* Sub-tabs */}
      <div className="flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1">
        {SUB_TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              'flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              tab === t.key
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Scrollable content area */}
      <div className="max-h-[600px] overflow-y-auto rounded-xl border border-slate-200/90 bg-white p-4">
        {tab === 'journal' &&
          (gradesLoading ? (
            <TableSkeleton rows={8} cols={5} />
          ) : gradesError ? (
            <ErrorState
              message="Не удалось загрузить журнал оценок"
              description="Попробуйте обновить данные ещё раз."
              onRetry={() => {
                void refetchGrades();
              }}
            />
          ) : (
            <GradeTable grades={grades} />
          ))}

        {tab === 'rating' &&
          (ratingLoading ? (
            <TableSkeleton rows={6} cols={5} />
          ) : ratingError ? (
            <ErrorState
              message="Не удалось загрузить рейтинг группы"
              description="Смените период или повторите запрос."
              onRetry={() => {
                void refetchRating();
              }}
            />
          ) : (
            <RatingTable
              data={rating}
              period={period}
              onPeriodChange={setPeriod}
            />
          ))}
      </div>
    </div>
  );
}
