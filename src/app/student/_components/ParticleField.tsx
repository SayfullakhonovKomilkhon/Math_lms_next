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
export function ParticleField({ density = 0.00009, className }: ParticleFieldProps) {
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
      particles = Array.from({ length: targetCount }).map(() => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.6 + 0.4,
        speed: Math.random() * 0.25 + 0.05,
        drift: (Math.random() - 0.5) * 0.12,
        hue: Math.random() < 0.5 ? 275 : Math.random() < 0.5 ? 325 : 50,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const tick = () => {
      if (!running) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.y += p.speed;
        p.x += p.drift;
        p.phase += 0.02;
        if (p.y > h + 2) p.y = -2;
        if (p.x < -2) p.x = w + 2;
        if (p.x > w + 2) p.x = -2;
        const twinkle = 0.55 + Math.sin(p.phase) * 0.35;
        ctx.beginPath();
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
        grad.addColorStop(0, `hsla(${p.hue}, 95%, 70%, ${0.85 * twinkle})`);
        grad.addColorStop(1, `hsla(${p.hue}, 95%, 70%, 0)`);
        ctx.fillStyle = grad;
        ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = `hsla(${p.hue}, 100%, 85%, ${twinkle})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
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
