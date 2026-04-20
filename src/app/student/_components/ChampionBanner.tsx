'use client';

import type { ChampionState } from '../_lib/useChampionship';
import styles from './ChampionBanner.module.css';

type Props = {
  state: ChampionState;
};

export function ChampionBanner({ state }: Props) {
  if (!state.isChampion || !state.title) return null;

  return (
    <div className={styles.banner} role="status">
      <div className={styles.decor} aria-hidden>
        <span>👑</span>
        <span>★</span>
        <span>✨</span>
        <span>🏆</span>
      </div>
      <div className={styles.left}>
        <span className={styles.kicker}>
          👑 Ты лучший в группе
        </span>
        <div className={styles.headline}>
          {state.monthName}: первое место в группе!
        </div>
        <div className={styles.subline}>
          Звание «{state.title.title}»
        </div>
      </div>
      <span className={styles.trophy} aria-hidden>
        {state.title.icon}
      </span>
    </div>
  );
}
