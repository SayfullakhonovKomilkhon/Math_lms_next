'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { InputField } from '@/components/ui/input-field';
import { useAuth } from '@/hooks/useAuth';

const schema = z.object({
  phone: z
    .string()
    .trim()
    .regex(
      /^\+?[0-9]{9,15}$/,
      'Введите номер телефона в международном формате (например, +998901234567)',
    ),
  password: z.string().min(8, 'Минимум 8 символов'),
  fullName: z.string().min(2, 'Обязательное поле'),
  ratePerStudent: z.coerce.number().min(0),
});

type FormData = z.output<typeof schema>;

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function NewTeacherPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'SUPER_ADMIN') {
      toast('Доступ только для супер-администратора', 'error');
      router.replace('/admin/teachers');
    }
  }, [user, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof schema>, unknown, FormData>({
    resolver: zodResolver(schema),
    defaultValues: { ratePerStudent: 50000 },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await api.post('/teachers', {
        phone: data.phone,
        password: data.password,
        fullName: data.fullName,
        ratePerStudent: data.ratePerStudent,
      });
      toast('Учитель добавлен');
      router.push('/admin/teachers');
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string | string[] } } }).response?.data?.message
          : undefined;
      const text = Array.isArray(msg) ? msg.join(', ') : msg;
      toast(text || 'Ошибка при создании учителя', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (user && user.role !== 'SUPER_ADMIN') {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/teachers"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          К списку учителей
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900">Новый учитель</h1>
        <p className="mt-1 text-sm text-slate-600">Создаётся учётная запись с ролью «Учитель».</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-slate-900">Данные</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-xl">
            <Field label="Телефон (логин)" error={errors.phone?.message}>
              <InputField accent="admin" type="tel" placeholder="+998901234567" {...register('phone')} />
            </Field>
            <Field label="Пароль" error={errors.password?.message}>
              <InputField accent="admin" type="password" {...register('password')} />
            </Field>
            <Field label="ФИО" error={errors.fullName?.message}>
              <InputField accent="admin" {...register('fullName')} placeholder="Иван Иванов" />
            </Field>
            <Field label="Ставка за ученика (сум)" error={errors.ratePerStudent?.message}>
              <InputField accent="admin" type="number" {...register('ratePerStudent')} />
            </Field>
            <Button type="submit" disabled={loading}>
              {loading ? 'Сохранение…' : 'Создать учителя'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
