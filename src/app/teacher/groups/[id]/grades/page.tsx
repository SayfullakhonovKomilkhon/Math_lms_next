'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Grade, RatingEntry } from '@/types';
import { RatingTable } from '@/components/grades/RatingTable';
import { GradeTable } from '@/components/grades/GradeTable';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { TabsBar, TabsBarButton } from '@/components/ui/tabs-bar';

const TABS = [
  { key: 'journal', label: 'Журнал оценок' },
  { key: 'rating', label: 'Рейтинг группы' },
] as const;

export default function GradesPage() {
  const { id: groupId } = useParams<{ id: string }>();
  const [tab, setTab] = useState<'journal' | 'rating'>('journal');
  const [period, setPeriod] = useState<'month' | 'quarter' | 'all'>('month');

  const { data: grades = [] } = useQuery({
    queryKey: ['grades', groupId],
    queryFn: () => api.get(`/grades?groupId=${groupId}`).then((r) => r.data.data as Grade[]),
    enabled: tab === 'journal',
  });

  const { data: rating = [] } = useQuery({
    queryKey: ['rating', groupId, period],
    queryFn: () =>
      api.get(`/grades/rating/${groupId}?period=${period}`).then((r) => r.data.data as RatingEntry[]),
    enabled: tab === 'rating',
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Оценки" description="Журнал и рейтинг группы" />

      <TabsBar>
        {TABS.map((t) => (
          <TabsBarButton key={t.key} accent="teacher" active={tab === t.key} onClick={() => setTab(t.key)}>
            {t.label}
          </TabsBarButton>
        ))}
      </TabsBar>

      {tab === 'journal' && <GradeTable grades={grades} />}

      {tab === 'rating' && (
        <Card>
          <CardContent className="pt-6">
            <RatingTable data={rating} period={period} onPeriodChange={setPeriod} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
