'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Search, X } from 'lucide-react';
import api from '@/lib/api';
import { Student } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { InputField } from '@/components/ui/input-field';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/toast';

const schema = z.object({
  fullName: z.string().min(2, 'Обязательное поле'),
  phone: z
    .string()
    .trim()
    .regex(
      /^\+?[0-9]{9,15}$/,
      'Введите номер телефона в международном формате (например, +998901234567)',
    ),
  password: z.string().min(8, 'Минимум 8 символов'),
});

type FormData = z.infer<typeof schema>;

export default function NewParentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Student[]>([]);

  const { data: students = [] } = useQuery({
    queryKey: ['students-for-parent'],
    queryFn: () => api.get('/students').then((r) => r.data.data as Student[]),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students.slice(0, 10);
    return students
      .filter((s) =>
        [s.fullName, s.user?.phone, s.phone, s.group?.name]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(q)),
      )
      .slice(0, 15);
  }, [search, students]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const toggle = (s: Student) => {
    setSelected((prev) =>
      prev.find((x) => x.id === s.id)
        ? prev.filter((x) => x.id !== s.id)
        : [...prev, s],
    );
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await api.post('/parents', {
        ...data,
        studentIds: selected.map((s) => s.id),
      });
      toast('Родитель добавлен');
      router.push('/admin/parents');
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string | string[] } } }).response
              ?.data?.message
          : undefined;
      const text = Array.isArray(msg) ? msg.join(', ') : msg;
      toast(text || 'Ошибка при создании родителя', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/parents">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Назад
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Новый родитель</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-slate-800">Данные родителя</h2>
            <p className="mt-1 text-xs text-slate-500">
              Номер телефона и пароль будут использоваться родителем для входа в систему.
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                ФИО *
              </label>
              <InputField
                accent="admin"
                {...register('fullName')}
                placeholder="Каримов Шерзод"
              />
              {errors.fullName && (
                <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Телефон (логин) *
              </label>
              <InputField
                accent="admin"
                type="tel"
                {...register('phone')}
                placeholder="+998901234567"
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Пароль *
              </label>
              <InputField
                accent="admin"
                type="text"
                {...register('password')}
                placeholder="Минимум 8 символов"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-slate-800">Привязать детей</h2>
            <p className="mt-1 text-xs text-slate-500">
              Можно выбрать сразу нескольких. Список можно изменить позже.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {selected.length > 0 && (
              <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                {selected.map((s) => (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => toggle(s)}
                    className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 hover:bg-blue-200"
                  >
                    {s.fullName}
                    <X className="h-3 w-3" />
                  </button>
                ))}
              </div>
            )}

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <InputField
                accent="admin"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск ученика по имени, телефону, группе..."
                className="pl-9"
              />
            </div>

            <div className="max-h-64 overflow-y-auto rounded-lg border border-slate-200">
              {filtered.length === 0 ? (
                <p className="p-4 text-center text-sm text-slate-400">
                  Ничего не найдено
                </p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {filtered.map((s) => {
                    const checked = !!selected.find((x) => x.id === s.id);
                    return (
                      <li key={s.id}>
                        <button
                          type="button"
                          onClick={() => toggle(s)}
                          className={`flex w-full items-center justify-between gap-2 p-3 text-left text-sm hover:bg-slate-50 ${
                            checked ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900">
                              {s.fullName}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              {s.user?.phone ?? s.phone ?? '—'}
                              {s.group?.name ? ` · ${s.group.name}` : ''}
                            </p>
                          </div>
                          {checked && <Badge variant="blue">Выбран</Badge>}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>

        <Button type="submit" loading={loading} size="lg">
          Создать родителя
        </Button>
      </form>
    </div>
  );
}
