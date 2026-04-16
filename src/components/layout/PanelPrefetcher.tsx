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
      void queryClient.prefetchQuery({
        queryKey: ['student-profile'],
        queryFn: () => api.get('/students/me').then((response) => response.data),
        staleTime: PROFILE_STALE_TIME,
      });
      void queryClient.prefetchQuery({
        queryKey: ['student-homework-latest'],
        queryFn: () => api.get('/homework/my/latest').then((response) => response.data),
        staleTime: ACADEMIC_STALE_TIME,
      });
      void queryClient.prefetchQuery({
        queryKey: ['student-schedule'],
        queryFn: () => api.get('/schedule/my').then((response) => response.data),
        staleTime: SCHEDULE_STALE_TIME,
      });
      return;
    }

    if (variant === 'parent') {
      void queryClient.prefetchQuery({
        queryKey: ['parent-profile'],
        queryFn: () => api.get('/parents/me').then((response) => response.data),
        staleTime: PROFILE_STALE_TIME,
      });
      void queryClient.prefetchQuery({
        queryKey: ['parent-child-payment'],
        queryFn: () => api.get('/parents/me/child/payments').then((response) => response.data),
        staleTime: ACADEMIC_STALE_TIME,
      });
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

