'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Group, Teacher } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/toast';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { InputField, SelectField } from '@/components/ui/input-field';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  IconMenuItem,
} from '@/components/ui/dropdown-menu';
import { Archive, MoreVertical, Plus } from 'lucide-react';

export default function GroupsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', teacherId: '', maxStudents: 20 });

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: () => api.get('/groups').then((r) => r.data.data as Group[]),
  });

  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => api.get('/teachers').then((r) => r.data.data as Teacher[]),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      api.post('/groups', {
        ...form,
        schedule: { days: ['MONDAY', 'WEDNESDAY', 'FRIDAY'], time: '09:00', duration: 90 },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groups'] });
      toast('Группа создана');
      setShowForm(false);
      setForm({ name: '', teacherId: '', maxStudents: 20 });
    },
    onError: (e: unknown) => {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast(msg || 'Ошибка', 'error');
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/groups/${id}/archive`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groups'] });
      toast('Группа архивирована');
    },
    onError: () => toast('Ошибка', 'error'),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Группы"
        description="Создание и управление учебными группами"
        actions={
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Создать группу
          </Button>
        }
      />

      {showForm && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-slate-900">Новая группа</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Название</label>
                <InputField
                  accent="admin"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Algebra 9A"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Учитель</label>
                <SelectField
                  accent="admin"
                  value={form.teacherId}
                  onChange={(e) => setForm((f) => ({ ...f, teacherId: e.target.value }))}
                >
                  <option value="">Выберите учителя</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.fullName}
                    </option>
                  ))}
                </SelectField>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Макс. учеников</label>
                <InputField
                  accent="admin"
                  type="number"
                  value={form.maxStudents}
                  onChange={(e) => setForm((f) => ({ ...f, maxStudents: Number(e.target.value) }))}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button loading={createMutation.isPending} onClick={() => createMutation.mutate()}>
                Создать
              </Button>
              <Button variant="secondary" onClick={() => setShowForm(false)}>
                Отмена
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading && <p className="text-slate-400">Загрузка...</p>}
        {groups.map((group) => (
          <Card key={group.id} className="p-5">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-slate-900">{group.name}</h3>
                <p className="text-sm text-slate-500">{group.teacher?.fullName}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Badge variant={group.isActive ? 'green' : 'gray'}>
                  {group.isActive ? 'Активна' : 'Архив'}
                </Badge>
                {group.isActive && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        accent="admin"
                        aria-label="Действия с группой"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" accent="admin" className="min-w-[220px]">
                      <IconMenuItem
                        accent="admin"
                        icon={Archive}
                        label="Архивировать"
                        description="Группа станет неактивной"
                        iconClassName="border-slate-200 bg-slate-50 text-slate-600"
                        onSelect={() => archiveMutation.mutate(group.id)}
                      />
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
            <div className="text-sm text-slate-600">
              Учеников: {group._count?.students ?? 0} / {group.maxStudents}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
