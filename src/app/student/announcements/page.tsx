'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ApiResponse, Announcement } from '@/types';
import { AnnouncementCard } from '@/components/announcements/AnnouncementCard';
import { Megaphone, Search } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

export default function StudentAnnouncementsPage() {
  const [search, setSearch] = useState('');

  const { data: announcementsRes, isLoading } = useQuery({
    queryKey: ['student-announcements'],
    queryFn: () => api.get<ApiResponse<Announcement[]>>('/announcements/my').then(res => res.data),
  });

  if (isLoading) {
    return <div className="flex h-[400px] items-center justify-center">Загрузка объявлений...</div>;
  }

  const announcements = announcementsRes?.data || [];
  
  const filtered = announcements.filter(a => 
    a.title.toLowerCase().includes(search.toLowerCase()) || 
    a.message.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 leading-tight flex items-center gap-3">
            <Megaphone className="h-8 w-8 text-teal-600" />
            Объявления
          </h1>
          <p className="text-slate-500 mt-1 ml-11">
            Важные новости центра и сообщения от ваших учителей
          </p>
        </div>
        
        <div className="relative w-full md:w-72 font-sans font-medium">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            className="pl-10 bg-white border-slate-200" 
            placeholder="Поиск объявлений..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6">
        {filtered.length > 0 ? (
          filtered.map((announcement) => (
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
            {search && <p className="text-sm text-slate-400 mt-1">По вашему запросу ничего не найдено</p>}
          </div>
        )}
      </div>
    </div>
  );
}
