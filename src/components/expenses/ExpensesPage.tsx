'use client';

import { useMemo, useState } from 'react';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  CalendarDays,
  FileText,
  Pencil,
  Plus,
  Receipt,
  Search,
  Trash2,
  Wallet,
} from 'lucide-react';
import api from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  InputField,
  SelectField,
  TextareaField,
} from '@/components/ui/input-field';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { toast } from '@/components/ui/toast';
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';

export type ExpenseDto = {
  id: string;
  amount: number;
  category: string;
  description: string | null;
  receiptUrl: string | null;
  spentAt: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
};

type ExpensesListResponse = {
  items: ExpenseDto[];
  total: number;
  totalAmount: number;
  limit: number;
  offset: number;
};

type ExpensesSummary = {
  categories: { name: string; usageCount: number }[];
  monthByCategory: { category: string; amount: number }[];
  monthTotal: number;
  monthStart: string;
};

type FormState = {
  amount: string;
  category: string;
  description: string;
  spentAt: string;
  file: File | null;
};

const blankForm: FormState = {
  amount: '',
  category: '',
  description: '',
  spentAt: new Date().toISOString().slice(0, 10),
  file: null,
};

const formatMoney = (n: number) =>
  new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(n);

const formatDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export function ExpensesPage() {
  const qc = useQueryClient();

  // ── Filters ────────────────────────────────────────────────────────────
  const [category, setCategory] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [search, setSearch] = useState('');

  // ── Create / edit form ─────────────────────────────────────────────────
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ExpenseDto | null>(null);
  const [form, setForm] = useState<FormState>(blankForm);

  // ── Delete confirmation ────────────────────────────────────────────────
  const [pendingDelete, setPendingDelete] = useState<ExpenseDto | null>(null);

  const params = useMemo(() => {
    const p = new URLSearchParams();
    if (category) p.set('category', category);
    if (from) p.set('from', from);
    if (to) p.set('to', to);
    if (search.trim()) p.set('search', search.trim());
    return p.toString();
  }, [category, from, to, search]);

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['expenses', params],
    queryFn: () =>
      api
        .get(`/expenses${params ? `?${params}` : ''}`)
        .then((r) => r.data.data as ExpensesListResponse),
  });

  const { data: summary } = useQuery({
    queryKey: ['expenses', 'summary'],
    queryFn: () =>
      api.get('/expenses/summary').then((r) => r.data.data as ExpensesSummary),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['expenses'] });
  };

  const createMutation = useMutation({
    mutationFn: async (state: FormState) => {
      // Multipart so admin can attach a receipt photo / PDF in the same call.
      const fd = new FormData();
      fd.append('amount', state.amount);
      fd.append('category', state.category.trim());
      if (state.description.trim()) {
        fd.append('description', state.description.trim());
      }
      if (state.spentAt) fd.append('spentAt', state.spentAt);
      if (state.file) fd.append('file', state.file);
      return api.post('/expenses', fd).then((r) => r.data.data as ExpenseDto);
    },
    onSuccess: () => {
      toast('Расход добавлен');
      setFormOpen(false);
      setForm(blankForm);
      invalidate();
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : undefined;
      toast(msg || 'Не удалось сохранить расход', 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, state }: { id: string; state: FormState }) => {
      const body: Record<string, string | number | undefined> = {
        amount: Number(state.amount),
        category: state.category.trim(),
        description: state.description.trim() || undefined,
        spentAt: state.spentAt || undefined,
      };
      const updated = await api
        .patch(`/expenses/${id}`, body)
        .then((r) => r.data.data as ExpenseDto);
      // Receipt replacement is a separate endpoint so we can patch text-only
      // edits without re-uploading the file every time.
      if (state.file) {
        const fd = new FormData();
        fd.append('file', state.file);
        await api.post(`/expenses/${id}/receipt`, fd);
      }
      return updated;
    },
    onSuccess: () => {
      toast('Расход обновлён');
      setFormOpen(false);
      setEditing(null);
      setForm(blankForm);
      invalidate();
    },
    onError: () => toast('Не удалось обновить расход', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/expenses/${id}`),
    onSuccess: () => {
      toast('Расход удалён');
      setPendingDelete(null);
      invalidate();
    },
    onError: () => toast('Не удалось удалить расход', 'error'),
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ ...blankForm });
    setFormOpen(true);
  };

  const openEdit = (e: ExpenseDto) => {
    setEditing(e);
    setForm({
      amount: String(e.amount),
      category: e.category,
      description: e.description ?? '',
      spentAt: e.spentAt.slice(0, 10),
      file: null,
    });
    setFormOpen(true);
  };

  const onSubmitForm = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) {
      toast('Укажите сумму больше нуля', 'error');
      return;
    }
    if (!form.category.trim()) {
      toast('Укажите категорию', 'error');
      return;
    }
    if (editing) {
      updateMutation.mutate({ id: editing.id, state: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleOpenReceipt = async (id: string) => {
    try {
      const res = await api.get(`/expenses/${id}/receipt`);
      const url = res.data?.data?.url as string | undefined;
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      toast('Не удалось открыть чек', 'error');
    }
  };

  const items = data?.items ?? [];
  const filterCount =
    Number(Boolean(category)) +
    Number(Boolean(from)) +
    Number(Boolean(to)) +
    Number(Boolean(search.trim()));

  const resetFilters = () => {
    setCategory('');
    setFrom('');
    setTo('');
    setSearch('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Расходы центра"
        description="Учёт операционных расходов: канцелярия, вода, доставка и др. Не учитывается в общей выручке центра."
        actions={
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Новый расход
          </Button>
        }
      />

      {/* Сводка за текущий месяц ─────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryTile
          label="Расходы за текущий месяц"
          value={`${formatMoney(summary?.monthTotal ?? 0)} сум`}
          icon={<Wallet className="h-5 w-5" />}
        />
        <SummaryTile
          label="Записей в текущей выборке"
          value={String(data?.total ?? 0)}
          icon={<FileText className="h-5 w-5" />}
        />
        <SummaryTile
          label="Сумма в выборке"
          value={`${formatMoney(data?.totalAmount ?? 0)} сум`}
          icon={<Receipt className="h-5 w-5" />}
        />
      </div>

      {/* Топ категорий за месяц ─────────────────────────────────────── */}
      {summary && summary.monthByCategory.length > 0 ? (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-slate-900">
              Категории за этот месяц
            </h2>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {summary.monthByCategory.map((row) => (
                <button
                  key={row.category}
                  type="button"
                  onClick={() => setCategory(row.category)}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                    category === row.category
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
                  )}
                >
                  <span>{row.category}</span>
                  <span className="text-slate-500">
                    {formatMoney(row.amount)} сум
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Фильтры ────────────────────────────────────────────────────── */}
      <Card>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                Категория
              </label>
              <SelectField
                accent="admin"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Все категории</option>
                {(summary?.categories ?? []).map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </SelectField>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                С даты
              </label>
              <InputField
                accent="admin"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                По дату
              </label>
              <InputField
                accent="admin"
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                Поиск
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <InputField
                  accent="admin"
                  className="pl-9"
                  placeholder="Категория или описание"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
          {filterCount > 0 ? (
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Активных фильтров: {filterCount}</span>
              <button
                type="button"
                className="font-medium text-indigo-600 hover:underline"
                onClick={resetFilters}
              >
                Сбросить
              </button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Список расходов ────────────────────────────────────────────── */}
      {isLoading ? (
        <CardSkeleton />
      ) : isError ? (
        <ErrorState
          message="Не удалось загрузить расходы"
          description="Попробуйте обновить страницу или повторить запрос."
          onRetry={() => {
            void refetch();
          }}
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon="💸"
          message={
            filterCount > 0
              ? 'По выбранным фильтрам ничего не найдено'
              : 'Пока нет ни одного расхода'
          }
          description={
            filterCount > 0
              ? 'Сбросьте фильтры или измените период.'
              : 'Нажмите «Новый расход», чтобы зафиксировать первую покупку — например, бумагу, воду или доставку.'
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50/80 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Дата</th>
                  <th className="px-5 py-3 font-medium">Категория</th>
                  <th className="px-5 py-3 font-medium">Описание</th>
                  <th className="px-5 py-3 text-right font-medium">Сумма</th>
                  <th className="px-5 py-3 font-medium">Чек</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/60">
                    <td className="whitespace-nowrap px-5 py-3 text-slate-700">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-slate-400" />
                        {formatDate(e.spentAt)}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                        {e.category}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {e.description ? (
                        <span className="line-clamp-2 max-w-[28rem]">
                          {e.description}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-right font-semibold text-slate-900">
                      {formatMoney(e.amount)} сум
                    </td>
                    <td className="px-5 py-3">
                      {e.receiptUrl ? (
                        <button
                          type="button"
                          onClick={() => handleOpenReceipt(e.id)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:underline"
                        >
                          <Receipt className="h-3.5 w-3.5" />
                          Открыть
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          accent="admin"
                          onClick={() => openEdit(e)}
                          aria-label="Изменить"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          accent="admin"
                          onClick={() => setPendingDelete(e)}
                          aria-label="Удалить"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create / edit dialog ───────────────────────────────────────── */}
      <Dialog.Root
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) {
            setFormOpen(false);
            setEditing(null);
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <Dialog.Title className="text-lg font-semibold text-slate-900">
              {editing ? 'Редактировать расход' : 'Новый расход'}
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-slate-500">
              Запись попадёт в раздел «Расходы центра» и не будет учитываться в
              общей выручке.
            </Dialog.Description>

            <form onSubmit={onSubmitForm} className="mt-5 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">
                    Сумма (сум) *
                  </label>
                  <InputField
                    accent="admin"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    step={1}
                    placeholder="250000"
                    value={form.amount}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, amount: e.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">
                    Дата *
                  </label>
                  <InputField
                    accent="admin"
                    type="date"
                    value={form.spentAt}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, spentAt: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  Категория *
                </label>
                <InputField
                  accent="admin"
                  list="expense-categories"
                  placeholder="Например, Канцелярия"
                  value={form.category}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, category: e.target.value }))
                  }
                  required
                />
                <datalist id="expense-categories">
                  {(summary?.categories ?? []).map((c) => (
                    <option key={c.name} value={c.name} />
                  ))}
                </datalist>
                <p className="mt-1 text-xs text-slate-400">
                  Можно ввести новую категорию или выбрать из уже использованных.
                </p>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  Описание
                </label>
                <TextareaField
                  accent="admin"
                  rows={3}
                  placeholder="На что потрачено: бумага A4, 5 пачек и т.п."
                  value={form.description}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, description: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  Чек / квитанция (необязательно)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={(e) =>
                    setForm((s) => ({
                      ...s,
                      file: e.target.files?.[0] ?? null,
                    }))
                  }
                  className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
                />
                {editing?.receiptUrl && !form.file ? (
                  <p className="mt-1 text-xs text-slate-400">
                    Уже прикреплён чек. Загрузите новый файл, чтобы заменить.
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFormOpen(false);
                    setEditing(null);
                  }}
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  loading={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {editing ? 'Сохранить' : 'Добавить расход'}
                </Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <ConfirmDialog
        isOpen={!!pendingDelete}
        title="Удалить расход?"
        description={
          pendingDelete
            ? `Запись «${pendingDelete.category}» на ${formatMoney(pendingDelete.amount)} сум будет удалена без возможности восстановления.`
            : ''
        }
        variant="danger"
        confirmLabel="Удалить"
        confirmLoading={deleteMutation.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) deleteMutation.mutate(pendingDelete.id);
        }}
      />
    </div>
  );
}

function SummaryTile({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-slate-500">{label}</p>
          <p className="truncate text-lg font-semibold text-slate-900">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
