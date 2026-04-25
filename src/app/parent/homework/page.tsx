'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ApiResponse, Homework } from '@/types';
import { BookOpen, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  useParentProfile,
  useSelectedChild,
  PARENT_CHILD_QUERY_DEFAULTS,
} from '@/hooks/useParentProfile';
import { ChildSelector } from '@/components/parent/ChildSelector';
import { CardSkeleton } from '@/components/ui/Skeleton';

export default function ParentHomeworkPage() {
  const { data: profile } = useParentProfile();
  const { children, selectedId, select } = useSelectedChild(profile);

  const { data: homeworksRes, isLoading } = useQuery({
    queryKey: ['parent-child-homework', selectedId],
    queryFn: () =>
      api
        .get<ApiResponse<Homework[]>>('/parents/me/child/homework', {
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

  const homeworks = homeworksRes?.data || [];
  const latestHw = homeworks[0];
  const overdue =
    latestHw?.dueDate && new Date(latestHw.dueDate) < new Date();

  return (
    <div className="space-y-5 pb-2">
      <ChildSelector children={children} selectedId={selectedId} onSelect={select} />

      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <BookOpen className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold leading-tight text-slate-900 sm:text-2xl">
            Домашние задания
          </h1>
          <p className="mt-0.5 text-[12px] text-slate-500 sm:text-sm">
            Контроль учебных задач ребёнка
          </p>
        </div>
      </div>

      {latestHw ? (
        <article className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <header className="flex items-center justify-between gap-2 bg-gradient-to-br from-emerald-50 to-teal-50 px-4 py-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
              Актуальное задание
            </span>
            {latestHw.dueDate && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  overdue
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-white text-emerald-700'
                }`}
              >
                {overdue && <AlertCircle className="h-3 w-3" />}
                до {format(new Date(latestHw.dueDate), 'd MMM', { locale: ru })}
              </span>
            )}
          </header>
          <div className="px-4 py-4 sm:px-5 sm:py-5">
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-slate-800">
              {latestHw.text}
            </p>

            {latestHw.imageUrls && latestHw.imageUrls.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {latestHw.imageUrls.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => window.open(url, '_blank')}
                    className="overflow-hidden rounded-2xl border border-slate-100 transition-transform active:scale-[0.98]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Изображение ${i + 1}`}
                      className="h-32 w-full object-cover sm:h-36"
                    />
                  </button>
                ))}
              </div>
            )}

            {latestHw.teacher && (
              <div className="mt-4 flex items-center gap-1.5 border-t border-slate-100 pt-3 text-[11px] text-slate-400">
                <Clock className="h-3 w-3" />
                {latestHw.teacher.fullName}
              </div>
            )}
          </div>
        </article>
      ) : (
        <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white py-16 text-center">
          <BookOpen className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="font-medium text-slate-500">Актуальных заданий нет</p>
        </div>
      )}

      {homeworks.length > 1 && (
        <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <header className="px-4 py-3">
            <h2 className="text-sm font-bold text-slate-800">Предыдущие задания</h2>
          </header>
          <ul className="divide-y divide-slate-100 border-t border-slate-100">
            {homeworks.slice(1, 6).map((hw) => (
              <li key={hw.id} className="px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  {format(new Date(hw.createdAt), 'd MMMM', { locale: ru })}
                </p>
                <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-slate-700">
                  {hw.text}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
