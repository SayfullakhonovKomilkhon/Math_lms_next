'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Pencil } from 'lucide-react';
import api from '@/lib/api';
import { Teacher } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { InputField } from '@/components/ui/input-field';

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  );
}

export default function EditTeacherPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { user } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    ratePerStudent: '0',
  });

  useEffect(() => {
    if (user && user.role !== 'SUPER_ADMIN') {
      toast('Доступ только для супер-администратора', 'error');
      router.replace('/admin/teachers');
    }
  }, [router, user]);

  const { data: teacher, isLoading } = useQuery({
    queryKey: ['teacher', id],
    queryFn: () => api.get(`/teachers/${id}`).then((r) => r.data.data as Teacher),
    enabled: !!id,
  });

  useEffect(() => {
    if (teacher) {
      setForm({
        fullName: teacher.fullName ?? '',
        phone: teacher.phone ?? '',
        ratePerStudent: String(Number(teacher.ratePerStudent ?? 0)),
      });
    }
  }, [teacher]);

  const updateMutation = useMutation({
    mutationFn: () =>
      api.patch(`/teachers/${id}`, {
        fullName: form.fullName,
        phone: form.phone || undefined,
        ratePerStudent: Number(form.ratePerStudent || 0),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teacher', id] });
      qc.invalidateQueries({ queryKey: ['teachers'] });
      toast('Данные учителя обновлены');
      router.push('/admin/teachers');
    },
    onError: (e: unknown) => {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { message?: string | string[] } } }).response?.data?.message
          : undefined;
      const text = Array.isArray(msg) ? msg.join(', ') : msg;
      toast(text || 'Ошибка при обновлении учителя', 'error');
    },
  });

  if (user && user.role !== 'SUPER_ADMIN') {
    return null;
  }

  if (isLoading || !teacher) {
    return <div className="p-8 text-center text-slate-500">{isLoading ? 'Загрузка...' : 'Учитель не найден'}</div>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link
          href="/admin/teachers"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          К списку учителей
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900">Редактирование учителя</h1>
        <p className="mt-1 text-sm text-slate-600">{teacher.user?.email}</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-slate-900">Основные данные</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="ФИО">
            <InputField
              accent="admin"
              value={form.fullName}
              onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
            />
          </Field>
          <Field label="Телефон">
            <InputField
              accent="admin"
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="+998901234567"
            />
          </Field>
          <Field label="Ставка за ученика (сум)">
            <InputField
              accent="admin"
              type="number"
              value={form.ratePerStudent}
              onChange={(e) => setForm((prev) => ({ ...prev, ratePerStudent: e.target.value }))}
            />
          </Field>

          <Button
            loading={updateMutation.isPending}
            onClick={() => updateMutation.mutate()}
            disabled={!form.fullName.trim()}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Сохранить изменения
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
