'use client';

import Link from 'next/link';
import {
  Calendar,
  CreditCard,
  LogOut,
  Megaphone,
  MessageCircle,
  Bell,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { PageTitle } from '../_components/PageTitle';
import { SButton } from '../_components/SButton';
import { useStudentSummary } from '../_lib/useStudentSummary';
import styles from './profile.module.css';

export default function StudentProfilePage() {
  const { summary } = useStudentSummary();
  const { user, logout } = useAuth();

  const menu = [
    {
      href: '/student/schedule',
      icon: Calendar,
      title: 'Расписание',
      sub: 'Мои занятия и ближайший урок',
    },
    {
      href: '/student/payment',
      icon: CreditCard,
      title: 'Оплата',
      sub: 'Статус и история платежей',
    },
    {
      href: '/student/announcements',
      icon: Megaphone,
      title: 'Объявления',
      sub: 'Новости от учителя и центра',
    },
    {
      href: '/student/notifications',
      icon: Bell,
      title: 'Уведомления',
      sub: 'История событий и достижений',
    },
    {
      href: '/student/settings/telegram',
      icon: MessageCircle,
      title: 'Telegram',
      sub: 'Получай оповещения в Telegram',
    },
  ];

  return (
    <div>
      <PageTitle kicker="Профиль" title="Моя карточка" gradient />

      <section className={styles.hero}>
        <div className={styles.avatar}>{summary.initials}</div>
        <div className={styles.name}>{summary.fullName}</div>
        <div className={styles.meta}>
          {summary.groupName}
          <br />
          Учитель: {summary.teacherName}
        </div>
        <div className={styles.levelPill}>
          {summary.titleEmoji} {summary.title} · уровень {summary.level}
        </div>
      </section>

      <div className={styles.statsRow}>
        <div className={styles.statBlock}>
          <div className={styles.statVal}>{summary.totalLessons}</div>
          <div className={styles.statLabel}>уроков</div>
        </div>
        <div className={styles.statBlock}>
          <div className={styles.statVal}>{summary.attendancePercent}%</div>
          <div className={styles.statLabel}>посещ.</div>
        </div>
        <div className={styles.statBlock}>
          <div className={styles.statVal}>{summary.streak}</div>
          <div className={styles.statLabel}>стрик</div>
        </div>
      </div>

      <nav className={styles.menu} aria-label="Дополнительные разделы">
        {menu.map(({ href, icon: Icon, title, sub }) => (
          <Link key={href} href={href} className={styles.menuItem}>
            <span className={styles.menuIcon}>
              <Icon size={18} />
            </span>
            <span className={styles.menuBody}>
              <span className={styles.menuTitle}>{title}</span>
              <span className={styles.menuSub}>{sub}</span>
            </span>
            <ChevronRight size={18} className={styles.menuArrow} />
          </Link>
        ))}
      </nav>

      {user ? (
        <div style={{ marginTop: 14, color: 'var(--s-text-muted)', fontSize: 11, textAlign: 'center' }}>
          {user.email}
        </div>
      ) : null}

      <div className={styles.logoutBtn}>
        <SButton variant="danger" onClick={logout}>
          <LogOut size={16} /> Выйти
        </SButton>
      </div>
    </div>
  );
}
