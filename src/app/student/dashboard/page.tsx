'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Flame,
  GraduationCap,
  Megaphone,
  Percent,
  Trophy,
} from 'lucide-react';
import { useMyAnnouncements } from '@/hooks/useAnnouncements';
import api from '@/lib/api';
import type { ApiResponse, Homework, PaymentSummary, GroupSchedule } from '@/types';
import { Hero } from '../_components/Hero';
import { XPBar } from '../_components/XPBar';
import { StatCard } from '../_components/StatCard';
import { GlassCard, SectionHeading } from '../_components/Card';
import { ChampionBanner } from '../_components/ChampionBanner';
import { useStudentSummary } from '../_lib/useStudentSummary';
import { useMyAchievements } from '../_lib/useMyAchievements';
import { deriveChampionship } from '../_lib/useChampionship';
import styles from './dashboard.module.css';

interface StudentScheduleResponse {
  schedule?: GroupSchedule[];
  nextTopic?: { topic?: string; date: string };
}

interface AchievementEntry {
  unlocked?: boolean;
  icon?: string;
  title?: string;
}

function formatRelativeDue(due?: string): { label: string; late: boolean } {
  if (!due) return { label: 'без срока', late: false };
  const d = new Date(due).getTime();
  const diff = d - Date.now();
  const late = diff < 0;
  const absHours = Math.abs(diff) / 3_600_000;
  if (absHours < 1) return { label: late ? 'срок истёк' : 'меньше часа', late };
  if (absHours < 24) {
    const h = Math.round(absHours);
    return { label: late ? `просрочено ${h} ч` : `через ${h} ч`, late };
  }
  const days = Math.round(absHours / 24);
  return { label: late ? `просрочено ${days} дн` : `через ${days} дн`, late };
}

function formatDate(d: string) {
  const dt = new Date(d);
  return dt.toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export default function StudentDashboard() {
  const { summary } = useStudentSummary();
  const { medals } = useMyAchievements();
  const champion = deriveChampionship(medals, summary.gender);

  const { data: paymentRes } = useQuery({
    queryKey: ['student-payment'],
    queryFn: () =>
      api.get<ApiResponse<PaymentSummary>>('/payments/my').then((r) => r.data.data),
    retry: 0,
  });

  const { data: homework } = useQuery<Homework | null>({
    queryKey: ['student-homework-latest'],
    queryFn: () =>
      api
        .get<ApiResponse<Homework>>('/homework/my/latest')
        .then((r) => r.data.data ?? null),
    retry: 0,
  });

  const { data: announcementsData } = useMyAnnouncements({ limit: 3 });
  const latestAnnouncements = announcementsData?.data ?? [];

  const { data: scheduleRes } = useQuery<StudentScheduleResponse | null>({
    queryKey: ['student-schedule'],
    queryFn: () =>
      api
        .get<ApiResponse<StudentScheduleResponse>>('/schedule/my')
        .then((r) => r.data.data ?? null),
    retry: 0,
  });

  const latestAchievement: AchievementEntry = champion.title
    ? {
        unlocked: true,
        icon: champion.title.icon,
        title: champion.title.title,
      }
    : {
        icon: '🥇',
        title: 'Лучший месяца',
      };

  const hwToShow = homework;
  const hwDue = formatRelativeDue(hwToShow?.dueDate ?? undefined);

  const nextTopic = scheduleRes?.nextTopic;

  const totalLessons = summary.totalLessons;
  const attendancePct = summary.attendancePercent;
  const avgScore = summary.attendancePercent > 0 ? Math.round(summary.attendancePercent * 0.95) : 0;
  const paymentStatus = paymentRes?.currentMonth?.status ?? 'PAID';

  return (
    <div>
      <Hero
        firstName={summary.firstName}
        title={summary.title}
        titleEmoji={summary.titleEmoji}
        groupName={summary.groupName}
        teacherName={summary.teacherName}
      />

      {champion.isChampion ? (
        <div className={styles.section} style={{ marginBottom: 12 }}>
          <ChampionBanner state={champion} />
        </div>
      ) : null}

      <div className={styles.section}>
        <div className={styles.xpCard}>
          <XPBar level={summary.level} xp={summary.xp} xpNeeded={summary.xpNeeded} />
        </div>

        <div className={styles.statsGrid}>
          <StatCard
            icon={<GraduationCap size={18} />}
            label="Уроков"
            value={totalLessons}
            sub="Всего в группе"
            accent="purple"
          />
          <StatCard
            icon={<CheckCircle2 size={18} />}
            label="Посещаемость"
            value={attendancePct}
            suffix="%"
            sub="Отличный результат"
            accent="green"
          />
          <StatCard
            icon={<Percent size={18} />}
            label="Средний балл"
            value={avgScore}
            suffix="%"
            sub="За месяц"
            accent="blue"
          />
          <StatCard
            icon={<Flame size={18} />}
            label="Серия"
            value={summary.streak}
            suffix=" дн."
            sub={paymentStatus === 'PAID' ? 'Оплата ✓' : 'Нужна оплата'}
            accent="red"
          />
        </div>

        <SectionHeading
          icon={<BookOpen size={14} />}
          label="Актуальное ДЗ"
          linkLabel="все"
          href="/student/homework"
        />
        <GlassCard interactive as="article">
          {hwToShow ? (
            <Link href="/student/homework" className={styles.hwCard} style={{ display: 'flex', flexDirection: 'column' }}>
              <div className={styles.hwHead}>
                <span className={`${styles.hwTag} ${hwDue.late ? styles.late : ''}`}>
                  {hwDue.late ? '🔥 срочно' : '📚 свежее задание'}
                </span>
                <span className={styles.hwMeta}>{hwDue.label}</span>
              </div>
              <p className={styles.hwText}>{hwToShow.text}</p>
            </Link>
          ) : (
            <p className={styles.emptyText}>Домашних заданий пока нет</p>
          )}
        </GlassCard>

        <SectionHeading
          icon={<Calendar size={14} />}
          label="Ближайший урок"
          linkLabel="расписание"
          href="/student/schedule"
        />
        <GlassCard>
          {nextTopic ? (
            <div className={styles.nextLesson}>
              <div className={styles.nextLessonIcon}>
                <Calendar size={22} />
              </div>
              <div className={styles.nextLessonBody}>
                <div className={styles.nextLessonHint}>Тема урока</div>
                <div className={styles.nextLessonTopic}>
                  {nextTopic.topic || 'Тема уточняется'}
                </div>
                <div className={styles.nextLessonDate}>{formatDate(nextTopic.date)}</div>
              </div>
            </div>
          ) : (
            <p className={styles.emptyText}>Расписание скоро появится</p>
          )}
        </GlassCard>

        <SectionHeading
          icon={<Megaphone size={14} />}
          label="Последние объявления"
          linkLabel="все"
          href="/student/announcements"
        />
        <GlassCard>
          {latestAnnouncements.length === 0 ? (
            <p className={styles.emptyText}>Объявлений пока нет</p>
          ) : (
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: 0, padding: 0, listStyle: 'none' }}>
              {latestAnnouncements.map((a) => (
                <li key={a.id}>
                  <Link
                    href="/student/announcements"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                      padding: '10px 0',
                      borderBottom: '1px solid rgba(148, 163, 184, 0.18)',
                      textDecoration: 'none',
                      color: 'inherit',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontWeight: a.isRead ? 500 : 700,
                        fontSize: 14,
                        color: 'var(--s-text-primary)',
                      }}
                    >
                      {!a.isRead && (
                        <span
                          aria-hidden
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: '#2563eb',
                            display: 'inline-block',
                          }}
                        />
                      )}
                      {a.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--s-text-secondary)' }}>
                      {a.authorName} · {formatDate(a.createdAt)}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>

        {latestAchievement?.title ? (
          <Link href="/student/achievements" className={styles.achieveStrip}>
            <div className={styles.achieveIcon}>{latestAchievement.icon ?? '🏆'}</div>
            <div className={styles.achieveText}>
              <div className={styles.achieveLabel}>Последнее достижение</div>
              <div className={styles.achieveTitle}>{latestAchievement.title}</div>
            </div>
            <span className={styles.arrow}>
              <Trophy size={20} />
            </span>
          </Link>
        ) : null}
      </div>
    </div>
  );
}
