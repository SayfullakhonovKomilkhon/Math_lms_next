'use client';

import { useInViewOnce, useCountUp } from '../_lib/hooks';
import styles from './StatCard.module.css';

type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  suffix?: string;
  sub?: string;
  accent?: 'purple' | 'pink' | 'gold' | 'blue' | 'green' | 'red';
  countUp?: boolean;
  trend?: { value: number; direction: 'up' | 'down' };
};

const ACCENT_COLOR: Record<NonNullable<StatCardProps['accent']>, string> = {
  purple: '#9B5CFF',
  pink: '#FF3CAC',
  gold: '#FFD700',
  blue: '#4DC0FF',
  green: '#4ADE80',
  red: '#FF5F6D',
};

export function StatCard({
  icon,
  label,
  value,
  suffix,
  sub,
  accent = 'purple',
  countUp = true,
  trend,
}: StatCardProps) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  const numericTarget =
    typeof value === 'number' ? value : Number(String(value).replace(/[^\d.-]/g, ''));
  const isNumeric = Number.isFinite(numericTarget);
  const counted = useCountUp(isNumeric ? numericTarget : 0, 1200, countUp && isNumeric && inView);
  const display = countUp && isNumeric ? counted : value;

  return (
    <div
      ref={ref}
      className={styles.stat}
      style={{ ['--accentColor' as string]: ACCENT_COLOR[accent] }}
    >
      <div className={styles.icon}>{icon}</div>
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>
        {display}
        {suffix ?? ''}
        {trend ? (
          <span className={`${styles.trend} ${trend.direction === 'down' ? styles.down : ''}`}>
            {trend.direction === 'up' ? '▲' : '▼'} {Math.abs(trend.value)}%
          </span>
        ) : null}
      </div>
      {sub ? <div className={styles.sub}>{sub}</div> : null}
    </div>
  );
}
