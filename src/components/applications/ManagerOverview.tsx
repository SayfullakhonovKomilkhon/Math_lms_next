'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Headphones,
  Target,
  Users,
} from 'lucide-react';
import api from '@/lib/api';
import { AdmissionApplication, ApplicationsSummary } from '@/types/applications';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { ApplicationStatusBadge } from './application-status';

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function ManagerOverview({ resultsOnly = false }: { resultsOnly?: boolean }) {
  const { data: summary } = useQuery<ApplicationsSummary>({
    queryKey: ['applications-summary'],
    queryFn: () => api.get('/applications/summary').then((response) => response.data.data),
  });

  const { data: recent = [] } = useQuery<AdmissionApplication[]>({
    queryKey: ['applications', { dashboard: true }],
    queryFn: () => api.get('/applications').then((response) => response.data.data),
    enabled: !resultsOnly,
  });

  const conversion = summary?.total
    ? Math.round((summary.enrolled / summary.total) * 100)
    : 0;

  const cards = resultsOnly
    ? [
        { label: 'Всего заявок', value: summary?.total, icon: Users, color: 'bg-slate-100 text-slate-700' },
        { label: 'В работе', value: summary?.active, icon: Headphones, color: 'bg-blue-50 text-blue-700' },
        { label: 'Пробные уроки', value: summary?.trials, icon: Target, color: 'bg-violet-50 text-violet-700' },
        { label: 'Стали учениками', value: summary?.enrolled, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-700' },
      ]
    : [
        { label: 'Новые заявки', value: summary?.new, icon: Headphones, color: 'bg-blue-50 text-blue-700' },
        { label: 'Звонки сегодня', value: summary?.callbacksToday, icon: CalendarClock, color: 'bg-cyan-50 text-cyan-700' },
        { label: 'Просроченные', value: summary?.overdue, icon: Clock3, color: 'bg-red-50 text-red-700' },
        { label: 'Стали учениками', value: summary?.enrolled, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-700' },
      ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={resultsOnly ? 'Мои результаты' : 'Работа с заявками'}
        description={
          resultsOnly
            ? 'Основные показатели обработки лидов и конверсии'
            : 'Новые обращения и задачи, которые требуют внимания сегодня'
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-950">{value ?? '—'}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {resultsOnly ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Конверсия в ученика</p>
                <p className="mt-1 text-4xl font-semibold text-slate-950">{conversion}%</p>
                <p className="mt-2 text-sm text-slate-500">
                  {summary?.enrolled ?? 0} из {summary?.total ?? 0} заявок завершились зачислением.
                </p>
              </div>
              <div className="h-3 w-full max-w-md overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all"
                  style={{ width: `${conversion}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
          <Card>
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="font-semibold text-slate-900">Последние заявки</h2>
              <Link href="/manager/applications" className="flex items-center gap-1 text-sm font-medium text-cyan-700 hover:text-cyan-800">
                Все заявки <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {recent.slice(0, 6).map((application) => (
              <Link
                key={application.id}
                href="/manager/applications"
                className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 last:border-0 hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{application.fullName}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {application.phone} · {formatDateTime(application.createdAt)}
                  </p>
                </div>
                <ApplicationStatusBadge status={application.status} />
              </Link>
            ))}
            {recent.length === 0 ? (
              <CardContent className="py-12 text-center text-sm text-slate-400">
                Новых заявок пока нет.
              </CardContent>
            ) : null}
          </Card>

          <Card>
            <CardContent className="space-y-3 p-5">
              <h2 className="font-semibold text-slate-900">Быстрые действия</h2>
              <Link
                href="/manager/applications"
                className="flex items-center justify-between rounded-xl border border-slate-200 p-4 text-sm font-medium text-slate-700 hover:border-cyan-200 hover:bg-cyan-50"
              >
                Обработать новые заявки <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/manager/callbacks"
                className="flex items-center justify-between rounded-xl border border-slate-200 p-4 text-sm font-medium text-slate-700 hover:border-cyan-200 hover:bg-cyan-50"
              >
                Открыть повторные звонки <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
