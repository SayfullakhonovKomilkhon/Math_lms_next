'use client';

import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { haptic, useReducedMotion } from '../_lib/hooks';
import styles from './AchievementCelebration.module.css';

export type LevelUpInput = {
  level: number;
  title: string;
  titleEmoji: string;
};

type Props = {
  input: LevelUpInput | null;
  onClose: () => void;
};

function seededRandom(seed: number) {
  let x = seed;
  return () => {
    x = (x * 9301 + 49297) % 233280;
    return x / 233280;
  };
}

type Particle = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  emoji: string;
  rotate: number;
  drift: number;
};

function buildRising(seed: number): Particle[] {
  const rnd = seededRandom(seed);
  const emojis = ['✨', '⭐', '🎉', '🏆', '🎆', '✦', '🌟'];
  return Array.from({ length: 36 }).map((_, i) => ({
    id: i,
    left: rnd() * 100,
    delay: rnd() * 1.4,
    duration: 2.4 + rnd() * 3.2,
    size: 18 + rnd() * 22,
    emoji: emojis[Math.floor(rnd() * emojis.length)],
    rotate: (rnd() - 0.5) * 360,
    drift: (rnd() - 0.5) * 60,
  }));
}

function buildRadial(seed: number): Particle[] {
  const rnd = seededRandom(seed);
  const emojis = ['🎊', '✨', '🎉', '★'];
  return Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    left: 50,
    delay: rnd() * 0.6,
    duration: 1.4 + rnd() * 1.6,
    size: 18 + rnd() * 18,
    emoji: emojis[Math.floor(rnd() * emojis.length)],
    rotate: (rnd() - 0.5) * 720,
    drift: 0,
  }));
}

function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

// Theme colours pick the "warmer + more epic" gradient as level increases.
function pickTheme(level: number) {
  if (level >= 20) {
    return {
      background:
        'linear-gradient(140deg, #c026d3 0%, #f97316 55%, #fde047 100%)',
      borderColor: '#fde047',
      glow: '0 24px 60px rgba(192,38,211,0.55), 0 0 0 2px #fde047',
      textLight: false,
    };
  }
  if (level >= 15) {
    return {
      background:
        'linear-gradient(140deg, #ef4444 0%, #f59e0b 50%, #fde047 100%)',
      borderColor: '#fde047',
      glow: '0 24px 60px rgba(239,68,68,0.5), 0 0 0 2px #fde047',
      textLight: false,
    };
  }
  if (level >= 10) {
    return {
      background:
        'linear-gradient(140deg, #2563eb 0%, #7c3aed 50%, #c026d3 100%)',
      borderColor: '#a78bfa',
      glow: '0 24px 60px rgba(124,58,237,0.55), 0 0 0 2px #a78bfa',
      textLight: true,
    };
  }
  if (level >= 5) {
    return {
      background:
        'linear-gradient(140deg, #0ea5e9 0%, #2563eb 50%, #1e40af 100%)',
      borderColor: '#38bdf8',
      glow: '0 24px 60px rgba(37,99,235,0.55), 0 0 0 2px #38bdf8',
      textLight: true,
    };
  }
  return {
    background:
      'linear-gradient(140deg, #16a34a 0%, #65a30d 55%, #facc15 100%)',
    borderColor: '#bef264',
    glow: '0 24px 60px rgba(22,163,74,0.5), 0 0 0 2px #bef264',
    textLight: true,
  };
}

export function LevelUpCelebration({ input, onClose }: Props) {
  const mounted = useMounted();
  const reduced = useReducedMotion();

  const scene = useMemo(() => {
    if (!input) return null;
    const seed = input.level * 137 + 19;
    return {
      rising: buildRising(seed),
      radial: buildRadial(seed + 7),
      theme: pickTheme(input.level),
    };
  }, [input]);

  useEffect(() => {
    if (!input) return;
    haptic([60, 60, 60, 60]);
    const t = setTimeout(onClose, 5800);
    return () => clearTimeout(t);
  }, [input, onClose]);

  useEffect(() => {
    if (!input) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [input, onClose]);

  if (!mounted) return null;

  const content = (
    <AnimatePresence>
      {input && scene ? (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className={styles.closeBtn}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            aria-label="Закрыть"
          >
            <X size={20} />
          </button>

          {!reduced ? (
            <div className={styles.stage} aria-hidden>
              <motion.div
                className={styles.flash}
                style={{
                  background:
                    'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.95), transparent 60%)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0, 0.5, 0] }}
                transition={{ duration: 1.4, times: [0, 0.1, 0.25, 0.4, 1] }}
              />

              <motion.div
                className={styles.rays}
                initial={{ opacity: 0, rotate: 0 }}
                animate={{ opacity: 0.7, rotate: 360 }}
                transition={{
                  opacity: { duration: 0.6 },
                  rotate: { duration: 18, ease: 'linear', repeat: Infinity },
                }}
              />

              {scene.rising.map((p) => (
                <motion.span
                  key={`r-${p.id}`}
                  className={styles.particle}
                  style={{
                    left: `${p.left}%`,
                    bottom: '-10vh',
                    fontSize: p.size,
                  }}
                  initial={{ y: 0, opacity: 0, rotate: 0 }}
                  animate={{
                    y: '-120vh',
                    opacity: [0, 1, 1, 0],
                    rotate: p.rotate,
                    x: p.drift,
                  }}
                  transition={{
                    duration: p.duration,
                    delay: p.delay,
                    ease: 'easeOut',
                    repeat: Infinity,
                  }}
                >
                  {p.emoji}
                </motion.span>
              ))}

              {scene.radial.map((p) => {
                const angle = (p.id / scene.radial.length) * Math.PI * 2;
                const dist = 30 + (p.id % 7) * 6;
                const dx = Math.cos(angle) * dist;
                const dy = Math.sin(angle) * dist;
                return (
                  <motion.span
                    key={`c-${p.id}`}
                    className={styles.particle}
                    style={{
                      left: '50%',
                      top: '50%',
                      fontSize: p.size,
                    }}
                    initial={{ x: 0, y: 0, opacity: 0, scale: 0.2 }}
                    animate={{
                      x: `${dx}vmax`,
                      y: `${dy}vmax`,
                      opacity: [0, 1, 1, 0],
                      scale: [0.2, 1, 1, 0.6],
                      rotate: p.rotate,
                    }}
                    transition={{
                      duration: p.duration,
                      delay: p.delay,
                      ease: 'easeOut',
                      repeat: Infinity,
                      repeatDelay: 0.4,
                    }}
                  >
                    {p.emoji}
                  </motion.span>
                );
              })}
            </div>
          ) : null}

          <motion.div
            className={styles.cardWrap}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              className={`${styles.cardInner} ${
                scene.theme.textLight ? styles.darkText : styles.lightText
              }`}
              style={{
                background: scene.theme.background,
                border: `2px solid ${scene.theme.borderColor}`,
                boxShadow: scene.theme.glow,
              }}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.2 }}
            >
              <div className={styles.sheen} />
              <div className={styles.monthBadge}>Новый уровень</div>
              <div className={styles.medal} aria-hidden>
                {input.titleEmoji}
              </div>
              <div className={styles.placeLabel}>Уровень {input.level}</div>
              <div className={styles.title}>{input.title}</div>
              <div className={styles.desc}>
                Так держать! Каждый урок, экзамен и медаль приближают к
                следующему уровню.
              </div>
            </motion.div>
          </motion.div>

          <div className={styles.hint}>Нажмите в любом месте, чтобы закрыть</div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
}
