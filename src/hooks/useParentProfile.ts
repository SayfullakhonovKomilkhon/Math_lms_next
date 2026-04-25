'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { ApiResponse, ParentProfile } from '@/types';

const STORAGE_KEY = 'mc:parent:selectedChildId';

export function useParentProfile() {
  return useQuery({
    queryKey: ['parent-profile'],
    queryFn: () =>
      api.get<ApiResponse<ParentProfile>>('/parents/me').then((r) => r.data.data),
    staleTime: 60 * 1000,
  });
}

// Lets every parent page share the same "currently viewed child" selection.
// The choice persists in localStorage so refreshing keeps the same context.
export function useSelectedChild(profile: ParentProfile | undefined) {
  const children = profile?.children ?? [];
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) setSelectedId(stored);
  }, []);

  const selected = useMemo(() => {
    if (children.length === 0) return null;
    const found = children.find((c) => c.id === selectedId);
    return found ?? children[0];
  }, [children, selectedId]);

  const select = (id: string) => {
    setSelectedId(id);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, id);
    }
  };

  return {
    children,
    selected,
    selectedId: selected?.id ?? null,
    select,
    hasMultiple: children.length > 1,
  };
}
