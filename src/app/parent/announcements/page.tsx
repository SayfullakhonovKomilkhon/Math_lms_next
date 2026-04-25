'use client';

import { Megaphone, Check } from 'lucide-react';
import {
  useMarkAllAnnouncementsRead,
  useMarkAnnouncementRead,
  useMyAnnouncements,
} from '@/hooks/useAnnouncements';
import { AnnouncementCard } from '@/components/announcements/AnnouncementCard';
import { CardSkeleton } from '@/components/ui/Skeleton';

export default function ParentAnnouncementsPage() {
  const { data, isLoading } = useMyAnnouncements({ limit: 50 });
  const { mutate: markRead } = useMarkAnnouncementRead();
  const { mutate: markAllRead, isPending: markingAll } =
    useMarkAllAnnouncementsRead();

  const announcements = data?.data ?? [];
  const unreadCount = data?.meta.unreadCount ?? 0;

  return (
    <div className="space-y-5 pb-2">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Megaphone className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold leading-tight text-slate-900 sm:text-2xl">
            Объявления
          </h1>
          <p className="mt-0.5 text-[12px] text-slate-500 sm:text-sm">
            Новости центра и сообщения для группы ребёнка
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            disabled={markingAll}
            onClick={() => markAllRead()}
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-[11px] font-semibold text-blue-700 transition-colors active:bg-blue-100 disabled:opacity-60"
          >
            <Check className="h-3 w-3" />
            {unreadCount}
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : announcements.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white py-16 text-center">
          <Megaphone className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="font-medium text-slate-500">Объявлений пока нет</p>
          <p className="mt-0.5 text-[13px] text-slate-400">
            Здесь будут сообщения от учителей и администрации.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <AnnouncementCard
              key={a.id}
              announcement={a}
              onRead={markRead}
              showReadStatus
            />
          ))}
        </div>
      )}
    </div>
  );
}
