'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Award, Sparkles, Trophy, Users } from 'lucide-react';
import { PageTitle } from '../_components/PageTitle';
import { SectionHeading } from '../_components/Card';
import { ChampionBanner } from '../_components/ChampionBanner';
import {
  MonthAchievementGrid,
  type MonthMedal,
} from '../_components/MonthAchievementCard';
import { Podium, type PodiumEntry } from '../_components/Podium';
import {
  SpecialAchievementCard,
  type SpecialState,
} from '../_components/SpecialAchievementCard';
import {
  AchievementDetailModal,
  type AchievementDetail,
} from '../_components/AchievementDetailModal';
import {
  AchievementCelebration,
  type CelebrationInput,
} from '../_components/AchievementCelebration';
import { useStudentSummary } from '../_lib/useStudentSummary';
import { useMyAchievements } from '../_lib/useMyAchievements';
import { deriveChampionship } from '../_lib/useChampionship';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { ApiResponse, MyRating } from '@/types';
import styles from './achievements.module.css';

export default function StudentAchievementsPage() {
  const { summary } = useStudentSummary();
  const { medals, specials, studentName: apiName, groupName: apiGroup } =
    useMyAchievements();

  const studentName = apiName ?? summary.fullName;
  const studentGroup = apiGroup ?? summary.groupName;
  const champion = deriveChampionship(medals, summary.gender);

  const [detail, setDetail] = useState<AchievementDetail | null>(null);
  const [celebrate, setCelebrate] = useState<CelebrationInput | null>(null);

  // Manual trigger via `?celebrate=1|2|3` so the celebration can be previewed
  // (e.g. for a demo, screenshot, or QA) without having to grant a real
  // achievement in the database. Fires once per visit, then strips the param
  // from the URL so a refresh doesn't replay it endlessly.
  const searchParams = useSearchParams();
  useEffect(() => {
    const raw = searchParams.get('celebrate');
    if (!raw) return;
    const place = Number(raw);
    if (place !== 1 && place !== 2 && place !== 3) return;
    const month = new Date().getMonth() + 1;
    setCelebrate({ month, place: place as 1 | 2 | 3 });
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('celebrate');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams]);

  const { data: ratingRes } = useQuery({
    queryKey: ['student-rating', 'month'],
    queryFn: () =>
      api.get<ApiResponse<MyRating>>(`/grades/my/rating?period=month`).then((r) => r.data.data),
    retry: 0,
  });

  const podiumEntries: PodiumEntry[] = (ratingRes?.rating ?? []).slice(0, 3).map((r, i) => ({
    id: r.studentId,
    fullName: r.fullName,
    score: Math.round(r.totalPoints ?? 0),
    maxScore: Math.round(r.totalMax ?? 0),
    place: (r.place ?? i + 1) as 1 | 2 | 3,
    isMe: false,
  }));

  const goldCount = medals.filter((m) => m.unlocked && m.place === 1).length;
  const silverCount = medals.filter((m) => m.unlocked && m.place === 2).length;
  const bronzeCount = medals.filter((m) => m.unlocked && m.place === 3).length;

  const openMedalDetail = (m: MonthMedal) => {
    if (!m.unlocked || !m.place) return;
    setDetail({
      kind: 'monthly',
      month: m.month,
      place: m.place,
      unlockedAt: m.unlockedAt,
      year: m.year,
    });
  };

  const openSpecial = (s: SpecialState) => {
    if (!s.unlocked) return;
    setDetail({
      kind: 'special',
      key: s.key,
      unlockedAt: s.unlockedAt,
    });
  };

  return (
    <div>
      <PageTitle
        kicker="Награды"
        title="Твой путь"
        description="Каждая медаль — доказательство твоих усилий."
        gradient
      />

      {champion.isChampion ? (
        <div style={{ marginBottom: 18 }}>
          <ChampionBanner state={champion} />
        </div>
      ) : null}

      <section className={styles.hero}>
        <div className={styles.heroIcon}>🏅</div>
        <div className={styles.heroText}>
          <div className={styles.heroName}>{studentName}</div>
          <div className={styles.heroGroup}>{studentGroup ?? '—'}</div>
          <div className={styles.medalsRow}>
            <span className={styles.medalStat}>
              🥇 {goldCount} <small>золото</small>
            </span>
            <span className={styles.medalStat}>
              🥈 {silverCount} <small>серебро</small>
            </span>
            <span className={styles.medalStat}>
              🥉 {bronzeCount} <small>бронза</small>
            </span>
          </div>
        </div>
      </section>

      <div className={styles.section}>
        <SectionHeading
          icon={<Users size={14} />}
          label="Топ-3 группы"
          linkLabel="рейтинг"
          href="/student/grades"
        />
        <div className={styles.podiumWrap}>
          <h3>
            <Trophy size={16} style={{ color: '#f5b544' }} /> Подиум месяца
          </h3>
          {podiumEntries.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--s-text-secondary)', padding: 20 }}>
              Подиум ещё не сформирован
            </p>
          ) : (
            <Podium entries={podiumEntries} />
          )}
        </div>
      </div>

      <div className={styles.section}>
        <SectionHeading icon={<Award size={14} />} label="Медали по месяцам" />
        <MonthAchievementGrid
          medals={medals}
          gender={summary.gender}
          onSelect={openMedalDetail}
        />
        <p className={styles.hint}>
          Нажми на карточку, чтобы увидеть подробности и поделиться победой.
        </p>
      </div>

      <div className={styles.section}>
        <SectionHeading icon={<Sparkles size={14} />} label="Особые достижения" />
        <div className={styles.specialGrid}>
          {specials.map((s) => (
            <SpecialAchievementCard
              key={s.key}
              state={s}
              gender={summary.gender}
              onSelect={openSpecial}
            />
          ))}
        </div>
      </div>

      <AchievementDetailModal
        detail={detail}
        gender={summary.gender}
        groupName={studentGroup}
        onClose={() => setDetail(null)}
      />

      <AchievementCelebration
        input={celebrate}
        gender={summary.gender}
        onClose={() => setCelebrate(null)}
      />
    </div>
  );
}
