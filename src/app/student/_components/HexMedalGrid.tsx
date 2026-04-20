'use client';

import { useRef } from 'react';
import { haptic } from '../_lib/hooks';
import styles from './HexMedalGrid.module.css';

export type HexMedal = {
  month: number;
  monthName: string;
  unlocked: boolean;
  place?: 1 | 2 | 3;
  title?: string;
  icon?: string;
  description?: string;
};

type HexMedalGridProps = {
  medals: HexMedal[];
  onSelect?: (m: HexMedal) => void;
};

const SHORT = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

export function HexMedalGrid({ medals, onSelect }: HexMedalGridProps) {
  return (
    <div className={styles.grid}>
      {medals.map((m, i) => (
        <HexCell key={m.month} medal={m} index={i} onSelect={onSelect} />
      ))}
    </div>
  );
}

function HexCell({
  medal,
  index,
  onSelect,
}: {
  medal: HexMedal;
  index: number;
  onSelect?: (m: HexMedal) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const longPressRef = useRef<number | null>(null);

  const cellClass = [
    styles.cell,
    medal.unlocked ? styles.unlocked : styles.locked,
    medal.place === 1 ? styles.placeGold : '',
    medal.place === 2 ? styles.placeSilver : '',
    medal.place === 3 ? styles.placeBronze : '',
  ]
    .filter(Boolean)
    .join(' ');

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--tiltY', `${x * 16}deg`);
    el.style.setProperty('--tiltX', `${-y * 16}deg`);
  };
  const handleLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--tiltY', '0deg');
    el.style.setProperty('--tiltX', '0deg');
  };

  const handleSelect = () => {
    haptic(12);
    onSelect?.(medal);
  };

  return (
    <div
      ref={ref}
      className={cellClass}
      role="button"
      tabIndex={0}
      aria-label={`${medal.monthName}: ${medal.unlocked ? medal.title ?? 'Получено' : 'Закрыто'}`}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={handleSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleSelect();
      }}
      onTouchStart={() => {
        longPressRef.current = window.setTimeout(() => {
          haptic([10, 30, 10]);
          onSelect?.(medal);
        }, 450);
      }}
      onTouchEnd={() => {
        if (longPressRef.current) window.clearTimeout(longPressRef.current);
      }}
      onTouchCancel={() => {
        if (longPressRef.current) window.clearTimeout(longPressRef.current);
      }}
      style={{ ['--i' as string]: index }}
    >
      <div className={styles.hex}>
        <div className={styles.inner} />
        <div className={styles.icon}>
          {medal.unlocked ? medal.icon ?? '🏅' : <span className={styles.lockIcon}>🔒</span>}
        </div>
        <div className={styles.month}>{SHORT[medal.month - 1] ?? medal.monthName}</div>
      </div>
    </div>
  );
}
