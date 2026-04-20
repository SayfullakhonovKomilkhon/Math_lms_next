'use client';

import {
  getSpecial,
  type Gender,
  type SpecialDef,
  type SpecialKey,
} from '../_lib/achievementsCatalog';
import { haptic } from '../_lib/hooks';
import styles from './SpecialAchievementCard.module.css';

export type SpecialState = {
  key: SpecialKey;
  unlocked: boolean;
  unlockedAt?: string;
};

type Props = {
  state: SpecialState;
  gender: Gender;
  onSelect?: (state: SpecialState, def: SpecialDef) => void;
};

function formatDate(iso?: string): string {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return '';
  }
}

export function SpecialAchievementCard({ state, gender, onSelect }: Props) {
  const def = getSpecial(state.key);
  if (!def) return null;

  const title =
    gender === 'female' && def.titleFemale ? def.titleFemale : def.title;
  const description =
    gender === 'female' && def.descriptionFemale
      ? def.descriptionFemale
      : def.description;

  const handleClick = () => {
    haptic(14);
    onSelect?.(state, def);
  };

  if (!state.unlocked) {
    return (
      <div
        className={`${styles.card} ${styles.locked}`}
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleClick();
        }}
      >
        <div className={styles.head}>
          <div className={styles.iconWrap}>
            <span className={styles.lockIcon}>🔒</span>
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className={styles.title}>{title}</div>
            <div className={styles.label}>Ещё не получено</div>
          </div>
        </div>
        <div className={styles.desc}>{def.condition}</div>
        <div className={styles.footer}>
          <span className={styles.tag}>Условие</span>
        </div>
      </div>
    );
  }

  const theme = def.theme;

  return (
    <div
      className={`${styles.card} ${theme.textLight ? styles.dark : styles.light}`}
      role="button"
      tabIndex={0}
      style={{
        background: theme.background,
        border: `${theme.borderWidth}px solid ${theme.borderColor}`,
        boxShadow: theme.glow,
      }}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleClick();
      }}
    >
      <div className={styles.sheen} />
      {theme.decor.length > 0 ? (
        <div className={styles.decor} aria-hidden>
          {theme.decor.map((c, i) => (
            <span key={i}>{c}</span>
          ))}
        </div>
      ) : null}

      <div className={styles.head}>
        <div className={styles.iconWrap}>{def.icon}</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className={styles.title}>{title}</div>
          <div className={styles.label}>{theme.label}</div>
        </div>
      </div>

      <div className={styles.desc}>{description}</div>

      <div className={styles.footer}>
        <span className={styles.tag}>Получено</span>
        {state.unlockedAt ? (
          <span className={styles.date}>{formatDate(state.unlockedAt)}</span>
        ) : null}
      </div>
    </div>
  );
}
