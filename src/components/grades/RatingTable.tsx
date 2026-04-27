'use client';

import { RatingEntry } from '@/types';
import { cn } from '@/lib/utils';

interface Props {
  data: RatingEntry[];
  period: 'month' | 'quarter' | 'all';
  onPeriodChange: (p: 'month' | 'quarter' | 'all') => void;
}

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

const PERIODS = [
  { value: 'month' as const, label: 'За месяц' },
  { value: 'quarter' as const, label: 'За квартал' },
  { value: 'all' as const, label: 'За всё время' },
];

export function RatingTable({ data, period, onPeriodChange }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => onPeriodChange(p.value)}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              period === p.value
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200/90">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-slate-200 bg-slate-50/90">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Место
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Ученик
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Баллы
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Работ
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Посещаемость
              </th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr className="border-b border-slate-100">
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  Нет данных за выбранный период
                </td>
              </tr>
            )}
            {data.map((entry) => (
              <tr
                key={entry.studentId}
                className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/60"
              >
                <td className="px-4 py-3 text-xl">
                  {MEDAL[entry.place] ?? (
                    <span className="text-sm font-bold text-slate-500">{entry.place}</span>
                  )}
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">{entry.fullName}</td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={`text-base font-bold ${
                      entry.averageScore >= 80
                        ? 'text-emerald-600'
                        : entry.averageScore >= 60
                          ? 'text-amber-600'
                          : 'text-red-600'
                    }`}
                  >
                    {entry.totalPoints}
                  </span>
                  {entry.totalMax > 0 ? (
                    <span className="ml-1 text-xs font-medium text-slate-400">
                      / {entry.totalMax}
                    </span>
                  ) : null}
                  <span className="ml-1 text-xs font-medium text-slate-400">
                    ({entry.averageScore}%)
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-slate-600">{entry.totalWorks}</td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={`font-medium ${
                      entry.attendancePercent >= 80
                        ? 'text-emerald-600'
                        : entry.attendancePercent >= 60
                          ? 'text-amber-600'
                          : 'text-red-600'
                    }`}
                  >
                    {entry.attendancePercent}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
