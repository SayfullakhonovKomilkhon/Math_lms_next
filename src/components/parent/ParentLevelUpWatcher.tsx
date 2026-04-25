'use client';

import { useEffect, useState } from 'react';
import { useParentProfile, useSelectedChild } from '@/hooks/useParentProfile';
import { useChildProgress } from '@/app/student/_lib/useStudentProgress';
import {
  LevelUpCelebration,
  type LevelUpInput,
} from '@/app/student/_components/LevelUpCelebration';

const LEVEL_STORAGE_PREFIX = 'mc:parent:lastSeenLevel:';

/**
 * Watches the currently selected child's level across the parent panel and
 * fires the same level-up celebration the student would see when they
 * actually level up. Per-child localStorage prevents replaying old levels
 * and supports families with multiple children.
 */
export function ParentLevelUpWatcher() {
  const { data: profile } = useParentProfile();
  const { selectedId } = useSelectedChild(profile);
  const progress = useChildProgress(selectedId);

  const [levelUp, setLevelUp] = useState<LevelUpInput | null>(null);

  useEffect(() => {
    if (!selectedId || !progress.level || progress.student.id === '') return;
    const key = LEVEL_STORAGE_PREFIX + selectedId;
    const stored = (() => {
      try {
        const raw = window.localStorage.getItem(key);
        return raw ? Number(raw) : null;
      } catch {
        return null;
      }
    })();

    // First load for this child — just snapshot, don't replay.
    if (stored === null) {
      try {
        window.localStorage.setItem(key, String(progress.level));
      } catch {
        // ignore
      }
      return;
    }

    if (progress.level > stored) {
      setLevelUp({
        level: progress.level,
        title: progress.title,
        titleEmoji: progress.titleEmoji,
      });
      try {
        window.localStorage.setItem(key, String(progress.level));
      } catch {
        // ignore
      }
    }
  }, [
    selectedId,
    progress.level,
    progress.title,
    progress.titleEmoji,
    progress.student.id,
  ]);

  return <LevelUpCelebration input={levelUp} onClose={() => setLevelUp(null)} />;
}
