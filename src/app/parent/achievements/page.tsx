'use client';

import { useQuery } from '@tanstack/react-query';
import { Trophy } from 'lucide-react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AchievementMonthGrid } from '@/components/achievements/AchievementMonthGrid';
import { SpecialAchievements } from '@/components/achievements/SpecialAchievements';
import { useParentProfile, useSelectedChild } from '@/hooks/useParentProfile';
import { ChildSelector } from '@/components/parent/ChildSelector';

export default function ParentAchievementsPage() {
  const { data: profile } = useParentProfile();
  const { children, selectedId, select } = useSelectedChild(profile);

  const childId = selectedId;

  const { data, isLoading } = useQuery({
    queryKey: ['child-achievements', childId],
    queryFn: () => api.get(`/achievements/student/${childId}`).then((r) => r.data.data),
    enabled: !!childId,
    staleTime: 1000 * 60 * 10,
  });

  if (isLoading) {
    return <p className="py-10 text-center text-slate-400">Загрузка...</p>;
  }

  if (!data) {
    return <p className="py-10 text-center text-slate-400">Нет данных</p>;
  }

  const { student, monthGrid, specialAchievements, stats } = data;

  const shareText = `🏆 ${student.fullName} получил ${stats.totalAchievements} достижений в MathCenter! 🥇${stats.goldCount} 🥈${stats.silverCount} 🥉${stats.bronzeCount}`;

  return (
    <div className="space-y-6">
      <ChildSelector children={children} selectedId={selectedId} onSelect={select} />
      <Card>
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
              <Trophy className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Достижения</p>
              <p className="font-bold text-slate-900">{student.fullName}</p>
              {student.groupName && (
                <p className="text-sm text-slate-500">{student.groupName}</p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex gap-4 text-center">
              <div>
                <p className="text-xl font-bold text-yellow-500">🥇 {stats.goldCount}</p>
                <p className="text-xs text-slate-400">Золото</p>
              </div>
              <div>
                <p className="text-xl font-bold text-slate-400">🥈 {stats.silverCount}</p>
                <p className="text-xs text-slate-400">Серебро</p>
              </div>
              <div>
                <p className="text-xl font-bold text-amber-700">🥉 {stats.bronzeCount}</p>
                <p className="text-xs text-slate-400">Бронза</p>
              </div>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(shareText)}
              className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-sm font-medium text-violet-700 hover:bg-violet-100"
            >
              Поделиться
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Monthly grid */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-slate-900">Ежемесячные достижения</h2>
        </CardHeader>
        <CardContent>
          <AchievementMonthGrid monthGrid={monthGrid} />
        </CardContent>
      </Card>

      {/* Special achievements */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-slate-900">Особые достижения</h2>
        </CardHeader>
        <CardContent>
          <SpecialAchievements achievements={specialAchievements} />
        </CardContent>
      </Card>
    </div>
  );
}
