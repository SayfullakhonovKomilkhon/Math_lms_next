'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ApiResponse, Homework } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calendar, Clock, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function ParentHomeworkPage() {
  const { data: homeworksRes, isLoading } = useQuery({
    queryKey: ['parent-child-homework'],
    queryFn: () => api.get<ApiResponse<Homework[]>>('/parents/me/child/homework').then(res => res.data),
  });

  if (isLoading) {
    return <div className="flex h-[400px] items-center justify-center">Загрузка данных...</div>;
  }

  const homeworks = homeworksRes?.data || [];
  const latestHw = homeworks[0];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 leading-tight flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-blue-600" />
          Домашние задания
        </h1>
        <p className="text-slate-500 mt-1 ml-11">
          Контроль выполнения учебных задач вашего ребенка
        </p>
      </div>

      {latestHw ? (
        <Card className="border shadow-lg overflow-hidden">
          <div className="bg-slate-50 px-6 py-3 border-b flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              Последнее выданное задание
            </span>
            <Badge variant={new Date(latestHw.dueDate || '') < new Date() ? "destructive" : "secondary"}>
              Срок: {latestHw.dueDate ? format(new Date(latestHw.dueDate), 'd MMMM', { locale: ru }) : 'Не указан'}
            </Badge>
          </div>
          <CardContent className="p-8">
            <div className="prose prose-slate max-w-none">
              <p className="text-lg text-slate-800 leading-relaxed whitespace-pre-wrap">
                {latestHw.text}
              </p>
            </div>

            {latestHw.imageUrls && latestHw.imageUrls.length > 0 && (
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                {latestHw.imageUrls.map((url, i) => (
                  <img 
                    key={i} 
                    src={url} 
                    alt="HW" 
                    className="rounded-xl border border-slate-200 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => window.open(url, '_blank')}
                  />
                ))}
              </div>
            )}
            
            {latestHw.teacher && (
                <div className="mt-8 pt-4 border-t flex items-center gap-2 text-xs text-slate-400 font-medium italic">
                    <Clock className="h-3 w-3" />
                    Задание выдано преподавателем: {latestHw.teacher.fullName}
                </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
           <BookOpen className="h-12 w-12 text-slate-200 mx-auto mb-4" />
           <p className="text-slate-400 font-medium">Актуальных заданий нет</p>
        </div>
      )}

      {homeworks.length > 1 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-800">Предыдущие задания</h3>
          {homeworks.slice(1, 5).map(hw => (
            <Card key={hw.id} className="shadow-sm border-slate-200">
              <CardContent className="p-5 flex items-start justify-between gap-6">
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    От {format(new Date(hw.createdAt), 'd MMMM', { locale: ru })}
                  </p>
                  <p className="text-sm text-slate-700 line-clamp-2 leading-relaxed">
                    {hw.text}
                  </p>
                </div>
                <Badge variant="outline" className="shrink-0 bg-slate-50">Выполнено</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
