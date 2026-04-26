'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Plus, Search, User, UserX, Wallet } from 'lucide-react';
import api from '@/lib/api';
import { Student, Group, Debtor } from '@/types';
import { ManualPaymentDialog } from '@/components/payments/ManualPaymentDialog';
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
import { TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ResponsiveTable } from '@/components/ui/ResponsiveTable';

export default function StudentsPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [page, setPage] = useState(1);
  const [pendingDeactivate, setPendingDeactivate] = useState<Student | null>(null);
  const [payingStudent, setPayingStudent] = useState<Student | null>(null);
  const PER_PAGE = 20;

  const debouncedSearch = useDebounce(search, 300);

  const {
    data: studentsData,
    isLoading,
    isError: studentsError,
    refetch: refetchStudents,
  } = useQuery({
    queryKey: ['students'],
    queryFn: () => api.get('/students').then((r) => r.data.data as Student[]),
  });

  const {
    data: groupsData,
    isError: groupsError,
    refetch: refetchGroups,
  } = useQuery({
    queryKey: ['groups'],
    queryFn: () => api.get('/groups').then((r) => r.data.data as Group[]),
  });

  const {
    data: debtorsData,
    isError: debtorsError,
    refetch: refetchDebtors,
  } = useQuery({
    queryKey: ['debtors'],
    queryFn: () => api.get('/payments/debtors').then((r) => r.data.data as Debtor[]),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/students/${id}/deactivate`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] });
      setPendingDeactivate(null);
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
    .filter((s) =>
      groupFilter
        ? (s.groups ?? []).some((g) => g.groupId === groupFilter)
        : true,
    )
    .filter((s) => {
      if (paymentFilter === 'paid') return s.isActive && !debtorIds.has(s.id);
      if (paymentFilter === 'unpaid') return debtorIds.has(s.id);
      return true;
    });

  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(total / PER_PAGE);
  const hasQueryError = studentsError || groupsError || debtorsError;

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

      {isLoading ? (
        <TableSkeleton rows={10} cols={8} />
      ) : hasQueryError ? (
        <ErrorState
          message="Не удалось загрузить список учеников"
          description="Часть данных для таблицы не загрузилась. Попробуйте снова."
          onRetry={() => {
            void refetchStudents();
            void refetchGroups();
            void refetchDebtors();
          }}
        />
      ) : paginated.length === 0 ? (
        <EmptyState
          icon="🎓"
          message={students.length === 0 ? 'Учеников пока нет' : 'Ученики не найдены'}
          description={
            students.length === 0
              ? 'Добавьте первого ученика, чтобы начать вести группы и оплату.'
              : 'Измените поиск или фильтры, чтобы увидеть нужных учеников.'
          }
          action={students.length === 0 ? { label: 'Добавить ученика', href: '/admin/students/new' } : undefined}
        />
      ) : (
        <ResponsiveTable
          data={paginated}
          renderDesktop={(items) => (
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
              {items.map((student) => (
                <DataTableRow key={student.id}>
                  <DataTableCell>
                    <div className="font-medium text-slate-900">{student.fullName}</div>
                    <div className="text-xs text-slate-500">{student.user?.phone}</div>
                  </DataTableCell>
                  <DataTableCell>
                    {(student.groups ?? []).length === 0
                      ? '—'
                      : (student.groups ?? [])
                          .map((g) => g.groupName)
                          .join(', ')}
                  </DataTableCell>
                  <DataTableCell>{student.phone ?? '—'}</DataTableCell>
                  <DataTableCell>
                    <div className="font-medium text-slate-900">
                      {formatCurrency(Number(student.monthlyFee))}
                    </div>
                    {(student.groups ?? []).length > 1 && (
                      <div className="text-[11px] text-slate-500">
                        {(student.groups ?? []).length} групп
                      </div>
                    )}
                  </DataTableCell>
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
                            icon={Wallet}
                            label="Оплата"
                            description="Записать оплату вручную"
                            iconClassName="border-emerald-200 bg-emerald-50 text-emerald-700"
                            onSelect={() => setPayingStudent(student)}
                          />
                        )}
                        {student.isActive && (
                          <IconMenuItem
                            accent="admin"
                            icon={UserX}
                            label="Деактивировать"
                            description="Отключить доступ"
                            destructive
                            onSelect={() => setPendingDeactivate(student)}
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
          )}
          renderMobileCard={(student) => (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{student.fullName}</p>
                  <p className="text-sm text-slate-500">
                    {(student.groups ?? []).length === 0
                      ? 'Без группы'
                      : (student.groups ?? [])
                          .map((g) => g.groupName)
                          .join(', ')}
                  </p>
                </div>
                <Badge variant={student.isActive ? 'green' : 'gray'}>
                  {student.isActive ? 'Активен' : 'Неактивен'}
                </Badge>
              </div>
              <div className="space-y-1 text-sm text-slate-600">
                <p>{student.phone ?? 'Телефон не указан'}</p>
                <p>{formatCurrency(Number(student.monthlyFee))}</p>
                <p>{debtorIds.has(student.id) ? 'Не оплачен' : 'Оплачен'}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() =>
                    router.push(`/admin/students/${student.id}`)
                  }
                >
                  Профиль
                </Button>
                {student.isActive ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setPayingStudent(student)}
                  >
                    <Wallet className="mr-1 h-4 w-4" />
                    Оплата
                  </Button>
                ) : null}
                {student.isActive ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setPendingDeactivate(student)}
                  >
                    Деактивировать
                  </Button>
                ) : null}
              </div>
            </div>
          )}
        />
      )}

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

      <ManualPaymentDialog
        open={payingStudent !== null}
        onOpenChange={(open) => !open && setPayingStudent(null)}
        studentId={payingStudent?.id ?? null}
        studentName={payingStudent?.fullName}
        suggestedAmount={Number(payingStudent?.monthlyFee ?? 0)}
      />

      <ConfirmDialog
        isOpen={pendingDeactivate !== null}
        title="Деактивировать ученика?"
        description="Ученик потеряет доступ к системе, но останется в базе и во всех отчётах."
        confirmLabel="Деактивировать"
        variant="danger"
        confirmLoading={deactivateMutation.isPending}
        onCancel={() => setPendingDeactivate(null)}
        onConfirm={() => {
          if (pendingDeactivate) {
            deactivateMutation.mutate(pendingDeactivate.id);
          }
        }}
      />
    </div>
  );
}
