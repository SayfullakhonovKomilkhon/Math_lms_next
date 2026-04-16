'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Download, FileSpreadsheet, FileText, AlertTriangle } from 'lucide-react';
import api from '@/lib/api';
import { Group, Payment } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { TabsBar, TabsBarButton } from '@/components/ui/tabs-bar';
import { InputField, SelectField } from '@/components/ui/input-field';
import { toast } from '@/components/ui/toast';

interface Debtor {
  studentId: string; fullName: string; groupName: string; teacherName: string;
  monthlyFee: number; lastPaymentDate: string | null;
  daysSinceLastPayment: number | null; parentPhone: string | null;
}

type Tab = 'all' | 'debtors' | 'pending';

// ─── Export helper ────────────────────────────────────────────────────────────

async function downloadBlob(url: string, filename: string, onStart: () => void, onEnd: () => void) {
  onStart();
  try {
    const token = document.cookie
      .split('; ')
      .find((r) => r.startsWith('auth-storage='));
    const authData = token ? JSON.parse(decodeURIComponent(token.split('=')[1])) : null;
    const accessToken = authData?.state?.accessToken;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}${url}`, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });
    if (!res.ok) throw new Error('Export failed');
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  } catch {
    toast('Ошибка экспорта', 'error');
  } finally {
    onEnd();
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FinancePage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('all');
  const [exporting, setExporting] = useState<string | null>(null);

  // Filters
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [groupId, setGroupId] = useState('');
  const [status, setStatus] = useState('');

  const { data: groups = [] } = useQuery<Group[]>({
    queryKey: ['groups'],
    queryFn: () => api.get('/groups').then((r) => r.data.data),
  });

  const buildParams = () => {
    const p = new URLSearchParams();
    if (from) p.append('from', from);
    if (to) p.append('to', to);
    if (groupId) p.append('groupId', groupId);
    if (status) p.append('status', status);
    return p.toString();
  };

  const { data: payments = [], isLoading: paymentsLoading } = useQuery<Payment[]>({
    queryKey: ['sa-payments', from, to, groupId, status],
    queryFn: () => api.get(`/payments?${buildParams()}`).then((r) => r.data.data),
    enabled: tab === 'all',
  });

  const { data: debtors = [], isLoading: debtorsLoading } = useQuery<Debtor[]>({
    queryKey: ['sa-debtors'],
    queryFn: () => api.get('/analytics/debtors').then((r) => r.data.data),
    enabled: tab === 'debtors',
  });

  const { data: pending = [], isLoading: pendingLoading } = useQuery<Payment[]>({
    queryKey: ['sa-payments-pending'],
    queryFn: () => api.get('/payments?status=PENDING').then((r) => r.data.data),
    enabled: tab === 'pending',
  });

  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const confirmMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/payments/${id}/confirm`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sa-payments-pending'] }); toast('Оплата подтверждена'); },
    onError: () => toast('Ошибка', 'error'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.patch(`/payments/${id}/reject`, { rejectReason: reason || 'Отклонено администратором' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sa-payments-pending'] });
      toast('Оплата отклонена');
      setRejectingId(null);
      setRejectReason('');
    },
    onError: () => toast('Ошибка', 'error'),
  });

  const exportParams = () => {
    const p = new URLSearchParams();
    if (from) p.append('from', from);
    if (to) p.append('to', to);
    if (groupId) p.append('groupId', groupId);
    if (status) p.append('status', status);
    return p.toString();
  };

  const confirmedTotal = payments
    .filter((p) => p.status === 'CONFIRMED')
    .reduce((s, p) => s + Number(p.amount), 0);

  const statusLabel: Record<string, { label: string; variant: 'green' | 'yellow' | 'red' }> = {
    CONFIRMED: { label: 'Подтверждён', variant: 'green' },
    PENDING: { label: 'Ожидает', variant: 'yellow' },
    REJECTED: { label: 'Отклонён', variant: 'red' },
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Финансы"
        description="Платежи, должники и финансовая отчётность"
      />

      <TabsBar>
        <TabsBarButton accent="admin" active={tab === 'all'} onClick={() => setTab('all')}>
          Все оплаты
        </TabsBarButton>
        <TabsBarButton accent="admin" active={tab === 'debtors'} onClick={() => setTab('debtors')}>
          Должники
        </TabsBarButton>
        <TabsBarButton accent="admin" active={tab === 'pending'} onClick={() => setTab('pending')}>
          Чеки на проверке
        </TabsBarButton>
      </TabsBar>

      {/* ── Все оплаты ── */}
      {tab === 'all' && (
        <div className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="flex flex-wrap items-end gap-3 p-4">
              <div>
                <label className="mb-1 block text-xs text-slate-500">От</label>
                <InputField accent="admin" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-36" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-500">До</label>
                <InputField accent="admin" type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-36" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-500">Группа</label>
                <SelectField accent="admin" value={groupId} onChange={(e) => setGroupId(e.target.value)} className="w-40">
                  <option value="">Все группы</option>
                  {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </SelectField>
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-500">Статус</label>
                <SelectField accent="admin" value={status} onChange={(e) => setStatus(e.target.value)} className="w-36">
                  <option value="">Все</option>
                  <option value="CONFIRMED">Подтверждён</option>
                  <option value="PENDING">Ожидает</option>
                  <option value="REJECTED">Отклонён</option>
                </SelectField>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  loading={exporting === 'excel'}
                  onClick={() =>
                    downloadBlob(
                      `/reports/payments/excel?${exportParams()}`,
                      `payments-${new Date().toISOString().slice(0, 10)}.xlsx`,
                      () => setExporting('excel'),
                      () => setExporting(null),
                    )
                  }
                >
                  <FileSpreadsheet className="mr-1.5 h-4 w-4 text-green-600" />
                  Excel
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  loading={exporting === 'pdf'}
                  onClick={() =>
                    downloadBlob(
                      `/reports/payments/pdf?${exportParams()}`,
                      `payments-${new Date().toISOString().slice(0, 10)}.pdf`,
                      () => setExporting('pdf'),
                      () => setExporting(null),
                    )
                  }
                >
                  <FileText className="mr-1.5 h-4 w-4 text-red-500" />
                  PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            {paymentsLoading ? (
              <CardContent className="py-10 text-center text-sm text-slate-400">Загрузка...</CardContent>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/60 text-xs text-slate-500">
                        <th className="px-4 py-3 text-left font-medium">Дата</th>
                        <th className="px-4 py-3 text-left font-medium">Ученик</th>
                        <th className="px-4 py-3 text-left font-medium">Группа</th>
                        <th className="px-4 py-3 text-right font-medium">Сумма</th>
                        <th className="px-4 py-3 text-center font-medium">Статус</th>
                        <th className="px-4 py-3 text-center font-medium">Чек</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p) => (
                        <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                          <td className="px-4 py-3 text-slate-500">{formatDate(p.createdAt)}</td>
                          <td className="px-4 py-3 font-medium text-slate-900">{p.student?.fullName ?? '—'}</td>
                          <td className="px-4 py-3 text-slate-500">{p.student?.group?.name ?? '—'}</td>
                          <td className="px-4 py-3 text-right font-semibold text-slate-800">
                            {formatCurrency(Number(p.amount))}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant={statusLabel[p.status]?.variant ?? 'gray'}>
                              {statusLabel[p.status]?.label ?? p.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {p.receiptUrl ? (
                              <a href={p.receiptUrl} target="_blank" rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-violet-600 hover:underline">
                                <Download className="h-3 w-3" />
                                Чек
                              </a>
                            ) : '—'}
                          </td>
                        </tr>
                      ))}
                      {payments.length === 0 && (
                        <tr><td colSpan={6} className="py-10 text-center text-slate-400">Нет данных</td></tr>
                      )}
                    </tbody>
                    {payments.length > 0 && (
                      <tfoot>
                        <tr className="border-t border-slate-200 bg-slate-50">
                          <td colSpan={3} className="px-4 py-3 text-sm font-medium text-slate-600">
                            Итого подтверждённых:
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-semibold text-slate-900">
                            {formatCurrency(confirmedTotal)}
                          </td>
                          <td colSpan={2} />
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </>
            )}
          </Card>
        </div>
      )}

      {/* ── Должники ── */}
      {tab === 'debtors' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              variant="secondary"
              size="sm"
              loading={exporting === 'debtors-excel'}
              onClick={() =>
                downloadBlob(
                  '/reports/students/excel?isActive=true',
                  `debtors-${new Date().toISOString().slice(0, 10)}.xlsx`,
                  () => setExporting('debtors-excel'),
                  () => setExporting(null),
                )
              }
            >
              <FileSpreadsheet className="mr-1.5 h-4 w-4 text-green-600" />
              Экспорт Excel
            </Button>
          </div>
          <Card>
            {debtorsLoading ? (
              <CardContent className="py-10 text-center text-sm text-slate-400">Загрузка...</CardContent>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60 text-xs text-slate-500">
                      <th className="px-4 py-3 text-left font-medium">Ученик</th>
                      <th className="px-4 py-3 text-left font-medium">Группа</th>
                      <th className="px-4 py-3 text-left font-medium">Учитель</th>
                      <th className="px-4 py-3 text-right font-medium">Сумма долга</th>
                      <th className="px-4 py-3 text-right font-medium">Посл. оплата</th>
                      <th className="px-4 py-3 text-center font-medium">Дней</th>
                      <th className="px-4 py-3 text-left font-medium">Тел. родителя</th>
                    </tr>
                  </thead>
                  <tbody>
                    {debtors.map((d) => (
                      <tr key={d.studentId} className="border-b border-slate-50 hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-medium text-slate-900">{d.fullName}</td>
                        <td className="px-4 py-3 text-slate-500">{d.groupName}</td>
                        <td className="px-4 py-3 text-slate-500">{d.teacherName}</td>
                        <td className="px-4 py-3 text-right font-semibold text-red-600">
                          {formatCurrency(d.monthlyFee)}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-500">
                          {d.lastPaymentDate ? formatDate(d.lastPaymentDate) : '—'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {d.daysSinceLastPayment !== null ? (
                            <Badge variant={d.daysSinceLastPayment > 30 ? 'red' : 'yellow'}>
                              {d.daysSinceLastPayment}д
                            </Badge>
                          ) : (
                            <span className="flex items-center justify-center gap-1 text-xs text-red-500">
                              <AlertTriangle className="h-3 w-3" />Никогда
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{d.parentPhone ?? '—'}</td>
                      </tr>
                    ))}
                    {debtors.length === 0 && (
                      <tr><td colSpan={7} className="py-10 text-center text-green-600">Должников нет!</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ── Чеки на проверке ── */}
      {tab === 'pending' && (
        <Card>
          {pendingLoading ? (
            <CardContent className="py-10 text-center text-sm text-slate-400">Загрузка...</CardContent>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-xs text-slate-500">
                    <th className="px-4 py-3 text-left font-medium">Дата</th>
                    <th className="px-4 py-3 text-left font-medium">Ученик</th>
                    <th className="px-4 py-3 text-left font-medium">Группа</th>
                    <th className="px-4 py-3 text-right font-medium">Сумма</th>
                    <th className="px-4 py-3 text-center font-medium">Чек</th>
                    <th className="px-4 py-3 text-center font-medium">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map((p) => (
                    <tr key={p.id} className="border-b border-slate-50 hover:bg-amber-50/30">
                      <td className="px-4 py-3 text-slate-500">{formatDate(p.createdAt)}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{p.student?.fullName ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-500">{p.student?.group?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-800">
                        {formatCurrency(Number(p.amount))}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {p.receiptUrl ? (
                          <a href={p.receiptUrl} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-violet-600 hover:underline">
                            <Download className="h-3 w-3" />Открыть
                          </a>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {rejectingId === p.id ? (
                          <div className="flex flex-col gap-1.5 min-w-[200px]">
                            <InputField
                              accent="admin"
                              placeholder="Причина отклонения..."
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              className="h-7 text-xs"
                            />
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                className="h-6 flex-1 bg-red-600 px-2 text-xs hover:bg-red-700"
                                loading={rejectMutation.isPending}
                                onClick={() => rejectMutation.mutate({ id: p.id, reason: rejectReason })}
                              >
                                Подтвердить
                              </Button>
                              <Button
                                size="sm" variant="ghost"
                                className="h-6 px-2 text-xs"
                                onClick={() => { setRejectingId(null); setRejectReason(''); }}
                              >
                                Отмена
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              className="h-7 bg-green-600 px-3 text-xs hover:bg-green-700"
                              onClick={() => confirmMutation.mutate(p.id)}
                              loading={confirmMutation.isPending}
                            >
                              Принять
                            </Button>
                            <Button
                              size="sm" variant="secondary"
                              className="h-7 px-3 text-xs text-red-600 hover:bg-red-50"
                              onClick={() => { setRejectingId(p.id); setRejectReason(''); }}
                            >
                              Отклонить
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {pending.length === 0 && (
                    <tr><td colSpan={6} className="py-10 text-center text-slate-400">Нет чеков на проверке</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
