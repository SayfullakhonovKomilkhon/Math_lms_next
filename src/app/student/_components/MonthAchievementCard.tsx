'use client';

import { useRef } from 'react';
import {
  getMonth,
  getMonthlyTitle,
  placeMedal,
  type Gender,
  type MonthMeta,
  type Place,
} from '../_lib/achievementsCatalog';
import { haptic } from '../_lib/hooks';
import styles from './MonthAchievementCard.module.css';

export type MonthMedal = {
  month: number;
  unlocked: boolean;
  place?: Place;
  /** ISO date string when the medal was awarded. */
  unlockedAt?: string;
  year?: number;
};

type Props = {
  medal: MonthMedal;
  gender: Gender;
  onSelect?: (medal: MonthMedal, meta: MonthMeta) => void;
};

export function MonthAchievementCard({ medal, gender, onSelect }: Props) {
  const meta = getMonth(medal.month);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!medal.unlocked || !medal.place) {
    return (
      <div
        className={`${styles.card} ${styles.locked}`}
        role="button"
        tabIndex={0}
        onClick={() => onSelect?.(medal, meta)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onSelect?.(medal, meta);
        }}
      >
        <div className={styles.monthLabel}>
          {meta.emoji} {meta.name}
        </div>
        <div className={styles.icon}>🔒</div>
        <div className={styles.lockedText}>Ещё не получено</div>
      </div>
    );
  }

  const data = getMonthlyTitle(medal.month, medal.place, gender);
  const theme = data.theme;
  const placeClass =
    medal.place === 1 ? styles.place1 : medal.place === 2 ? styles.place2 : styles.place3;

  const handleClick = () => {
    haptic(14);
    onSelect?.(medal, meta);
  };

  return (
    <div
      className={`${styles.card} ${placeClass} ${theme.textLight ? styles.dark : styles.light}`}
      role="button"
      tabIndex={0}
      style={{
        background: theme.background,
        border: `${theme.borderWidth}px solid ${theme.borderColor}`,
        boxShadow: theme.glow,
      }}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleClick();
      }}
      onTouchStart={() => {
        pressTimer.current = setTimeout(() => {
          haptic(30);
          onSelect?.(medal, meta);
        }, 500);
      }}
      onTouchEnd={() => {
        if (pressTimer.current) clearTimeout(pressTimer.current);
      }}
      onTouchCancel={() => {
        if (pressTimer.current) clearTimeout(pressTimer.current);
      }}
    >
      <div className={styles.sheen} />
      {theme.decor.length > 0 ? (
        <div className={styles.decor} aria-hidden>
          {theme.decor.map((c, i) => (
            <span key={i}>{c}</span>
          ))}
        </div>
      ) : null}

      <div className={styles.monthLabel}>
        {meta.emoji} {meta.name}
      </div>
      <div className={styles.placeMedal} aria-hidden>
        {placeMedal(medal.place)}
      </div>
      <div className={styles.icon}>{data.icon}</div>
      <div className={styles.title}>{data.title}</div>
      <div className={styles.desc}>{data.description}</div>
    </div>
  );
}

type GridProps = {
  medals: MonthMedal[];
  gender: Gender;
  onSelect?: (medal: MonthMedal, meta: MonthMeta) => void;
};

export function MonthAchievementGrid({ medals, gender, onSelect }: GridProps) {
  return (
    <div className={styles.grid}>
      {medals.map((m) => (
        <MonthAchievementCard
          key={m.month}
          medal={m}
          gender={gender}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
