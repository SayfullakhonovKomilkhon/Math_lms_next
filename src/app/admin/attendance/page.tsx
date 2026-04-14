'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import api from '@/lib/api';
import { Group, AttendanceRecord } from '@/types';
import { AttendanceBadge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { SelectField, InputField } from '@/components/ui/input-field';
import {
  DataTable,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
  DataTableCell,
} from '@/components/ui/data-table';

export default function AdminAttendancePage() {
  const [groupId, setGroupId] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const { data: groups = [] } = useQuery({
    queryKey: ['groups'],
    queryFn: () => api.get('/groups').then((r) => r.data.data as Group[]),
  });

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['admin-attendance', groupId, date],
    queryFn: () =>
      api
        .get('/attendance', { params: { groupId, date } })
        .then((r) => r.data.data as AttendanceRecord[]),
    enabled: !!groupId,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Посещаемость" description="Просмотр журнала по группе и дате" />

      <Card>
        <CardContent className="flex flex-wrap gap-4">
          <div className="min-w-[220px]">
            <label className="mb-1 block text-sm font-medium text-slate-700">Группа</label>
            <SelectField accent="admin" value={groupId} onChange={(e) => setGroupId(e.target.value)}>
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
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Дата</label>
            <InputField accent="admin" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {!groupId ? (
        <p className="text-slate-400">Выберите группу</p>
      ) : isLoading ? (
        <p className="text-slate-400">Загрузка...</p>
      ) : (
        <DataTable>
          <table className="w-full min-w-[640px] text-sm">
            <DataTableHead>
              <DataTableHeaderCell>Ученик</DataTableHeaderCell>
              <DataTableHeaderCell>Статус</DataTableHeaderCell>
              <DataTableHeaderCell>Тип урока</DataTableHeaderCell>
              <DataTableHeaderCell>Дата</DataTableHeaderCell>
            </DataTableHead>
            <tbody>
              {records.length === 0 && (
                <DataTableRow>
                  <DataTableCell colSpan={4} className="py-8 text-center text-slate-400">
                    Нет записей за выбранный день
                  </DataTableCell>
                </DataTableRow>
              )}
              {records.map((r) => (
                <DataTableRow key={r.id}>
                  <DataTableCell className="font-medium text-slate-900">
                    {r.student?.fullName ?? '—'}
                  </DataTableCell>
                  <DataTableCell>
                    <AttendanceBadge status={r.status} />
                  </DataTableCell>
                  <DataTableCell className="text-slate-600">{r.lessonType}</DataTableCell>
                  <DataTableCell className="text-slate-600">{formatDate(r.date)}</DataTableCell>
                </DataTableRow>
              ))}
            </tbody>
          </table>
        </DataTable>
      )}
    </div>
  );
}
