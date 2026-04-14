'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Plus, Search, User, UserX } from 'lucide-react';
import api from '@/lib/api';
import { Student, Group, Debtor } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import { InputField, SelectField } from '@/components/ui/input-field';
import {
  DataTable,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
  DataTableCell,
} from '@/components/ui/data-table';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  IconMenuItem,
} from '@/components/ui/dropdown-menu';
import { formatDate, formatCurrency } from '@/lib/utils';
import { toast } from '@/components/ui/toast';
import { useDebounce } from '@/hooks/useDebounce';

export default function StudentsPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;

  const debouncedSearch = useDebounce(search, 300);

  const { data: studentsData, isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: () => api.get('/students').then((r) => r.data.data as Student[]),
  });

  const { data: groupsData } = useQuery({
    queryKey: ['groups'],
    queryFn: () => api.get('/groups').then((r) => r.data.data as Group[]),
  });

  const { data: debtorsData } = useQuery({
    queryKey: ['debtors'],
    queryFn: () => api.get('/payments/debtors').then((r) => r.data.data as Debtor[]),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/students/${id}/deactivate`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] });
      toast('Ученик деактивирован');
    },
    onError: () => toast('Ошибка при деактивации', 'error'),
  });

  const students = studentsData ?? [];
  const groups = groupsData ?? [];
  const debtorIds = new Set((debtorsData ?? []).map((d) => d.studentId));

  const filtered = students
    .filter((s) =>
      debouncedSearch
        ? s.fullName.toLowerCase().includes(debouncedSearch.toLowerCase())
        : true,
    )
    .filter((s) => (groupFilter ? s.groupId === groupFilter : true))
    .filter((s) => {
      if (paymentFilter === 'paid') return s.isActive && !debtorIds.has(s.id);
      if (paymentFilter === 'unpaid') return debtorIds.has(s.id);
      return true;
    });

  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ученики"
        description={`Всего в списке: ${total}`}
        actions={
          <Link href="/admin/students/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Добавить ученика
            </Button>
          </Link>
        }
      />

      <Card>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="relative min-w-[200px] flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <InputField
              accent="admin"
              type="text"
              placeholder="Поиск по имени..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>
          <SelectField
            accent="admin"
            value={groupFilter}
            onChange={(e) => {
              setGroupFilter(e.target.value);
              setPage(1);
            }}
            className="min-w-[180px]"
          >
            <option value="">Все группы</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </SelectField>
          <SelectField
            accent="admin"
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value as 'all' | 'paid' | 'unpaid');
              setPage(1);
            }}
            className="min-w-[220px]"
          >
            <option value="all">Оплата: все</option>
            <option value="paid">Оплатил (тек. месяц)</option>
            <option value="unpaid">Не оплатил (тек. месяц)</option>
          </SelectField>
        </CardContent>
      </Card>

      <DataTable>
        <table className="w-full min-w-[800px] text-sm">
          <DataTableHead>
            <DataTableHeaderCell>Ученик</DataTableHeaderCell>
            <DataTableHeaderCell>Группа</DataTableHeaderCell>
            <DataTableHeaderCell>Телефон</DataTableHeaderCell>
            <DataTableHeaderCell>Оплата/мес</DataTableHeaderCell>
            <DataTableHeaderCell>Оплата (мес.)</DataTableHeaderCell>
            <DataTableHeaderCell>Дата поступления</DataTableHeaderCell>
            <DataTableHeaderCell>Статус</DataTableHeaderCell>
            <DataTableHeaderCell>Действия</DataTableHeaderCell>
          </DataTableHead>
          <tbody>
            {isLoading && (
              <DataTableRow>
                <DataTableCell colSpan={8} className="py-10 text-center text-slate-400">
                  Загрузка...
                </DataTableCell>
              </DataTableRow>
            )}
            {!isLoading && paginated.length === 0 && (
              <DataTableRow>
                <DataTableCell colSpan={8} className="py-10 text-center text-slate-400">
                  Ученики не найдены
                </DataTableCell>
              </DataTableRow>
            )}
            {paginated.map((student) => (
              <DataTableRow key={student.id}>
                <DataTableCell>
                  <div className="font-medium text-slate-900">{student.fullName}</div>
                  <div className="text-xs text-slate-500">{student.user?.email}</div>
                </DataTableCell>
                <DataTableCell>{student.group?.name ?? '—'}</DataTableCell>
                <DataTableCell>{student.phone ?? '—'}</DataTableCell>
                <DataTableCell>{formatCurrency(Number(student.monthlyFee))}</DataTableCell>
                <DataTableCell>
                  {student.isActive ? (
                    debtorIds.has(student.id) ? (
                      <Badge variant="red">Не оплачен</Badge>
                    ) : (
                      <Badge variant="green">Оплачен</Badge>
                    )
                  ) : (
                    <Badge variant="gray">—</Badge>
                  )}
                </DataTableCell>
                <DataTableCell>{formatDate(student.enrolledAt)}</DataTableCell>
                <DataTableCell>
                  <Badge variant={student.isActive ? 'green' : 'gray'}>
                    {student.isActive ? 'Активен' : 'Неактивен'}
                  </Badge>
                </DataTableCell>
                <DataTableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        accent="admin"
                        aria-label="Действия со строкой ученика"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" accent="admin" className="min-w-[220px]">
                      <IconMenuItem
                        accent="admin"
                        icon={User}
                        label="Профиль"
                        description="Карточка ученика"
                        iconClassName="border-indigo-200 bg-indigo-50 text-indigo-700"
                        onSelect={() => router.push(`/admin/students/${student.id}`)}
                      />
                      {student.isActive && (
                        <IconMenuItem
                          accent="admin"
                          icon={UserX}
                          label="Деактивировать"
                          description="Отключить доступ"
                          destructive
                          onSelect={() => deactivateMutation.mutate(student.id)}
                        />
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </DataTableCell>
              </DataTableRow>
            ))}
          </tbody>
        </table>
      </DataTable>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${
                p === page
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
