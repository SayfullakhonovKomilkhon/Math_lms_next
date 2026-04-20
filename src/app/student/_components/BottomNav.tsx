'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Book, Trophy, BarChart3, User } from 'lucide-react';
import { haptic } from '../_lib/hooks';
import styles from './BottomNav.module.css';

export type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  badge?: number;
};

const ITEMS: NavItem[] = [
  { href: '/student/dashboard', label: 'Главная', icon: Home },
  { href: '/student/homework', label: 'ДЗ', icon: Book },
  { href: '/student/achievements', label: 'Награды', icon: Trophy },
  { href: '/student/grades', label: 'Рейтинг', icon: BarChart3 },
  { href: '/student/profile', label: 'Профиль', icon: User },
];

type BottomNavProps = {
  badges?: Partial<Record<string, number>>;
};

export function BottomNav({ badges }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <div className={styles.wrap} role="navigation" aria-label="Основная навигация">
      <nav className={styles.nav}>
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          const badge = badges?.[href];
          return (
            <Link
              key={href}
              href={href}
              prefetch
              onClick={() => haptic(8)}
              className={`${styles.item} ${active ? styles.active : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              <span className={styles.iconWrap}>
                <Icon size={20} />
                {badge && badge > 0 ? (
                  <span className={styles.badge}>{badge > 9 ? '9+' : badge}</span>
                ) : null}
              </span>
              <span className={styles.label}>{label}</span>
              <span className={styles.indicator} aria-hidden />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
