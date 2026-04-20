'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Megaphone, Search } from 'lucide-react';
import api from '@/lib/api';
import type { ApiResponse, Announcement } from '@/types';
import { PageTitle } from '../_components/PageTitle';
import { mockAnnouncements } from '../_lib/mockData';
import styles from './announcements.module.css';

function formatAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return 'только что';
  if (h < 24) return `${h} ч назад`;
  const days = Math.floor(h / 24);
  if (days === 1) return 'вчера';
  return `${days} дн назад`;
}

export default function StudentAnnouncementsPage() {
  const [search, setSearch] = useState('');

  const { data } = useQuery({
    queryKey: ['student-announcements'],
    queryFn: () =>
      api.get<ApiResponse<Announcement[]>>('/announcements/my').then((r) => r.data.data ?? []),
    retry: 0,
  });

  const announcements: Announcement[] =
    data && data.length > 0
      ? data
      : mockAnnouncements.map((a) => ({ ...a, groupName: undefined }));

  const filtered = useMemo(
    () =>
      announcements.filter(
        (a) =>
          a.title.toLowerCase().includes(search.toLowerCase()) ||
          a.message.toLowerCase().includes(search.toLowerCase()),
      ),
    [announcements, search],
  );

  return (
    <div>
      <PageTitle
        kicker="Объявления"
        title="Новости группы"
        description="Сообщения от учителей и администрации."
        gradient
      />

      <div className={styles.search}>
        <Search size={18} />
        <input
          placeholder="Поиск по объявлениям…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <span>📢</span>
          Объявлений пока нет
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map((a) => (
            <article key={a.id} className={styles.card}>
              <div className={styles.head}>
                <div className={styles.title}>{a.title}</div>
                <div className={styles.time}>{formatAgo(a.createdAt)}</div>
              </div>
              <p className={styles.msg}>{a.message}</p>
              {a.authorName ? (
                <div className={styles.author}>
                  <Megaphone size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                  {a.authorName}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
