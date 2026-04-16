'use client';

import { formatDate } from '@/lib/utils';

export interface SpecialAchievementItem {
  key: string;
  title: string;
  icon: string;
  description: string;
  condition: string;
  unlocked: boolean;
  unlockedAt?: string;
}

function SpecialCard({ item }: { item: SpecialAchievementItem }) {
  if (!item.unlocked) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
        <span className="mt-0.5 text-2xl opacity-30">{item.icon}</span>
        <div>
          <p className="font-medium text-slate-400">{item.title}</p>
          <p className="mt-0.5 text-xs text-slate-400">{item.condition}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-xl border border-violet-200 bg-violet-50 p-4">
      <span className="mt-0.5 text-2xl">{item.icon}</span>
      <div>
        <p className="font-semibold text-violet-900">{item.title}</p>
        <p className="mt-0.5 text-xs text-violet-600">{item.description}</p>
        {item.unlockedAt && (
          <p className="mt-1 text-xs text-slate-500">
            Получено: {formatDate(item.unlockedAt)}
          </p>
        )}
      </div>
    </div>
  );
}

interface Props {
  achievements: SpecialAchievementItem[];
}

export function SpecialAchievements({ achievements }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {achievements.map((a) => (
        <SpecialCard key={a.key} item={a} />
      ))}
    </div>
  );
}
