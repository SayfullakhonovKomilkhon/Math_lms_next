'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Book,
  Trophy,
  BarChart3,
  User,
  Calendar,
  CreditCard,
  Megaphone,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import styles from './SideDock.module.css';

const MAIN = [
  { href: '/student/dashboard', label: 'Главная', icon: Home },
  { href: '/student/homework', label: 'Домашние задания', icon: Book },
  { href: '/student/achievements', label: 'Достижения', icon: Trophy },
  { href: '/student/grades', label: 'Оценки и рейтинг', icon: BarChart3 },
];

const SECONDARY = [
  { href: '/student/schedule', label: 'Расписание', icon: Calendar },
  { href: '/student/payment', label: 'Оплата', icon: CreditCard },
  { href: '/student/announcements', label: 'Объявления', icon: Megaphone },
  { href: '/student/profile', label: 'Профиль', icon: User },
];

type SideDockProps = {
  unreadCount?: number;
};

export function SideDock({ unreadCount = 0 }: SideDockProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside className={styles.dock} aria-label="Навигация ученика">
      <div className={styles.brand}>
        <div className={styles.brandLogo}>M</div>
        <div>
          <div className={styles.brandName}>MathCenter</div>
          <div className={styles.brandSub}>Панель ученика</div>
        </div>
      </div>

      <nav className={styles.nav}>
        {MAIN.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`${styles.link} ${isActive(href) ? styles.active : ''}`}
          >
            <Icon size={18} />
            {label}
            {href === '/student/achievements' && unreadCount > 0 ? (
              <span className={styles.badge}>{unreadCount}</span>
            ) : null}
          </Link>
        ))}

        <div style={{ height: 20 }} aria-hidden />

        {SECONDARY.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`${styles.link} ${isActive(href) ? styles.active : ''}`}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>

      <div className={styles.footer}>
        <div className={styles.footerName}>Вы вошли как</div>
        <div className={styles.footerEmail}>{user?.email ?? '—'}</div>
        <button type="button" className={styles.logoutBtn} onClick={logout}>
          <LogOut size={14} /> Выйти
        </button>
      </div>
    </aside>
  );
}
