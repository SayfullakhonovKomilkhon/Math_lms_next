'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, UserX, Phone, Settings2 } from 'lucide-react';
import api from '@/lib/api';
import { Teacher } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { TabsBar, TabsBarButton } from '@/components/ui/tabs-bar';
import { InputField } from '@/components/ui/input-field';
import { toast } from '@/components/ui/toast';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, IconMenuItem, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';
import { EditStaffSheet, type EditStaffTarget } from './EditStaffSheet';

interface AdminUser {
  id: string; phone: string; role: string; isActive: boolean;
  createdAt: string;
  teacher?: { id: string; fullName: string; phone?: string; ratePerStudent: number } | null;
}

type Tab = 'teachers' | 'admins';

export default function StaffPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('teachers');
  const [editRateId, setEditRateId] = useState<string | null>(null);
  const [editRateValue, setEditRateValue] = useState('');
  const [editTarget, setEditTarget] = useState<EditStaffTarget | null>(null);

  const { data: teachers = [], isLoading: teachersLoading } = useQuery<Teacher[]>({
    queryKey: ['sa-teachers'],
    queryFn: () => api.get('/teachers').then((r) => r.data.data),
  });

  const { data: admins = [], isLoading: adminsLoading } = useQuery<AdminUser[]>({
    queryKey: ['sa-admins'],
    queryFn: () => api.get('/users?role=ADMIN').then((r) => r.data.data),
    enabled: tab === 'admins',
  });

  const { data: teacherLoads = [] } = useQuery<{ teacherId: string; studentsCount: number; groupsCount: number; totalSalary: number }[]>({
    queryKey: ['sa-teachers-load'],
    queryFn: () => api.get('/analytics/teachers-load').then((r) => r.data.data),
  });

  const deactivateTeacherMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/teachers/${id}/deactivate`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sa-teachers'] }); toast('Учитель деактивирован'); },
    onError: () => toast('Ошибка', 'error'),
  });

  const deactivateAdminMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/users/${id}/deactivate`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sa-admins'] }); toast('Пользователь деактивирован'); },
    onError: () => toast('Ошибка', 'error'),
  });

  const updateRateMutation = useMutation({
    mutationFn: ({ id, rate }: { id: string; rate: number }) =>
      api.patch(`/salary/teachers/${id}/rate`, { rate }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sa-teachers'] });
      qc.invalidateQueries({ queryKey: ['sa-teachers-load'] });
      setEditRateId(null);
      toast('Ставка обновлена');
    },
    onError: () => toast('Ошибка', 'error'),
  });

  const loadMap = new Map(teacherLoads.map((t) => [t.teacherId, t]));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Персонал"
        description="Управление учителями и администраторами"
        actions={
          <Link href="/superadmin/staff/new">
            <Button className="bg-violet-600 hover:bg-violet-700">
              <Plus className="mr-2 h-4 w-4" />
              Добавить сотрудника
            </Button>
          </Link>
        }
      />

      <TabsBar>
        <TabsBarButton accent="admin" active={tab === 'teachers'} onClick={() => setTab('teachers')}>
          Учителя ({teachers.length})
        </TabsBarButton>
        <TabsBarButton accent="admin" active={tab === 'admins'} onClick={() => setTab('admins')}>
          Администраторы
        </TabsBarButton>
      </TabsBar>

      {tab === 'teachers' && (
        <Card>
          {teachersLoading ? (
            <CardContent className="py-10 text-center text-sm text-slate-400">Загрузка...</CardContent>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-xs text-slate-500">
                    <th className="px-4 py-3 text-left font-medium">Имя</th>
                    <th className="px-4 py-3 text-left font-medium">Телефон</th>
                    <th className="px-4 py-3 text-right font-medium">Учеников</th>
                    <th className="px-4 py-3 text-right font-medium">Групп</th>
                    <th className="px-4 py-3 text-right font-medium">Ставка</th>
                    <th className="px-4 py-3 text-right font-medium">Зарплата</th>
                    <th className="px-4 py-3 text-center font-medium">Статус</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {teachers.map((t) => {
                    const load = loadMap.get(t.id);
                    return (
                      <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-900">{t.fullName}</p>
                          <p className="text-xs text-slate-400">{t.user?.phone ?? t.phone ?? '—'}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {t.phone ? (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" /> {t.phone}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-700">{load?.studentsCount ?? 0}</td>
                        <td className="px-4 py-3 text-right text-slate-500">{load?.groupsCount ?? 0}</td>
                        <td className="px-4 py-3 text-right">
                          {editRateId === t.id ? (
                            <div className="flex items-center justify-end gap-2">
                              <InputField
                                accent="admin"
                                type="number"
                                className="w-28 text-right text-xs"
                                value={editRateValue}
                                onChange={(e) => setEditRateValue(e.target.value)}
                              />
                              <button
                                className="text-xs font-medium text-violet-600 hover:text-violet-700"
                                onClick={() => updateRateMutation.mutate({ id: t.id, rate: Number(editRateValue) })}
                              >
                                ОК
                              </button>
                              <button
                                className="text-xs text-slate-400"
                                onClick={() => setEditRateId(null)}
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              className="flex items-center gap-1 text-slate-700 hover:text-violet-600"
                              onClick={() => { setEditRateId(t.id); setEditRateValue(String(t.ratePerStudent)); }}
                            >
                              {formatCurrency(Number(t.ratePerStudent))}
                              <Pencil className="h-3 w-3 opacity-50" />
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-slate-800">
                          {load ? formatCurrency(load.totalSalary) : '—'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={t.isActive ? 'green' : 'gray'}>
                            {t.isActive ? 'Активен' : 'Неактивен'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {t.isActive && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" accent="admin" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" accent="admin" className="min-w-[240px]">
                                <IconMenuItem
                                  accent="admin"
                                  icon={Settings2}
                                  label="Редактировать"
                                  description="Профиль, телефон, ставка"
                                  iconClassName="border-violet-200 bg-violet-50 text-violet-600"
                                  onSelect={() =>
                                    setEditTarget({
                                      kind: 'teacher',
                                      id: t.id,
                                      fullName: t.fullName,
                                      phone: t.phone,
                                      ratePerStudent: Number(t.ratePerStudent),
                                      loginPhone: t.user?.phone ?? t.phone ?? null,
                                    })
                                  }
                                />
                                <DropdownMenuSeparator />
                                <IconMenuItem
                                  accent="admin"
                                  icon={UserX}
                                  label="Деактивировать"
                                  description="Учитель потеряет доступ"
                                  iconClassName="border-red-200 bg-red-50 text-red-600"
                                  destructive
                                  onSelect={() => deactivateTeacherMutation.mutate(t.id)}
                                />
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {tab === 'admins' && (
        <Card>
          {adminsLoading ? (
            <CardContent className="py-10 text-center text-sm text-slate-400">Загрузка...</CardContent>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-xs text-slate-500">
                    <th className="px-4 py-3 text-left font-medium">Телефон (логин)</th>
                    <th className="px-4 py-3 text-center font-medium">Статус</th>
                    <th className="px-4 py-3 text-right font-medium">Дата создания</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {admins.map((u) => (
                    <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-slate-900">{u.phone}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={u.isActive ? 'green' : 'gray'}>
                          {u.isActive ? 'Активен' : 'Неактивен'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500">{formatDate(u.createdAt)}</td>
                      <td className="px-4 py-3">
                        {u.isActive && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" accent="admin" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" accent="admin" className="min-w-[240px]">
                              <IconMenuItem
                                accent="admin"
                                icon={Settings2}
                                label="Редактировать"
                                description="Телефон и пароль"
                                iconClassName="border-violet-200 bg-violet-50 text-violet-600"
                                onSelect={() =>
                                  setEditTarget({ kind: 'admin', id: u.id, phone: u.phone })
                                }
                              />
                              <DropdownMenuSeparator />
                              <IconMenuItem
                                accent="admin"
                                icon={UserX}
                                label="Деактивировать"
                                description="Пользователь потеряет доступ"
                                iconClassName="border-red-200 bg-red-50 text-red-600"
                                destructive
                                onSelect={() => deactivateAdminMutation.mutate(u.id)}
                              />
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </td>
                    </tr>
                  ))}
                  {admins.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center text-slate-400">
                        Администраторов нет
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      <EditStaffSheet target={editTarget} onClose={() => setEditTarget(null)} />
    </div>
  );
}
