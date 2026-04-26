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

// One scheduling block: a chosen set of days that all share the same time +
// duration. A group can have many of these (e.g. Mon/Wed/Fri 15:00 +
// Tue/Thu/Sat 13:00).
type Slot = { days: string[]; time: string; duration: number };
type FormState = {
  name: string;
  teacherId: string;
  maxStudents: number;
  defaultMonthlyFee: number;
  slots: Slot[];
};

const DEFAULT_SLOT: Slot = {
  days: ['MONDAY', 'WEDNESDAY', 'FRIDAY'],
  time: '09:00',
  duration: 90,
};

const EMPTY_FORM: FormState = {
  name: '',
  teacherId: '',
  maxStudents: 20,
  defaultMonthlyFee: 0,
  slots: [DEFAULT_SLOT],
};

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

// Read whatever shape sits in DB and turn it into a list of editable slots.
// Older groups use {days, time, duration}; we wrap them into a single slot.
function readSlots(raw: unknown): Slot[] {
  if (!raw || typeof raw !== 'object') return [{ ...DEFAULT_SLOT }];
  const obj = raw as Record<string, unknown>;
  if (Array.isArray(obj.slots) && obj.slots.length > 0) {
    return (obj.slots as Slot[]).map((s) => ({
      days: Array.isArray(s.days) ? s.days : [],
      time: typeof s.time === 'string' ? s.time : '09:00',
      duration: typeof s.duration === 'number' ? s.duration : 90,
    }));
  }
  if (Array.isArray(obj.days) && typeof obj.days[0] === 'string') {
    return [
      {
        days: obj.days as string[],
        time: typeof obj.time === 'string' ? obj.time : '09:00',
        duration: typeof obj.duration === 'number' ? obj.duration : 90,
      },
    ];
  }
  return [{ ...DEFAULT_SLOT }];
}

// Compose what we send back to the API. We keep the new `slots` array but
// also flatten it into the legacy per-day structure that the student/parent
// schedule pages already understand, so existing readers keep working.
function buildSchedulePayload(slots: Slot[]) {
  const DAY_SHORT: Record<string, string> = {
    MONDAY: 'MON', TUESDAY: 'TUE', WEDNESDAY: 'WED',
    THURSDAY: 'THU', FRIDAY: 'FRI', SATURDAY: 'SAT', SUNDAY: 'SUN',
  };
  const flat: { day: string; startTime: string; endTime: string }[] = [];
  for (const slot of slots) {
    const [hh, mm] = (slot.time ?? '09:00').split(':').map(Number);
    const total = hh * 60 + mm + (slot.duration ?? 0);
    const endHh = Math.floor(total / 60) % 24;
    const endMm = total % 60;
    const endTime = `${String(endHh).padStart(2, '0')}:${String(endMm).padStart(2, '0')}`;
    for (const day of slot.days ?? []) {
      flat.push({ day: DAY_SHORT[day] ?? day, startTime: slot.time, endTime });
    }
  }
  return { slots, days: flat };
}

function ScheduleSlotsEditor({
  slots,
  onChange,
}: {
  slots: Slot[];
  onChange: (slots: Slot[]) => void;
}) {
  const update = (i: number, patch: Partial<Slot>) =>
    onChange(slots.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  const remove = (i: number) =>
    onChange(slots.filter((_, idx) => idx !== i));
  const add = () => onChange([...slots, { days: [], time: '13:00', duration: 90 }]);

  return (
    <div className="space-y-3">
      {slots.map((slot, i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-200 bg-slate-50/50 p-3"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Расписание {slots.length > 1 ? `№${i + 1}` : ''}
            </span>
            {slots.length > 1 && (
              <button
                type="button"
                onClick={() => remove(i)}
                className="rounded-md px-2 py-0.5 text-xs font-medium text-red-500 hover:bg-red-50"
              >
                Удалить
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_auto]">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Дни недели
              </label>
              <DayPicker
                value={slot.days}
                onChange={(days) => update(i, { days })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Время начала
              </label>
              <InputField
                accent="admin"
                type="time"
                value={slot.time}
                onChange={(e) => update(i, { time: e.target.value })}
                className="w-32"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Длит. (мин)
              </label>
              <InputField
                accent="admin"
                type="number"
                value={slot.duration}
                onChange={(e) => update(i, { duration: Number(e.target.value) })}
                className="w-24"
              />
            </div>
          </div>
        </div>
      ))}
      <Button
        type="button"
        accent="admin"
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={add}
      >
        <Plus className="h-3.5 w-3.5" />
        Добавить расписание
      </Button>
    </div>
  );
}

export default function GroupsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM);
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
    mutationFn: () =>
      api.post('/groups', {
        name: form.name,
        teacherId: form.teacherId,
        maxStudents: form.maxStudents,
        defaultMonthlyFee: form.defaultMonthlyFee,
        schedule: buildSchedulePayload(form.slots),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groups'] });
      toast('Группа создана');
      setShowForm(false);
      setForm(EMPTY_FORM);
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
        defaultMonthlyFee: editForm.defaultMonthlyFee,
        schedule: buildSchedulePayload(editForm.slots),
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
    setEditForm({
      name: group.name,
      teacherId: group.teacher?.id ?? '',
      maxStudents: group.maxStudents,
      defaultMonthlyFee: Number(group.defaultMonthlyFee ?? 0),
      slots: readSlots(group.schedule),
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Цена группы (сум/мес)
                </label>
                <InputField
                  accent="admin"
                  type="number"
                  min={0}
                  step={1000}
                  value={editForm.defaultMonthlyFee}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      defaultMonthlyFee: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Расписание
              </label>
              <ScheduleSlotsEditor
                slots={editForm.slots}
                onChange={(slots) => setEditForm((f) => ({ ...f, slots }))}
              />
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Цена группы (сум/мес)
                </label>
                <InputField
                  accent="admin"
                  type="number"
                  min={0}
                  step={1000}
                  value={form.defaultMonthlyFee}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      defaultMonthlyFee: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Расписание
              </label>
              <ScheduleSlotsEditor
                slots={form.slots}
                onChange={(slots) => setForm((f) => ({ ...f, slots }))}
              />
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
