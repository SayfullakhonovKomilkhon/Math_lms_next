'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { ApiResponse, StudentProfile } from '@/types';
import { useStudentProgress } from './useStudentProgress';

type StudentSummary = {
  fullName: string;
  firstName: string;
  initials: string;
  groupName: string;
  teacherName: string;
  centerName: string;
  totalLessons: number;
  attendancePercent: number;
  level: number;
  xp: number;
  xpNeeded: number;
  title: string;
  titleEmoji: string;
  streak: number;
  gender: 'male' | 'female';
};

function toInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'M';
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/**
 * Hook that wraps the /students/me endpoint, producing a convenient summary
 * with game-like fields (level, xp, title) sourced from the backend
 * progression endpoint (`/achievements/my/progress`).
 */
export function useStudentSummary(): {
  summary: StudentSummary;
  loading: boolean;
  isMock: boolean;
  profile: StudentProfile | null;
} {
  const { data, isLoading } = useQuery({
    queryKey: ['student-profile'],
    queryFn: () =>
      api.get<ApiResponse<StudentProfile>>('/students/me').then((r) => r.data.data),
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  // XP / level / streak are computed on the backend from real attendance,
  // grades and achievements — see `GamificationService.computeStudentProgress`.
  const progress = useStudentProgress();

  if (data) {
    const fullName = data.fullName ?? 'Ученик';
    const firstName = fullName.split(/\s+/)[0] ?? fullName;
    return {
      summary: {
        fullName,
        firstName,
        initials: toInitials(fullName),
        groupName: data.group?.name ?? 'Группа',
        teacherName: data.group?.teacher?.fullName ?? '—',
        centerName: 'MathCenter',
        totalLessons: data.totalLessons ?? 0,
        attendancePercent: data.attendanceStats?.percentage ?? 0,
        level: progress.level,
        xp: progress.xpInLevel,
        xpNeeded: progress.xpForNextLevel,
        title: progress.title,
        titleEmoji: progress.titleEmoji,
        streak: progress.streak,
        gender: data.gender === 'FEMALE' ? 'female' : 'male',
      },
      loading: false,
      isMock: false,
      profile: data,
    };
  }

  return {
    summary: {
      fullName: 'Ученик',
      firstName: 'Ученик',
      initials: 'У',
      groupName: 'Группа',
      teacherName: '—',
      centerName: 'MathCenter',
      totalLessons: 0,
      attendancePercent: 0,
      level: progress.level,
      xp: progress.xpInLevel,
      xpNeeded: progress.xpForNextLevel,
      title: progress.title,
      titleEmoji: progress.titleEmoji,
      streak: progress.streak,
      gender: 'male',
    },
    loading: isLoading,
    isMock: false,
    profile: null,
  };
}
