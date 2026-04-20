'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { haptic, useReducedMotion } from '../_lib/hooks';
import styles from './PullToRefresh.module.css';

const TRIGGER_DY = 80;
const MAX_DY = 140;

/**
 * Adds a native-feeling pull-to-refresh gesture on mobile which invalidates
 * all react-query caches on trigger. A golden medal icon is revealed as the
 * user pulls.
 */
export function PullToRefresh({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();
  const reduced = useReducedMotion();
  const [dy, setDy] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);

  useEffect(() => {
    if (reduced) return;
    const main = document.getElementById('student-scroll-root');
    if (!main) return;

    const onStart = (e: TouchEvent) => {
      if (main.scrollTop > 0) return;
      const t = e.touches[0];
      if (!t) return;
      startY.current = t.clientY;
    };
    const onMove = (e: TouchEvent) => {
      if (startY.current === null) return;
      const t = e.touches[0];
      if (!t) return;
      const delta = t.clientY - startY.current;
      if (delta > 0 && main.scrollTop <= 0) {
        setDy(Math.min(MAX_DY, delta * 0.55));
      }
    };
    const onEnd = async () => {
      const released = dy;
      startY.current = null;
      if (released >= TRIGGER_DY) {
        setRefreshing(true);
        haptic([20, 40, 20]);
        try {
          await qc.invalidateQueries();
        } finally {
          setTimeout(() => {
            setRefreshing(false);
            setDy(0);
          }, 450);
        }
      } else {
        setDy(0);
      }
    };

    main.addEventListener('touchstart', onStart, { passive: true });
    main.addEventListener('touchmove', onMove, { passive: true });
    main.addEventListener('touchend', onEnd, { passive: true });
    main.addEventListener('touchcancel', onEnd, { passive: true });
    return () => {
      main.removeEventListener('touchstart', onStart);
      main.removeEventListener('touchmove', onMove);
      main.removeEventListener('touchend', onEnd);
      main.removeEventListener('touchcancel', onEnd);
    };
  }, [dy, qc, reduced]);

  const visible = dy > 12 || refreshing;
  const y = refreshing ? 12 : Math.max(0, dy - 30);
  const scale = Math.min(1, 0.3 + dy / TRIGGER_DY);
  const rot = Math.min(360, dy * 4);

  return (
    <div className={styles.wrap}>
      <div
        className={`${styles.indicator} ${visible ? styles.visible : ''} ${refreshing ? styles.refreshing : ''}`}
        style={
          refreshing
            ? { transform: 'translate(-50%, 0)' }
            : {
                transform: `translate(-50%, ${y}px) scale(${scale}) rotate(${rot}deg)`,
              }
        }
        aria-hidden
      >
        🏅
      </div>
      {children}
    </div>
  );
}
