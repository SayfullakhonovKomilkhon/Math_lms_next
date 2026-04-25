'use client';

import { useQuery } from '@tanstack/react-query';
import { Trophy, Share2 } from 'lucide-react';
import api from '@/lib/api';
import { AchievementMonthGrid } from '@/components/achievements/AchievementMonthGrid';
import { SpecialAchievements } from '@/components/achievements/SpecialAchievements';
import { useParentProfile, useSelectedChild } from '@/hooks/useParentProfile';
import { ChildSelector } from '@/components/parent/ChildSelector';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/toast';

export default function ParentAchievementsPage() {
  const { data: profile } = useParentProfile();
  const { children, selectedId, select } = useSelectedChild(profile);
  const { toast } = useToast();

  const childId = selectedId;

  const { data, isLoading } = useQuery({
    queryKey: ['child-achievements', childId],
    queryFn: () => api.get(`/achievements/student/${childId}`).then((r) => r.data.data),
    enabled: !!childId,
    staleTime: 1000 * 60 * 10,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="space-y-5">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white py-16 text-center">
        <Trophy className="mx-auto mb-3 h-10 w-10 text-slate-300" />
        <p className="font-medium text-slate-500">Нет данных о достижениях</p>
      </div>
    );
  }

  const { student, monthGrid, specialAchievements, stats } = data;

  const shareText = `🏆 ${student.fullName} получил ${stats.totalAchievements} достижений в MathCenter! 🥇${stats.goldCount} 🥈${stats.silverCount} 🥉${stats.bronzeCount}`;

  return (
    <div className="space-y-5 pb-2">
      <ChildSelector children={children} selectedId={selectedId} onSelect={select} />

      {/* Hero card */}
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 p-5 text-white shadow-[0_8px_24px_-12px_rgba(245,158,11,0.5)] sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <Trophy className="h-7 w-7" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/80">
              Достижения
            </p>
            <h1 className="mt-0.5 truncate text-xl font-bold leading-tight sm:text-2xl">
              {student.fullName}
            </h1>
            {student.groupName && (
              <p className="mt-0.5 text-[12px] text-white/85">{student.groupName}</p>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <MedalStat icon="🥇" count={stats.goldCount} label="Золото" />
          <MedalStat icon="🥈" count={stats.silverCount} label="Серебро" />
          <MedalStat icon="🥉" count={stats.bronzeCount} label="Бронза" />
        </div>

        <button
          type="button"
          onClick={async () => {
            if (navigator.share) {
              try {
                await navigator.share({ text: shareText });
                return;
              } catch {
                // ignore — fall back to clipboard
              }
            }
            await navigator.clipboard.writeText(shareText);
            toast({ title: 'Скопировано', description: 'Текст в буфере обмена' });
          }}
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-white/20 px-3 py-2 text-xs font-semibold backdrop-blur-sm transition-colors active:bg-white/30"
        >
          <Share2 className="h-3.5 w-3.5" />
          Поделиться
        </button>
      </div>

      <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-5">
        <h2 className="text-sm font-bold text-slate-800">Ежемесячные достижения</h2>
        <div className="mt-3">
          <AchievementMonthGrid monthGrid={monthGrid} />
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-5">
        <h2 className="text-sm font-bold text-slate-800">Особые достижения</h2>
        <div className="mt-3">
          <SpecialAchievements achievements={specialAchievements} />
        </div>
      </section>
    </div>
  );
}

function MedalStat({
  icon,
  count,
  label,
}: {
  icon: string;
  count: number;
  label: string;
}) {
  return (
    <div className="rounded-2xl bg-white/15 px-2 py-2.5 text-center backdrop-blur-sm">
      <p className="text-2xl leading-none">{icon}</p>
      <p className="mt-1 text-lg font-black leading-none">{count}</p>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-white/80">
        {label}
      </p>
    </div>
  );
}
