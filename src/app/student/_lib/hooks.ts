'use client';

import { useEffect, useRef, useState } from 'react';

/** Respects user's reduced-motion preference. Returns true to disable animations. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = () => setReduced(mql.matches);
    handler();
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);
  return reduced;
}

/** Returns true once the element has entered the viewport. */
export function useInViewOnce<T extends Element>(options?: IntersectionObserverInit) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(
    () => typeof IntersectionObserver === 'undefined',
  );
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.2, ...options },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [options]);
  return { ref, inView };
}

/** Count-up animation hook. Activates when `active` is true. */
export function useCountUp(target: number, durationMs = 1200, active = true) {
  const [value, setValue] = useState(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!active || reduced) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs, active, reduced]);
  return reduced || !active ? target : value;
}

/** Typewriter effect, revealing `text` char by char. */
export function useTypewriter(text: string, speedMs = 45, active = true) {
  const [out, setOut] = useState('');
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!active || reduced) return;
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setOut(text.slice(0, i));
      if (i >= text.length) window.clearInterval(id);
    }, speedMs);
    return () => window.clearInterval(id);
  }, [text, speedMs, active, reduced]);
  return reduced || !active ? text : out;
}

/** Lightweight haptic helper. Falls back to no-op where unsupported. */
export function haptic(pattern: number | number[] = 20): void {
  if (typeof navigator === 'undefined') return;
  if (typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* noop */
    }
  }
}
