'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Megaphone } from 'lucide-react';
import { useCreateAnnouncement } from '@/hooks/useAnnouncements';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CreateAnnouncementPayload, Role } from '@/types';

const schema = z.object({
  title: z
    .string()
    .min(3, 'Минимум 3 символа')
    .max(100, 'Максимум 100 символов'),
  message: z
    .string()
    .min(5, 'Минимум 5 символов')
    .max(5000, 'Максимум 5000 символов'),
  groupId: z.string().optional(),
  isPinned: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  groups: { id: string; name: string }[];
  userRole: Role;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function AnnouncementCreateForm({
  groups,
  userRole,
  onSuccess,
  onCancel,
  className,
}: Props) {
  const { mutate, isPending } = useCreateAnnouncement();
  const canPin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';
  const canSendCenterWide = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      message: '',
      groupId: userRole === 'TEACHER' ? groups[0]?.id ?? '' : '',
      isPinned: false,
    },
  });

  const onSubmit = (values: FormValues) => {
    const payload: CreateAnnouncementPayload = {
      title: values.title.trim(),
      message: values.message.trim(),
      groupId: values.groupId ? values.groupId : undefined,
      isPinned: canPin ? !!values.isPinned : false,
    };
    if (userRole === 'TEACHER' && !payload.groupId) {
      form.setError('groupId', { message: 'Выберите группу' });
      return;
    }
    mutate(payload, {
      onSuccess: () => {
        form.reset({
          title: '',
          message: '',
          groupId: userRole === 'TEACHER' ? groups[0]?.id ?? '' : '',
          isPinned: false,
        });
        onSuccess?.();
      },
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className={cn('space-y-4', className)}>
      <div>
        <label className="text-sm font-medium text-slate-700">Заголовок *</label>
        <input
          {...form.register('title')}
          placeholder="Например: Перенос урока в пятницу"
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
        {form.formState.errors.title && (
          <p className="mt-1 text-xs text-red-500">{form.formState.errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Текст объявления *</label>
        <textarea
          {...form.register('message')}
          placeholder="Напишите текст объявления…"
          rows={5}
          className="mt-1 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
        {form.formState.errors.message && (
          <p className="mt-1 text-xs text-red-500">{form.formState.errors.message.message}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Получатели</label>
        <select
          {...form.register('groupId')}
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        >
          {canSendCenterWide && (
            <option value="">Весь центр (все ученики и родители)</option>
          )}
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              Группа: {g.name}
            </option>
          ))}
        </select>
        {form.formState.errors.groupId && (
          <p className="mt-1 text-xs text-red-500">
            {form.formState.errors.groupId.message}
          </p>
        )}
        <p className="mt-1 text-xs text-slate-400">
          {userRole === 'TEACHER'
            ? 'Объявление получат ученики и родители выбранной группы.'
            : 'Выберите группу или оставьте «Весь центр» для общего объявления.'}
        </p>
      </div>

      {canPin && (
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            {...form.register('isPinned')}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          Закрепить объявление (будет показываться первым)
        </label>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Отмена
          </Button>
        )}
        <Button type="submit" loading={isPending}>
          <Megaphone className="mr-2 h-4 w-4" />
          Опубликовать объявление
        </Button>
      </div>
    </form>
  );
}
