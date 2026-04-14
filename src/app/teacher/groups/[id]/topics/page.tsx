'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import { LessonTopic } from '@/types';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { Plus, X, BookOpen, Calendar } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { InputField, TextareaField } from '@/components/ui/input-field';
import { formatDate } from '@/lib/utils';

interface FormData {
  date: string;
  topic: string;
  materialsRaw?: string;
}

export default function TopicsPage() {
  const { id: groupId } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset } = useForm<FormData>();

  const { data: topics = [], isLoading } = useQuery({
    queryKey: ['lesson-topics', groupId],
    queryFn: () =>
      api.get(`/lesson-topics?groupId=${groupId}`).then((r) => r.data.data as LessonTopic[]),
  });

  const createMutation = useMutation({
    mutationFn: (data: FormData) => {
      let materials: Record<string, unknown> | undefined;
      if (data.materialsRaw?.trim()) {
        try {
          materials = JSON.parse(data.materialsRaw);
        } catch {
          materials = { notes: data.materialsRaw };
        }
      }
      return api.post('/lesson-topics', {
        groupId,
        date: data.date,
        topic: data.topic,
        materials,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lesson-topics', groupId] });
      toast('Тема урока добавлена');
      setShowForm(false);
      reset();
    },
    onError: (e: unknown) => {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast(msg || 'Ошибка', 'error');
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Темы уроков"
        description="История пройденных тем и планирование"
        actions={
          <Button variant="success" onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Добавить тему
          </Button>
        }
      />

      {showForm && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <h2 className="font-semibold text-slate-900">Новая тема урока</h2>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Закрыть"
            >
              <X className="h-4 w-4" />
            </button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Дата урока *</label>
                  <InputField
                    accent="teacher"
                    type="date"
                    {...register('date', { required: true })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Тема *</label>
                  <InputField
                    accent="teacher"
                    {...register('topic', { required: true })}
                    placeholder="Квадратные уравнения — формула дискриминанта"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Материалы / заметки
                </label>
                <TextareaField
                  accent="teacher"
                  rows={3}
                  {...register('materialsRaw')}
                  placeholder="Дополнительные материалы, ссылки, заметки для себя..."
                />
              </div>
              <div className="flex gap-3">
                <Button type="submit" variant="success" loading={createMutation.isPending}>
                  Добавить
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowForm(false);
                    reset();
                  }}
                >
                  Отмена
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading && <p className="text-slate-400">Загрузка...</p>}
      {!isLoading && topics.length === 0 && (
        <p className="py-8 text-center text-slate-400">Темы уроков ещё не добавлены</p>
      )}

      <div className="space-y-3">
        {topics.map((topic) => (
          <Card key={topic.id}>
            <CardContent className="flex items-start gap-4 py-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-slate-900">{topic.topic}</h3>
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(topic.date)}</span>
                  {topic.teacher && (
                    <span className="text-slate-400">• {topic.teacher.fullName}</span>
                  )}
                </div>
                {topic.materials && typeof topic.materials === 'object' && (
                  <p className="mt-2 text-sm text-slate-600">
                    {(topic.materials as Record<string, unknown>).notes
                      ? String((topic.materials as Record<string, unknown>).notes)
                      : JSON.stringify(topic.materials)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
