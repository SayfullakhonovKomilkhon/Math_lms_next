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
import { Archive, MoreVertical, Pencil, Plus } from 'lucide-react';
import { GroupDetailPanel } from './GroupDetailPanel';

const DAYS = [
  { key: 'MONDAY', label: 'Пн' },
  { key: 'TUESDAY', label: 'Вт' },
  { key: 'WEDNESDAY', label: 'Ср' },
  { key: 'THURSDAY', label: 'Чт' },
  { key: 'FRIDAY', label: 'Пт' },
  { key: 'SATURDAY', label: 'Сб' },
  { key: 'SUNDAY', label: 'Вс' },
];

type Schedule = { days: string[]; time: string; duration: number };
type FormState = { name: string; teacherId: string; maxStudents: number; schedule: Schedule };

const DEFAULT_SCHEDULE: Schedule = { days: ['MONDAY', 'WEDNESDAY', 'FRIDAY'], time: '09:00', duration: 90 };

function DayPicker({ value, onChange }: { value: string[]; onChange: (days: string[]) => void }) {
  const toggle = (day: string) =>
    onChange(value.includes(day) ? value.filter((d) => d !== day) : [...value, day]);
  return (
    <div className="flex flex-wrap gap-1.5">
      {DAYS.map((d) => (
        <button
          key={d.key}
          type="button"
          onClick={() => toggle(d.key)}
          className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
            value.includes(d.key)
              ? 'border-indigo-500 bg-indigo-500 text-white'
              : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300'
          }`}
        >
          {d.label}
        </button>
      ))}
    </div>
  );
}

export default function GroupsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>({ name: '', teacherId: '', maxStudents: 20, schedule: DEFAULT_SCHEDULE });
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [editForm, setEditForm] = useState<FormState>({ name: '', teacherId: '', maxStudents: 20, schedule: DEFAULT_SCHEDULE });
  const [detailGroup, setDetailGroup] = useState<Group | null>(null);

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: () => api.get('/groups').then((r) => r.data.data as Group[]),
  });

  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => api.get('/teachers').then((r) => r.data.data as Teacher[]),
  });

  const createMutation = useMutation({
    mutationFn: () => api.post('/groups', { ...form }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groups'] });
      toast('Группа создана');
      setShowForm(false);
      setForm({ name: '', teacherId: '', maxStudents: 20, schedule: DEFAULT_SCHEDULE });
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
    mutationFn: (id: string) =>
      api.patch(`/groups/${id}`, {
        name: editForm.name,
        teacherId: editForm.teacherId,
        maxStudents: editForm.maxStudents,
        schedule: editForm.schedule,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groups'] });
      toast('Группа обновлена');
      setEditingGroup(null);
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

  function openEdit(group: Group) {
    setEditingGroup(group);
    const s = group.schedule as Partial<Schedule>;
    setEditForm({
      name: group.name,
      teacherId: group.teacher?.id ?? '',
      maxStudents: group.maxStudents,
      schedule: {
        days: Array.isArray(s?.days) ? s.days : DEFAULT_SCHEDULE.days,
        time: typeof s?.time === 'string' ? s.time : DEFAULT_SCHEDULE.time,
        duration: typeof s?.duration === 'number' ? s.duration : DEFAULT_SCHEDULE.duration,
      },
    });
  }

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

      {editingGroup && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-slate-900">Редактировать группу</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Название</label>
                <InputField
                  accent="admin"
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Algebra 9A"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Учитель</label>
                <SelectField
                  accent="admin"
                  value={editForm.teacherId}
                  onChange={(e) => setEditForm((f) => ({ ...f, teacherId: e.target.value }))}
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
                  value={editForm.maxStudents}
                  onChange={(e) => setEditForm((f) => ({ ...f, maxStudents: Number(e.target.value) }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Дни недели</label>
                <DayPicker
                  value={editForm.schedule.days}
                  onChange={(days) => setEditForm((f) => ({ ...f, schedule: { ...f.schedule, days } }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Время начала</label>
                  <InputField
                    accent="admin"
                    type="time"
                    value={editForm.schedule.time}
                    onChange={(e) => setEditForm((f) => ({ ...f, schedule: { ...f.schedule, time: e.target.value } }))}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Длит. (мин)</label>
                  <InputField
                    accent="admin"
                    type="number"
                    value={editForm.schedule.duration}
                    onChange={(e) => setEditForm((f) => ({ ...f, schedule: { ...f.schedule, duration: Number(e.target.value) } }))}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                loading={updateMutation.isPending}
                onClick={() => updateMutation.mutate(editingGroup.id)}
              >
                Сохранить
              </Button>
              <Button variant="secondary" onClick={() => setEditingGroup(null)}>
                Отмена
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Дни недели</label>
                <DayPicker
                  value={form.schedule.days}
                  onChange={(days) => setForm((f) => ({ ...f, schedule: { ...f.schedule, days } }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Время начала</label>
                  <InputField
                    accent="admin"
                    type="time"
                    value={form.schedule.time}
                    onChange={(e) => setForm((f) => ({ ...f, schedule: { ...f.schedule, time: e.target.value } }))}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Длит. (мин)</label>
                  <InputField
                    accent="admin"
                    type="number"
                    value={form.schedule.duration}
                    onChange={(e) => setForm((f) => ({ ...f, schedule: { ...f.schedule, duration: Number(e.target.value) } }))}
                  />
                </div>
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

      <GroupDetailPanel group={detailGroup} onClose={() => setDetailGroup(null)} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading && <p className="text-slate-400">Загрузка...</p>}
        {groups.map((group) => (
          <Card
            key={group.id}
            className="cursor-pointer p-5 transition-shadow hover:shadow-md"
            onClick={() => setDetailGroup(group)}
          >
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
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" accent="admin" className="min-w-[220px]">
                      <IconMenuItem
                        accent="admin"
                        icon={Pencil}
                        label="Редактировать"
                        description="Изменить данные группы"
                        iconClassName="border-slate-200 bg-slate-50 text-slate-600"
                        onSelect={(e) => { e.stopPropagation(); openEdit(group); }}
                      />
                      <IconMenuItem
                        accent="admin"
                        icon={Archive}
                        label="Архивировать"
                        description="Группа станет неактивной"
                        iconClassName="border-slate-200 bg-slate-50 text-slate-600"
                        onSelect={(e) => { e.stopPropagation(); archiveMutation.mutate(group.id); }}
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
