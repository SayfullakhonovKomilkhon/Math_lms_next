'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useStudentSummary } from '../_lib/useStudentSummary';
import { useMyAchievements } from '../_lib/useMyAchievements';
import { useStudentProgress } from '../_lib/useStudentProgress';
import { deriveChampionship } from '../_lib/useChampionship';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { SideDock } from './SideDock';
import { ParticleField } from './ParticleField';
import { PullToRefresh } from './PullToRefresh';
import { SwipeNavigator } from './SwipeNavigator';
import { SplashScreen } from './SplashScreen';
import { LevelUpCelebration, type LevelUpInput } from './LevelUpCelebration';
import styles from './StudentShell.module.css';

type NotifCountResponse = { data: { unread: number } };

const LEVEL_STORAGE_KEY = 'mc:student:lastSeenLevel';

export function StudentShell({ children }: { children: React.ReactNode }) {
  const { summary } = useStudentSummary();
  const { medals } = useMyAchievements();
  const progress = useStudentProgress();
  const champion = deriveChampionship(medals, summary.gender);

  // Detect a real level-up: compare the freshly polled level against the
  // last value persisted in localStorage. The first ever load just snapshots
  // the current level so we don't replay celebrations for old levels.
  const [levelUp, setLevelUp] = useState<LevelUpInput | null>(null);
  const lastLevelRef = useRef<number | null>(null);

  useEffect(() => {
    if (!progress.level || progress.student.id === '') return;
    const stored = (() => {
      try {
        const raw = window.localStorage.getItem(LEVEL_STORAGE_KEY);
        return raw ? Number(raw) : null;
      } catch {
        return null;
      }
    })();

    if (lastLevelRef.current === null) {
      lastLevelRef.current = stored ?? progress.level;
      if (stored === null) {
        try {
          window.localStorage.setItem(LEVEL_STORAGE_KEY, String(progress.level));
        } catch {
          // ignore
        }
      }
    }

    if (lastLevelRef.current !== null && progress.level > lastLevelRef.current) {
      setLevelUp({
        level: progress.level,
        title: progress.title,
        titleEmoji: progress.titleEmoji,
      });
      lastLevelRef.current = progress.level;
      try {
        window.localStorage.setItem(LEVEL_STORAGE_KEY, String(progress.level));
      } catch {
        // ignore
      }
    }
  }, [progress.level, progress.title, progress.titleEmoji, progress.student.id]);
  const { data: unreadData } = useQuery<NotifCountResponse>({
    queryKey: ['notif-count'],
    queryFn: () => api.get('/notifications/unread-count').then((r) => r.data),
    refetchInterval: 60_000,
    retry: 0,
  });
  const unread = unreadData?.data?.unread ?? 0;

  return (
    <div className={`studentApp ${styles.root}`}>
      <div className={styles.bgLayer} aria-hidden />
      <div className={styles.bgParticles} aria-hidden>
        <ParticleField />
      </div>

      <SideDock
        unreadCount={unread}
        champion={champion.isChampion}
        studentName={summary.fullName}
        studentInitials={summary.initials}
        studentGroup={summary.groupName}
        championTitle={champion.title?.title}
      />

      <div className={styles.mainCol} id="student-scroll-root">
        <TopBar
          firstName={summary.firstName}
          initials={summary.initials}
          unreadCount={unread}
          streak={summary.streak}
          champion={champion.isChampion}
        />
        <SwipeNavigator>
          <PullToRefresh>
            <div className={`${styles.canvasWrap} ${styles.pageEnter}`}>{children}</div>
          </PullToRefresh>
        </SwipeNavigator>
      </div>

      <BottomNav
        badges={{
          '/student/homework': 0,
          '/student/achievements': 0,
        }}
      />

      <SplashScreen />

      <LevelUpCelebration input={levelUp} onClose={() => setLevelUp(null)} />
    </div>
  );
}
