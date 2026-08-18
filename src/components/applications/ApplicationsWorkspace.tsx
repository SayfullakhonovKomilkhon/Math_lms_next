'use client';

import { FormEvent, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CalendarClock,
  Clock3,
  Headphones,
  MessageSquareText,
  Phone,
  Plus,
  Search,
  UserCheck,
  X,
} from 'lucide-react';
import api from '@/lib/api';
import {
  AdmissionApplication,
  ApplicationsSummary,
  ApplicationSource,
  ApplicationStatus,
} from '@/types/applications';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_OPTIONS,
  ApplicationStatusBadge,
} from './application-status';

type CallbackFilter = '' | 'today' | 'overdue';

const APPLICATION_SOURCE_OPTIONS: Array<{
  value: ApplicationSource;
  label: string;
}> = [
  { value: 'WEBSITE', label: 'Сайт' },
  { value: 'ADVERTISEMENT', label: 'Объявление / реклама' },
  { value: 'INSTAGRAM', label: 'Instagram' },
  { value: 'TELEGRAM', label: 'Telegram' },
  { value: 'PHONE_CALL', label: 'Входящий звонок' },
  { value: 'WALK_IN', label: 'Пришёл в учебный центр' },
  { value: 'REFERRAL', label: 'Рекомендация' },
  { value: 'OTHER', label: 'Другое' },
];

const APPLICATION_SOURCE_LABELS = Object.fromEntries(
  APPLICATION_SOURCE_OPTIONS.map((source) => [source.value, source.label]),
) as Record<ApplicationSource, string>;

function applicationSourceLabel(application: AdmissionApplication) {
  const label = APPLICATION_SOURCE_LABELS[application.source] || 'Сайт';
  return application.sourceDetails ? `${label}: ${application.sourceDetails}` : label;
}

function formatDateTime(value?: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function toLocalInput(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

const summaryCards = [
  { key: 'new', label: 'Новые', icon: Headphones, color: 'text-blue-600 bg-blue-50' },
  {
    key: 'callbacksToday',
    label: 'Звонки сегодня',
    icon: CalendarClock,
    color: 'text-cyan-700 bg-cyan-50',
  },
  {
    key: 'overdue',
    label: 'Просрочено',
    icon: Clock3,
    color: 'text-red-600 bg-red-50',
  },
  {
    key: 'enrolled',
    label: 'Стали учениками',
    icon: UserCheck,
    color: 'text-emerald-700 bg-emerald-50',
  },
] as const;

function CreateApplicationDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (application: AdmissionApplication) => void;
}) {
  const queryClient = useQueryClient();
  const [childFullName, setChildFullName] = useState('');
  const [childPhone, setChildPhone] = useState('+998');
  const [childAge, setChildAge] = useState('');
  const [parentFullName, setParentFullName] = useState('');
  const [parentPhone, setParentPhone] = useState('+998');
  const [source, setSource] = useState<ApplicationSource>('ADVERTISEMENT');
  const [sourceDetails, setSourceDetails] = useState('');
  const [note, setNote] = useState('');

  const reset = () => {
    setChildFullName('');
    setChildPhone('+998');
    setChildAge('');
    setParentFullName('');
    setParentPhone('+998');
    setSource('ADVERTISEMENT');
    setSourceDetails('');
    setNote('');
  };

  const createMutation = useMutation({
    mutationFn: () =>
      api.post('/applications/manual', {
        fullName: childFullName.trim(),
        phone: childPhone,
        childAge: Number(childAge),
        parentFullName: parentFullName.trim(),
        parentPhone,
        source,
        sourceDetails: sourceDetails.trim() || undefined,
        note: note.trim() || undefined,
      }),
    onSuccess: (response) => {
      const application = response.data.data as AdmissionApplication;
      void queryClient.invalidateQueries({ queryKey: ['applications'] });
      void queryClient.invalidateQueries({ queryKey: ['applications-summary'] });
      toast('Новый лид добавлен');
      reset();
      onOpenChange(false);
      onCreated(application);
    },
    onError: () => toast('Не удалось добавить лида. Проверьте данные.', 'error'),
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const age = Number(childAge);
    if (childFullName.trim().length < 2) {
      toast('Введите имя ребёнка', 'info');
      return;
    }
    if (!/^\+?[0-9 ()-]{9,20}$/.test(childPhone)) {
      toast('Введите корректный номер ребёнка', 'info');
      return;
    }
    if (parentFullName.trim().length < 2) {
      toast('Введите имя родителя', 'info');
      return;
    }
    if (!/^\+?[0-9 ()-]{9,20}$/.test(parentPhone)) {
      toast('Введите корректный номер родителя', 'info');
      return;
    }
    if (!Number.isInteger(age) || age < 5 || age > 25) {
      toast('Возраст ребёнка должен быть от 5 до 25 лет', 'info');
      return;
    }
    createMutation.mutate();
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !createMutation.isPending) reset();
        onOpenChange(nextOpen);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl outline-none sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-xl font-semibold text-slate-950">
                Добавить нового лида
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-slate-500">
                Для обращений из рекламы, звонков, рекомендаций и офлайн-визитов.
              </Dialog.Description>
            </div>
            <Dialog.Close className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
              <X className="h-5 w-5" />
              <span className="sr-only">Закрыть</span>
            </Dialog.Close>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="flex items-center gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">
                Данные ребёнка
              </p>
              <div className="h-px flex-1 bg-slate-100" />
            </div>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Имя ребёнка</span>
              <input
                autoFocus
                value={childFullName}
                onChange={(event) => setChildFullName(event.target.value)}
                maxLength={120}
                placeholder="Например, Алишер Каримов"
                className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Телефон ребёнка
                </span>
                <input
                  value={childPhone}
                  onChange={(event) => setChildPhone(event.target.value)}
                  inputMode="tel"
                  maxLength={20}
                  placeholder="+998 90 123 45 67"
                  className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Возраст</span>
                <input
                  value={childAge}
                  onChange={(event) => setChildAge(event.target.value)}
                  type="number"
                  min={5}
                  max={25}
                  placeholder="14"
                  className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                />
              </label>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                Данные родителя
              </p>
              <div className="h-px flex-1 bg-slate-100" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Имя родителя</span>
                <input
                  value={parentFullName}
                  onChange={(event) => setParentFullName(event.target.value)}
                  maxLength={120}
                  placeholder="Например, Малика Каримова"
                  className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Телефон родителя</span>
                <input
                  value={parentPhone}
                  onChange={(event) => setParentPhone(event.target.value)}
                  inputMode="tel"
                  maxLength={20}
                  placeholder="+998 90 123 45 68"
                  className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Источник</span>
              <select
                value={source}
                onChange={(event) => setSource(event.target.value as ApplicationSource)}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              >
                {APPLICATION_SOURCE_OPTIONS.filter((option) => option.value !== 'WEBSITE').map(
                  (option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ),
                )}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Уточнение источника <span className="font-normal text-slate-400">(необязательно)</span>
              </span>
              <input
                value={sourceDetails}
                onChange={(event) => setSourceDetails(event.target.value)}
                maxLength={240}
                placeholder="Например, реклама SAT в Instagram"
                className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Первый комментарий <span className="font-normal text-slate-400">(необязательно)</span>
              </span>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={3}
                maxLength={1000}
                placeholder="Что уже известно о клиенте и его цели?"
                className="w-full resize-none rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              />
            </label>

            <div className="flex justify-end gap-3 pt-2">
              <Dialog.Close asChild>
                <Button type="button" variant="outline">Отмена</Button>
              </Dialog.Close>
              <Button
                type="submit"
                loading={createMutation.isPending}
                className="bg-cyan-600 hover:bg-cyan-700 focus:ring-cyan-500"
              >
                Добавить лида
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ApplicationDialog({
  preview,
  onClose,
}: {
  preview: AdmissionApplication;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<ApplicationStatus>(preview.status);
  const [nextCallAt, setNextCallAt] = useState(toLocalInput(preview.nextCallAt));
  const [note, setNote] = useState('');

  const { data: application = preview, isLoading } = useQuery<AdmissionApplication>({
    queryKey: ['application', preview.id],
    queryFn: () => api.get(`/applications/${preview.id}`).then((response) => response.data.data),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      api.patch(`/applications/${preview.id}`, {
        status,
        nextCallAt: nextCallAt ? new Date(nextCallAt).toISOString() : null,
        note: note.trim() || undefined,
      }),
    onSuccess: (response) => {
      queryClient.setQueryData(['application', preview.id], response.data.data);
      void queryClient.invalidateQueries({ queryKey: ['applications'] });
      void queryClient.invalidateQueries({ queryKey: ['applications-summary'] });
      setNote('');
      toast('Результат звонка сохранён');
    },
    onError: () => toast('Не удалось сохранить изменения', 'error'),
  });

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col bg-white shadow-2xl outline-none">
          <div className="flex items-start justify-between border-b border-slate-200 px-5 py-5 sm:px-6">
            <div>
              <Dialog.Title className="text-xl font-semibold text-slate-950">
                {application.fullName}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-slate-500">
                Ребёнку {application.childAge} лет · заявка {formatDateTime(application.createdAt)}
              </Dialog.Description>
              <p className="mt-1 text-xs font-medium text-cyan-700">
                Источник: {applicationSourceLabel(application)}
              </p>
            </div>
            <Dialog.Close className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
              <X className="h-5 w-5" />
              <span className="sr-only">Закрыть</span>
            </Dialog.Close>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Ребёнок</p>
                <p className="mt-1 font-medium text-slate-900">{application.fullName}</p>
                <a href={`tel:${application.phone}`} className="mt-1 block text-sm text-cyan-700 hover:underline">
                  {application.phone}
                </a>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">Родитель</p>
                <p className="mt-1 font-medium text-slate-900">
                  {application.parentFullName || 'Не указан'}
                </p>
                <p className="mt-1 text-sm text-emerald-700">
                  {application.parentPhone || 'Телефон не указан'}
                </p>
              </div>
            </div>

            <a
              href={`tel:${application.parentPhone || application.phone}`}
              className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 font-semibold text-white transition hover:bg-cyan-700"
            >
              <Phone className="h-4 w-4" />
              Позвонить {application.parentPhone ? 'родителю' : application.phone}
            </a>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Результат</span>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value as ApplicationStatus)}
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                >
                  {APPLICATION_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Следующий звонок
                </span>
                <input
                  type="datetime-local"
                  value={nextCallAt}
                  onChange={(event) => setNextCallAt(event.target.value)}
                  className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                />
              </label>
            </div>

            <label className="mt-4 block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Комментарий</span>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={4}
                maxLength={1000}
                placeholder="Что обсудили с клиентом?"
                className="w-full resize-none rounded-lg border border-slate-200 p-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              />
            </label>

            <Button
              type="button"
              loading={updateMutation.isPending}
              onClick={() => updateMutation.mutate()}
              className="mt-4 w-full bg-cyan-600 hover:bg-cyan-700 focus:ring-cyan-500"
            >
              Сохранить результат
            </Button>

            <div className="mt-8">
              <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                <MessageSquareText className="h-4 w-4 text-slate-500" />
                История работы
              </h3>
              {isLoading ? (
                <p className="mt-4 text-sm text-slate-400">Загрузка истории...</p>
              ) : application.activities?.length ? (
                <div className="mt-4 space-y-3">
                  {application.activities.map((activity) => (
                    <div key={activity.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                        <span>
                          {activity.actor.fullName || activity.actor.phone} ·{' '}
                          {formatDateTime(activity.createdAt)}
                        </span>
                        {activity.toStatus ? (
                          <ApplicationStatusBadge status={activity.toStatus} />
                        ) : null}
                      </div>
                      {activity.fromStatus && activity.toStatus ? (
                        <p className="mt-2 text-sm text-slate-600">
                          {APPLICATION_STATUS_LABELS[activity.fromStatus]} →{' '}
                          {APPLICATION_STATUS_LABELS[activity.toStatus]}
                        </p>
                      ) : null}
                      {activity.note ? (
                        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">
                          {activity.note}
                        </p>
                      ) : null}
                      {activity.nextCallAt ? (
                        <p className="mt-2 text-xs font-medium text-cyan-700">
                          Перезвонить: {formatDateTime(activity.nextCallAt)}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-400">История пока пуста.</p>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function ApplicationsWorkspace({
  title = 'Заявки',
  description = 'Обработка обращений и контроль повторных звонков',
  initialCallback = '',
}: {
  title?: string;
  description?: string;
  initialCallback?: CallbackFilter;
}) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ApplicationStatus | ''>('');
  const [callback, setCallback] = useState<CallbackFilter>(initialCallback);
  const [selected, setSelected] = useState<AdmissionApplication | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [currentTime] = useState(() => Date.now());

  const { data: summary } = useQuery<ApplicationsSummary>({
    queryKey: ['applications-summary'],
    queryFn: () => api.get('/applications/summary').then((response) => response.data.data),
  });

  const { data: applications = [], isLoading } = useQuery<AdmissionApplication[]>({
    queryKey: ['applications', { search, status, callback }],
    queryFn: () =>
      api
        .get('/applications', {
          params: {
            search: search.trim() || undefined,
            status: status || undefined,
            callback: callback || undefined,
          },
        })
        .then((response) => response.data.data),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        actions={
          <Button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="gap-2 bg-cyan-600 hover:bg-cyan-700 focus:ring-cyan-500"
          >
            <Plus className="h-4 w-4" />
            Добавить лида
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(({ key, label, icon: Icon, color }) => (
          <Card key={key}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-950">{summary?.[key] ?? '—'}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <div className="grid gap-3 border-b border-slate-100 p-4 lg:grid-cols-[1fr_220px_220px]">
          <label className="relative block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Поиск ребёнка или родителя"
              className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            />
          </label>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as ApplicationStatus | '')}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-cyan-500"
          >
            <option value="">Все статусы</option>
            {APPLICATION_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={callback}
            onChange={(event) => setCallback(event.target.value as CallbackFilter)}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-cyan-500"
          >
            <option value="">Все звонки</option>
            <option value="today">На сегодня</option>
            <option value="overdue">Просроченные</option>
          </select>
        </div>

        {isLoading ? (
          <CardContent className="py-14 text-center text-sm text-slate-400">Загрузка заявок...</CardContent>
        ) : applications.length === 0 ? (
          <CardContent className="py-14 text-center">
            <Headphones className="mx-auto h-9 w-9 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-700">Заявок не найдено</p>
            <p className="mt-1 text-xs text-slate-400">Измените фильтры или дождитесь новых обращений.</p>
          </CardContent>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-left text-xs text-slate-500">
                  <th className="px-4 py-3 font-medium">Ребёнок</th>
                  <th className="px-4 py-3 font-medium">Родитель</th>
                  <th className="px-4 py-3 font-medium">Возраст</th>
                  <th className="px-4 py-3 font-medium">Источник</th>
                  <th className="px-4 py-3 font-medium">Статус</th>
                  <th className="px-4 py-3 font-medium">Следующий звонок</th>
                  <th className="px-4 py-3 font-medium">Ответственный</th>
                  <th className="px-4 py-3 font-medium">Получена</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => {
                  const overdue =
                    application.nextCallAt &&
                    new Date(application.nextCallAt).getTime() < currentTime;
                  return (
                    <tr
                      key={application.id}
                      onClick={() => setSelected(application)}
                      className="cursor-pointer border-b border-slate-100 transition hover:bg-cyan-50/50"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{application.fullName}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{application.phone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">
                          {application.parentFullName || '—'}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {application.parentPhone || '—'}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{application.childAge} лет</td>
                      <td className="max-w-[200px] px-4 py-3 text-slate-600">
                        <span className="line-clamp-2">{applicationSourceLabel(application)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <ApplicationStatusBadge status={application.status} />
                      </td>
                      <td className={`px-4 py-3 ${overdue ? 'font-medium text-red-600' : 'text-slate-600'}`}>
                        {formatDateTime(application.nextCallAt)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {application.assignedTo?.fullName || application.assignedTo?.phone || 'Без менеджера'}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {formatDateTime(application.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {selected ? (
        <ApplicationDialog key={selected.id} preview={selected} onClose={() => setSelected(null)} />
      ) : null}
      <CreateApplicationDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={setSelected}
      />
    </div>
  );
}
