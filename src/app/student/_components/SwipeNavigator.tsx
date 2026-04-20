'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { haptic } from '../_lib/hooks';

const ORDER = [
  '/student/dashboard',
  '/student/homework',
  '/student/achievements',
  '/student/grades',
  '/student/profile',
];

const SWIPE_MIN_DX = 70;
const SWIPE_MAX_DY = 50;

/**
 * Enables horizontal swipe navigation between top-level student routes.
 * Only activates when the current route matches one of the five main tabs,
 * so that inner pages (e.g. /student/payment) are unaffected.
 */
export function SwipeNavigator({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const startRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const idx = ORDER.indexOf(pathname);

  useEffect(() => {
    if (idx === -1) return;
    if (typeof window === 'undefined') return;

    const onStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      startRef.current = { x: t.clientX, y: t.clientY, t: performance.now() };
    };
    const onEnd = (e: TouchEvent) => {
      const s = startRef.current;
      startRef.current = null;
      if (!s) return;
      const t = e.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - s.x;
      const dy = t.clientY - s.y;
      if (Math.abs(dy) > SWIPE_MAX_DY) return;
      if (Math.abs(dx) < SWIPE_MIN_DX) return;
      const dt = performance.now() - s.t;
      if (dt > 600) return;
      if (dx < 0 && idx < ORDER.length - 1) {
        haptic(12);
        router.push(ORDER[idx + 1]);
      } else if (dx > 0 && idx > 0) {
        haptic(12);
        router.push(ORDER[idx - 1]);
      }
    };

    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchend', onEnd);
    };
  }, [idx, router]);

  return <>{children}</>;
}
