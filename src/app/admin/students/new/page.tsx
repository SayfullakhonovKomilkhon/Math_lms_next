'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import api from '@/lib/api';
import { Group } from '@/types';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { InputField, SelectField } from '@/components/ui/input-field';

const schema = z.object({
  fullName: z.string().min(2, 'Обязательное поле'),
  email: z.string().email('Некорректный email'),
  password: z.string().min(8, 'Минимум 8 символов'),
  phone: z.string().optional(),
  birthDate: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE']),
  groupId: z.string().optional(),
  monthlyFee: z.number().min(0),
  parentFullName: z.string().optional(),
  parentPhone: z.string().optional(),
  parentEmail: z.string().email('Некорректный email').optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function NewStudentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { data: groupsData } = useQuery({
    queryKey: ['groups'],
    queryFn: () => api.get('/groups').then((r) => r.data.data as Group[]),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { monthlyFee: 500000, gender: 'MALE' },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const studentRes = await api.post('/students', {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phone: data.phone || undefined,
        birthDate: data.birthDate || undefined,
        gender: data.gender,
        groupId: data.groupId || undefined,
        monthlyFee: data.monthlyFee,
      });

      const studentId = studentRes.data.data.id;

      if (data.parentFullName && data.parentEmail) {
        await api.post('/parents', {
          email: data.parentEmail,
          password: 'Parent123!',
          fullName: data.parentFullName,
          phone: data.parentPhone || undefined,
          studentId,
        });
      }

      toast('Ученик успешно добавлен!');
      router.push('/admin/students');
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast(msg || 'Ошибка при создании ученика', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/students">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Назад
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Новый ученик</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-slate-800">Данные ученика</h2>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="ФИО *" error={errors.fullName?.message}>
              <InputField accent="admin" {...register('fullName')} placeholder="Алишер Каримов" />
            </Field>
            <Field label="Email *" error={errors.email?.message}>
              <InputField
                accent="admin"
                type="email"
                {...register('email')}
                placeholder="student@mathcenter.uz"
              />
            </Field>
            <Field label="Пароль *" error={errors.password?.message}>
              <InputField
                accent="admin"
                type="password"
                {...register('password')}
                placeholder="Минимум 8 символов"
              />
            </Field>
            <Field label="Телефон" error={errors.phone?.message}>
              <InputField accent="admin" {...register('phone')} placeholder="+998901234567" />
            </Field>
            <Field label="Дата рождения" error={errors.birthDate?.message}>
              <InputField accent="admin" type="date" {...register('birthDate')} />
            </Field>
            <Field label="Пол *" error={errors.gender?.message}>
              <SelectField accent="admin" {...register('gender')}>
                <option value="MALE">Мужской</option>
                <option value="FEMALE">Женский</option>
              </SelectField>
            </Field>
            <Field label="Группа" error={errors.groupId?.message}>
              <SelectField accent="admin" {...register('groupId')}>
                <option value="">Без группы</option>
                {(groupsData ?? [])
                  .filter((g) => g.isActive)
                  .map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
              </SelectField>
            </Field>
            <Field label="Оплата в месяц (сум)" error={errors.monthlyFee?.message}>
              <InputField
                accent="admin"
                type="number"
                {...register('monthlyFee', { valueAsNumber: true })}
                placeholder="500000"
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-slate-800">Данные родителя (необязательно)</h2>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="ФИО родителя" error={errors.parentFullName?.message}>
              <InputField accent="admin" {...register('parentFullName')} placeholder="Каримов Шерзод" />
            </Field>
            <Field label="Email родителя" error={errors.parentEmail?.message}>
              <InputField
                accent="admin"
                type="email"
                {...register('parentEmail')}
                placeholder="parent@mathcenter.uz"
              />
            </Field>
            <Field label="Телефон родителя" error={errors.parentPhone?.message}>
              <InputField accent="admin" {...register('parentPhone')} placeholder="+998901234567" />
            </Field>
          </CardContent>
        </Card>

        <Button type="submit" loading={loading} size="lg">
          Создать ученика
        </Button>
      </form>
    </div>
  );
}
