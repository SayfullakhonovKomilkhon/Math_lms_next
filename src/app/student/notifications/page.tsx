'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Check } from 'lucide-react';
import api from '@/lib/api';
import { PageTitle } from '../_components/PageTitle';
import { SButton } from '../_components/SButton';
import { mockNotifications } from '../_lib/mockData';
import styles from './notifications.module.css';

interface Notification {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const TYPE_ICONS: Record<string, string> = {
  PAYMENT: '💳',
  HOMEWORK: '📚',
  ATTENDANCE: '📋',
  ACHIEVEMENT: '🏆',
  ANNOUNCEMENT: '📢',
};

const FILTERS: Array<{ key: string; label: string }> = [
  { key: '', label: 'Все' },
  { key: 'ACHIEVEMENT', label: '🏆 Достижения' },
  { key: 'HOMEWORK', label: '📚 ДЗ' },
  { key: 'PAYMENT', label: '💳 Оплата' },
  { key: 'ANNOUNCEMENT', label: '📢 Новости' },
];

function formatTime(d: string) {
  const date = new Date(d);
  const diff = Date.now() - date.getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'только что';
  if (m < 60) return `${m} мин назад`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ч назад`;
  const days = Math.floor(h / 24);
  if (days === 1) return 'вчера';
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}

export default function StudentNotificationsPage() {
  const qc = useQueryClient();
  const [typeFilter, setTypeFilter] = useState('');

  const { data } = useQuery<{ total: number; notifications: Notification[] }>({
    queryKey: ['notifications', typeFilter],
    queryFn: () => {
      const params = new URLSearchParams({ limit: '50', page: '0' });
      if (typeFilter) params.append('type', typeFilter);
      return api.get(`/notifications?${params}`).then((r) => r.data.data);
    },
    retry: 0,
  });

  const list = data?.notifications ?? mockNotifications;
  const filtered = typeFilter ? list.filter((n) => n.type === typeFilter) : list;
  const unread = filtered.some((n) => !n.isRead);

  const markRead = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notif-count'] });
    },
  });

  const markAll = useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notif-count'] });
    },
  });

  return (
    <div>
      <PageTitle
        kicker="Уведомления"
        title="Что нового"
        description="События, достижения и важные напоминания."
        gradient
      />

      <div className={styles.filters} role="tablist">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`${styles.chip} ${typeFilter === f.key ? styles.active : ''}`}
            onClick={() => setTypeFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {unread ? (
        <div className={styles.markAll}>
          <SButton size="sm" variant="ghost" onClick={() => markAll.mutate()}>
            <Check size={14} /> Прочитать все
          </SButton>
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <span>🔔</span>
          Уведомлений пока нет
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map((n) => (
            <div
              key={n.id}
              className={`${styles.item} ${n.isRead ? '' : styles.unread}`}
              onClick={() => !n.isRead && markRead.mutate(n.id)}
            >
              <span className={styles.icon}>{TYPE_ICONS[n.type] ?? '🔔'}</span>
              <div className={styles.body}>
                <div className={`${styles.msg} ${n.isRead ? styles.read : ''}`}>
                  {n.message}
                </div>
                <div className={styles.when}>{formatTime(n.createdAt)}</div>
              </div>
              {!n.isRead ? <span className={styles.dot} aria-hidden /> : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
