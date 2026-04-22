'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Megaphone, Plus } from 'lucide-react';
import api from '@/lib/api';
import type { Group } from '@/types';
import {
  useAllAnnouncements,
  useDeleteAnnouncement,
  useToggleAnnouncementPin,
} from '@/hooks/useAnnouncements';
import { AnnouncementCard } from '@/components/announcements/AnnouncementCard';
import { AnnouncementCreateForm } from '@/components/announcements/AnnouncementCreateForm';
import { AnnouncementReadersDialog } from '@/components/announcements/AnnouncementReadersDialog';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export default function AdminAnnouncementsPage() {
  const [showForm, setShowForm] = useState(false);
  const [filterGroup, setFilterGroup] = useState<string>('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [readersId, setReadersId] = useState<string | null>(null);

  const { data: groupsData } = useQuery({
    queryKey: ['groups'],
    queryFn: () =>
      api.get<{ data: Group[] }>('/groups').then((r) => r.data.data),
  });
  const groups = (groupsData ?? []).filter((g) => g.isActive);

  // backend поддерживает фильтр только по конкретной группе; "center" фильтруем локально.
  const { data, isLoading } = useAllAnnouncements(
    filterGroup === '' || filterGroup === 'center' ? {} : { groupId: filterGroup },
  );

  const { mutate: togglePin } = useToggleAnnouncementPin();
  const { mutate: deleteAnn, isPending: deleting } = useDeleteAnnouncement();

  const announcements = (data?.data ?? []).filter((a) =>
    filterGroup === 'center' ? a.group === null : true,
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900">
            <Megaphone className="h-7 w-7 text-indigo-600" />
            Управление объявлениями
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Всего объявлений: {data?.meta.total ?? 0}
          </p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          <Plus className="mr-2 h-4 w-4" />
          {showForm ? 'Скрыть форму' : 'Создать объявление'}
        </Button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">Новое объявление</h2>
          <AnnouncementCreateForm
            groups={groups.map((g) => ({ id: g.id, name: g.name }))}
            userRole="ADMIN"
            onSuccess={() => setShowForm(false)}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <label className="text-sm font-medium text-slate-600">Фильтр:</label>
        <select
          value={filterGroup}
          onChange={(e) => setFilterGroup(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        >
          <option value="">Все объявления</option>
          <option value="center">Только для всего центра</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              Группа: {g.name}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex h-[180px] items-center justify-center text-slate-400">
          Загрузка…
        </div>
      ) : announcements.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white py-16 text-center">
          <Megaphone className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="font-medium text-slate-500">Объявлений пока нет</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {announcements.map((a) => (
            <AnnouncementCard
              key={a.id}
              announcement={a}
              canDelete
              canPin
              onDelete={setDeleteId}
              onPin={togglePin}
              onShowReaders={setReadersId}
              showReadStatus={false}
              showReadCount
            />
          ))}
        </div>
      )}

      <AnnouncementReadersDialog
        announcementId={readersId}
        onClose={() => setReadersId(null)}
      />

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
