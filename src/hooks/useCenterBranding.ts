'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface CenterBranding {
  centerName: string;
  centerPhone: string;
  centerAddress: string;
}

const FALLBACK: CenterBranding = {
  centerName: 'MathCenter',
  centerPhone: '',
  centerAddress: '',
};

export function useCenterBranding() {
  const query = useQuery<CenterBranding>({
    queryKey: ['center-branding'],
    queryFn: () =>
      api.get('/settings/public').then((r) => r.data.data as CenterBranding),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });

  return query.data ?? FALLBACK;
}
