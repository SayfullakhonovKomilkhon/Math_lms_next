'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from '../_lib/hooks';
import styles from './ParticleField.module.css';

type Particle = {
  x: number;
  y: number;
  r: number;
  speed: number;
  drift: number;
  hue: number;
  phase: number;
};

type ParticleFieldProps = {
  density?: number;
  className?: string;
};

/**
 * Canvas starfield — slow-drifting neon particles.
 * Reduces density on mobile automatically and falls back to a static
 * radial-gradient image when the user prefers reduced motion.
 */
export function ParticleField({ density = 0.00002, className }: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let rafId = 0;
    let running = true;

    const setup = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const targetCount = Math.max(24, Math.floor(w * h * density));
      particles = Array.from({ length: targetCount }).map(() => {
        const pick = Math.random();
        const hue = pick < 0.4 ? 28 : pick < 0.75 ? 225 : 170; // Clay / Blue / Teal
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 9 + 4,
          speed: Math.random() * 0.18 + 0.04,
          drift: (Math.random() - 0.5) * 0.08,
          hue,
          phase: Math.random() * Math.PI * 2,
        };
      });
    };

    const tick = () => {
      if (!running) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.y += p.speed;
        p.x += p.drift;
        p.phase += 0.015;
        if (p.y > h + p.r * 8) p.y = -p.r * 8;
        if (p.x < -p.r * 8) p.x = w + p.r * 8;
        if (p.x > w + p.r * 8) p.x = -p.r * 8;
        const pulse = 0.6 + Math.sin(p.phase) * 0.25;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
        grad.addColorStop(0, `hsla(${p.hue}, 85%, 62%, ${0.14 * pulse})`);
        grad.addColorStop(0.6, `hsla(${p.hue}, 85%, 62%, ${0.06 * pulse})`);
        grad.addColorStop(1, `hsla(${p.hue}, 85%, 62%, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
        ctx.fill();
      }
      rafId = requestAnimationFrame(tick);
    };

    setup();
    tick();

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(setup, 150);
    };
    window.addEventListener('resize', onResize);

    const onVisibility = () => {
      running = !document.hidden;
      if (running) {
        rafId = requestAnimationFrame(tick);
      } else {
        cancelAnimationFrame(rafId);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [density, reduced]);

  return (
    <div className={`${styles.wrap} ${className ?? ''}`} aria-hidden>
      {reduced ? (
        <div className={styles.fallback} />
      ) : (
        <canvas ref={canvasRef} className={styles.canvas} />
      )}
    </div>
  );
}
