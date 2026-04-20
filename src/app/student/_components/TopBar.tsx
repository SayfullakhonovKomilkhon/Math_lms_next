'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';
import styles from './TopBar.module.css';

type TopBarProps = {
  firstName: string;
  initials: string;
  unreadCount?: number;
  streak?: number;
};

export function TopBar({ firstName, initials, unreadCount = 0, streak }: TopBarProps) {
  return (
    <header className={styles.bar}>
      <Link href="/student/profile" className={styles.identity} aria-label="Профиль">
        <span className={styles.avatar} aria-hidden>
          {initials}
        </span>
        <span className={styles.text}>
          <span className={styles.hello}>Привет</span>
          <span className={styles.name}>{firstName}</span>
        </span>
      </Link>

      <div className={styles.actions}>
        {streak && streak > 0 ? (
          <span className={styles.streak} title="Серия дней подряд">
            <span className={styles.flame}>🔥</span>
            {streak}
          </span>
        ) : null}
        <Link
          href="/student/notifications"
          className={styles.iconBtn}
          aria-label="Уведомления"
        >
          <Bell size={18} />
          {unreadCount > 0 ? <span className={styles.dot} aria-hidden /> : null}
        </Link>
      </div>
    </header>
  );
}
