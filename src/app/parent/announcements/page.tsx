'use client';

import { Megaphone } from 'lucide-react';
import {
  useMarkAllAnnouncementsRead,
  useMarkAnnouncementRead,
  useMyAnnouncements,
} from '@/hooks/useAnnouncements';
import { AnnouncementCard } from '@/components/announcements/AnnouncementCard';
import { Button } from '@/components/ui/button';

export default function ParentAnnouncementsPage() {
  const { data, isLoading } = useMyAnnouncements({ limit: 50 });
  const { mutate: markRead } = useMarkAnnouncementRead();
  const { mutate: markAllRead, isPending: markingAll } =
    useMarkAllAnnouncementsRead();

  const announcements = data?.data ?? [];
  const unreadCount = data?.meta.unreadCount ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold leading-tight text-slate-900">
            <Megaphone className="h-8 w-8 text-blue-600" />
            Объявления
          </h1>
          <p className="ml-11 mt-1 text-slate-500">
            Новости центра и сообщения для группы вашего ребёнка
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={() => markAllRead()}
            loading={markingAll}
          >
            Отметить все прочитанными ({unreadCount})
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex h-[200px] items-center justify-center text-slate-400">
          Загрузка…
        </div>
      ) : announcements.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white py-16 text-center">
          <Megaphone className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="font-medium text-slate-500">Объявлений пока нет</p>
          <p className="text-sm text-slate-400">
            Здесь будут появляться сообщения от учителей и администрации.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
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
