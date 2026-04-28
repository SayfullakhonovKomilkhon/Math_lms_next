'use client';

import { useEffect, useState } from 'react';
import { useTelegramStatus } from '@/hooks/useTelegramLink';
import { useAuthStore } from '@/store/auth.store';
import { TelegramLinkModal } from './TelegramLinkModal';

const STORAGE_KEY = 'tgLinkDismissedUntil';
// "Remind later" hides the prompt for 7 days.
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;
// Small delay so the modal doesn't pop the moment the dashboard paints.
const OPEN_DELAY_MS = 800;

/**
 * Auto-shows the Telegram-link modal once per session for users who haven't
 * connected their account yet. Honours a 7-day "remind later" snooze stored
 * in localStorage. Manual openings via the settings page bypass this.
 */
export function TelegramLinkPrompt() {
  const { user, isAuthenticated } = useAuthStore();
  const { data: status, isLoading } = useTelegramStatus(isAuthenticated);
  const [open, setOpen] = useState(false);
  const [decided, setDecided] = useState(false);

  useEffect(() => {
    if (decided) return;
    if (!isAuthenticated || !user) return;
    if (isLoading) return;
    if (status?.linked) {
      setDecided(true);
      return;
    }

    let cancelled = false;
    const dismissedUntil = Number(
      typeof window !== 'undefined'
        ? localStorage.getItem(STORAGE_KEY) ?? '0'
        : '0',
    );
    if (Date.now() < dismissedUntil) {
      setDecided(true);
      return;
    }

    const t = setTimeout(() => {
      if (!cancelled) {
        setOpen(true);
        setDecided(true);
      }
    }, OPEN_DELAY_MS);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [decided, isAuthenticated, isLoading, status?.linked, user]);

  const handleClose = () => setOpen(false);
  const handleRemindLater = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, String(Date.now() + SNOOZE_MS));
    }
    setOpen(false);
  };

  return (
    <TelegramLinkModal
      open={open}
      onClose={handleClose}
      onRemindLater={handleRemindLater}
    />
  );
}
