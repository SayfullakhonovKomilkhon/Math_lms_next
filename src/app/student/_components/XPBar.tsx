'use client';

import { useEffect, useState } from 'react';
import { useCountUp, useReducedMotion } from '../_lib/hooks';
import styles from './XPBar.module.css';

type XPBarProps = {
  level: number;
  xp: number;
  xpNeeded: number;
};

export function XPBar({ level, xp, xpNeeded }: XPBarProps) {
  const target = Math.min(100, Math.round((xp / Math.max(1, xpNeeded)) * 100));
  const [progress, setProgress] = useState(0);
  const reduced = useReducedMotion();
  const countedLevel = useCountUp(level, 1000, true);

  useEffect(() => {
    if (reduced) return;
    const t = window.setTimeout(() => setProgress(target), 220);
    return () => window.clearTimeout(t);
  }, [target, reduced]);

  const shown = reduced ? target : progress;

  return (
    <div className={styles.wrap}>
      <div className={styles.top}>
        <div className={styles.levelBlock}>
          <div className={styles.levelLabel}>Уровень</div>
          <div className={styles.level}>{countedLevel}</div>
        </div>
        <div className={styles.xp}>
          <strong>{xp}</strong> / {xpNeeded} XP
        </div>
      </div>
      <div
        className={styles.track}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={target}
      >
        <div className={styles.fill} style={{ ['--progress' as string]: `${shown}%` }} />
        <div className={styles.tip} style={{ ['--progress' as string]: `${shown}%` }} />
      </div>
    </div>
  );
}
