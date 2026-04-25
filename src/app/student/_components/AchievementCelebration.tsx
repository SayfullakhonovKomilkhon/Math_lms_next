'use client';

import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import {
  getMonth,
  getMonthlyTitle,
  placeLabel,
  placeMedal,
  type AnimationKey,
  type Gender,
  type Place,
} from '../_lib/achievementsCatalog';
import { haptic, useReducedMotion } from '../_lib/hooks';
import styles from './AchievementCelebration.module.css';

export type CelebrationInput = {
  month: number;
  place: Place;
};

type Props = {
  input: CelebrationInput | null;
  gender: Gender;
  onClose: () => void;
};

/* Seeded pseudo-random generator so particle positions are deterministic. */
function seededRandom(seed: number) {
  let x = seed;
  return () => {
    x = (x * 9301 + 49297) % 233280;
    return x / 233280;
  };
}

type ParticleSpec = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  emoji: string;
  rotate: number;
  drift: number;
};

function buildParticles(
  seed: number,
  emojis: string[],
  count: number,
  opts: {
    minSize?: number;
    maxSize?: number;
    minDuration?: number;
    maxDuration?: number;
  } = {},
): ParticleSpec[] {
  const rnd = seededRandom(seed);
  const minSize = opts.minSize ?? 14;
  const maxSize = opts.maxSize ?? 34;
  const minDuration = opts.minDuration ?? 3.2;
  const maxDuration = opts.maxDuration ?? 6.5;
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    left: rnd() * 100,
    delay: rnd() * 1.6,
    duration: minDuration + rnd() * (maxDuration - minDuration),
    size: minSize + rnd() * (maxSize - minSize),
    emoji: emojis[Math.floor(rnd() * emojis.length)],
    rotate: (rnd() - 0.5) * 360,
    drift: (rnd() - 0.5) * 40,
  }));
}

/* ---------- Scene builders ---------- */

type CardKeyframe = {
  scale?: number;
  y?: number | string;
  rotate?: number;
  opacity?: number;
};

type Scene = {
  fallingParticles?: ParticleSpec[];
  risingParticles?: ParticleSpec[];
  radialParticles?: ParticleSpec[];
  flash?: boolean;
  rainbow?: boolean;
  rays?: boolean;
  fog?: boolean;
  ring?: boolean;
  cardInitial: CardKeyframe;
  cardAnimate: CardKeyframe;
  cardTransition?: {
    type?: 'spring' | 'tween';
    stiffness?: number;
    damping?: number;
    duration?: number;
    delay?: number;
  };
};

function makeScene(anim: AnimationKey, seed: number): Scene {
  switch (anim) {
    case 'snowstorm':
      return {
        fallingParticles: buildParticles(seed, ['❄', '❄️', '✦', '✧'], 40, {
          minSize: 14,
          maxSize: 32,
        }),
        cardInitial: { scale: 0, opacity: 0 },
        cardAnimate: { scale: 1, opacity: 1 },
        cardTransition: { type: 'spring', stiffness: 200, damping: 18, delay: 0.2 },
      };
    case 'salute_roses':
      return {
        risingParticles: buildParticles(seed, ['★', '🌹', '✦', '🌸'], 32, {
          minSize: 18,
          maxSize: 36,
          minDuration: 2.2,
          maxDuration: 4.4,
        }),
        cardInitial: { opacity: 0, scale: 0.8 },
        cardAnimate: { opacity: 1, scale: 1 },
        cardTransition: { type: 'spring', stiffness: 150, damping: 18, delay: 0.15 },
      };
    case 'bloom':
      return {
        risingParticles: buildParticles(seed, ['🌸', '🌺', '🍃', '✿'], 34, {
          minSize: 18,
          maxSize: 36,
          minDuration: 3.2,
          maxDuration: 5.6,
        }),
        cardInitial: { y: '100%', opacity: 0 },
        cardAnimate: { y: 0, opacity: 1 },
        cardTransition: { type: 'spring', stiffness: 140, damping: 16, delay: 0.2 },
      };
    case 'lightning':
      return {
        flash: true,
        rainbow: true,
        radialParticles: buildParticles(seed, ['⚡', '💧'], 20, {
          minSize: 18,
          maxSize: 32,
        }),
        cardInitial: { scale: 1, opacity: 0 },
        cardAnimate: { scale: 1, opacity: 1 },
        cardTransition: { duration: 0.35, delay: 0.3 },
      };
    case 'fireworks':
      return {
        radialParticles: buildParticles(seed, ['🎊', '★', '✨', '🎉', '🎆'], 48, {
          minSize: 18,
          maxSize: 36,
        }),
        cardInitial: { scale: 0.4, opacity: 0 },
        cardAnimate: { scale: 1, opacity: 1 },
        cardTransition: { type: 'spring', stiffness: 260, damping: 12, delay: 0.15 },
      };
    case 'sunburst':
      return {
        rays: true,
        radialParticles: buildParticles(seed, ['🔥', '✨', '☀️'], 30, {
          minSize: 18,
          maxSize: 36,
        }),
        cardInitial: { scale: 0.6, opacity: 0 },
        cardAnimate: { scale: 1, opacity: 1 },
        cardTransition: { type: 'spring', stiffness: 180, damping: 16, delay: 0.25 },
      };
    case 'wave':
      return {
        risingParticles: buildParticles(seed, ['🐚', '🌊', '⭐', '🐚'], 32, {
          minSize: 18,
          maxSize: 34,
          minDuration: 3.8,
          maxDuration: 6,
        }),
        cardInitial: { y: '120%', opacity: 0 },
        cardAnimate: { y: 0, opacity: 1 },
        cardTransition: { type: 'spring', stiffness: 120, damping: 18, delay: 0.2 },
      };
    case 'starfall':
      return {
        fallingParticles: buildParticles(seed, ['✦', '★', '✧', '🌠'], 34, {
          minSize: 16,
          maxSize: 32,
          minDuration: 1.6,
          maxDuration: 3.8,
        }),
        cardInitial: { scale: 0.1, opacity: 0 },
        cardAnimate: { scale: 1, opacity: 1 },
        cardTransition: { type: 'spring', stiffness: 180, damping: 14, delay: 0.25 },
      };
    case 'leaffall':
      return {
        fallingParticles: buildParticles(seed, ['🍁', '🍂', '🍃'], 40, {
          minSize: 20,
          maxSize: 36,
          minDuration: 4,
          maxDuration: 7,
        }),
        cardInitial: { scale: 0.85, opacity: 0, y: 30 },
        cardAnimate: { scale: 1, opacity: 1, y: 0 },
        cardTransition: { type: 'tween', duration: 0.6, delay: 0.25 },
      };
    case 'magic':
      return {
        fog: true,
        ring: true,
        radialParticles: buildParticles(seed, ['✦', '⬡', '★', '✨'], 36, {
          minSize: 16,
          maxSize: 32,
        }),
        cardInitial: { scale: 0.4, opacity: 0 },
        cardAnimate: { scale: 1, opacity: 1 },
        cardTransition: { type: 'spring', stiffness: 120, damping: 16, delay: 0.3 },
      };
    case 'storm':
      return {
        flash: true,
        fallingParticles: buildParticles(seed, ['💧', '⚡'], 50, {
          minSize: 14,
          maxSize: 28,
          minDuration: 1.2,
          maxDuration: 2.6,
        }),
        cardInitial: { scale: 1.3, opacity: 0 },
        cardAnimate: { scale: 1, opacity: 1 },
        cardTransition: { type: 'spring', stiffness: 260, damping: 18, delay: 0.4 },
      };
    case 'newyear':
      return {
        fallingParticles: buildParticles(seed, ['❄', '✨', '⭐'], 46, {
          minSize: 14,
          maxSize: 34,
          minDuration: 2.6,
          maxDuration: 5.2,
        }),
        radialParticles: buildParticles(seed + 5, ['🎊', '🎉', '✨', '🎆'], 36, {
          minSize: 20,
          maxSize: 36,
        }),
        cardInitial: { y: '-120%', opacity: 0 },
        cardAnimate: { y: 0, opacity: 1 },
        cardTransition: { type: 'spring', stiffness: 120, damping: 14, delay: 0.3 },
      };
  }
}

/* ---------- Portal helper ---------- */

function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/* ---------- Main component ---------- */

export function AchievementCelebration({ input, gender, onClose }: Props) {
  const mounted = useMounted();
  const reduced = useReducedMotion();

  const scene = useMemo(() => {
    if (!input) return null;
    const meta = getMonth(input.month);
    return { meta, scene: makeScene(meta.animation, input.month * 31 + input.place * 7) };
  }, [input]);

  useEffect(() => {
    if (!input) return;
    haptic([40, 40, 40]);
    const t = setTimeout(onClose, 5600);
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
        <CelebrationInner
          input={input}
          gender={gender}
          onClose={onClose}
          meta={scene.meta}
          scene={scene.scene}
          reduced={reduced}
        />
      ) : null}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
}

type InnerProps = {
  input: CelebrationInput;
  gender: Gender;
  onClose: () => void;
  meta: ReturnType<typeof getMonth>;
  scene: Scene;
  reduced: boolean;
};

function CelebrationInner({
  input,
  gender,
  onClose,
  meta,
  scene,
  reduced,
}: InnerProps) {
  const data = getMonthlyTitle(input.month, input.place, gender);
  const theme = data.theme;

  return (
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

      {/* Scene layers (skipped when reduced motion) */}
      {!reduced ? (
        <div className={styles.stage} aria-hidden>
          {scene.flash ? (
            <motion.div
              className={styles.flash}
              style={{
                background:
                  'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.9), transparent 60%)',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0, 0.6, 0] }}
              transition={{ duration: 1.4, times: [0, 0.1, 0.25, 0.4, 1] }}
            />
          ) : null}

          {scene.rainbow ? (
            <motion.div
              className={styles.rainbow}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.55, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          ) : null}

          {scene.rays ? (
            <motion.div
              className={styles.rays}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ opacity: { duration: 0.6 } }}
            />
          ) : null}

          {scene.fog ? (
            <motion.div
              className={styles.fog}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ duration: 0.9 }}
            />
          ) : null}

          {scene.ring ? (
            <motion.div
              className={styles.magicRing}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 0.9, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            />
          ) : null}

          {scene.fallingParticles?.map((p) => (
            <motion.span
              key={`f-${p.id}`}
              className={styles.particle}
              style={{
                left: `${p.left}%`,
                top: '-10vh',
                fontSize: p.size,
              }}
              initial={{ y: 0, opacity: 0, rotate: 0 }}
              animate={{
                y: '120vh',
                opacity: [0, 1, 1, 0],
                rotate: p.rotate,
                x: p.drift,
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                ease: 'linear',
                repeat: Infinity,
              }}
            >
              {p.emoji}
            </motion.span>
          ))}

          {scene.risingParticles?.map((p) => (
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

          {scene.radialParticles?.map((p) => {
            const angle = (p.id / (scene.radialParticles?.length ?? 1)) * Math.PI * 2;
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

      {/* Card */}
      <motion.div
        className={styles.cardWrap}
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          className={`${styles.cardInner} ${theme.textLight ? styles.darkText : styles.lightText}`}
          style={{
            background: theme.background,
            border: `${theme.borderWidth}px solid ${theme.borderColor}`,
            boxShadow: theme.glow,
          }}
          initial={scene.cardInitial}
          animate={scene.cardAnimate}
          transition={scene.cardTransition}
        >
          <div className={styles.sheen} />
          <div className={styles.monthBadge}>
            {meta.emoji} {meta.name}
          </div>
          <div className={styles.medal} aria-hidden>
            {data.icon}
          </div>
          <div className={styles.placeLabel}>
            {placeMedal(input.place)} {placeLabel(input.place)}
          </div>
          <div className={styles.title}>{data.title}</div>
          <div className={styles.desc}>{data.description}</div>
        </motion.div>
      </motion.div>

      <div className={styles.hint}>Нажмите в любом месте, чтобы закрыть</div>
    </motion.div>
  );
}
