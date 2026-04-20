'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { BookOpen, Calendar, Plus, X } from 'lucide-react';
import api from '@/lib/api';
import { LessonTopic } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { InputField, TextareaField } from '@/components/ui/input-field';
import { toast } from '@/components/ui/toast';
import { formatDate } from '@/lib/utils';

interface Props {
  groupId: string;
}

interface FormData {
  date: string;
  topic: string;
  materialsRaw?: string;
}

export function TopicsTab({ groupId }: Props) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset } = useForm<FormData>();

  const { data: topics = [], isLoading } = useQuery({
    queryKey: ['lesson-topics', groupId],
    queryFn: () =>
      api
        .get(`/lesson-topics?groupId=${groupId}`)
        .then((r) => r.data.data as LessonTopic[]),
    enabled: !!groupId,
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
      qc.invalidateQueries({ queryKey: ['lesson-topic-suggestions'] });
      toast('Тема урока добавлена');
      setShowForm(false);
      reset();
    },
    onError: (e: unknown) => {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { message?: string | string[] } } })
              .response?.data?.message
          : undefined;
      const text = Array.isArray(msg) ? msg.join(', ') : msg;
      toast(text || 'Не удалось добавить тему', 'error');
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Темы уроков
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            История пройденных тем и планирование для этой группы.
          </p>
        </div>
        <Button
          variant="success"
          size="sm"
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? (
            <>
              <X className="mr-1.5 h-4 w-4" />
              Отменить
            </>
          ) : (
            <>
              <Plus className="mr-1.5 h-4 w-4" />
              Добавить тему
            </>
          )}
        </Button>
      </div>

      {showForm && (
        <Card className="p-4">
          <form
            onSubmit={handleSubmit((d) => createMutation.mutate(d))}
            className="space-y-3"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Дата урока *
                </label>
                <InputField
                  accent="teacher"
                  type="date"
                  {...register('date', { required: true })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Тема *
                </label>
                <InputField
                  accent="teacher"
                  {...register('topic', { required: true, minLength: 3 })}
                  placeholder="Например, производные"
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
                placeholder="Дополнительные материалы, ссылки, заметки..."
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                variant="success"
                loading={createMutation.isPending}
              >
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
        </Card>
      )}

      <div className="max-h-[600px] overflow-y-auto rounded-xl border border-slate-200/90 bg-white">
        {isLoading ? (
          <p className="py-10 text-center text-sm text-slate-400">
            Загрузка...
          </p>
        ) : topics.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">
            Темы уроков ещё не добавлены
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {topics.map((topic) => {
              const materials =
                topic.materials && typeof topic.materials === 'object'
                  ? (topic.materials as Record<string, unknown>)
                  : null;
              const notes = materials?.notes
                ? String(materials.notes)
                : null;
              return (
                <li key={topic.id} className="flex items-start gap-3 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-slate-900">{topic.topic}</h4>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(topic.date)}</span>
                      {topic.teacher && (
                        <span className="text-slate-400">
                          • {topic.teacher.fullName}
                        </span>
                      )}
                    </div>
                    {notes && (
                      <p className="mt-1.5 text-sm text-slate-600">{notes}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
