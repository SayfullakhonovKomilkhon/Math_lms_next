'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from '@/components/ui/toast';
import type {
  Announcement,
  AnnouncementsResponse,
  ApiResponse,
  CreateAnnouncementPayload,
} from '@/types';

export interface AnnouncementsListParams {
  page?: number;
  limit?: number;
  groupId?: string;
}

const KEYS = {
  root: ['announcements'] as const,
  my: (params?: AnnouncementsListParams) =>
    ['announcements', 'my', params ?? {}] as const,
  all: (params?: AnnouncementsListParams) =>
    ['announcements', 'all', params ?? {}] as const,
  unread: ['announcements', 'unread-count'] as const,
};

// NOTE: бэкенд оборачивает все ответы через ResponseInterceptor
// в { data, statusCode, timestamp }. Поэтому сам полезный payload
// лежит в r.data.data.

export function useMyAnnouncements(params?: AnnouncementsListParams) {
  return useQuery<AnnouncementsResponse>({
    queryKey: KEYS.my(params),
    queryFn: () =>
      api
        .get<ApiResponse<AnnouncementsResponse>>('/announcements/my', { params })
        .then((r) => r.data.data),
    staleTime: 30_000,
  });
}

export function useAllAnnouncements(params?: AnnouncementsListParams) {
  return useQuery<AnnouncementsResponse>({
    queryKey: KEYS.all(params),
    queryFn: () =>
      api
        .get<ApiResponse<AnnouncementsResponse>>('/announcements', { params })
        .then((r) => r.data.data),
    staleTime: 30_000,
  });
}

export function useUnreadAnnouncementsCount(enabled = true) {
  return useQuery<{ count: number }>({
    queryKey: KEYS.unread,
    queryFn: () =>
      api
        .get<ApiResponse<{ count: number }>>('/announcements/unread-count')
        .then((r) => r.data.data),
    enabled,
    refetchInterval: 30_000,
    staleTime: 0,
  });
}

export function useCreateAnnouncement() {
  const qc = useQueryClient();
  return useMutation<Announcement, unknown, CreateAnnouncementPayload>({
    mutationFn: (payload) =>
      api
        .post<ApiResponse<Announcement>>('/announcements', payload)
        .then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.root });
      toast('Объявление опубликовано', 'success');
    },
    onError: () => toast('Не удалось создать объявление', 'error'),
  });
}

export function useMarkAnnouncementRead() {
  const qc = useQueryClient();
  return useMutation<{ success: boolean }, unknown, string>({
    mutationFn: (id) =>
      api
        .patch<ApiResponse<{ success: boolean }>>(`/announcements/${id}/read`)
        .then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.root }),
  });
}

export function useMarkAllAnnouncementsRead() {
  const qc = useQueryClient();
  return useMutation<{ success: boolean; count: number }, unknown, void>({
    mutationFn: () =>
      api
        .patch<ApiResponse<{ success: boolean; count: number }>>(
          '/announcements/read-all',
        )
        .then((r) => r.data.data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: KEYS.root });
      if (data.count > 0) toast(`Отмечено прочитанными: ${data.count}`, 'success');
    },
  });
}

export function useDeleteAnnouncement() {
  const qc = useQueryClient();
  return useMutation<{ success: boolean }, unknown, string>({
    mutationFn: (id) =>
      api
        .delete<ApiResponse<{ success: boolean }>>(`/announcements/${id}`)
        .then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.root });
      toast('Объявление удалено', 'success');
    },
    onError: () => toast('Не удалось удалить объявление', 'error'),
  });
}

export function useToggleAnnouncementPin() {
  const qc = useQueryClient();
  return useMutation<{ id: string; isPinned: boolean }, unknown, string>({
    mutationFn: (id) =>
      api
        .patch<ApiResponse<{ id: string; isPinned: boolean }>>(
          `/announcements/${id}/pin`,
        )
        .then((r) => r.data.data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: KEYS.root });
      toast(data.isPinned ? 'Объявление закреплено' : 'Объявление откреплено', 'success');
    },
  });
}
