'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  History,
  ImagePlus,
  Loader2,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import api from '@/lib/api';
import { Homework } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { InputField, TextareaField } from '@/components/ui/input-field';
import { toast } from '@/components/ui/toast';
import { HomeworkCard } from '@/components/homework/HomeworkCard';

interface Props {
  groupId: string;
}

interface FormData {
  text: string;
  youtubeUrl?: string;
  dueDate?: string;
}

interface UploadedImage {
  url: string;
  preview: string;
  name: string;
}

export function HomeworkTab({ groupId }: Props) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { register, handleSubmit, reset } = useForm<FormData>();

  const { data: latest, isLoading } = useQuery({
    queryKey: ['homework-latest', groupId],
    queryFn: () =>
      api
        .get(`/homework/latest/${groupId}`)
        .then((r) => (r.data.data as Homework | null) ?? null),
    enabled: !!groupId,
  });

  const createMutation = useMutation({
    mutationFn: (data: FormData) =>
      api.post('/homework', {
        groupId,
        text: data.text,
        youtubeUrl: data.youtubeUrl || undefined,
        dueDate: data.dueDate || undefined,
        imageUrls: images.length ? images.map((img) => img.url) : undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['homework-latest', groupId] });
      qc.invalidateQueries({ queryKey: ['homework', groupId] });
      toast('Домашнее задание создано');
      handleClose();
    },
    onError: (e: unknown) => {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { message?: string | string[] } } })
              .response?.data?.message
          : undefined;
      const text = Array.isArray(msg) ? msg.join(', ') : msg;
      toast(text || 'Не удалось создать домашнее задание', 'error');
    },
  });

  const uploadFiles = async (files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith('image/'));
    if (!imageFiles.length) return;
    setUploading(true);
    const uploaded: UploadedImage[] = [];
    for (const file of imageFiles) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await api.post('/homework/upload-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const url = res.data.data?.url ?? res.data.url;
        const preview = URL.createObjectURL(file);
        uploaded.push({
          url,
          preview,
          name: file.name || 'вставленное изображение',
        });
      } catch {
        toast(`Ошибка загрузки: ${file.name || 'изображение'}`, 'error');
      }
    }
    setImages((prev) => [...prev, ...uploaded]);
    setUploading(false);
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    await uploadFiles(files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const files: File[] = [];
    for (const item of Array.from(items)) {
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        const f = item.getAsFile();
        if (f) files.push(f);
      }
    }
    if (files.length > 0) {
      e.preventDefault();
      void uploadFiles(files);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleClose = () => {
    setShowForm(false);
    images.forEach((img) => URL.revokeObjectURL(img.preview));
    setImages([]);
    reset();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Домашние задания
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Задание с прошлого урока и создание нового.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
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
                Добавить на сегодня
              </>
            )}
          </Button>
          <Link href={`/teacher/groups/${groupId}/homework`}>
            <Button variant="secondary" size="sm" accent="teacher">
              <History className="mr-1.5 h-4 w-4" />
              История
            </Button>
          </Link>
        </div>
      </div>

      {showForm && (
        <Card className="p-4">
          <form
            onSubmit={handleSubmit((d) => createMutation.mutate(d))}
            onPaste={handlePaste}
            className="space-y-3"
          >
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Текст задания *
              </label>
              <TextareaField
                accent="teacher"
                {...register('text', { required: true, minLength: 5 })}
                placeholder="Решить задачи 1–10 из учебника..."
                rows={4}
              />
              <p className="mt-1 text-xs text-slate-400">
                Подсказка: можно вставить изображение прямо сюда (Ctrl + V /
                ⌘ + V).
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Изображения
              </label>
              {images.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-3">
                  {images.map((img, i) => (
                    <div key={i} className="group relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.preview}
                        alt={img.name}
                        className="h-20 w-20 rounded-lg border border-slate-200 object-cover shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow"
                        aria-label="Удалить"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-2.5 text-sm text-slate-500 transition-colors hover:border-emerald-400 hover:text-emerald-600 disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Загрузка...
                  </>
                ) : (
                  <>
                    <ImagePlus className="h-4 w-4" />
                    {images.length > 0
                      ? 'Добавить ещё'
                      : 'Выбрать изображения'}
                  </>
                )}
              </button>
              <p className="mt-1 text-xs text-slate-400">
                JPG, PNG, WebP · до 10 МБ каждое
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  YouTube ссылка
                </label>
                <InputField
                  accent="teacher"
                  {...register('youtubeUrl')}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Срок сдачи
                </label>
                <InputField
                  accent="teacher"
                  type="date"
                  {...register('dueDate')}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                variant="success"
                loading={createMutation.isPending}
                disabled={uploading}
              >
                Создать
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
              >
                Отмена
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div>
        <h4 className="mb-2 text-sm font-semibold text-slate-700">
          Задание с прошлого урока
        </h4>
        {isLoading ? (
          <p className="py-6 text-center text-sm text-slate-400">Загрузка...</p>
        ) : latest ? (
          <HomeworkCard homework={latest} />
        ) : (
          <Card className="flex flex-col items-center justify-center px-6 py-10 text-center">
            <p className="text-sm text-slate-500">
              Для этой группы ещё не добавлено ни одного задания.
            </p>
            <Button
              variant="success"
              size="sm"
              className="mt-3"
              onClick={() => setShowForm(true)}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Создать первое задание
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
