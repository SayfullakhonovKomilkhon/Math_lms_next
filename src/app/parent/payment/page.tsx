'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { ApiResponse, PaymentSummary } from '@/types';
import {
  useParentProfile,
  useSelectedChild,
  PARENT_CHILD_QUERY_DEFAULTS,
} from '@/hooks/useParentProfile';
import { ChildSelector } from '@/components/parent/ChildSelector';
import { PaymentStatusBadge } from '@/components/payments/PaymentStatusBadge';
import { PaymentBanner } from '@/components/payments/PaymentBanner';
import {
  CreditCard,
  Upload,
  Check,
  Eye,
  FileText,
  History,
  X,
} from 'lucide-react';
import { useState, useRef } from 'react';
import { ReceiptModal } from '@/components/payments/ReceiptModal';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useToast } from '@/components/ui/toast';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';

const STATUS_TONE: Record<string, string> = {
  PAID: 'bg-gradient-to-br from-emerald-500 to-teal-600',
  CONFIRMED: 'bg-gradient-to-br from-emerald-500 to-teal-600',
  PENDING: 'bg-gradient-to-br from-amber-400 to-orange-500',
  REJECTED: 'bg-gradient-to-br from-rose-500 to-red-600',
  UNPAID: 'bg-gradient-to-br from-blue-500 to-indigo-600',
};

const STATUS_LABEL: Record<string, string> = {
  PAID: 'Оплачено',
  CONFIRMED: 'Оплачено',
  PENDING: 'На проверке',
  REJECTED: 'Отклонено',
  UNPAID: 'Не оплачено',
};

export default function ParentPaymentPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [receiptPaymentId, setReceiptPaymentId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    data: profile,
    isError: profileError,
    refetch: refetchProfile,
  } = useParentProfile();
  const { children, selected, selectedId, select } = useSelectedChild(profile);

  const { data: paymentRes, isLoading, isError, refetch } = useQuery({
    queryKey: ['parent-child-payment', selectedId],
    queryFn: () =>
      api
        .get<ApiResponse<PaymentSummary>>('/parents/me/child/payments', {
          params: selectedId ? { studentId: selectedId } : {},
        })
        .then((res) => res.data),
    enabled: !!selectedId,
    ...PARENT_CHILD_QUERY_DEFAULTS,
  });

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) =>
      api.post('/parents/me/child/payments/receipt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parent-child-payment'] });
      toast({ title: 'Успешно!', description: 'Чек загружен и отправлен на проверку.' });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    onError: () => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить чек.',
        variant: 'destructive',
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    if (selectedId) formData.append('studentId', selectedId);
    uploadMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="space-y-5">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (profileError || isError) {
    return (
      <ErrorState
        message="Не удалось загрузить страницу оплаты"
        description="История платежей или профиль ребёнка временно недоступны."
        onRetry={() => {
          void refetchProfile();
          void refetch();
        }}
      />
    );
  }

  const payment = paymentRes?.data;
  const history = payment?.history || [];
  const childName = selected?.fullName ?? '—';
  const status = payment?.currentMonth.status ?? 'UNPAID';
  const accentBg = STATUS_TONE[status] ?? STATUS_TONE.UNPAID;

  return (
    <div className="space-y-5 pb-2">
      <ChildSelector children={children} selectedId={selectedId} onSelect={select} />

      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <CreditCard className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold leading-tight text-slate-900 sm:text-2xl">
            Оплата обучения
          </h1>
          <p className="mt-0.5 truncate text-[12px] text-slate-500 sm:text-sm">
            Для: <span className="font-semibold text-slate-700">{childName}</span>
          </p>
        </div>
      </div>

      <PaymentBanner
        daysUntilPayment={payment?.currentMonth.daysUntilPayment ?? null}
        status={status}
      />

      {/* Hero current-month */}
      <div className={`relative overflow-hidden rounded-3xl p-5 text-white shadow-[0_8px_24px_-12px_rgba(15,23,42,0.4)] sm:p-6 ${accentBg}`}>
        <div className="absolute right-0 top-0 h-40 w-40 -translate-y-12 translate-x-12 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm">
            <CreditCard className="h-3 w-3" /> {STATUS_LABEL[status] ?? status}
          </div>
          <p className="mt-3 text-xs font-medium opacity-90">К оплате за текущий месяц</p>
          <p className="mt-1 text-4xl font-black tracking-tight sm:text-5xl">
            {(payment?.currentMonth.amount ?? 0).toLocaleString('ru-RU')}
            <span className="ml-1 text-lg font-bold opacity-90">сум</span>
          </p>
          {payment?.currentMonth.nextPaymentDate && (
            <p className="mt-1 text-xs opacity-85">
              Срок:{' '}
              {format(new Date(payment.currentMonth.nextPaymentDate), 'd MMMM yyyy', {
                locale: ru,
              })}
            </p>
          )}
        </div>
      </div>

      {/* Upload card */}
      <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-5">
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <Upload className="h-4 w-4 text-blue-600" />
          Загрузить чек
        </h2>
        <p className="mt-0.5 text-[12px] text-slate-500">
          PNG, JPG или PDF до 5MB
        </p>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-3 flex w-full flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-4 py-7 text-center transition-all active:border-blue-300 active:bg-blue-50"
        >
          {file ? (
            <>
              <FileText className="h-8 w-8 text-blue-600" />
              <p className="line-clamp-1 max-w-[220px] text-sm font-semibold text-slate-900">
                {file.name}
              </p>
              <p className="text-[11px] text-slate-400">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">Выбрать файл</p>
              <p className="text-[11px] text-slate-400">или сделать фото чека</p>
            </>
          )}
        </button>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*,.pdf"
          onChange={handleFileChange}
        />

        {file && (
          <button
            type="button"
            onClick={() => {
              setFile(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            className="mt-2 inline-flex items-center gap-1 text-[12px] font-medium text-slate-500 active:text-rose-600"
          >
            <X className="h-3.5 w-3.5" /> Убрать файл
          </button>
        )}

        <button
          type="button"
          onClick={handleUpload}
          disabled={!file || uploadMutation.isPending}
          className={`mt-3 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold transition-all ${
            !file || uploadMutation.isPending
              ? 'cursor-not-allowed bg-slate-100 text-slate-400'
              : 'bg-blue-600 text-white shadow-[0_8px_20px_-8px_rgba(37,99,235,0.5)] active:scale-[0.99] active:bg-blue-700'
          }`}
        >
          {uploadMutation.isPending ? (
            'Загрузка…'
          ) : (
            <>
              {file ? <Check className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
              Отправить на проверку
            </>
          )}
        </button>
      </section>

      {/* History */}
      <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <header className="flex items-center gap-2 px-4 py-3">
          <History className="h-4 w-4 text-slate-400" />
          <h2 className="text-sm font-bold text-slate-800">История платежей</h2>
          {history.length > 0 && (
            <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
              {history.length}
            </span>
          )}
        </header>
        <div className="border-t border-slate-100">
          {history.length === 0 ? (
            <div className="px-4 py-6">
              <EmptyState
                icon="💳"
                message="История пуста"
                description="Загруженные и подтверждённые чеки появятся здесь."
              />
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {history.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900">
                      {item.amount.toLocaleString('ru-RU')} сум
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {format(new Date(item.createdAt), 'd MMM yyyy, HH:mm', {
                        locale: ru,
                      })}
                    </p>
                    {item.rejectReason && (
                      <p className="mt-1 line-clamp-2 text-[11px] italic text-rose-500">
                        {item.rejectReason}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <PaymentStatusBadge status={item.status} />
                    {(item.receiptUrl || item.id) && (
                      <button
                        type="button"
                        onClick={() => setReceiptPaymentId(item.id)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors active:bg-blue-600 active:text-white"
                        title="Посмотреть чек"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {receiptPaymentId && (
        <ReceiptModal
          paymentId={receiptPaymentId}
          isOpen={!!receiptPaymentId}
          onClose={() => setReceiptPaymentId(null)}
        />
      )}
    </div>
  );
}
