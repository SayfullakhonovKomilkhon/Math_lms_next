'use client';

import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Banknote, Paperclip, Wallet, X } from 'lucide-react';
import api from '@/lib/api';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { InputField } from '@/components/ui/input-field';
import { formatCurrency } from '@/lib/utils';

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT = 'image/jpeg,image/png,application/pdf';

interface ManualPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string | null;
  studentName?: string;
  /** Sum of monthlyFee across all of the student's groups; used as default. */
  suggestedAmount?: number;
}

function todayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function ManualPaymentDialog({
  open,
  onOpenChange,
  studentId,
  studentName,
  suggestedAmount,
}: ManualPaymentDialogProps) {
  const qc = useQueryClient();
  const [amount, setAmount] = useState('');
  const [paidAt, setPaidAt] = useState(todayISO());
  const [file, setFile] = useState<File | null>(null);

  // Reset the form whenever the dialog re-opens for a different student so
  // the previous draft doesn't leak between rows.
  useEffect(() => {
    if (open) {
      setAmount(
        suggestedAmount && suggestedAmount > 0 ? String(suggestedAmount) : '',
      );
      setPaidAt(todayISO());
      setFile(null);
    }
  }, [open, studentId, suggestedAmount]);

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!studentId) throw new Error('No student selected');
      const fd = new FormData();
      fd.append('studentId', studentId);
      fd.append('amount', String(Number(amount)));
      fd.append('paidAt', paidAt);
      if (file) fd.append('file', file);
      return api.post('/payments/manual', fd);
    },
    onSuccess: () => {
      toast('Оплата записана');
      qc.invalidateQueries({ queryKey: ['payments'] });
      qc.invalidateQueries({ queryKey: ['student-payments', studentId] });
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
        Array.isArray(msg) ? msg.join(', ') : msg || 'Ошибка при добавлении оплаты',
        'error',
      );
    },
  });

  const onPickFile = (f: File | null) => {
    if (!f) {
      setFile(null);
      return;
    }
    if (f.size > MAX_BYTES) {
      toast('Файл больше 10 МБ', 'error');
      return;
    }
    if (!['image/jpeg', 'image/png', 'application/pdf'].includes(f.type)) {
      toast('Допустимы JPG, PNG или PDF', 'error');
      return;
    }
    setFile(f);
  };

  const amountNum = Number(amount);
  const canSubmit =
    !!studentId &&
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
              <div className="rounded-full bg-emerald-50 p-2 text-emerald-600">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <Dialog.Title className="text-lg font-semibold text-slate-900">
                  Добавить оплату
                </Dialog.Title>
                <Dialog.Description className="mt-0.5 text-sm text-slate-500">
                  {studentName ? `${studentName} · ` : ''}
                  Запись оплаты вручную (наличные / перевод). Чек —
                  по желанию.
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
                  placeholder={
                    suggestedAmount
                      ? String(suggestedAmount)
                      : 'Введите сумму'
                  }
                  className="pl-9"
                />
              </div>
              {suggestedAmount && suggestedAmount > 0 && (
                <button
                  type="button"
                  onClick={() => setAmount(String(suggestedAmount))}
                  className="mt-1 text-xs text-indigo-600 hover:underline"
                >
                  Подставить полный абонемент:{' '}
                  {formatCurrency(suggestedAmount)}
                </button>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Дата оплаты <span className="text-red-500">*</span>
              </label>
              <InputField
                accent="admin"
                type="date"
                value={paidAt}
                onChange={(e) => setPaidAt(e.target.value)}
                max={todayISO()}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Чек (необязательно)
              </label>
              <label
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-100"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  onPickFile(e.dataTransfer.files?.[0] ?? null);
                }}
              >
                <Paperclip className="h-4 w-4 text-slate-400" />
                <span className="flex-1 truncate">
                  {file ? file.name : 'Прикрепить JPG, PNG или PDF (до 10 МБ)'}
                </span>
                <input
                  type="file"
                  accept={ACCEPT}
                  className="hidden"
                  onChange={(e) =>
                    onPickFile(e.target.files?.[0] ?? null)
                  }
                />
                {file && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="rounded p-1 text-slate-400 hover:bg-white hover:text-slate-700"
                    aria-label="Убрать файл"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </label>
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
              Записать оплату
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
