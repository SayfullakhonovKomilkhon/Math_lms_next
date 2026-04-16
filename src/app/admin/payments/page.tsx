'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Payment, Student } from '@/types';
import { PaymentsList } from '@/components/payments/PaymentsList';
import { ReceiptUploader } from '@/components/payments/ReceiptUploader';
import { toast } from '@/components/ui/toast';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { SelectField } from '@/components/ui/input-field';
import { TabsBar, TabsBarButton } from '@/components/ui/tabs-bar';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';

const TABS = [
  { key: 'PENDING', label: 'Чеки на проверке' },
  { key: 'ALL', label: 'История оплат' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export default function PaymentsPage() {
  const [tab, setTab] = useState<TabKey>('PENDING');
  const [uploadStudentId, setUploadStudentId] = useState('');
  const qc = useQueryClient();

  const {
    data: students = [],
    isLoading: studentsLoading,
    isError: studentsError,
    refetch: refetchStudents,
  } = useQuery({
    queryKey: ['students'],
    queryFn: () => api.get('/students').then((r) => r.data.data as Student[]),
  });

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['payments', tab],
    queryFn: () => {
      const params = tab === 'PENDING' ? '?status=PENDING' : '';
      return api.get(`/payments${params}`).then((r) => r.data.data as Payment[]);
    },
  });

  const confirmMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/payments/${id}/confirm`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      toast('Оплата подтверждена');
    },
    onError: () => toast('Ошибка', 'error'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.patch(`/payments/${id}/reject`, { rejectReason: reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      toast('Оплата отклонена');
    },
    onError: () => toast('Ошибка', 'error'),
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Управление оплатами" description="Проверка чеков и история платежей" />

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-slate-900">Загрузить чек за ученика</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          {studentsLoading ? (
            <CardSkeleton />
          ) : studentsError ? (
            <ErrorState
              message="Не удалось загрузить список учеников"
              description="Без списка учеников нельзя выбрать, за кого загружать чек."
              onRetry={() => {
                void refetchStudents();
              }}
            />
          ) : (
            <>
              <div>
                <label className="mb-1 block text-xs text-slate-500">Ученик</label>
                <SelectField
                  accent="admin"
                  value={uploadStudentId}
                  onChange={(e) => setUploadStudentId(e.target.value)}
                  className="max-w-md"
                >
                  <option value="">Выберите ученика</option>
                  {students
                    .filter((s) => s.isActive)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.fullName}
                      </option>
                    ))}
                </SelectField>
              </div>
              {uploadStudentId ? (
                <ReceiptUploader
                  studentId={uploadStudentId}
                  onUploaded={() => qc.invalidateQueries({ queryKey: ['payments'] })}
                />
              ) : (
                <p className="text-sm text-slate-500">Сначала выберите ученика</p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <TabsBar>
        {TABS.map((t) => (
          <TabsBarButton key={t.key} accent="admin" active={tab === t.key} onClick={() => setTab(t.key)}>
            {t.label}
          </TabsBarButton>
        ))}
      </TabsBar>

      {isLoading ? (
        <CardSkeleton />
      ) : isError ? (
        <ErrorState
          message="Не удалось загрузить оплаты"
          description="Список чеков и история оплат временно недоступны."
          onRetry={() => {
            void refetch();
          }}
        />
      ) : (data ?? []).length === 0 ? (
        <EmptyState
          icon={tab === 'PENDING' ? '🧾' : '💳'}
          message={tab === 'PENDING' ? 'Чеков на проверке пока нет' : 'История оплат пуста'}
          description={
            tab === 'PENDING'
              ? 'Новые чеки появятся здесь, когда родители или администраторы загрузят оплату.'
              : 'Когда в системе появятся платежи, они будут показаны в этом разделе.'
          }
        />
      ) : (
        <PaymentsList
          payments={data ?? []}
          showActions={tab === 'PENDING'}
          onConfirm={async (id) => {
            await confirmMutation.mutateAsync(id);
          }}
          onReject={async (id, reason) => {
            await rejectMutation.mutateAsync({ id, reason });
          }}
        />
      )}
    </div>
  );
}
