'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Award, Sparkles, Trophy, Users } from 'lucide-react';
import api from '@/lib/api';
import { useParentProfile, useSelectedChild } from '@/hooks/useParentProfile';
import { useChildAchievements } from '@/hooks/useChildAchievements';
import { ChildSelector } from '@/components/parent/ChildSelector';
import { CardSkeleton, ProfileSkeleton } from '@/components/ui/Skeleton';

import { PageTitle } from '@/app/student/_components/PageTitle';
import { SectionHeading } from '@/app/student/_components/Card';
import { ChampionBanner } from '@/app/student/_components/ChampionBanner';
import {
  MonthAchievementGrid,
  type MonthMedal,
} from '@/app/student/_components/MonthAchievementCard';
import { Podium, type PodiumEntry } from '@/app/student/_components/Podium';
import {
  SpecialAchievementCard,
  type SpecialState,
} from '@/app/student/_components/SpecialAchievementCard';
import {
  AchievementDetailModal,
  type AchievementDetail,
} from '@/app/student/_components/AchievementDetailModal';
import {
  AchievementCelebration,
  type CelebrationInput,
} from '@/app/student/_components/AchievementCelebration';
import { deriveChampionship } from '@/app/student/_lib/useChampionship';

// Load the student panel's design tokens (CSS variables prefixed with --s-*)
// so the achievement components reuse the exact look-and-feel from the
// student panel. The vars are scoped to .studentApp via this stylesheet.
import '@/app/student/_theme/theme.css';
import styles from '@/app/student/achievements/achievements.module.css';

// Persist which medal keys we've already celebrated for so we don't fire the
// animation again on every reload. Scoped per child id to support parents
// with multiple children.
const SEEN_STORAGE_PREFIX = 'mc:parent:seenAchievements:';

function readSeen(childId: string): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(SEEN_STORAGE_PREFIX + childId);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function writeSeen(childId: string, set: Set<string>) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      SEEN_STORAGE_PREFIX + childId,
      JSON.stringify(Array.from(set)),
    );
  } catch {
    // ignore
  }
}

function medalKey(m: MonthMedal): string | null {
  if (!m.unlocked || !m.place) return null;
  return `${m.year ?? new Date().getFullYear()}-${m.month}-${m.place}`;
}

export default function ParentAchievementsPage() {
  const { data: profile, isLoading: profileLoading } = useParentProfile();
  const { children, selected, selectedId, select } = useSelectedChild(profile);
  const childId = selectedId;

  const {
    medals,
    specials,
    studentName: apiName,
    groupName: apiGroup,
    goldCount,
    silverCount,
    bronzeCount,
    loading: achievementsLoading,
  } = useChildAchievements(childId);

  // Group rating (top-3 podium) — same data shape as the student panel.
  const { data: ratingRes } = useQuery<{
    rating: Array<{
      studentId: string;
      fullName: string;
      totalPoints?: number;
      totalMax?: number;
      place?: number;
    }>;
  } | null>({
    queryKey: ['parent-child-rating', childId, 'month'],
    queryFn: () =>
      api
        .get(`/parents/me/child/rating?period=month&studentId=${childId}`)
        .then((r) => r.data?.data ?? null),
    enabled: !!childId,
    staleTime: 1000 * 60 * 5,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 0,
  });

  // Map ParentChild's MALE/FEMALE to the student catalog's male/female.
  const gender: 'male' | 'female' = selected?.gender === 'FEMALE' ? 'female' : 'male';
  const studentName = apiName ?? selected?.fullName ?? 'Ребёнок';
  const studentGroup = apiGroup ?? selected?.group?.name ?? undefined;
  const champion = deriveChampionship(medals, gender);

  const podiumEntries: PodiumEntry[] = (ratingRes?.rating ?? [])
    .slice(0, 3)
    .map((r, i) => ({
      id: r.studentId,
      fullName: r.fullName,
      score: Math.round(r.totalPoints ?? 0),
      maxScore: Math.round(r.totalMax ?? 0),
      place: (r.place ?? i + 1) as 1 | 2 | 3,
      isMe: r.studentId === childId,
    }));

  const [detail, setDetail] = useState<AchievementDetail | null>(null);
  const [celebrate, setCelebrate] = useState<CelebrationInput | null>(null);
  const celebrateQueueRef = useRef<CelebrationInput[]>([]);

  // Build a stable signature of the unlocked medals so the celebration
  // detection effect only re-runs when the actual data changes (and not on
  // every render where `useChildAchievements` returns a fresh array).
  const medalsSignature = medals
    .filter((m) => m.unlocked && m.place)
    .map((m) => medalKey(m))
    .filter(Boolean)
    .sort()
    .join('|');

  // Detect newly unlocked monthly medals and queue celebration animations.
  // We only fire on transitions ("not seen yet"), so refreshing the page
  // does not replay every old medal.
  useEffect(() => {
    if (!childId) return;
    const seen = readSeen(childId);
    const previouslyHadCache = seen.size > 0;
    const newlyUnlocked: CelebrationInput[] = [];

    for (const m of medals) {
      const key = medalKey(m);
      if (!key) continue;
      if (!seen.has(key)) {
        newlyUnlocked.push({ month: m.month, place: m.place as 1 | 2 | 3 });
        seen.add(key);
      }
    }

    if (newlyUnlocked.length === 0) return;
    writeSeen(childId, seen);

    // On the very first load for this child we just snapshot what's already
    // unlocked without replaying a parade. From the next refresh onward,
    // any newly unlocked medal triggers the same celebration the student
    // sees in their own panel.
    if (!previouslyHadCache) return;

    celebrateQueueRef.current.push(...newlyUnlocked);
    setCelebrate((current) => current ?? celebrateQueueRef.current.shift() ?? null);
    // medals is intentionally excluded — the signature already captures
    // changes in unlocked medals and keeps this effect stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId, medalsSignature]);

  const handleCelebrationClose = () => {
    setCelebrate(null);
    // Drain any queued celebrations one by one.
    setTimeout(() => {
      const next = celebrateQueueRef.current.shift();
      if (next) setCelebrate(next);
    }, 120);
  };

  // Manual trigger via `?celebrate=1|2|3` so the celebration can be previewed
  // for the currently selected child without having to grant a real medal.
  // Fires once per visit and then strips the param from the URL.
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

  const isLoading = profileLoading || (!!childId && achievementsLoading && !medals.some((m) => m.unlocked));

  // Empty state — no children linked yet.
  if (!profileLoading && (!profile || (profile.children?.length ?? 0) === 0)) {
    return (
      <div className="space-y-5">
        <ChildSelector children={children} selectedId={selectedId} onSelect={select} />
        <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white py-16 text-center">
          <Trophy className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="font-medium text-slate-500">Ребёнок ещё не привязан</p>
        </div>
      </div>
    );
  }

  // Loading skeleton while we don't have any cached data yet.
  if (isLoading && !apiName) {
    return (
      <div className="space-y-5">
        <ChildSelector children={children} selectedId={selectedId} onSelect={select} />
        <ProfileSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <ChildSelector children={children} selectedId={selectedId} onSelect={select} />

      {/* Wrap the whole page in `.studentApp` so the achievement design tokens
          (--s-* CSS variables) and shared keyframes apply identically to the
          student panel. */}
      <div className="studentApp">
        <PageTitle
          kicker="Достижения ребёнка"
          title="Путь побед"
          description="Каждая медаль — это его новые усилия и ваша гордость."
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

        <PodiumSection entries={podiumEntries} />

        <div className={styles.section}>
          <SectionHeading icon={<Award size={14} />} label="Медали по месяцам" />
          <MonthAchievementGrid
            medals={medals}
            gender={gender}
            onSelect={openMedalDetail}
          />
          <p className={styles.hint}>
            Нажмите на карточку, чтобы увидеть подробности и поделиться победой.
          </p>
        </div>

        <div className={styles.section}>
          <SectionHeading icon={<Sparkles size={14} />} label="Особые достижения" />
          <div className={styles.specialGrid}>
            {specials.map((s) => (
              <SpecialAchievementCard
                key={s.key}
                state={s}
                gender={gender}
                onSelect={openSpecial}
              />
            ))}
          </div>
        </div>

        <AchievementDetailModal
          detail={detail}
          gender={gender}
          groupName={studentGroup}
          onClose={() => setDetail(null)}
        />

        <AchievementCelebration
          input={celebrate}
          gender={gender}
          onClose={handleCelebrationClose}
        />
      </div>
    </div>
  );
}

function PodiumSection({ entries }: { entries: PodiumEntry[] }) {
  return (
    <div className={styles.section}>
      <SectionHeading
        icon={<Users size={14} />}
        label="Топ-3 группы"
      />
      <div className={styles.podiumWrap}>
        <h3>
          <Trophy size={16} style={{ color: '#f5b544' }} /> Подиум месяца
        </h3>
        {entries.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--s-text-secondary)', padding: 20 }}>
            Подиум ещё не сформирован
          </p>
        ) : (
          <Podium entries={entries} />
        )}
      </div>
    </div>
  );
}

