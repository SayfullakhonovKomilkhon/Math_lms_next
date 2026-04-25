'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { ArrowLeft, KeyRound, Pencil, UserPlus } from 'lucide-react';
import api from '@/lib/api';
import { Student, Group, Payment, Parent } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '@/lib/utils';
import { toast } from '@/components/ui/toast';
import { PaymentsList } from '@/components/payments/PaymentsList';
import { ReceiptUploader } from '@/components/payments/ReceiptUploader';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { InputField, SelectField } from '@/components/ui/input-field';

export default function StudentProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [groupId, setGroupId] = useState('');
  const [editForm, setEditForm] = useState({
    fullName: '',
    phone: '',
    birthDate: '',
    gender: 'MALE',
    monthlyFee: '0',
  });
  const [creds, setCreds] = useState({ email: '', password: '' });

  const { data: student, isLoading } = useQuery({
    queryKey: ['student', id],
    queryFn: () => api.get(`/students/${id}`).then((r) => r.data.data as Student),
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['student-payments', id],
    queryFn: () => api.get(`/payments/student/${id}`).then((r) => r.data.data as Payment[]),
    enabled: !!id,
  });

  const { data: groups = [] } = useQuery({
    queryKey: ['groups'],
    queryFn: () => api.get('/groups').then((r) => r.data.data as Group[]),
  });

  useEffect(() => {
    if (student) {
      setEditForm({
        fullName: student.fullName ?? '',
        phone: student.phone ?? '',
        birthDate: student.birthDate ? new Date(student.birthDate).toISOString().slice(0, 10) : '',
        gender: student.gender,
        monthlyFee: String(Number(student.monthlyFee ?? 0)),
      });
      setCreds((prev) => ({
        email: student.user?.email ?? '',
        password: prev.password,
      }));
    }
  }, [student]);

  const { data: linkedParents = [] } = useQuery({
    queryKey: ['student-parents', id],
    queryFn: () =>
      api
        .get('/parents', { params: { search: '' } })
        .then((r) => (r.data.data as Parent[])
          .filter((p) =>
            (p.students ?? []).some((s) => s.student.id === id),
          ),
        ),
    enabled: !!id,
  });

  const assignMutation = useMutation({
    mutationFn: (gid: string) => api.patch(`/students/${id}/group`, { groupId: gid }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['student', id] });
      qc.invalidateQueries({ queryKey: ['students'] });
      toast('Группа обновлена');
      setGroupId('');
    },
    onError: (e: unknown) => {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast(msg || 'Ошибка', 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      api.patch(`/students/${id}`, {
        fullName: editForm.fullName,
        phone: editForm.phone || undefined,
        birthDate: editForm.birthDate || undefined,
        gender: editForm.gender,
        monthlyFee: Number(editForm.monthlyFee || 0),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['student', id] });
      qc.invalidateQueries({ queryKey: ['students'] });
      toast('Данные ученика обновлены');
    },
    onError: (e: unknown) => {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { message?: string | string[] } } }).response?.data?.message
          : undefined;
      const text = Array.isArray(msg) ? msg.join(', ') : msg;
      toast(text || 'Ошибка при обновлении ученика', 'error');
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: () => api.patch(`/students/${id}/deactivate`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] });
      toast('Ученик деактивирован');
      router.push('/admin/students');
    },
    onError: (e: unknown) => {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast(msg || 'Ошибка', 'error');
    },
  });

  const updateCredsMutation = useMutation({
    mutationFn: () => {
      const payload: { email?: string; password?: string } = {};
      if (creds.email && creds.email !== student?.user?.email)
        payload.email = creds.email;
      if (creds.password) payload.password = creds.password;
      return api.patch(`/students/${id}/credentials`, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['student', id] });
      qc.invalidateQueries({ queryKey: ['students'] });
      toast('Логин и/или пароль обновлены');
      setCreds((prev) => ({ ...prev, password: '' }));
    },
    onError: (e: unknown) => {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { message?: string | string[] } } }).response?.data?.message
          : undefined;
      toast(Array.isArray(msg) ? msg.join(', ') : msg || 'Ошибка', 'error');
    },
  });

  const confirmMutation = useMutation({
    mutationFn: (paymentId: string) => api.patch(`/payments/${paymentId}/confirm`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['student-payments', id] });
      qc.invalidateQueries({ queryKey: ['payments'] });
      toast('Оплата подтверждена');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ paymentId, reason }: { paymentId: string; reason: string }) =>
      api.patch(`/payments/${paymentId}/reject`, { rejectReason: reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['student-payments', id] });
      qc.invalidateQueries({ queryKey: ['payments'] });
      toast('Оплата отклонена');
    },
  });

  if (isLoading || !student) {
    return (
      <div className="p-8 text-center text-slate-500">
        {isLoading ? 'Загрузка...' : 'Ученик не найден'}
      </div>
    );
  }

  const pendingPayments = payments.filter((p) => p.status === 'PENDING');

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/admin/students">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1 h-4 w-4" />
            К списку
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">{student.fullName}</h1>
        <Badge variant={student.isActive ? 'green' : 'gray'}>
          {student.isActive ? 'Активен' : 'Неактивен'}
        </Badge>
      </div>

      <Card>
        <CardContent className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div>
            <span className="text-slate-500">Email</span>
            <p className="font-medium text-slate-900">{student.user?.email ?? '—'}</p>
          </div>
          <div>
            <span className="text-slate-500">Телефон</span>
            <p className="font-medium text-slate-900">{student.phone ?? '—'}</p>
          </div>
          <div>
            <span className="text-slate-500">Группа</span>
            <p className="font-medium text-slate-900">{student.group?.name ?? '—'}</p>
          </div>
          <div>
            <span className="text-slate-500">Абонемент / мес</span>
            <p className="font-medium text-slate-900">{formatCurrency(Number(student.monthlyFee))}</p>
          </div>
          <div>
            <span className="text-slate-500">Дата поступления</span>
            <p className="font-medium text-slate-900">{formatDate(student.enrolledAt)}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-slate-900">Редактирование ученика</h2>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">ФИО</label>
            <InputField
              accent="admin"
              value={editForm.fullName}
              onChange={(e) => setEditForm((prev) => ({ ...prev, fullName: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Телефон</label>
            <InputField
              accent="admin"
              value={editForm.phone}
              onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="+998901234567"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Дата рождения</label>
            <InputField
              accent="admin"
              type="date"
              value={editForm.birthDate}
              onChange={(e) => setEditForm((prev) => ({ ...prev, birthDate: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Пол</label>
            <SelectField
              accent="admin"
              value={editForm.gender}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, gender: e.target.value as Student['gender'] }))
              }
            >
              <option value="MALE">Мужской</option>
              <option value="FEMALE">Женский</option>
            </SelectField>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Абонемент / мес</label>
            <InputField
              accent="admin"
              type="number"
              value={editForm.monthlyFee}
              onChange={(e) => setEditForm((prev) => ({ ...prev, monthlyFee: e.target.value }))}
            />
          </div>
          <div className="sm:col-span-2">
            <Button
              loading={updateMutation.isPending}
              onClick={() => updateMutation.mutate()}
              disabled={!editForm.fullName.trim()}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Сохранить изменения
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-blue-600" />
            <h2 className="font-semibold text-slate-900">Логин и пароль для входа</h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Старый пароль вводить не нужно — задайте сразу новый.
          </p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Email (логин)
            </label>
            <InputField
              accent="admin"
              type="email"
              value={creds.email}
              onChange={(e) => setCreds((c) => ({ ...c, email: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Новый пароль
            </label>
            <InputField
              accent="admin"
              type="text"
              value={creds.password}
              onChange={(e) => setCreds((c) => ({ ...c, password: e.target.value }))}
              placeholder="оставьте пустым, чтобы не менять"
            />
          </div>
          <div className="sm:col-span-2">
            <Button
              loading={updateCredsMutation.isPending}
              disabled={
                !creds.password &&
                (!creds.email || creds.email === student.user?.email)
              }
              onClick={() => updateCredsMutation.mutate()}
            >
              Применить
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Родители</h2>
            <Link href="/admin/parents/new">
              <Button variant="ghost" size="sm">
                <UserPlus className="mr-1 h-4 w-4" />
                Добавить
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {linkedParents.length === 0 ? (
            <p className="text-sm text-slate-400">
              К ученику не привязан ни один родитель.
            </p>
          ) : (
            <ul className="space-y-2">
              {linkedParents.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/admin/parents/${p.id}`}
                      className="truncate font-semibold text-slate-900 hover:text-blue-600"
                    >
                      {p.fullName}
                    </Link>
                    <p className="truncate text-xs text-slate-500">
                      {p.user?.email ?? '—'}
                      {p.phone ? ` · ${p.phone}` : ''}
                    </p>
                  </div>
                  <Link href={`/admin/parents/${p.id}`}>
                    <Button variant="ghost" size="sm">
                      Открыть
                    </Button>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-slate-900">Перевести в другую группу</h2>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs text-slate-500">Группа</label>
            <SelectField
              accent="admin"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="min-w-[200px]"
            >
              <option value="">Выберите группу</option>
              {groups
                .filter((g) => g.isActive)
                .map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
            </SelectField>
          </div>
          <Button
            size="sm"
            disabled={!groupId}
            loading={assignMutation.isPending}
            onClick={() => groupId && assignMutation.mutate(groupId)}
          >
            Сохранить
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">История оплат</h2>
        <PaymentsList
          payments={payments}
          showActions={pendingPayments.length > 0}
          onConfirm={async (pid) => {
            await confirmMutation.mutateAsync(pid);
          }}
          onReject={async (pid, reason) => {
            await rejectMutation.mutateAsync({ paymentId: pid, reason });
          }}
        />
      </div>

      <ReceiptUploader studentId={student.id} />

      {student.isActive && (
        <div className="border-t border-slate-200 pt-4">
          <Button
            variant="danger"
            loading={deactivateMutation.isPending}
            onClick={() => {
              if (confirm('Деактивировать ученика?')) deactivateMutation.mutate();
            }}
          >
            Деактивировать ученика
          </Button>
        </div>
      )}
    </div>
  );
}
