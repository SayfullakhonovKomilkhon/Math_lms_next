'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  CheckCheck,
  GraduationCap,
  Heart,
  ShieldCheck,
  User,
  Users,
  X,
} from 'lucide-react';
import {
  useAnnouncementReaders,
  type AnnouncementReader,
} from '@/hooks/useAnnouncements';
import { cn } from '@/lib/utils';

interface Props {
  announcementId: string | null;
  onClose: () => void;
}

const ROLE_META: Record<
  AnnouncementReader['role'],
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  STUDENT: {
    label: 'Ученик',
    icon: GraduationCap,
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  PARENT: {
    label: 'Родитель',
    icon: Heart,
    color: 'bg-pink-50 text-pink-700 border-pink-200',
  },
  TEACHER: {
    label: 'Учитель',
    icon: User,
    color: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  ADMIN: {
    label: 'Админ',
    icon: ShieldCheck,
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  SUPER_ADMIN: {
    label: 'Супер-админ',
    icon: ShieldCheck,
    color: 'bg-violet-50 text-violet-700 border-violet-200',
  },
};

export function AnnouncementReadersDialog({ announcementId, onClose }: Props) {
  const { data, isLoading, isError, refetch } = useAnnouncementReaders(announcementId);

  const open = !!announcementId;
  const readers = data?.readers ?? [];
  const readCount = data?.readCount ?? 0;
  const recipientCount = data?.recipientCount ?? 0;
  const percent =
    recipientCount > 0 ? Math.round((readCount / recipientCount) * 100) : 0;

  return (
    <Dialog.Root open={open} onOpenChange={(v) => (!v ? onClose() : undefined)}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 flex max-h-[min(85vh,680px)] w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
          aria-describedby={undefined}
        >
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-6 py-4">
            <div className="min-w-0">
              <Dialog.Title className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <CheckCheck className="h-5 w-5 text-emerald-600" />
                Кто прочитал объявление
              </Dialog.Title>
              {data?.announcement.title && (
                <p className="mt-0.5 truncate text-sm text-slate-500">
                  «{data.announcement.title}»
                </p>
              )}
            </div>
            <Dialog.Close
              className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              aria-label="Закрыть"
            >
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-3">
            {isLoading ? (
              <div className="h-6 animate-pulse rounded bg-slate-200" />
            ) : (
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                  <CheckCheck className="h-4 w-4 text-emerald-600" />
                  Прочитали: <strong>{readCount}</strong>
                </span>
                <span className="inline-flex items-center gap-1.5 text-slate-500">
                  <Users className="h-4 w-4" />
                  Получателей: <strong>{recipientCount}</strong>
                </span>
                <span
                  className={cn(
                    'ml-auto inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                    percent >= 80
                      ? 'bg-emerald-100 text-emerald-700'
                      : percent >= 40
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-200 text-slate-700',
                  )}
                >
                  {percent}% прочитано
                </span>
              </div>
            )}

            {!isLoading && recipientCount > 0 && (
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    percent >= 80
                      ? 'bg-emerald-500'
                      : percent >= 40
                        ? 'bg-amber-500'
                        : 'bg-slate-400',
                  )}
                  style={{ width: `${Math.min(percent, 100)}%` }}
                />
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-2 py-2">
            {isLoading ? (
              <div className="space-y-2 px-4 py-3">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
                ))}
              </div>
            ) : isError ? (
              <div className="py-12 text-center">
                <p className="text-sm text-slate-500">Не удалось загрузить список.</p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Повторить
                </button>
              </div>
            ) : readers.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-400">
                Пока никто не прочитал объявление.
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {readers.map((r) => (
                  <ReaderRow key={r.userId} reader={r} />
                ))}
              </ul>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ReaderRow({ reader }: { reader: AnnouncementReader }) {
  const meta = ROLE_META[reader.role];
  const RoleIcon = meta.icon;
  return (
    <li className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-slate-50">
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-semibold uppercase',
          meta.color,
        )}
        aria-hidden
      >
        {getInitials(reader.fullName)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="truncate text-sm font-medium text-slate-900">{reader.fullName}</p>
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold',
              meta.color,
            )}
          >
            <RoleIcon className="h-3 w-3" />
            {meta.label}
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs text-slate-500">
          {reader.group ? `Группа: ${reader.group.name}` : null}
          {reader.group && reader.extra ? ' · ' : null}
          {reader.extra}
          {!reader.group && !reader.extra ? reader.phone : null}
        </p>
      </div>
      <div className="shrink-0 text-right text-xs text-slate-400">
        {format(new Date(reader.readAt), 'd MMM, HH:mm', { locale: ru })}
      </div>
    </li>
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}
