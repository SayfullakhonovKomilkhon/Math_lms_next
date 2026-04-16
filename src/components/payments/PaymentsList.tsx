'use client';

import { useState } from 'react';
import { Check, MoreHorizontal, XCircle } from 'lucide-react';
import { Payment } from '@/types';
import { PaymentStatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  IconMenuItem,
} from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatDate, formatCurrency } from '@/lib/utils';

interface Props {
  payments: Payment[];
  onConfirm?: (id: string) => Promise<void>;
  onReject?: (id: string, reason: string) => Promise<void>;
  showActions?: boolean;
}

export function PaymentsList({ payments, onConfirm, onReject, showActions }: Props) {
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const activeRejectPayment = payments.find((payment) => payment.id === rejectingId) ?? null;

  const handleConfirm = async (id: string) => {
    setLoading(id + 'confirm');
    await onConfirm?.(id);
    setLoading(null);
  };

  const handleReject = async (id: string) => {
    if (rejectReason.trim().length < 10) return;
    setLoading(id + 'reject');
    await onReject?.(id, rejectReason);
    setLoading(null);
    setRejectingId(null);
    setRejectReason('');
  };

  return (
    <div className="space-y-3">
      {payments.length === 0 ? (
        <EmptyState
          icon="💳"
          message="Платежей пока нет"
          description="Когда чеки появятся в системе, они отобразятся здесь."
        />
      ) : null}
      {payments.map((p) => (
        <Card key={p.id} className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="font-medium text-slate-900">{p.student?.fullName}</div>
              <div className="text-sm text-slate-500">
                {p.student?.group?.name} · {formatDate(p.createdAt)}
              </div>
              <div className="mt-1 text-lg font-semibold text-slate-900">{formatCurrency(p.amount)}</div>
            </div>
            <div className="flex shrink-0 items-start gap-2">
              <PaymentStatusBadge status={p.status} />
              {showActions && p.status === 'PENDING' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      accent="admin"
                      aria-label="Действия с оплатой"
                      disabled={!!loading}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" accent="admin" className="min-w-[220px]">
                    <IconMenuItem
                      accent="admin"
                      icon={Check}
                      label="Подтвердить оплату"
                      description="Зачислить платёж"
                      iconClassName="border-indigo-200 bg-indigo-50 text-indigo-700"
                      disabled={loading !== null}
                      onSelect={() => handleConfirm(p.id)}
                    />
                    <IconMenuItem
                      accent="admin"
                      icon={XCircle}
                      label="Отклонить"
                      description="Указать причину отклонения"
                      destructive
                      disabled={loading !== null}
                      onSelect={() => setRejectingId(p.id)}
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {p.receiptUrl && (
            <a
              href={p.receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm text-indigo-600 hover:underline"
            >
              Посмотреть чек →
            </a>
          )}

          {p.rejectReason && (
            <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              Причина отказа: {p.rejectReason}
            </p>
          )}
        </Card>
      ))}

      <ConfirmDialog
        isOpen={activeRejectPayment !== null}
        title="Отклонить чек?"
        description="Причина будет отправлена родителю и сохранится в истории платежей."
        confirmLabel="Отклонить чек"
        cancelLabel="Отмена"
        variant="danger"
        confirmDisabled={rejectReason.trim().length < 10}
        confirmLoading={activeRejectPayment ? loading === activeRejectPayment.id + 'reject' : false}
        onCancel={() => {
          setRejectingId(null);
          setRejectReason('');
        }}
        onConfirm={() => {
          if (activeRejectPayment) {
            void handleReject(activeRejectPayment.id);
          }
        }}
      >
        <div className="space-y-2">
          <label htmlFor="reject-reason" className="block text-sm font-medium text-slate-700">
            Причина отклонения
          </label>
          <textarea
            id="reject-reason"
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
            placeholder="Например: чек нечитаемый или сумма не совпадает. Минимум 10 символов."
            className="min-h-28 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-200"
          />
          <p className="text-xs text-slate-500">Минимум 10 символов.</p>
        </div>
      </ConfirmDialog>
    </div>
  );
}
