'use client';

/**
 * Determines whether the logged-in student is the current-month champion
 * (topped the group in the month that's happening right now). When they are,
 * the UI switches on crown / banner / gold badges.
 */

import type { MonthMedal } from '../_components/MonthAchievementCard';
import {
  getMonthlyTitle,
  type Gender,
  type MonthlyTitle,
} from './achievementsCatalog';

export type ChampionState = {
  isChampion: boolean;
  month: number;
  monthName?: string;
  title?: MonthlyTitle;
};

export function deriveChampionship(
  medals: MonthMedal[],
  gender: Gender,
  now: Date = new Date(),
): ChampionState {
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const match = medals.find(
    (m) =>
      m.month === month &&
      m.unlocked &&
      m.place === 1 &&
      (m.year === undefined || m.year === year),
  );
  if (!match) {
    return { isChampion: false, month };
  }
  const title = getMonthlyTitle(month, 1, gender);
  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
  ];
  return {
    isChampion: true,
    month,
    monthName: monthNames[month - 1],
    title,
  };
}
