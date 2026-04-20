'use client';

import styles from './SpecialAchievementCard.module.css';

export type SpecialAchievement = {
  key: string;
  title: string;
  icon: string;
  description: string;
  condition: string;
  unlocked: boolean;
  unlockedAt?: string;
  accent?: 'red' | 'gold' | 'purple' | 'blue' | 'pink';
};

const ACCENT_CLASS: Record<NonNullable<SpecialAchievement['accent']>, string> = {
  red: styles.accentRed,
  gold: styles.accentGold,
  purple: styles.accentPurple,
  blue: styles.accentBlue,
  pink: styles.accentPink,
};

type Props = {
  achievement: SpecialAchievement;
  onClick?: (a: SpecialAchievement) => void;
};

export function SpecialAchievementCard({ achievement, onClick }: Props) {
  const cn = [
    styles.card,
    achievement.accent ? ACCENT_CLASS[achievement.accent] : styles.accentPurple,
    achievement.unlocked ? '' : styles.locked,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={cn}
      onClick={() => onClick?.(achievement)}
      style={{ border: 'none', textAlign: 'left' }}
    >
      <div className={styles.iconRow}>
        <div className={styles.bigIcon}>
          {achievement.unlocked ? (
            achievement.icon
          ) : (
            <span className={styles.lockedIcon} aria-hidden>
              🔒
            </span>
          )}
        </div>
        <div>
          <div className={styles.title}>{achievement.title}</div>
        </div>
      </div>
      <div className={styles.desc}>
        {achievement.unlocked ? achievement.description : achievement.condition}
      </div>
      <span className={`${styles.tag} ${achievement.unlocked ? '' : styles.tagLocked}`}>
        {achievement.unlocked ? 'получено' : 'закрыто'}
      </span>
    </button>
  );
}
