'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { MonthMedal } from '../_components/MonthAchievementCard';
import type { SpecialState } from '../_components/SpecialAchievementCard';
import type { SpecialKey } from './achievementsCatalog';

interface ApiMedal {
  month: number;
  year?: number;
  unlocked?: boolean;
  place?: 1 | 2 | 3 | null;
  unlockedAt?: string;
  createdAt?: string;
}

interface ApiSpecial {
  key: string;
  unlocked?: boolean;
  unlockedAt?: string;
}

interface ApiAchievements {
  student?: { id: string; fullName: string; groupName: string | null };
  monthGrid?: ApiMedal[];
  specialAchievements?: ApiSpecial[];
}

export type MyAchievements = {
  medals: MonthMedal[];
  specials: SpecialState[];
  studentName?: string;
  groupName?: string;
  loading: boolean;
  isMock: boolean;
};

const ALL_SPECIAL_KEYS: SpecialKey[] = [
  'first_step',
  'iron_attendance',
  'perfect_100',
  'three_months',
  'quiet_hero',
  'year_legend',
  'no_miss',
];

function emptyMonthGrid(): MonthMedal[] {
  const year = new Date().getFullYear();
  return Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    unlocked: false,
    place: undefined,
    year,
  }));
}

export function useMyAchievements(): MyAchievements {
  const { data, isLoading } = useQuery<ApiAchievements | null>({
    queryKey: ['my-achievements'],
    queryFn: () =>
      api.get('/achievements/my').then((r) => r.data.data ?? null),
    staleTime: 1000 * 60 * 10,
    retry: 0,
  });

  const medals: MonthMedal[] = data?.monthGrid?.length
    ? data.monthGrid.map((m) => ({
        month: m.month,
        unlocked: !!m.unlocked,
        place: (m.place ?? undefined) as 1 | 2 | 3 | undefined,
        unlockedAt: m.unlockedAt ?? m.createdAt,
        year: m.year,
      }))
    : emptyMonthGrid();

  const specials: SpecialState[] = data?.specialAchievements?.length
    ? data.specialAchievements
        .filter((s) => ALL_SPECIAL_KEYS.includes(s.key as SpecialKey))
        .map((s) => ({
          key: s.key as SpecialKey,
          unlocked: !!s.unlocked,
          unlockedAt: s.unlockedAt,
        }))
    : ALL_SPECIAL_KEYS.map((key) => ({ key, unlocked: false }));

  return {
    medals,
    specials,
    studentName: data?.student?.fullName,
    groupName: data?.student?.groupName ?? undefined,
    loading: isLoading,
    isMock: false,
  };
}
