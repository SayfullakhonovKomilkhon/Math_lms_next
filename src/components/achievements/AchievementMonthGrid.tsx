'use client';

export interface AchievementMonth {
  month: number;
  monthName: string;
  unlocked: boolean;
  place?: number | null;
  title?: string;
  icon?: string;
  description?: string;
  year?: number | null;
  createdAt?: string;
}

const PLACE_STYLES: Record<number, { border: string; bg: string; medal: string }> = {
  1: { border: 'border-yellow-400', bg: 'bg-yellow-50', medal: '🥇' },
  2: { border: 'border-slate-400', bg: 'bg-slate-50', medal: '🥈' },
  3: { border: 'border-amber-600', bg: 'bg-amber-50', medal: '🥉' },
};

function AchievementMonthCard({ data }: { data: AchievementMonth }) {
  if (!data.unlocked) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 text-center transition-transform hover:scale-105">
        <span className="mb-1 text-2xl">🔒</span>
        <p className="text-sm font-medium text-slate-400">{data.monthName}</p>
      </div>
    );
  }

  const place = data.place ?? 1;
  const style = PLACE_STYLES[place] ?? PLACE_STYLES[3];

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border-2 ${style.border} ${style.bg} p-4 text-center transition-transform hover:scale-105`}
    >
      <span className="mb-1 text-2xl">{style.medal}</span>
      <span className="mb-1 text-xl">{data.icon}</span>
      <p className="text-xs font-semibold text-slate-700">{data.title}</p>
      <p className="mt-0.5 text-xs text-slate-500">{data.monthName}</p>
    </div>
  );
}

interface Props {
  monthGrid: AchievementMonth[];
}

export function AchievementMonthGrid({ monthGrid }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
      {monthGrid.map((m) => (
        <AchievementMonthCard key={m.month} data={m} />
      ))}
    </div>
  );
}
