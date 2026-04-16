'use client';

import { useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import { Homework } from '@/types';
import { HomeworkCard } from '@/components/homework/HomeworkCard';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { Plus, X, ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { InputField, TextareaField } from '@/components/ui/input-field';

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

export default function HomeworkPage() {
  const { id: groupId } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { register, handleSubmit, reset } = useForm<FormData>();

  const { data: homeworks = [], isLoading } = useQuery({
    queryKey: ['homework', groupId],
    queryFn: () => api.get(`/homework?groupId=${groupId}`).then((r) => r.data.data as Homework[]),
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    setUploading(true);
    const uploaded: UploadedImage[] = [];

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await api.post('/homework/upload-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const url = res.data.data?.url ?? res.data.url;
        const preview = URL.createObjectURL(file);
        uploaded.push({ url, preview, name: file.name });
      } catch {
        toast(`Ошибка загрузки: ${file.name}`, 'error');
      }
    }

    setImages((prev) => [...prev, ...uploaded]);
    setUploading(false);
    // reset file input so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

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
      qc.invalidateQueries({ queryKey: ['homework', groupId] });
      toast('Домашнее задание создано');
      setShowForm(false);
      setImages([]);
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

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/homework/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['homework', groupId] });
      toast('Домашнее задание удалено');
    },
    onError: () => toast('Ошибка при удалении', 'error'),
  });

  const handleClose = () => {
    setShowForm(false);
    setImages([]);
    reset();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Домашние задания"
        description="Создание и просмотр заданий для группы"
        actions={
          <Button variant="success" onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Создать ДЗ
          </Button>
        }
      />

      {showForm && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <h2 className="font-semibold text-slate-900">Новое домашнее задание</h2>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Закрыть"
            >
              <X className="h-4 w-4" />
            </button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Текст задания *</label>
                <TextareaField
                  accent="teacher"
                  {...register('text', { required: true })}
                  placeholder="Решить задачи 1-10 из учебника..."
                />
              </div>

              {/* Image uploader */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Изображения</label>

                {/* Previews */}
                {images.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-3">
                    {images.map((img, i) => (
                      <div key={i} className="group relative">
                        <img
                          src={img.preview}
                          alt={img.name}
                          className="h-24 w-24 rounded-lg border border-slate-200 object-cover shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload button */}
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
                  className="flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 transition-colors hover:border-green-400 hover:text-green-600 disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Загрузка...
                    </>
                  ) : (
                    <>
                      <ImagePlus className="h-4 w-4" />
                      {images.length > 0 ? 'Добавить ещё' : 'Выбрать изображения'}
                    </>
                  )}
                </button>
                <p className="mt-1 text-xs text-slate-400">JPG, PNG, WebP · до 10 МБ каждое</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">YouTube ссылка</label>
                  <InputField
                    accent="teacher"
                    {...register('youtubeUrl')}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Срок сдачи</label>
                  <InputField accent="teacher" type="date" {...register('dueDate')} />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  variant="success"
                  loading={createMutation.isPending}
                  disabled={uploading}
                >
                  Создать
                </Button>
                <Button type="button" variant="secondary" onClick={handleClose}>
                  Отмена
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading && <p className="text-slate-400">Загрузка...</p>}
      {!isLoading && homeworks.length === 0 && (
        <p className="py-8 text-center text-slate-400">Домашних заданий пока нет</p>
      )}
      <div className="space-y-4">
        {homeworks.map((hw) => (
          <HomeworkCard
            key={hw.id}
            homework={hw}
            canDelete
            onDelete={(hid) => deleteMutation.mutate(hid)}
          />
        ))}
      </div>
    </div>
  );
}
