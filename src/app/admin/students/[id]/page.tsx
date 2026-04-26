'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { ArrowLeft, KeyRound, Pencil, Plus, Trash2, UserPlus, Wallet } from 'lucide-react';
import api from '@/lib/api';
import { Student, Group, Payment, Parent, StudentGroupLink } from '@/types';
import { ManualPaymentDialog } from '@/components/payments/ManualPaymentDialog';
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
  const [newGroup, setNewGroup] = useState({ groupId: '', monthlyFee: '' });
  const [manualPaymentOpen, setManualPaymentOpen] = useState(false);
  // Local edits for per-group monthly fees so the admin can tweak each price
  // independently without losing focus on every keystroke.
  const [feeEdits, setFeeEdits] = useState<Record<string, string>>({});
  const [editForm, setEditForm] = useState({
    fullName: '',
    phone: '',
    birthDate: '',
    gender: 'MALE',
  });
  const [creds, setCreds] = useState({ phone: '', password: '' });

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
      });
      setCreds((prev) => ({
        phone: student.user?.phone ?? student.phone ?? '',
        password: prev.password,
      }));
      // Sync server fees into local edit fields when student data refreshes,
      // but don't clobber a value the user is actively editing.
      setFeeEdits((prev) => {
        const next: Record<string, string> = {};
        for (const link of student.groups ?? []) {
          next[link.linkId] =
            prev[link.linkId] ?? String(Number(link.monthlyFee ?? 0));
        }
        return next;
      });
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

  const extractMessage = (e: unknown) => {
    const msg =
      e && typeof e === 'object' && 'response' in e
        ? (e as { response?: { data?: { message?: string | string[] } } })
            .response?.data?.message
        : undefined;
    return Array.isArray(msg) ? msg.join(', ') : msg;
  };

  const addGroupMutation = useMutation({
    mutationFn: () =>
      api.post(`/students/${id}/groups`, {
        groupId: newGroup.groupId,
        monthlyFee: newGroup.monthlyFee
          ? Number(newGroup.monthlyFee)
          : undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['student', id] });
      qc.invalidateQueries({ queryKey: ['students'] });
      toast('Ученик добавлен в группу');
      setNewGroup({ groupId: '', monthlyFee: '' });
    },
    onError: (e) => toast(extractMessage(e) || 'Ошибка', 'error'),
  });

  const updateFeeMutation = useMutation({
    mutationFn: ({ gid, fee }: { gid: string; fee: number }) =>
      api.patch(`/students/${id}/groups/${gid}`, { monthlyFee: fee }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['student', id] });
      qc.invalidateQueries({ queryKey: ['students'] });
      toast('Цена в группе обновлена');
    },
    onError: (e) => toast(extractMessage(e) || 'Ошибка', 'error'),
  });

  const removeGroupMutation = useMutation({
    mutationFn: (gid: string) => api.delete(`/students/${id}/groups/${gid}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['student', id] });
      qc.invalidateQueries({ queryKey: ['students'] });
      toast('Ученик удалён из группы');
    },
    onError: (e) => toast(extractMessage(e) || 'Ошибка', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      api.patch(`/students/${id}`, {
        fullName: editForm.fullName,
        phone: editForm.phone || undefined,
        birthDate: editForm.birthDate || undefined,
        gender: editForm.gender,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['student', id] });
      qc.invalidateQueries({ queryKey: ['students'] });
      toast('Данные ученика обновлены');
    },
    onError: (e) =>
      toast(extractMessage(e) || 'Ошибка при обновлении ученика', 'error'),
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
      const payload: { phone?: string; password?: string } = {};
      const currentPhone = student?.user?.phone ?? student?.phone ?? '';
      if (creds.phone && creds.phone !== currentPhone)
        payload.phone = creds.phone;
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
  const studentGroups: StudentGroupLink[] = student.groups ?? [];
  const enrolledGroupIds = new Set(studentGroups.map((g) => g.groupId));
  const monthlyFeeTotal = studentGroups.reduce(
    (sum, g) => sum + Number(g.monthlyFee || 0),
    0,
  );

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
            <span className="text-slate-500">Телефон (логин)</span>
            <p className="font-medium text-slate-900">
              {student.user?.phone ?? student.phone ?? '—'}
            </p>
          </div>
          <div>
            <span className="text-slate-500">Группы</span>
            <p className="font-medium text-slate-900">
              {studentGroups.length === 0
                ? '—'
                : studentGroups.map((g) => g.groupName).join(', ')}
            </p>
          </div>
          <div>
            <span className="text-slate-500">Абонемент (всего за мес.)</span>
            <p className="font-medium text-slate-900">
              {formatCurrency(monthlyFeeTotal)}
            </p>
            {studentGroups.length > 1 && (
              <p className="mt-0.5 text-xs text-slate-500">
                Сумма по {studentGroups.length} группам
              </p>
            )}
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
          <div className="sm:col-span-2">
            <p className="text-xs text-slate-500">
              Абонемент задаётся отдельно для каждой группы ниже. Общая сумма
              за месяц считается автоматически.
            </p>
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
              Телефон (логин)
            </label>
            <InputField
              accent="admin"
              type="tel"
              value={creds.phone}
              onChange={(e) => setCreds((c) => ({ ...c, phone: e.target.value }))}
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
              onChange={(e) => setCreds((c) => ({ ...c, password: e.target.value }))}
              placeholder="оставьте пустым, чтобы не менять"
            />
          </div>
          <div className="sm:col-span-2">
            <Button
              loading={updateCredsMutation.isPending}
              disabled={
                !creds.password &&
                (!creds.phone ||
                  creds.phone === (student.user?.phone ?? student.phone ?? ''))
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
                      {p.user?.phone ?? p.phone ?? '—'}
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
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">
              Группы и абонементы
            </h2>
            <span className="text-xs text-slate-500">
              Итого: {formatCurrency(monthlyFeeTotal)} / мес
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Ученик может состоять в нескольких группах одновременно. Цена
            абонемента указывается отдельно для каждой группы.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {studentGroups.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-500">
              Ученик пока не добавлен ни в одну группу.
            </p>
          ) : (
            <ul className="space-y-2">
              {studentGroups.map((link) => {
                const draft = feeEdits[link.linkId] ?? String(link.monthlyFee);
                const draftNum = Number(draft);
                const dirty =
                  Number.isFinite(draftNum) &&
                  draftNum !== Number(link.monthlyFee);
                return (
                  <li
                    key={link.linkId}
                    className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-900">
                        {link.groupName}
                      </p>
                      <p className="text-xs text-slate-500">
                        В группе с {formatDate(link.joinedAt)}
                      </p>
                    </div>
                    <div className="w-40">
                      <label className="mb-1 block text-xs text-slate-500">
                        Цена / мес
                      </label>
                      <InputField
                        accent="admin"
                        type="number"
                        min={0}
                        value={draft}
                        onChange={(e) =>
                          setFeeEdits((prev) => ({
                            ...prev,
                            [link.linkId]: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <Button
                      size="sm"
                      disabled={
                        !dirty ||
                        !Number.isFinite(draftNum) ||
                        draftNum < 0 ||
                        updateFeeMutation.isPending
                      }
                      loading={
                        updateFeeMutation.isPending &&
                        updateFeeMutation.variables?.gid === link.groupId
                      }
                      onClick={() =>
                        updateFeeMutation.mutate({
                          gid: link.groupId,
                          fee: draftNum,
                        })
                      }
                    >
                      Сохранить
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                      disabled={removeGroupMutation.isPending}
                      onClick={() => {
                        if (
                          confirm(
                            `Удалить ученика из группы «${link.groupName}»?`,
                          )
                        ) {
                          removeGroupMutation.mutate(link.groupId);
                        }
                      }}
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      Убрать
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="mb-2 text-sm font-medium text-slate-700">
              Добавить в новую группу
            </p>
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-[200px] flex-1">
                <label className="mb-1 block text-xs text-slate-500">
                  Группа
                </label>
                <SelectField
                  accent="admin"
                  value={newGroup.groupId}
                  onChange={(e) => {
                    const groupId = e.target.value;
                    // Pre-fill the price from the group's configured default
                    // so admins don't need to retype it for every student.
                    const picked = groups.find((g) => g.id === groupId);
                    setNewGroup((prev) => ({
                      groupId,
                      monthlyFee:
                        groupId && picked?.defaultMonthlyFee
                          ? String(picked.defaultMonthlyFee)
                          : prev.monthlyFee,
                    }));
                  }}
                >
                  <option value="">Выберите группу</option>
                  {groups
                    .filter(
                      (g) => g.isActive && !enrolledGroupIds.has(g.id),
                    )
                    .map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                </SelectField>
              </div>
              <div className="w-40">
                <label className="mb-1 block text-xs text-slate-500">
                  Цена / мес
                </label>
                <InputField
                  accent="admin"
                  type="number"
                  min={0}
                  placeholder="0"
                  value={newGroup.monthlyFee}
                  onChange={(e) =>
                    setNewGroup((prev) => ({
                      ...prev,
                      monthlyFee: e.target.value,
                    }))
                  }
                />
              </div>
              <Button
                size="sm"
                disabled={!newGroup.groupId}
                loading={addGroupMutation.isPending}
                onClick={() => addGroupMutation.mutate()}
              >
                <Plus className="mr-1 h-4 w-4" />
                Добавить
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-slate-900">История оплат</h2>
          {student.isActive && (
            <Button
              size="sm"
              onClick={() => setManualPaymentOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Wallet className="mr-2 h-4 w-4" />
              Добавить оплату
            </Button>
          )}
        </div>
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

      <ManualPaymentDialog
        open={manualPaymentOpen}
        onOpenChange={setManualPaymentOpen}
        studentId={student.id}
        studentName={student.fullName}
        suggestedAmount={monthlyFeeTotal}
      />

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
