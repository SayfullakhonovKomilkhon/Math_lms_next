'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Megaphone, Plus } from 'lucide-react';
import api from '@/lib/api';
import type { Group } from '@/types';
import {
  useDeleteAnnouncement,
  useMarkAllAnnouncementsRead,
  useMarkAnnouncementRead,
  useMyAnnouncements,
} from '@/hooks/useAnnouncements';
import { useAuth } from '@/hooks/useAuth';
import { AnnouncementCard } from '@/components/announcements/AnnouncementCard';
import { AnnouncementCreateForm } from '@/components/announcements/AnnouncementCreateForm';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export default function TeacherAnnouncementsPage() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: groups = [] } = useQuery({
    queryKey: ['teacher-groups'],
    queryFn: () =>
      api.get<{ data: Group[] }>('/groups').then((r) => r.data.data),
  });
  const activeGroups = (groups as Group[]).filter((g) => g.isActive);

  const { data, isLoading } = useMyAnnouncements({ limit: 50 });
  const { mutate: markRead } = useMarkAnnouncementRead();
  const { mutate: markAllRead, isPending: markingAll } =
    useMarkAllAnnouncementsRead();
  const { mutate: deleteAnn, isPending: deleting } = useDeleteAnnouncement();

  const announcements = data?.data ?? [];
  const unreadCount = data?.meta.unreadCount ?? 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900">
            <Megaphone className="h-7 w-7 text-emerald-600" />
            Объявления
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Создавайте и управляйте объявлениями для своих групп.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={() => markAllRead()}
              loading={markingAll}
            >
              Прочитать все ({unreadCount})
            </Button>
          )}
          <Button onClick={() => setShowForm((v) => !v)}>
            <Plus className="mr-2 h-4 w-4" />
            {showForm ? 'Скрыть форму' : 'Создать объявление'}
          </Button>
        </div>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">
            Новое объявление
          </h2>
          {activeGroups.length === 0 ? (
            <p className="text-sm text-slate-500">
              У вас пока нет активных групп, для которых можно создать объявление.
            </p>
          ) : (
            <AnnouncementCreateForm
              groups={activeGroups.map((g) => ({ id: g.id, name: g.name }))}
              userRole="TEACHER"
              onSuccess={() => setShowForm(false)}
              onCancel={() => setShowForm(false)}
            />
          )}
        </div>
      )}

      {isLoading ? (
        <div className="flex h-[180px] items-center justify-center text-slate-400">
          Загрузка…
        </div>
      ) : announcements.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white py-16 text-center">
          <Megaphone className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="font-medium text-slate-500">Объявлений пока нет</p>
          <p className="text-sm text-slate-400">
            Нажмите «Создать объявление», чтобы отправить сообщение своей группе.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {announcements.map((a) => (
            <AnnouncementCard
              key={a.id}
              announcement={a}
              onRead={markRead}
              canDelete={a.authorId === user?.id}
              onDelete={setDeleteId}
              showReadStatus
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Удалить объявление?"
        description="Объявление будет удалено для всех получателей. Это действие нельзя отменить."
        variant="danger"
        confirmLabel="Удалить"
        confirmLoading={deleting}
        onConfirm={() =>
          deleteId &&
          deleteAnn(deleteId, {
            onSettled: () => setDeleteId(null),
          })
        }
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
