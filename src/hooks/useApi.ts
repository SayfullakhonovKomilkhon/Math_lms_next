'use client';

import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from '@tanstack/react-query';
import api from '@/lib/api';

/** Typed GET helper — keeps data fetching in React Query, not useEffect. */
export function useApiQuery<TData>(
  queryKey: unknown[],
  url: string,
  options?: Omit<UseQueryOptions<TData, Error, TData, unknown[]>, 'queryKey' | 'queryFn'>,
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const res = await api.get(url);
      return res.data.data as TData;
    },
    ...options,
  });
}
