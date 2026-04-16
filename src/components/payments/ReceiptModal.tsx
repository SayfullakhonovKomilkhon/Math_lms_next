'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, ZoomIn, ZoomOut, RotateCcw, Check, XCircle, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';

interface Props {
  paymentId: string;
  isOpen: boolean;
  onClose: () => void;
  showActions?: boolean;
  onConfirm?: (id: string, comment: string) => Promise<void>;
  onReject?: (id: string, reason: string) => Promise<void>;
}

export function ReceiptModal({ paymentId, isOpen, onClose, showActions, onConfirm, onReject }: Props) {
  const [scale, setScale] = useState(1);
  const [action, setAction] = useState<'confirm' | 'reject' | null>(null);
  const [comment, setComment] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['payment-receipt', paymentId],
    queryFn: () => api.get(`/payments/${paymentId}/receipt`).then((r) => r.data.data as { url: string }),
    enabled: isOpen && !!paymentId,
    staleTime: 4 * 60 * 1000, // 4 min (presigned URL expires in 5)
  });

  const zoomIn = useCallback(() => setScale((s) => Math.min(s + 0.25, 4)), []);
  const zoomOut = useCallback(() => setScale((s) => Math.max(s - 0.25, 0.5)), []);
  const resetZoom = useCallback(() => setScale(1), []);

  const handleSubmit = async () => {
    if (action === 'confirm') {
      setSubmitting(true);
      await onConfirm?.(paymentId, comment);
      setSubmitting(false);
      onClose();
      resetState();
    } else if (action === 'reject') {
      if (reason.trim().length < 10) return;
      setSubmitting(true);
      await onReject?.(paymentId, reason);
      setSubmitting(false);
      onClose();
      resetState();
    }
  };

  const resetState = () => {
    setAction(null);
    setComment('');
    setReason('');
    setScale(1);
  };

  const handleClose = () => {
    onClose();
    resetState();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={handleClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">Просмотр чека</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={zoomOut}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
              title="Уменьшить"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="min-w-[3rem] text-center text-xs text-slate-500">{Math.round(scale * 100)}%</span>
            <button
              onClick={zoomIn}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
              title="Увеличить"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              onClick={resetZoom}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
              title="Сбросить масштаб"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={handleClose}
              className="ml-1 flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Image area */}
        <div className="relative flex-1 overflow-auto bg-slate-50 p-4">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : isError ? (
            <div className="flex h-64 flex-col items-center justify-center gap-2 text-slate-500">
              <p className="text-sm">Не удалось загрузить чек</p>
            </div>
          ) : (
            <div className="flex min-h-48 items-center justify-center overflow-auto">
              {data?.url.endsWith('.pdf') ? (
                <iframe
                  src={data.url}
                  className="h-[500px] w-full rounded-lg border border-slate-200"
                  title="Чек"
                  style={{ transform: `scale(${scale})`, transformOrigin: 'top center', transition: 'transform 0.2s' }}
                />
              ) : (
                <img
                  src={data?.url}
                  alt="Чек оплаты"
                  className="max-w-full rounded-lg object-contain shadow-md"
                  style={{ transform: `scale(${scale})`, transformOrigin: 'top center', transition: 'transform 0.2s' }}
                  draggable={false}
                />
              )}
            </div>
          )}
        </div>

        {/* Actions area */}
        {showActions && (
          <div className="border-t border-slate-100 px-5 py-4 space-y-4">
            {action === null && (
              <div className="flex gap-3">
                <Button
                  accent="admin"
                  className="flex-1 gap-2"
                  onClick={() => setAction('confirm')}
                >
                  <Check className="h-4 w-4" />
                  Подтвердить
                </Button>
                <Button
                  variant="danger"
                  className="flex-1 gap-2"
                  onClick={() => setAction('reject')}
                >
                  <XCircle className="h-4 w-4" />
                  Отклонить
                </Button>
              </div>
            )}

            {action === 'confirm' && (
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Комментарий <span className="text-slate-400 font-normal">(необязательно)</span>
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Например: оплата за апрель подтверждена"
                    className="min-h-20 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
                <div className="flex gap-2">
                  <Button accent="admin" className="flex-1 gap-2" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Подтвердить оплату
                  </Button>
                  <Button variant="ghost" onClick={() => setAction(null)} disabled={submitting}>
                    Назад
                  </Button>
                </div>
              </div>
            )}

            {action === 'reject' && (
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Причина отклонения <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Например: чек нечитаемый или сумма не совпадает. Минимум 10 символов."
                    className="min-h-24 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-200"
                  />
                  {reason.trim().length > 0 && reason.trim().length < 10 && (
                    <p className="mt-1 text-xs text-red-500">Минимум 10 символов ({reason.trim().length}/10)</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="danger"
                    className="flex-1 gap-2"
                    onClick={handleSubmit}
                    disabled={submitting || reason.trim().length < 10}
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                    Отклонить чек
                  </Button>
                  <Button variant="ghost" onClick={() => setAction(null)} disabled={submitting}>
                    Назад
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
