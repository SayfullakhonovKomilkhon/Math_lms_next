'use client';

import { useState } from 'react';
import { Eye, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Payment } from '@/types';
import { PaymentStatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ReceiptModal } from '@/components/payments/ReceiptModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  IconMenuItem,
} from '@/components/ui/dropdown-menu';
import { formatDate, formatCurrency } from '@/lib/utils';

interface Props {
  payments: Payment[];
  onConfirm?: (id: string) => Promise<void>;
  onReject?: (id: string, reason: string) => Promise<void>;
  showActions?: boolean;
  /**
   * If provided, an "Изменить/Удалить" menu appears next to each row. Reserved
   * for admin contexts — parent/student-facing pages should leave these
   * undefined.
   */
  onEdit?: (payment: Payment) => void;
  onDelete?: (payment: Payment) => void;
}

export function PaymentsList({
  payments,
  onConfirm,
  onReject,
  showActions,
  onEdit,
  onDelete,
}: Props) {
  const [modalPaymentId, setModalPaymentId] = useState<string | null>(null);
  const showAdminMenu = Boolean(onEdit || onDelete);

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
            <div className="flex shrink-0 items-center gap-2">
              <PaymentStatusBadge status={p.status} />
              {p.receiptUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  accent="admin"
                  className="gap-1.5"
                  onClick={() => setModalPaymentId(p.id)}
                >
                  <Eye className="h-3.5 w-3.5" />
                  Чек
                </Button>
              )}
              {showAdminMenu && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      accent="admin"
                      aria-label="Действия с оплатой"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    accent="admin"
                    className="min-w-[220px]"
                  >
                    {onEdit && (
                      <IconMenuItem
                        accent="admin"
                        icon={Pencil}
                        label="Изменить"
                        description="Сумма, дата оплаты, дата следующей"
                        iconClassName="border-indigo-200 bg-indigo-50 text-indigo-700"
                        onSelect={() => onEdit(p)}
                      />
                    )}
                    {onDelete && (
                      <IconMenuItem
                        accent="admin"
                        icon={Trash2}
                        label="Удалить"
                        description="Запись и чек удалятся безвозвратно"
                        destructive
                        onSelect={() => onDelete(p)}
                      />
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {p.rejectReason && (
            <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              Причина отказа: {p.rejectReason}
            </p>
          )}
        </Card>
      ))}

      {modalPaymentId && (
        <ReceiptModal
          paymentId={modalPaymentId}
          isOpen={!!modalPaymentId}
          onClose={() => setModalPaymentId(null)}
          showActions={showActions && payments.find((p) => p.id === modalPaymentId)?.status === 'PENDING'}
          onConfirm={async (id, _comment) => {
            await onConfirm?.(id);
          }}
          onReject={async (id, reason) => {
            await onReject?.(id, reason);
          }}
        />
      )}
    </div>
  );
}
