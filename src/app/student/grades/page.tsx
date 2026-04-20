'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Award, List, Users } from 'lucide-react';
import api from '@/lib/api';
import type {
  ApiResponse,
  GradeRecord,
  MyRating,
  RatingEntry,
} from '@/types';
import { PageTitle } from '../_components/PageTitle';
import { SectionHeading } from '../_components/Card';
import { Podium, type PodiumEntry } from '../_components/Podium';
import { useStudentSummary } from '../_lib/useStudentSummary';
import { mockGrades, mockLeaderboard } from '../_lib/mockData';
import styles from './grades.module.css';

function initials(name: string) {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? '') + (p[1]?.[0] ?? '')).toUpperCase();
}

const LESSON_TYPE_LABEL: Record<string, string> = {
  TEST: 'Тест',
  CONTROL: 'Контрольная',
  PRACTICE: 'Практика',
  REGULAR: 'Урок',
};

function formatDay(d: string) {
  const dt = new Date(d);
  return {
    day: dt.getDate(),
    month: dt.toLocaleDateString('ru-RU', { month: 'short' }).replace('.', ''),
  };
}

type TabId = 'rating' | 'grades';

export default function StudentGradesPage() {
  const { profile } = useStudentSummary();
  const [tab, setTab] = useState<TabId>('rating');
  const [period] = useState<'month' | 'quarter' | 'all'>('month');

  const { data: ratingRes } = useQuery({
    queryKey: ['student-rating', period],
    queryFn: () =>
      api
        .get<ApiResponse<MyRating>>(`/grades/my/rating?period=${period}`)
        .then((r) => r.data.data),
    retry: 0,
  });

  const { data: gradesRes } = useQuery({
    queryKey: ['student-grades'],
    queryFn: () =>
      api.get<ApiResponse<GradeRecord[]>>('/grades/my').then((r) => r.data.data ?? []),
    retry: 0,
  });

  const apiRating = ratingRes?.rating ?? [];
  const usingMock = apiRating.length === 0;

  const ratingList: Array<{
    id: string;
    fullName: string;
    score: number;
    place: number;
    change?: number;
    isMe?: boolean;
  }> = usingMock
    ? mockLeaderboard
    : apiRating.map((r: RatingEntry, i) => ({
        id: r.studentId,
        fullName: r.fullName,
        score: Math.round(r.averageScore),
        place: r.place ?? i + 1,
        isMe: r.studentId === profile?.id,
      }));

  const myPlace = ratingRes?.myPlace ?? ratingList.find((r) => r.isMe)?.place ?? 2;
  const total = ratingRes?.totalStudents ?? ratingList.length;

  const podium: PodiumEntry[] = ratingList.slice(0, 3).map((r) => ({
    id: r.id,
    fullName: r.fullName,
    score: r.score,
    place: r.place as 1 | 2 | 3,
    isMe: r.isMe,
  }));

  const grades = gradesRes && gradesRes.length > 0 ? gradesRes : mockGrades;

  return (
    <div>
      <PageTitle
        kicker="Рейтинг"
        title="Где ты в группе"
        description="Сравни свои результаты с товарищами."
        gradient
      />

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === 'rating' ? styles.active : ''}`}
          onClick={() => setTab('rating')}
        >
          🏆 Рейтинг
        </button>
        <button
          className={`${styles.tab} ${tab === 'grades' ? styles.active : ''}`}
          onClick={() => setTab('grades')}
        >
          📈 Мои оценки
        </button>
      </div>

      {tab === 'rating' ? (
        <>
          <div className={styles.myPlace}>
            <div className={styles.placeBadge}>{myPlace}</div>
            <div className={styles.placeBody}>
              <div className={styles.placeLabel}>Моё место</div>
              <div className={styles.placeValue}>
                {myPlace} <span style={{ color: 'var(--s-text-secondary)', fontWeight: 600, fontSize: 14 }}>из {total}</span>
              </div>
              <div className={styles.placeSub}>
                {myPlace <= 3 ? 'Ты на подиуме — держи темп!' : 'Ещё немного и ты на подиуме!'}
              </div>
            </div>
          </div>

          <SectionHeading icon={<Users size={14} />} label="Подиум месяца" />
          <div
            style={{
              borderRadius: 'var(--s-radius-lg)',
              background:
                'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(255,248,240,0.85))',
              border: '1px solid var(--s-card-outline)',
              boxShadow: 'var(--s-shadow-card)',
              backdropFilter: 'var(--s-blur-glass)',
              WebkitBackdropFilter: 'var(--s-blur-glass)',
              overflow: 'hidden',
            }}
          >
            <Podium entries={podium} />
          </div>

          <SectionHeading icon={<Award size={14} />} label="Полный рейтинг" />
          <ul
            className={styles.leaderList}
            style={{ listStyle: 'none', padding: 0, margin: 0 }}
          >
            {ratingList.map((r) => {
              const rankCls =
                r.place === 1
                  ? styles.top1
                  : r.place === 2
                    ? styles.top2
                    : r.place === 3
                      ? styles.top3
                      : '';
              const tierCls =
                r.place === 1
                  ? styles.rowGold
                  : r.place === 2
                    ? styles.rowSilver
                    : r.place === 3
                      ? styles.rowBronze
                      : '';
              const ch = r.change ?? 0;
              const chCls = ch > 0 ? '' : ch === 0 ? styles.zero : styles.down;
              const medal =
                r.place === 1 ? '🥇' : r.place === 2 ? '🥈' : r.place === 3 ? '🥉' : '';
              return (
                <li
                  key={r.id}
                  className={`${styles.row} ${tierCls} ${r.isMe ? styles.me : ''}`}
                >
                  <span className={`${styles.rank} ${rankCls}`}>
                    {medal || r.place}
                  </span>
                  <span className={styles.avatar}>{initials(r.fullName)}</span>
                  <span className={styles.rowName}>
                    {r.place === 1 ? (
                      <span className={styles.crownInline} aria-hidden>
                        👑
                      </span>
                    ) : null}
                    {r.fullName}
                    {r.isMe ? ' · ВЫ' : ''}
                  </span>
                  <span className={styles.score}>{r.score}%</span>
                  <span className={`${styles.change} ${chCls}`}>
                    {ch > 0 ? `▲${ch}` : ch === 0 ? '—' : `▼${Math.abs(ch)}`}
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <>
          <SectionHeading icon={<List size={14} />} label="Последние оценки" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {grades.map((g) => {
              const { day, month } = formatDay(g.date);
              const scoreCls = g.scorePercent >= 90 ? styles.high : g.scorePercent >= 70 ? styles.mid : styles.low;
              return (
                <div key={g.id} className={styles.gradeItem}>
                  <div className={styles.gradeDate}>
                    <strong>{day}</strong>
                    <span>{month}</span>
                  </div>
                  <div className={styles.gradeBody}>
                    <div className={styles.gradeType}>
                      {LESSON_TYPE_LABEL[g.lessonType] ?? g.lessonType}
                    </div>
                    <div className={styles.gradeComment}>
                      {g.comment || `${g.score} из ${g.maxScore}`}
                    </div>
                  </div>
                  <div className={`${styles.gradeScore} ${scoreCls}`}>
                    {g.scorePercent}%
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
