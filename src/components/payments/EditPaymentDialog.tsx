'use client';

import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Banknote, Pencil, X } from 'lucide-react';
import api from '@/lib/api';
import { Payment } from '@/types';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { InputField } from '@/components/ui/input-field';
import { formatCurrency } from '@/lib/utils';

interface EditPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: Payment | null;
}

function isoDate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function EditPaymentDialog({
  open,
  onOpenChange,
  payment,
}: EditPaymentDialogProps) {
  const qc = useQueryClient();
  const [amount, setAmount] = useState('');
  const [paidAt, setPaidAt] = useState('');
  const [nextPaymentDate, setNextPaymentDate] = useState('');

  // Sync local state with the selected payment whenever the dialog reopens
  // for a different record so the previous draft doesn't leak between rows.
  useEffect(() => {
    if (open && payment) {
      setAmount(String(Number(payment.amount)));
      setPaidAt(isoDate(new Date(payment.createdAt)));
      setNextPaymentDate(
        payment.nextPaymentDate
          ? isoDate(new Date(payment.nextPaymentDate))
          : '',
      );
    }
  }, [open, payment]);

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!payment) throw new Error('No payment selected');
      const body: Record<string, unknown> = {};
      const newAmount = Number(amount);
      if (Number.isFinite(newAmount) && newAmount !== Number(payment.amount)) {
        body.amount = newAmount;
      }
      if (paidAt && paidAt !== isoDate(new Date(payment.createdAt))) {
        body.paidAt = paidAt;
      }
      const currentNext = payment.nextPaymentDate
        ? isoDate(new Date(payment.nextPaymentDate))
        : '';
      if (nextPaymentDate !== currentNext) {
        body.nextPaymentDate = nextPaymentDate || undefined;
      }
      return api.patch(`/payments/${payment.id}`, body);
    },
    onSuccess: () => {
      toast('Изменения сохранены');
      qc.invalidateQueries({ queryKey: ['payments'] });
      qc.invalidateQueries({
        queryKey: ['student-payments', payment?.student?.id],
      });
      qc.invalidateQueries({ queryKey: ['debtors'] });
      qc.invalidateQueries({ queryKey: ['students'] });
      onOpenChange(false);
    },
    onError: (e: unknown) => {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { message?: string | string[] } } })
              .response?.data?.message
          : undefined;
      toast(
        Array.isArray(msg) ? msg.join(', ') : msg || 'Ошибка при сохранении',
        'error',
      );
    },
  });

  const amountNum = Number(amount);
  const canSubmit =
    !!payment &&
    Number.isFinite(amountNum) &&
    amountNum > 0 &&
    !!paidAt &&
    !submitMutation.isPending;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-indigo-50 p-2 text-indigo-600">
                <Pencil className="h-5 w-5" />
              </div>
              <div>
                <Dialog.Title className="text-lg font-semibold text-slate-900">
                  Редактировать оплату
                </Dialog.Title>
                <Dialog.Description className="mt-0.5 text-sm text-slate-500">
                  {payment?.student?.fullName
                    ? `${payment.student.fullName} · `
                    : ''}
                  Можно изменить сумму и даты. Статус меняется отдельно через
                  «подтвердить»/«отклонить».
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Закрыть"
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Сумма (сум) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Banknote className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <InputField
                  accent="admin"
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-9"
                />
              </div>
              {payment ? (
                <p className="mt-1 text-xs text-slate-500">
                  Текущая сумма: {formatCurrency(Number(payment.amount))}
                </p>
              ) : null}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Дата оплаты <span className="text-red-500">*</span>
                </label>
                <InputField
                  accent="admin"
                  type="date"
                  value={paidAt}
                  onChange={(e) => setPaidAt(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Дата следующей оплаты
                </label>
                <InputField
                  accent="admin"
                  type="date"
                  value={nextPaymentDate}
                  onChange={(e) => setNextPaymentDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
            <Button
              className="w-full sm:w-auto"
              loading={submitMutation.isPending}
              disabled={!canSubmit}
              onClick={() => submitMutation.mutate()}
            >
              Сохранить
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
