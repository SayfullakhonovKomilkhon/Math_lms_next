'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { ApiResponse, StudentProfile } from '@/types';
import { mockStudent } from './mockData';

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
};

function toInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'M';
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function computeLevel(totalLessons: number, attendancePercent: number) {
  // Simple heuristic: 1 level per 8 completed lessons, bonus for high attendance.
  const base = Math.max(1, Math.floor(totalLessons / 8) + 1);
  const bonus = attendancePercent >= 90 ? 1 : 0;
  const level = base + bonus;
  const xp = (totalLessons % 8) * 180 + Math.floor(attendancePercent * 4);
  const xpNeeded = 1440;
  return { level, xp, xpNeeded };
}

/**
 * Hook that wraps the /students/me endpoint, producing a convenient summary
 * with game-like fields (level, xp, title) derived client-side. When the API
 * is unavailable, returns mock data with Uzbek names so the UI always looks
 * alive (useful for demos & offline development).
 */
export function useStudentSummary(): {
  summary: StudentSummary;
  loading: boolean;
  isMock: boolean;
  profile: StudentProfile | null;
} {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['student-profile'],
    queryFn: () =>
      api.get<ApiResponse<StudentProfile>>('/students/me').then((r) => r.data.data),
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  if (data) {
    const { level, xp, xpNeeded } = computeLevel(
      data.totalLessons ?? 0,
      data.attendanceStats?.percentage ?? 0,
    );
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
        level,
        xp,
        xpNeeded,
        title: level >= 10 ? 'Легенда' : level >= 6 ? 'Умный боец' : 'Юный исследователь',
        titleEmoji: level >= 10 ? '🏆' : level >= 6 ? '⚡' : '🌱',
        streak: Math.min(30, Math.round((data.attendanceStats?.percentage ?? 0) / 8)),
      },
      loading: false,
      isMock: false,
      profile: data,
    };
  }

  return {
    summary: {
      fullName: mockStudent.fullName,
      firstName: mockStudent.firstName,
      initials: toInitials(mockStudent.fullName),
      groupName: mockStudent.groupName,
      teacherName: mockStudent.teacherName,
      centerName: mockStudent.centerName,
      totalLessons: 64,
      attendancePercent: 96,
      level: mockStudent.level,
      xp: mockStudent.xp,
      xpNeeded: mockStudent.xpNeeded,
      title: mockStudent.title,
      titleEmoji: mockStudent.titleEmoji,
      streak: mockStudent.streak,
    },
    loading: isLoading,
    isMock: isError || !isLoading,
    profile: null,
  };
}
