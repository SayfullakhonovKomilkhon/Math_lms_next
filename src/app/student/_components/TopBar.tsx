'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';
import { StudentAvatar } from './StudentAvatar';
import styles from './TopBar.module.css';

type TopBarProps = {
  firstName: string;
  initials: string;
  unreadCount?: number;
  streak?: number;
  champion?: boolean;
};

export function TopBar({
  firstName,
  initials,
  unreadCount = 0,
  streak,
  champion = false,
}: TopBarProps) {
  return (
    <header className={styles.bar}>
      <Link href="/student/profile" className={styles.identity} aria-label="Профиль">
        <StudentAvatar initials={initials} size={40} champion={champion} />
        <span className={styles.text}>
          <span className={styles.hello}>
            {champion ? 'Чемпион месяца' : 'Привет'}
          </span>
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
