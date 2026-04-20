'use client';

import { useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { haptic, useReducedMotion, useTypewriter } from '../_lib/hooks';
import { SButton } from './SButton';
import styles from './AchievementUnlockModal.module.css';

type Detail = {
  icon: string;
  title: string;
  description?: string;
  label?: string;
};

type Props = {
  open: boolean;
  detail: Detail | null;
  onClose: () => void;
};

const COLORS = ['#F5B544', '#EF8E38', '#2650BB', '#108174', '#FFD27A', '#372F57'];

/**
 * Full-screen bottom-sheet style modal that plays the achievement-unlock
 * animation sequence described in the brief: darken → flash → 3D medal flip-in
 * → confetti → shimmering title → CTA button.
 *
 * Closes on: overlay click, Esc key, swipe down, or the "Принять" button.
 */
const subscribeNoop = () => () => {};
const getTrue = () => true;
const getFalse = () => false;

export function AchievementUnlockModal({ open, detail, onClose }: Props) {
  const mounted = useSyncExternalStore(subscribeNoop, getTrue, getFalse);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const typed = useTypewriter(detail?.title ?? '', 55, open);

  useEffect(() => {
    if (!open) return;
    haptic(200);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Swipe-down-to-close
  useEffect(() => {
    if (!open) return;
    const sheet = sheetRef.current;
    if (!sheet) return;
    let startY = 0;
    const onStart = (e: TouchEvent) => {
      startY = e.touches[0]?.clientY ?? 0;
    };
    const onMove = (e: TouchEvent) => {
      const dy = (e.touches[0]?.clientY ?? 0) - startY;
      if (dy > 0) {
        sheet.style.transform = `translateY(${Math.min(dy, 200)}px)`;
      }
    };
    const onEnd = (e: TouchEvent) => {
      const dy = (e.changedTouches[0]?.clientY ?? 0) - startY;
      sheet.style.transform = '';
      if (dy > 120) onClose();
    };
    sheet.addEventListener('touchstart', onStart, { passive: true });
    sheet.addEventListener('touchmove', onMove, { passive: true });
    sheet.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      sheet.removeEventListener('touchstart', onStart);
      sheet.removeEventListener('touchmove', onMove);
      sheet.removeEventListener('touchend', onEnd);
    };
  }, [open, onClose]);

  const pieces = useMemo(() => {
    const count = reduced ? 0 : 60;
    const rand = (seed: number) => {
      const x = Math.sin(seed * 9301 + 49297) * 233280;
      return x - Math.floor(x);
    };
    return Array.from({ length: count }).map((_, i) => {
      const angle = rand(i + 1) * Math.PI * 2;
      const dist = 120 + rand(i + 17) * 160;
      return {
        i,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist - 60,
        rot: (rand(i + 31) * 720 - 360).toFixed(0),
        col: COLORS[Math.floor(rand(i + 53) * COLORS.length)],
        delay: rand(i + 71) * 0.25,
      };
    });
  }, [reduced]);

  if (!open || !detail || !mounted) return null;

  const node = (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="Новое достижение"
      onClick={onClose}
    >
      {!reduced ? <div className={styles.flash} /> : null}
      <div
        ref={sheetRef}
        className={styles.sheet}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.handle} aria-hidden />

        {!reduced ? (
          <div className={styles.confetti} aria-hidden>
            {pieces.map((p) => (
              <span
                key={p.i}
                className={styles.piece}
                style={{
                  ['--travelX' as string]: `${p.x}px`,
                  ['--travelY' as string]: `${p.y}px`,
                  ['--rot' as string]: `${p.rot}deg`,
                  ['--col' as string]: p.col,
                  animationDelay: `${0.35 + p.delay}s`,
                }}
              />
            ))}
          </div>
        ) : null}

        <div className={styles.label}>{detail.label ?? 'Новое достижение'}</div>
        <div className={styles.medal} aria-hidden>
          {detail.icon}
        </div>
        <h2 className={styles.title}>
          {reduced ? detail.title : typed}
        </h2>
        {detail.description ? (
          <p className={styles.desc}>{detail.description}</p>
        ) : null}
        <div className={styles.cta}>
          <SButton variant="gold" onClick={onClose}>
            🎉 Принять!
          </SButton>
        </div>
      </div>
    </div>
  );

  return createPortal(node, document.body);
}
