'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { ApiResponse, ParentProfile } from '@/types';

const STORAGE_KEY = 'mc:parent:selectedChildId';

export function useParentProfile() {
  // Always trigger a background refetch on every mount so newly linked
  // children appear immediately when the parent reloads / navigates back to
  // the panel. Cached data is still shown instantly while the refetch runs,
  // so the UI does not flash a skeleton when navigating between parent
  // sub-pages — `gcTime` keeps the cache alive for 30 minutes.
  return useQuery({
    queryKey: ['parent-profile'],
    queryFn: () =>
      api.get<ApiResponse<ParentProfile>>('/parents/me').then((r) => r.data.data),
    staleTime: 0,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
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

/**
 * Default cache options for parent-side queries that fetch data scoped to a
 * particular child. Keeping the data fresh for 60s and cached for 5m makes
 * navigation between parent sub-pages feel instant while still showing
 * up-to-date numbers.
 *
 * Typed as a plain readonly object so it can be spread into any `useQuery`
 * call regardless of the query's data type — using `UseQueryOptions<unknown>`
 * here would cause TS to infer incompatible generics at the call sites.
 */
export const PARENT_CHILD_QUERY_DEFAULTS = {
  staleTime: 60 * 1000,
  gcTime: 5 * 60 * 1000,
  refetchOnWindowFocus: false,
} as const;
