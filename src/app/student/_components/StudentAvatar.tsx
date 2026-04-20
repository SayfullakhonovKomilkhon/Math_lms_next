'use client';

import styles from './StudentAvatar.module.css';

type Props = {
  initials: string;
  size?: number;
  champion?: boolean;
  className?: string;
};

export function StudentAvatar({
  initials,
  size = 44,
  champion = false,
  className,
}: Props) {
  const crownSize = Math.round(size * 0.62);
  return (
    <span
      className={`${styles.wrap} ${className ?? ''}`}
      style={{ width: size, height: size }}
    >
      {champion ? (
        <span
          className={styles.crown}
          style={{ fontSize: crownSize }}
          aria-hidden
        >
          👑
        </span>
      ) : null}
      <span
        className={`${styles.avatar} ${champion ? styles.champion : ''}`}
        style={{
          width: size,
          height: size,
          fontSize: Math.round(size * 0.4),
        }}
      >
        {initials}
      </span>
    </span>
  );
}
