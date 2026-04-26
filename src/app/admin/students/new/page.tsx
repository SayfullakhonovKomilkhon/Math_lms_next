'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import api from '@/lib/api';
import { Group, Parent } from '@/types';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { ArrowLeft, Search } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { InputField, SelectField } from '@/components/ui/input-field';

const phoneRegex = /^\+?[0-9]{9,15}$/;

const schema = z
  .object({
    fullName: z.string().min(2, 'Обязательное поле'),
    phone: z
      .string()
      .trim()
      .regex(
        phoneRegex,
        'Введите номер телефона в международном формате (например, +998901234567)',
      ),
    password: z.string().min(8, 'Минимум 8 символов'),
    birthDate: z.string().optional(),
    gender: z.enum(['MALE', 'FEMALE']),
    groupId: z.string().optional(),
    monthlyFee: z.number().min(0),
    parentMode: z.enum(['none', 'new', 'existing']),
    parentFullName: z.string().optional(),
    parentPhone: z.string().optional(),
    parentPassword: z.string().optional(),
    existingParentId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.parentMode === 'new') {
      if (!data.parentFullName || data.parentFullName.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['parentFullName'],
          message: 'Укажите ФИО родителя',
        });
      }
      if (!data.parentPhone || !phoneRegex.test(data.parentPhone.trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['parentPhone'],
          message: 'Укажите телефон родителя в формате +998901234567',
        });
      }
      if (!data.parentPassword || data.parentPassword.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['parentPassword'],
          message: 'Минимум 8 символов',
        });
      }
    }
    if (data.parentMode === 'existing' && !data.existingParentId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['existingParentId'],
        message: 'Выберите родителя',
      });
    }
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
  const [parentSearch, setParentSearch] = useState('');

  const { data: groupsData } = useQuery({
    queryKey: ['groups'],
    queryFn: () => api.get('/groups').then((r) => r.data.data as Group[]),
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { monthlyFee: 500000, gender: 'MALE', parentMode: 'none' },
  });

  const parentMode = watch('parentMode');
  const existingParentId = watch('existingParentId');

  const { data: parents = [] } = useQuery({
    queryKey: ['parents-search', parentSearch],
    queryFn: () =>
      api
        .get('/parents', {
          params: parentSearch ? { search: parentSearch } : {},
        })
        .then((r) => r.data.data as Parent[]),
    enabled: parentMode === 'existing',
  });

  const visibleParents = useMemo(
    () => parents.slice(0, 12),
    [parents],
  );

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const studentRes = await api.post('/students', {
        phone: data.phone,
        password: data.password,
        fullName: data.fullName,
        birthDate: data.birthDate || undefined,
        gender: data.gender,
        groupId: data.groupId || undefined,
        monthlyFee: data.monthlyFee,
      });

      const studentId = studentRes.data.data.id;

      if (data.parentMode === 'new' && data.parentPhone && data.parentPassword) {
        await api.post('/parents', {
          phone: data.parentPhone,
          password: data.parentPassword,
          fullName: data.parentFullName,
          studentIds: [studentId],
        });
      } else if (data.parentMode === 'existing' && data.existingParentId) {
        await api.post(`/parents/${data.existingParentId}/students/${studentId}`);
      }

      toast('Ученик успешно добавлен!');
      router.push('/admin/students');
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string | string[] } } }).response
              ?.data?.message
          : undefined;
      const text = Array.isArray(msg) ? msg.join(', ') : msg;
      toast(text || 'Ошибка при создании ученика', 'error');
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
            <Field label="Телефон (логин) *" error={errors.phone?.message}>
              <InputField
                accent="admin"
                type="tel"
                {...register('phone')}
                placeholder="+998901234567"
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
            <Field label="Дата рождения" error={errors.birthDate?.message}>
              <InputField accent="admin" type="date" {...register('birthDate')} />
            </Field>
            <Field label="Пол *" error={errors.gender?.message}>
              <SelectField accent="admin" {...register('gender')}>
                <option value="MALE">Мужской</option>
                <option value="FEMALE">Женский</option>
              </SelectField>
            </Field>
            <Field label="Стартовая группа" error={errors.groupId?.message}>
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
            <Field
              label="Оплата в этой группе (сум / мес)"
              error={errors.monthlyFee?.message}
            >
              <InputField
                accent="admin"
                type="number"
                {...register('monthlyFee', { valueAsNumber: true })}
                placeholder="500000"
              />
            </Field>
            <p className="text-xs text-slate-500 sm:col-span-2">
              Дополнительные группы и индивидуальные цены можно добавить позже
              в карточке ученика.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-slate-800">Родитель</h2>
            <p className="mt-1 text-xs text-slate-500">
              Номер телефона и пароль родителя — это его данные для входа в систему.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Привязка родителя">
              <SelectField accent="admin" {...register('parentMode')}>
                <option value="none">Без родителя</option>
                <option value="new">Создать нового</option>
                <option value="existing">Привязать к существующему</option>
              </SelectField>
            </Field>

            {parentMode === 'new' && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="ФИО родителя *" error={errors.parentFullName?.message}>
                  <InputField
                    accent="admin"
                    {...register('parentFullName')}
                    placeholder="Каримов Шерзод"
                  />
                </Field>
                <Field label="Телефон (логин) *" error={errors.parentPhone?.message}>
                  <InputField
                    accent="admin"
                    type="tel"
                    {...register('parentPhone')}
                    placeholder="+998901234567"
                  />
                </Field>
                <Field label="Пароль *" error={errors.parentPassword?.message}>
                  <InputField
                    accent="admin"
                    type="text"
                    {...register('parentPassword')}
                    placeholder="Минимум 8 символов"
                  />
                </Field>
              </div>
            )}

            {parentMode === 'existing' && (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <InputField
                    accent="admin"
                    value={parentSearch}
                    onChange={(e) => setParentSearch(e.target.value)}
                    placeholder="Поиск по имени или телефону..."
                    className="pl-9"
                  />
                </div>
                {errors.existingParentId?.message && (
                  <p className="text-xs text-red-600">
                    {errors.existingParentId.message}
                  </p>
                )}
                <div className="max-h-64 overflow-y-auto rounded-lg border border-slate-200">
                  {visibleParents.length === 0 ? (
                    <p className="p-4 text-center text-sm text-slate-400">
                      Ничего не найдено
                    </p>
                  ) : (
                    <ul className="divide-y divide-slate-100">
                      {visibleParents.map((p) => {
                        const checked = existingParentId === p.id;
                        return (
                          <li key={p.id}>
                            <button
                              type="button"
                              onClick={() => setValue('existingParentId', p.id)}
                              className={`flex w-full items-center justify-between gap-2 p-3 text-left text-sm hover:bg-slate-50 ${
                                checked ? 'bg-blue-50' : ''
                              }`}
                            >
                              <div className="min-w-0">
                                <p className="truncate font-semibold text-slate-900">
                                  {p.fullName}
                                </p>
                                <p className="truncate text-xs text-slate-500">
                                  {p.user?.phone ?? p.phone ?? '—'} ·{' '}
                                  {(p.students ?? []).length} детей
                                </p>
                              </div>
                              {checked && (
                                <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
                                  Выбран
                                </span>
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Button type="submit" loading={loading} size="lg">
          Создать ученика
        </Button>
      </form>
    </div>
  );
}
