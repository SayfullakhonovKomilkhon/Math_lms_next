'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check } from 'lucide-react';
import api from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';

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

const TYPE_LABELS: Record<string, string> = {
  '': 'Все',
  PAYMENT: 'Оплата',
  HOMEWORK: 'ДЗ',
  ACHIEVEMENT: 'Достижения',
  ANNOUNCEMENT: 'Объявления',
};

function formatNotifTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const dDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const time = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  if (dDate.getTime() === today.getTime()) return `сегодня ${time}`;
  if (dDate.getTime() === yesterday.getTime()) return `вчера ${time}`;
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}

const LIMIT = 20;

export default function NotificationsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(0);
  const [typeFilter, setTypeFilter] = useState('');

  const { data, isLoading } = useQuery<{ total: number; notifications: Notification[] }>({
    queryKey: ['notifications', page, typeFilter],
    queryFn: () => {
      const params = new URLSearchParams({ limit: String(LIMIT), page: String(page) });
      if (typeFilter) params.append('type', typeFilter);
      return api.get(`/notifications?${params}`).then((r) => r.data.data);
    },
  });

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

  const notifications = data?.notifications ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / LIMIT);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Уведомления"
        description={`Всего: ${total}`}
        actions={
          unreadCount > 0 ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => markAll.mutate()}
              loading={markAll.isPending}
            >
              <Check className="mr-1.5 h-4 w-4" />
              Прочитать все
            </Button>
          ) : undefined
        }
      />

      {/* Type filter */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(TYPE_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => { setTypeFilter(key); setPage(0); }}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              typeFilter === key
                ? 'bg-violet-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {key && TYPE_ICONS[key] ? `${TYPE_ICONS[key]} ` : ''}{label}
          </button>
        ))}
      </div>

      <Card>
        {isLoading ? (
          <p className="py-10 text-center text-sm text-slate-400">Загрузка...</p>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-slate-400">
            <Bell className="mb-3 h-10 w-10 opacity-30" />
            <p className="text-sm">Нет уведомлений</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.isRead && markRead.mutate(n.id)}
                className={`flex cursor-pointer gap-4 px-5 py-4 transition-colors hover:bg-slate-50 ${!n.isRead ? 'bg-blue-50/40' : ''}`}
              >
                <span className="mt-0.5 text-xl">{TYPE_ICONS[n.type] ?? '🔔'}</span>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm ${n.isRead ? 'text-slate-600' : 'font-medium text-slate-800'}`}>
                    {n.message}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">{formatNotifTime(n.createdAt)}</p>
                </div>
                {!n.isRead && (
                  <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Страница {page + 1} из {totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              ←
            </Button>
            <Button variant="secondary" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
              →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
