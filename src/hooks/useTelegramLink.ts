'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface TelegramCode {
  code: string;
  botUsername: string;
}

interface StatusResponse {
  linked: boolean;
}

export function useTelegramStatus(enabled = true) {
  return useQuery({
    queryKey: ['telegram-status'],
    queryFn: () => api.get('/telegram/status').then((r) => r.data.data as StatusResponse),
    enabled,
    staleTime: 30_000,
  });
}

interface UseTelegramLinkOptions {
  onLinked?: () => void;
}

/**
 * Drives the one-click Telegram linking flow:
 * 1. Generate a one-time code on the server.
 * 2. Open `t.me/<botUsername>?start=<code>` so the bot links the chatId itself.
 * 3. Poll `/telegram/status` until `linked === true` (or the user cancels).
 */
export function useTelegramLink({ onLinked }: UseTelegramLinkOptions = {}) {
  const qc = useQueryClient();
  const [code, setCode] = useState<TelegramCode | null>(null);
  const [polling, setPolling] = useState(false);
  const [linked, setLinked] = useState(false);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanup = useCallback(() => {
    if (pollTimer.current) clearInterval(pollTimer.current);
    if (stopTimer.current) clearTimeout(stopTimer.current);
    pollTimer.current = null;
    stopTimer.current = null;
  }, []);

  const stopPolling = useCallback(() => {
    cleanup();
    setPolling(false);
  }, [cleanup]);

  const reset = useCallback(() => {
    cleanup();
    setCode(null);
    setPolling(false);
    setLinked(false);
  }, [cleanup]);

  useEffect(() => () => cleanup(), [cleanup]);

  const startPolling = useCallback(() => {
    setPolling(true);
    // Poll every 2 seconds for up to 5 minutes.
    pollTimer.current = setInterval(async () => {
      try {
        const r = await api.get('/telegram/status');
        const ok = Boolean(r.data?.data?.linked);
        if (ok) {
          cleanup();
          setLinked(true);
          setPolling(false);
          qc.invalidateQueries({ queryKey: ['telegram-status'] });
          qc.invalidateQueries({ queryKey: ['auth-user'] });
          onLinked?.();
        }
      } catch {
        // ignore transient errors and keep trying
      }
    }, 2000);

    stopTimer.current = setTimeout(() => {
      stopPolling();
    }, 5 * 60 * 1000);
  }, [cleanup, onLinked, qc, stopPolling]);

  const generate = useMutation({
    mutationFn: () =>
      api
        .post('/telegram/generate-code')
        .then((r) => r.data.data as TelegramCode),
    onSuccess: (data) => {
      setCode(data);
      setLinked(false);
      const url = `https://t.me/${data.botUsername}?start=${data.code}`;
      // `noopener` keeps the original tab safe; `_blank` lets desktop browsers
      // hand the URL to the Telegram Desktop app via the `tg://` handler.
      if (typeof window !== 'undefined') {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
      startPolling();
    },
  });

  const deepLink = code
    ? `https://t.me/${code.botUsername}?start=${code.code}`
    : null;

  return {
    code,
    deepLink,
    linked,
    polling,
    isGenerating: generate.isPending,
    generateAndOpen: () => generate.mutate(),
    stopPolling,
    reset,
  };
}
