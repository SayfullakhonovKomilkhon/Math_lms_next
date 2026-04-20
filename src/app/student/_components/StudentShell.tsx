'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useStudentSummary } from '../_lib/useStudentSummary';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { SideDock } from './SideDock';
import { ParticleField } from './ParticleField';
import { PullToRefresh } from './PullToRefresh';
import { SwipeNavigator } from './SwipeNavigator';
import { SplashScreen } from './SplashScreen';
import styles from './StudentShell.module.css';

type NotifCountResponse = { data: { unread: number } };

export function StudentShell({ children }: { children: React.ReactNode }) {
  const { summary } = useStudentSummary();
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

      <SideDock unreadCount={unread} />

      <div className={styles.mainCol} id="student-scroll-root">
        <TopBar
          firstName={summary.firstName}
          initials={summary.initials}
          unreadCount={unread}
          streak={summary.streak}
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
    </div>
  );
}
