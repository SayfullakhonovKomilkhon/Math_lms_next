'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, KeyRound, Plus, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { Parent, Student } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { InputField } from '@/components/ui/input-field';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/toast';

export default function EditParentPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();

  const [profile, setProfile] = useState({ fullName: '', phone: '' });
  const [creds, setCreds] = useState({ phone: '', password: '' });
  const [studentSearch, setStudentSearch] = useState('');

  const { data: parent, isLoading } = useQuery({
    queryKey: ['parent', id],
    queryFn: () => api.get(`/parents/${id}`).then((r) => r.data.data as Parent),
    enabled: !!id,
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students-for-parent'],
    queryFn: () => api.get('/students').then((r) => r.data.data as Student[]),
  });

  useEffect(() => {
    if (parent) {
      setProfile({
        fullName: parent.fullName ?? '',
        phone: parent.phone ?? '',
      });
      setCreds((prev) => ({
        phone: parent.user?.phone ?? parent.phone ?? '',
        password: prev.password,
      }));
    }
  }, [parent]);

  const linkedIds = useMemo(
    () => new Set((parent?.students ?? []).map((s) => s.student.id)),
    [parent],
  );

  const filteredStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    const candidates = students.filter((s) => !linkedIds.has(s.id));
    if (!q) return candidates.slice(0, 8);
    return candidates
      .filter((s) =>
        [s.fullName, s.user?.phone, s.phone, s.group?.name]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(q)),
      )
      .slice(0, 12);
  }, [studentSearch, students, linkedIds]);

  const updateProfileMutation = useMutation({
    mutationFn: () => api.patch(`/parents/${id}`, profile),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['parent', id] });
      qc.invalidateQueries({ queryKey: ['parents'] });
      toast('Данные родителя обновлены');
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string | string[] } } })
              .response?.data?.message
          : undefined;
      toast(Array.isArray(msg) ? msg.join(', ') : msg || 'Ошибка', 'error');
    },
  });

  const updateCredsMutation = useMutation({
    mutationFn: () => {
      const payload: { phone?: string; password?: string } = {};
      const currentPhone = parent?.user?.phone ?? parent?.phone ?? '';
      if (creds.phone && creds.phone !== currentPhone)
        payload.phone = creds.phone;
      if (creds.password) payload.password = creds.password;
      return api.patch(`/parents/${id}/credentials`, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['parent', id] });
      qc.invalidateQueries({ queryKey: ['parents'] });
      toast('Логин и/или пароль обновлены');
      setCreds((prev) => ({ ...prev, password: '' }));
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string | string[] } } })
              .response?.data?.message
          : undefined;
      toast(Array.isArray(msg) ? msg.join(', ') : msg || 'Ошибка', 'error');
    },
  });

  const linkMutation = useMutation({
    mutationFn: (studentId: string) =>
      api.post(`/parents/${id}/students/${studentId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['parent', id] });
      qc.invalidateQueries({ queryKey: ['parents'] });
      toast('Ребёнок привязан');
    },
  });

  const unlinkMutation = useMutation({
    mutationFn: (studentId: string) =>
      api.delete(`/parents/${id}/students/${studentId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['parent', id] });
      qc.invalidateQueries({ queryKey: ['parents'] });
      toast('Связь удалена');
    },
  });

  if (isLoading || !parent) {
    return (
      <div className="p-8 text-center text-slate-500">
        {isLoading ? 'Загрузка...' : 'Родитель не найден'}
      </div>
    );
  }

  const currentLoginPhone = parent.user?.phone ?? parent.phone ?? '';
  const credsChanged =
    Boolean(creds.password) ||
    (creds.phone && creds.phone !== currentLoginPhone);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/admin/parents">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1 h-4 w-4" />К списку
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">{parent.fullName}</h1>
      </div>

      <Card>
        <CardContent className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div>
            <span className="text-slate-500">Телефон (логин)</span>
            <p className="font-medium text-slate-900">
              {parent.user?.phone ?? parent.phone ?? '—'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-slate-900">Основные данные</h2>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              ФИО
            </label>
            <InputField
              accent="admin"
              value={profile.fullName}
              onChange={(e) =>
                setProfile((p) => ({ ...p, fullName: e.target.value }))
              }
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Телефон
            </label>
            <InputField
              accent="admin"
              value={profile.phone}
              onChange={(e) =>
                setProfile((p) => ({ ...p, phone: e.target.value }))
              }
              placeholder="+998901234567"
            />
          </div>
          <div className="sm:col-span-2">
            <Button
              onClick={() => updateProfileMutation.mutate()}
              loading={updateProfileMutation.isPending}
              disabled={!profile.fullName.trim()}
            >
              Сохранить
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-blue-600" />
            <h2 className="font-semibold text-slate-900">
              Логин и пароль для входа
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Старый пароль вводить не нужно — задайте сразу новый.
          </p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Телефон (логин)
            </label>
            <InputField
              accent="admin"
              type="tel"
              value={creds.phone}
              onChange={(e) =>
                setCreds((c) => ({ ...c, phone: e.target.value }))
              }
              placeholder="+998901234567"
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
              onChange={(e) =>
                setCreds((c) => ({ ...c, password: e.target.value }))
              }
              placeholder="оставьте пустым, чтобы не менять"
            />
          </div>
          <div className="sm:col-span-2">
            <Button
              onClick={() => updateCredsMutation.mutate()}
              loading={updateCredsMutation.isPending}
              disabled={!credsChanged}
            >
              Применить новые данные
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-slate-900">Дети</h2>
          <p className="mt-1 text-xs text-slate-500">
            Можно привязать сколько угодно учеников.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Привязанные ({(parent.students ?? []).length})
            </p>
            {(parent.students ?? []).length === 0 ? (
              <p className="text-sm text-slate-400">Пока никого не привязано.</p>
            ) : (
              <ul className="space-y-2">
                {(parent.students ?? []).map((link) => (
                  <li
                    key={link.student.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/admin/students/${link.student.id}`}
                        className="truncate font-semibold text-slate-900 hover:text-blue-600"
                      >
                        {link.student.fullName}
                      </Link>
                      {link.student.group?.name && (
                        <p className="text-xs text-slate-500">
                          {link.student.group.name}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {link.student.isActive === false && (
                        <Badge variant="gray">Архив</Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => unlinkMutation.mutate(link.student.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Добавить ребёнка
            </p>
            <InputField
              accent="admin"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="Поиск по имени, телефону, группе..."
            />
            <div className="mt-2 max-h-56 overflow-y-auto rounded-lg border border-slate-200">
              {filteredStudents.length === 0 ? (
                <p className="p-4 text-center text-sm text-slate-400">
                  Нечего добавить
                </p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {filteredStudents.map((s) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => linkMutation.mutate(s.id)}
                        className="flex w-full items-center justify-between gap-2 p-3 text-left text-sm hover:bg-slate-50"
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
                        <Plus className="h-4 w-4 text-slate-400" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
