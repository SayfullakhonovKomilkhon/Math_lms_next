'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

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

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'только что';
  if (mins < 60) return `${mins} мин назад`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ч назад`;
  const days = Math.floor(hours / 24);
  return `${days} дн назад`;
}

export function NotificationBell() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data: countData } = useQuery<{ count: number }>({
    queryKey: ['notif-count'],
    queryFn: () => api.get('/notifications/unread-count').then((r) => r.data.data),
    refetchInterval: 30000,
    enabled: !!user,
  });

  const { data: listData } = useQuery<{ notifications: Notification[] }>({
    queryKey: ['notif-list'],
    queryFn: () => api.get('/notifications?limit=5').then((r) => r.data.data),
    enabled: open,
  });

  const markRead = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notif-count'] });
      qc.invalidateQueries({ queryKey: ['notif-list'] });
    },
  });

  const markAll = useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notif-count'] });
      qc.invalidateQueries({ queryKey: ['notif-list'] });
    },
  });

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const count = countData?.count ?? 0;
  const notifications = listData?.notifications ?? [];
  const rolePrefix = user?.role?.toLowerCase() ?? 'student';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="font-semibold text-slate-800">Уведомления</p>
            {count > 0 && (
              <button
                onClick={() => markAll.mutate()}
                className="text-xs text-violet-600 hover:underline"
              >
                Прочитать все
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">Нет уведомлений</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && markRead.mutate(n.id)}
                  className={`flex cursor-pointer gap-3 px-4 py-3 hover:bg-slate-50 ${!n.isRead ? 'bg-blue-50/40' : ''}`}
                >
                  <span className="mt-0.5 text-lg">{TYPE_ICONS[n.type] ?? '🔔'}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-700">{n.message}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{relativeTime(n.createdAt)}</p>
                  </div>
                  {!n.isRead && (
                    <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                  )}
                </div>
              ))
            )}
          </div>

          <div className="border-t border-slate-100 px-4 py-2.5">
            <Link
              href={`/${rolePrefix}/notifications`}
              onClick={() => setOpen(false)}
              className="block text-center text-sm font-medium text-violet-600 hover:underline"
            >
              Все уведомления
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
