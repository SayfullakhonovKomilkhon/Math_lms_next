'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  ACADEMIC_STALE_TIME,
  ANALYTICS_STALE_TIME,
  PROFILE_STALE_TIME,
  SCHEDULE_STALE_TIME,
} from '@/lib/query-options';

type PanelPrefetchVariant = 'admin' | 'teacher' | 'student' | 'parent' | 'superadmin';

export function PanelPrefetcher({ variant }: { variant: PanelPrefetchVariant }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (variant === 'teacher') {
      void queryClient.prefetchQuery({
        queryKey: ['teacher-groups'],
        queryFn: () => api.get('/groups').then((response) => response.data.data),
        staleTime: ACADEMIC_STALE_TIME,
      });
      return;
    }

    if (variant === 'student') {
      // Match the unwrapping used in the actual page hooks (`r.data.data`),
      // otherwise the cache holds an `ApiResponse` wrapper here while pages
      // expect the inner payload, and the dashboard renders empty until a
      // real fetch overwrites the cache.
      void queryClient.prefetchQuery({
        queryKey: ['student-profile'],
        queryFn: () =>
          api.get('/students/me').then((response) => response.data?.data ?? response.data),
        staleTime: PROFILE_STALE_TIME,
      });
      void queryClient.prefetchQuery({
        queryKey: ['student-homework-latest'],
        queryFn: () =>
          api.get('/homework/my/latest').then((response) => response.data?.data ?? null),
        staleTime: ACADEMIC_STALE_TIME,
      });
      void queryClient.prefetchQuery({
        queryKey: ['student-schedule'],
        queryFn: () =>
          api.get('/schedule/my').then((response) => response.data?.data ?? null),
        staleTime: SCHEDULE_STALE_TIME,
      });
      return;
    }

    if (variant === 'parent') {
      // IMPORTANT: keep the cache shape identical to `useParentProfile`,
      // otherwise the dashboard sees `{success, data: {...}}` here and
      // `ParentProfile` from the hook, which makes `profile.children`
      // undefined on first paint and forces the user to navigate away
      // and back before real data shows up.
      void queryClient.prefetchQuery({
        queryKey: ['parent-profile'],
        queryFn: () =>
          api.get('/parents/me').then((response) => response.data?.data ?? response.data),
        staleTime: PROFILE_STALE_TIME,
      });
      // child-payment query is keyed by `['parent-child-payment', selectedId]`,
      // so this shape-less prefetch never matches the real key. We just
      // warm the HTTP layer so the next request is faster.
      void api.get('/parents/me/child/payments').catch(() => {});
      return;
    }

    if (variant === 'admin') {
      void queryClient.prefetchQuery({
        queryKey: ['students'],
        queryFn: () => api.get('/students').then((response) => response.data.data),
        staleTime: ACADEMIC_STALE_TIME,
      });
      return;
    }

    void queryClient.prefetchQuery({
      queryKey: ['sa-overview'],
      queryFn: () => api.get('/analytics/overview').then((response) => response.data.data),
      staleTime: ANALYTICS_STALE_TIME,
    });
  }, [queryClient, variant]);

  return null;
}

