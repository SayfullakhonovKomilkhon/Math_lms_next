'use client';

import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ApiResponse, Homework } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Image as ImageIcon,
  Play
} from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';

export default function StudentHomeworkPage() {
  const { data: homeworksRes, isLoading, isError, refetch } = useQuery({
    queryKey: ['student-homework-all'],
    queryFn: () => api.get<ApiResponse<Homework[]>>('/homework/my').then(res => res.data),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        message="Не удалось загрузить домашние задания"
        description="Попробуйте обновить страницу или повторить запрос позже."
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  const homeworks = homeworksRes?.data || [];
  const latestHw = homeworks[0];
  const historyHw = homeworks.slice(1);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 leading-tight flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-orange-600" />
          Домашние задания
        </h1>
        <p className="text-slate-500 mt-1 ml-11">
          Ваши текущие и прошлые задания
        </p>
      </div>

      {latestHw ? (
        <Card className="border-2 border-orange-200 shadow-lg shadow-orange-100 overflow-hidden">
          <div className="bg-orange-50 px-6 py-3 border-b border-orange-200 flex items-center justify-between">
            <span className="text-xs font-bold text-orange-700 uppercase tracking-widest flex items-center gap-1.5 font-sans">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              Текущее задание
            </span>
            <Badge variant={new Date(latestHw.dueDate || '') < new Date() ? "destructive" : "secondary"} className="font-bold">
              до {latestHw.dueDate ? format(new Date(latestHw.dueDate), 'd MMMM HH:mm', { locale: ru }) : '—'}
            </Badge>
          </div>
          <CardContent className="p-8">
            <div className="prose prose-slate max-w-none">
              <p className="text-lg text-slate-800 leading-relaxed whitespace-pre-wrap">
                {latestHw.text}
              </p>
            </div>

            {latestHw.youtubeUrl && <YoutubeEmbed url={latestHw.youtubeUrl} />}
            
            {latestHw.imageUrls && latestHw.imageUrls.length > 0 && (
              <div className="mt-8 space-y-3">
                <h4 className="flex items-center gap-2 text-sm font-bold text-slate-600 uppercase tracking-wider">
                  <ImageIcon className="h-4 w-4" /> Прикрепленные фото
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {latestHw.imageUrls.map((url, i) => (
                    <Image
                      key={i}
                      src={url}
                      alt="Homework material"
                      width={800}
                      height={600}
                      unoptimized
                      className="h-auto rounded-xl border border-slate-200 shadow-sm transition-colors hover:border-orange-300"
                      onClick={() => window.open(url, '_blank')}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          icon="📚"
          message="Домашних заданий пока нет"
          description="Когда преподаватель добавит новое задание, оно появится здесь."
        />
      )}

      {historyHw.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800">История заданий</h2>
          {historyHw.map((hw) => (
            <HistoryItem key={hw.id} hw={hw} />
          ))}
        </div>
      )}
    </div>
  );
}

function HistoryItem({ hw }: { hw: Homework }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm">
      <div 
        className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-4">
          <div className="bg-slate-100 p-2 rounded-lg">
            <Calendar className="h-4 w-4 text-slate-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">
              {format(new Date(hw.createdAt), 'd MMMM yyyy', { locale: ru })}
            </p>
            <p className="text-xs text-slate-500 line-clamp-1 max-w-[400px]">
              {hw.text}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {hw.dueDate && (
            <span className="text-xs text-slate-400 hidden md:block">
              Срок: {format(new Date(hw.dueDate), 'd.MM')}
            </span>
          )}
          {isOpen ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
        </div>
      </div>
      
      {isOpen && (
        <CardContent className="px-6 pb-6 pt-2 border-t bg-slate-50/30">
          <div className="text-slate-700 whitespace-pre-wrap py-4">
            {hw.text}
          </div>
          {hw.youtubeUrl && <YoutubeEmbed url={hw.youtubeUrl} />}
          {hw.imageUrls && hw.imageUrls.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {hw.imageUrls.map((url, i) => (
                <Image
                  key={i}
                  src={url}
                  alt="HW"
                  width={400}
                  height={225}
                  unoptimized
                  className="aspect-video rounded-lg border bg-white object-cover transition-shadow hover:shadow-md"
                  onClick={() => window.open(url, '_blank')}
                />
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

function YoutubeEmbed({ url }: { url: string }) {
  const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
  if (!videoId) return null;

  return (
    <div className="mt-6 aspect-video rounded-2xl overflow-hidden border-4 border-slate-100 shadow-xl bg-slate-900 group relative">
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
}
