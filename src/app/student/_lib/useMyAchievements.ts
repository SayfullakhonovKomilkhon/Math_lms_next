'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { MonthMedal } from '../_components/MonthAchievementCard';
import type { SpecialState } from '../_components/SpecialAchievementCard';
import type { SpecialKey } from './achievementsCatalog';
import { mockMonthGrid, mockSpecials } from './mockData';

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

/**
 * Hook that fetches the current student's achievements and enriches them
 * with preview-friendly defaults when the backend has nothing to show yet.
 *
 * PREVIEW MODE: While the real achievements flow is being finalised we
 * force-unlock every month + special so the design can be reviewed
 * end-to-end. Swap `PREVIEW_UNLOCK_ALL` to `false` to see the real state.
 */
const PREVIEW_UNLOCK_ALL = true;
const PREVIEW_PLACES: (1 | 2 | 3)[] = [1, 2, 1, 3, 2, 1, 2, 3, 1, 2, 3, 1];
const PREVIEW_SPECIAL_KEYS: SpecialKey[] = [
  'first_step',
  'iron_attendance',
  'perfect_100',
  'three_months',
  'quiet_hero',
  'year_legend',
  'no_miss',
];

export function useMyAchievements(): MyAchievements {
  const { data, isLoading, isError } = useQuery<ApiAchievements | null>({
    queryKey: ['my-achievements'],
    queryFn: () =>
      api.get('/achievements/my').then((r) => r.data.data ?? null),
    staleTime: 1000 * 60 * 10,
    retry: 0,
  });

  const fallbackMedals = mockMonthGrid.map((m) => ({
    month: m.month,
    unlocked: m.unlocked,
    place: m.place,
    year: m.year,
    unlockedAt: m.createdAt,
  }));

  const rawMedals: MonthMedal[] = data?.monthGrid?.length
    ? data.monthGrid.map((m) => ({
        month: m.month,
        unlocked: !!m.unlocked,
        place: (m.place ?? undefined) as 1 | 2 | 3 | undefined,
        unlockedAt: m.unlockedAt ?? m.createdAt,
        year: m.year,
      }))
    : fallbackMedals;

  const medals: MonthMedal[] = rawMedals.map((m, i) => {
    if (!PREVIEW_UNLOCK_ALL) return m;
    const place = (m.place ?? PREVIEW_PLACES[i] ?? 2) as 1 | 2 | 3;
    return {
      ...m,
      unlocked: true,
      place,
      unlockedAt:
        m.unlockedAt ??
        new Date(Date.UTC(new Date().getFullYear(), m.month - 1, 20)).toISOString(),
      year: m.year ?? new Date().getFullYear(),
    };
  });

  const rawSpecials: SpecialState[] = data?.specialAchievements?.length
    ? data.specialAchievements
        .filter((s) => PREVIEW_SPECIAL_KEYS.includes(s.key as SpecialKey))
        .map((s) => ({
          key: s.key as SpecialKey,
          unlocked: !!s.unlocked,
          unlockedAt: s.unlockedAt,
        }))
    : mockSpecials;

  const specials: SpecialState[] = PREVIEW_UNLOCK_ALL
    ? rawSpecials.map((s) => ({
        ...s,
        unlocked: true,
        unlockedAt: s.unlockedAt ?? new Date().toISOString(),
      }))
    : rawSpecials;

  return {
    medals,
    specials,
    studentName: data?.student?.fullName,
    groupName: data?.student?.groupName ?? undefined,
    loading: isLoading,
    isMock: isError || !data?.monthGrid?.length,
  };
}
