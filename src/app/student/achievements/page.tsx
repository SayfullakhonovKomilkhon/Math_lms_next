'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Award, Sparkles, Trophy, Users } from 'lucide-react';
import api from '@/lib/api';
import { PageTitle } from '../_components/PageTitle';
import { SectionHeading } from '../_components/Card';
import {
  HexMedalGrid,
  type HexMedal,
} from '../_components/HexMedalGrid';
import { Podium, type PodiumEntry } from '../_components/Podium';
import {
  SpecialAchievementCard,
  type SpecialAchievement,
} from '../_components/SpecialAchievementCard';
import { AchievementUnlockModal } from '../_components/AchievementUnlockModal';
import { SButton } from '../_components/SButton';
import { useStudentSummary } from '../_lib/useStudentSummary';
import {
  mockLeaderboard,
  mockMonthGrid,
  mockSpecials,
  mockStats,
} from '../_lib/mockData';
import styles from './achievements.module.css';

interface AchievementsData {
  student?: { id: string; fullName: string; groupName: string | null };
  monthGrid?: HexMedal[];
  specialAchievements?: SpecialAchievement[];
  stats?: {
    goldCount: number;
    silverCount: number;
    bronzeCount: number;
    totalAchievements: number;
  };
}

type UnlockDetail = {
  icon: string;
  title: string;
  description?: string;
  label?: string;
};

export default function StudentAchievementsPage() {
  const { summary } = useStudentSummary();
  const { data } = useQuery<AchievementsData | null>({
    queryKey: ['my-achievements'],
    queryFn: () => api.get('/achievements/my').then((r) => r.data.data ?? null),
    staleTime: 1000 * 60 * 10,
    retry: 0,
  });

  const [unlockOpen, setUnlockOpen] = useState(false);
  const [detail, setDetail] = useState<UnlockDetail | null>(null);

  const medals: HexMedal[] = data?.monthGrid?.length ? data.monthGrid : mockMonthGrid;
  const specials: SpecialAchievement[] =
    data?.specialAchievements?.length ? data.specialAchievements : mockSpecials;
  const stats =
    data?.stats ?? {
      goldCount: mockStats.goldCount,
      silverCount: mockStats.silverCount,
      bronzeCount: mockStats.bronzeCount,
      totalAchievements:
        mockStats.goldCount + mockStats.silverCount + mockStats.bronzeCount,
    };

  const podiumEntries: PodiumEntry[] = mockLeaderboard.slice(0, 3).map((m) => ({
    id: m.id,
    fullName: m.fullName,
    score: m.score,
    place: m.place as 1 | 2 | 3,
    isMe: m.isMe,
  }));

  const studentName = data?.student?.fullName ?? summary.fullName;
  const studentGroup = data?.student?.groupName ?? summary.groupName;

  const openMedalDetail = (m: HexMedal) => {
    if (!m.unlocked) {
      setDetail({
        icon: '🔒',
        title: `${m.monthName} — закрыто`,
        description: 'Попади в топ-3 группы в этом месяце, чтобы получить медаль.',
        label: 'Достижение заблокировано',
      });
    } else {
      setDetail({
        icon: m.icon ?? '🏅',
        title: m.title ?? 'Достижение',
        description: m.description ?? 'Отличная работа! Так держать!',
        label: m.monthName,
      });
    }
    setUnlockOpen(true);
  };

  const openSpecial = (s: SpecialAchievement) => {
    setDetail({
      icon: s.icon,
      title: s.unlocked ? s.title : `${s.title} — закрыто`,
      description: s.unlocked ? s.description : s.condition,
      label: s.unlocked ? 'Особое достижение' : 'Цель впереди',
    });
    setUnlockOpen(true);
  };

  const triggerDemoUnlock = () => {
    setDetail({
      icon: '🏆',
      title: 'Умный боец',
      description: 'Отличная серия! Ты на пути к следующему уровню.',
      label: 'Новое достижение',
    });
    setUnlockOpen(true);
  };

  return (
    <div>
      <PageTitle
        kicker="Награды"
        title="Твой путь"
        description="Каждая медаль — доказательство твоих усилий."
        gradient
      />

      <section className={styles.hero}>
        <div className={styles.heroIcon}>🏅</div>
        <div className={styles.heroText}>
          <div className={styles.heroName}>{studentName}</div>
          <div className={styles.heroGroup}>{studentGroup ?? '—'}</div>
          <div className={styles.medalsRow}>
            <span className={styles.medalStat}>
              🥇 {stats.goldCount} <small>золото</small>
            </span>
            <span className={styles.medalStat}>
              🥈 {stats.silverCount} <small>серебро</small>
            </span>
            <span className={styles.medalStat}>
              🥉 {stats.bronzeCount} <small>бронза</small>
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
          <Podium entries={podiumEntries} />
        </div>
      </div>

      <div className={styles.section}>
        <SectionHeading icon={<Award size={14} />} label="Медали по месяцам" />
        <HexMedalGrid medals={medals} onSelect={openMedalDetail} />
        <p className={styles.hint}>
          Нажми на медаль, чтобы узнать подробнее. Удерживай на телефоне, чтобы открыть детали.
        </p>
      </div>

      <div className={styles.section}>
        <SectionHeading icon={<Sparkles size={14} />} label="Особые достижения" />
        <div className={styles.specialGrid}>
          {specials.map((s) => (
            <SpecialAchievementCard key={s.key} achievement={s} onClick={openSpecial} />
          ))}
        </div>
        <div className={styles.demoBtn}>
          <SButton variant="gold" onClick={triggerDemoUnlock}>
            ✨ Посмотреть анимацию получения
          </SButton>
        </div>
      </div>

      <AchievementUnlockModal
        open={unlockOpen}
        detail={detail}
        onClose={() => setUnlockOpen(false)}
      />
    </div>
  );
}
