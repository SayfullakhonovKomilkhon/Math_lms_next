'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { MonthMedal } from '@/app/student/_components/MonthAchievementCard';
import type { SpecialState } from '@/app/student/_components/SpecialAchievementCard';
import type { SpecialKey } from '@/app/student/_lib/achievementsCatalog';

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
  student?: {
    id: string;
    fullName: string;
    gender?: 'MALE' | 'FEMALE';
    groupName: string | null;
  };
  monthGrid?: ApiMedal[];
  specialAchievements?: ApiSpecial[];
  stats?: {
    goldCount: number;
    silverCount: number;
    bronzeCount: number;
    totalAchievements: number;
  };
}

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

export type ChildAchievementsData = {
  medals: MonthMedal[];
  specials: SpecialState[];
  studentName?: string;
  groupName?: string;
  goldCount: number;
  silverCount: number;
  bronzeCount: number;
  totalAchievements: number;
  loading: boolean;
  raw?: ApiAchievements | null;
};

/**
 * Fetches and normalises achievement data for the parent's selected child.
 * Mirrors the student-side `useMyAchievements` hook so the parent panel can
 * reuse the very same achievement components (cards, modal, celebration)
 * without any shape adapters.
 */
export function useChildAchievements(childId: string | null): ChildAchievementsData {
  const { data, isLoading } = useQuery<ApiAchievements | null>({
    queryKey: ['child-achievements', childId],
    queryFn: () =>
      api.get(`/achievements/student/${childId}`).then((r) => r.data?.data ?? null),
    enabled: !!childId,
    staleTime: 1000 * 60 * 5,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: true,
    // Auto-update when the teacher awards a new achievement so the
    // celebration animation can fire without a manual refresh.
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
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
    goldCount: data?.stats?.goldCount ?? medals.filter((m) => m.unlocked && m.place === 1).length,
    silverCount: data?.stats?.silverCount ?? medals.filter((m) => m.unlocked && m.place === 2).length,
    bronzeCount: data?.stats?.bronzeCount ?? medals.filter((m) => m.unlocked && m.place === 3).length,
    totalAchievements: data?.stats?.totalAchievements ?? medals.filter((m) => m.unlocked).length,
    loading: isLoading,
    raw: data,
  };
}
