'use client';

import { useQuery } from '@tanstack/react-query';
import { Trophy } from 'lucide-react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AchievementMonthGrid } from '@/components/achievements/AchievementMonthGrid';
import { SpecialAchievements } from '@/components/achievements/SpecialAchievements';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { CardSkeleton, ProfileSkeleton } from '@/components/ui/Skeleton';

interface AchievementsData {
  student: { id: string; fullName: string; groupName: string | null };
  monthGrid: {
    month: number;
    monthName: string;
    unlocked: boolean;
    place?: number;
    title?: string;
    icon?: string;
    description?: string;
    year?: number;
    createdAt?: string;
  }[];
  specialAchievements: {
    key: string;
    title: string;
    icon: string;
    description: string;
    condition: string;
    unlocked: boolean;
    unlockedAt?: string;
  }[];
  stats: {
    goldCount: number;
    silverCount: number;
    bronzeCount: number;
    totalAchievements: number;
  };
}

export default function StudentAchievementsPage() {
  const { data, isLoading, isError, refetch } = useQuery<AchievementsData>({
    queryKey: ['my-achievements'],
    queryFn: () => api.get('/achievements/my').then((r) => r.data.data),
    staleTime: 1000 * 60 * 10,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <ProfileSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        message="Не удалось загрузить достижения"
        description="Попробуйте обновить страницу позже."
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  if (!data || (data.monthGrid.length === 0 && data.specialAchievements.length === 0)) {
    return (
      <EmptyState
        icon="🏆"
        message="Здесь будут твои достижения"
        description="Попади в топ-3 группы по итогам месяца, чтобы открыть первое звание."
      />
    );
  }

  const { student, monthGrid, specialAchievements, stats } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
              <Trophy className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="font-bold text-slate-900">{student.fullName}</p>
              {student.groupName && (
                <p className="text-sm text-slate-500">{student.groupName}</p>
              )}
            </div>
          </div>
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
            <div>
              <p className="text-xl font-bold text-violet-600">{stats.totalAchievements}</p>
              <p className="text-xs text-slate-400">Итого</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly grid */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-slate-900">Ежемесячные достижения</h2>
          <p className="text-xs text-slate-500">Попадите в топ-3 каждый месяц</p>
        </CardHeader>
        <CardContent>
          <AchievementMonthGrid monthGrid={monthGrid} />
        </CardContent>
      </Card>

      {/* Special achievements */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-slate-900">Особые достижения</h2>
          <p className="text-xs text-slate-500">Выполняйте условия для разблокировки</p>
        </CardHeader>
        <CardContent>
          <SpecialAchievements achievements={specialAchievements} />
        </CardContent>
      </Card>
    </div>
  );
}
