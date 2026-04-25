'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export type ProgressBreakdown = {
  attendance: number;
  lateness: number;
  lessonGrades: number;
  examGrades: number;
  monthlyMedals: number;
  specialAchievements: number;
  streakBonus: number;
};

export type StudentProgress = {
  student: {
    id: string;
    fullName: string;
    gender: 'MALE' | 'FEMALE';
  };
  totalXp: number;
  level: number;
  xpInLevel: number;
  xpForNextLevel: number;
  title: string;
  titleEmoji: string;
  streak: number;
  bestStreak: number;
  stats: {
    totalLessons: number;
    present: number;
    late: number;
    absent: number;
    attendancePercent: number;
  };
  breakdown: ProgressBreakdown;
};

const FALLBACK: StudentProgress = {
  student: { id: '', fullName: '', gender: 'MALE' },
  totalXp: 0,
  level: 1,
  xpInLevel: 0,
  xpForNextLevel: 500,
  title: 'Юный исследователь',
  titleEmoji: '🌱',
  streak: 0,
  bestStreak: 0,
  stats: { totalLessons: 0, present: 0, late: 0, absent: 0, attendancePercent: 0 },
  breakdown: {
    attendance: 0,
    lateness: 0,
    lessonGrades: 0,
    examGrades: 0,
    monthlyMedals: 0,
    specialAchievements: 0,
    streakBonus: 0,
  },
};

/**
 * Fetches the student-side progression payload (XP, level, streak,
 * breakdown). The XPBar in the student panel header reads from here.
 *
 * Polling every 30 seconds keeps the level-up celebration timely without
 * hammering the backend, since attendance/grades only change on teacher
 * actions.
 */
export function useStudentProgress() {
  const { data } = useQuery<StudentProgress | null>({
    queryKey: ['student-progress'],
    queryFn: () =>
      api.get('/achievements/my/progress').then((r) => r.data?.data ?? null),
    staleTime: 0,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    retry: 1,
  });

  return data ?? FALLBACK;
}

/**
 * Same data shape, but for the parent panel — keyed on the currently
 * selected child id. Disabled while no child is picked.
 */
export function useChildProgress(childId: string | null) {
  const { data } = useQuery<StudentProgress | null>({
    queryKey: ['child-progress', childId],
    queryFn: () =>
      api
        .get(`/achievements/student/${childId}/progress`)
        .then((r) => r.data?.data ?? null),
    enabled: !!childId,
    staleTime: 0,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    retry: 1,
  });

  return data ?? FALLBACK;
}
