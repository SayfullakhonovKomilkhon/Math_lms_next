'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ApiResponse, Announcement } from '@/types';
import { AnnouncementCard } from '@/components/announcements/AnnouncementCard';
import { Megaphone } from 'lucide-react';

export default function ParentAnnouncementsPage() {
  const { data: announcementsRes, isLoading } = useQuery({
    queryKey: ['parent-announcements'],
    queryFn: () => api.get<ApiResponse<Announcement[]>>('/announcements/my').then(res => res.data),
  });

  if (isLoading) {
    return <div className="flex h-[400px] items-center justify-center">Загрузка...</div>;
  }

  const announcements = announcementsRes?.data || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 leading-tight flex items-center gap-3">
          <Megaphone className="h-8 w-8 text-blue-600" />
          Объявления
        </h1>
        <p className="text-slate-500 mt-1 ml-11">
          Новости центра и важные сообщения для родителей
        </p>
      </div>

      <div className="grid gap-6">
        {announcements.length > 0 ? (
          announcements.map((announcement) => (
            <AnnouncementCard 
              key={announcement.id}
              title={announcement.title}
              message={announcement.message}
              createdAt={announcement.createdAt}
              authorName={announcement.authorName}
            />
          ))
        ) : (
          <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
            <Megaphone className="h-12 w-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">Объявлений пока нет</p>
          </div>
        )}
      </div>
    </div>
  );
}
