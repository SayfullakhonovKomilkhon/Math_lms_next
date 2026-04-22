'use client';

import { useMemo, useState } from 'react';
import { Megaphone, Search } from 'lucide-react';
import {
  useMarkAllAnnouncementsRead,
  useMarkAnnouncementRead,
  useMyAnnouncements,
} from '@/hooks/useAnnouncements';
import { AnnouncementCard } from '@/components/announcements/AnnouncementCard';
import { PageTitle } from '../_components/PageTitle';
import styles from './announcements.module.css';

export default function StudentAnnouncementsPage() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useMyAnnouncements({ limit: 50 });
  const { mutate: markRead } = useMarkAnnouncementRead();
  const { mutate: markAllRead, isPending: markingAll } =
    useMarkAllAnnouncementsRead();

  const unreadCount = data?.meta.unreadCount ?? 0;

  const filtered = useMemo(() => {
    const list = data?.data ?? [];
    const q = search.toLowerCase();
    return list.filter(
      (a) => a.title.toLowerCase().includes(q) || a.message.toLowerCase().includes(q),
    );
  }, [data, search]);

  return (
    <div>
      <PageTitle
        kicker="Объявления"
        title="Новости группы"
        description="Сообщения от учителей и администрации."
        gradient
      />

      <div className={styles.toolbar}>
        <div className={styles.search}>
          <Search size={18} />
          <input
            placeholder="Поиск по объявлениям…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            className={styles.markAll}
            onClick={() => markAllRead()}
            disabled={markingAll}
          >
            Отметить все прочитанными ({unreadCount})
          </button>
        )}
      </div>

      {isLoading ? (
        <div className={styles.empty}>Загрузка…</div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <Megaphone size={36} />
          <p>Объявлений пока нет</p>
          <span>Здесь будут появляться сообщения от учителей и администрации.</span>
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map((a) => (
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
