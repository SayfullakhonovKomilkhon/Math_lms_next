'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import api from '@/lib/api';
import { Parent } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import { InputField } from '@/components/ui/input-field';
import {
  DataTable,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
  DataTableCell,
} from '@/components/ui/data-table';
import { Card, CardContent } from '@/components/ui/card';
import { useDebounce } from '@/hooks/useDebounce';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';

export default function ParentsPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const {
    data: parents,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['parents', debouncedSearch],
    queryFn: () =>
      api
        .get('/parents', {
          params: debouncedSearch ? { search: debouncedSearch } : {},
        })
        .then((r) => r.data.data as Parent[]),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Родители"
        description="Управление аккаунтами родителей и привязка к ученикам"
        actions={
          <Link href="/admin/parents/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Новый родитель
            </Button>
          </Link>
        }
      />

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <InputField
              accent="admin"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по имени, email или телефону"
              className="pl-9"
            />
          </div>

          {isLoading ? (
            <TableSkeleton rows={6} cols={4} />
          ) : isError ? (
            <ErrorState
              message="Не удалось загрузить список родителей"
              onRetry={() => {
                void refetch();
              }}
            />
          ) : !parents || parents.length === 0 ? (
            <EmptyState
              icon="👨‍👩‍👧"
              message={debouncedSearch ? 'Ничего не найдено' : 'Родителей пока нет'}
              description={
                debouncedSearch
                  ? 'Попробуйте изменить запрос или добавьте нового родителя.'
                  : 'Создайте первого родителя или назначьте его при добавлении ученика.'
              }
            />
          ) : (
            <>
              <div className="hidden md:block">
                <DataTable>
                  <table className="w-full text-sm">
                    <DataTableHead>
                      <DataTableHeaderCell>ФИО</DataTableHeaderCell>
                      <DataTableHeaderCell>Email</DataTableHeaderCell>
                      <DataTableHeaderCell>Телефон</DataTableHeaderCell>
                      <DataTableHeaderCell>Дети</DataTableHeaderCell>
                    </DataTableHead>
                    <tbody>
                      {parents.map((p) => (
                        <DataTableRow
                          key={p.id}
                          className="cursor-pointer hover:bg-slate-50"
                        >
                          <DataTableCell>
                            <Link
                              href={`/admin/parents/${p.id}`}
                              className="font-semibold text-slate-900 hover:text-blue-600"
                            >
                              {p.fullName}
                            </Link>
                          </DataTableCell>
                          <DataTableCell className="text-slate-700">
                            {p.user?.email ?? '—'}
                          </DataTableCell>
                          <DataTableCell className="text-slate-600">
                            {p.phone ?? '—'}
                          </DataTableCell>
                          <DataTableCell>
                            <div className="flex flex-wrap gap-1.5">
                              {(p.students ?? []).length === 0 ? (
                                <span className="text-xs text-slate-400">
                                  Не привязаны
                                </span>
                              ) : (
                                (p.students ?? []).map((link) => (
                                  <Badge key={link.student.id} variant="blue">
                                    {link.student.fullName}
                                  </Badge>
                                ))
                              )}
                            </div>
                          </DataTableCell>
                        </DataTableRow>
                      ))}
                    </tbody>
                  </table>
                </DataTable>
              </div>
              <div className="space-y-3 md:hidden">
                {parents.map((p) => (
                  <Link
                    key={p.id}
                    href={`/admin/parents/${p.id}`}
                    className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:bg-slate-50"
                  >
                    <p className="font-semibold text-slate-900">{p.fullName}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {p.user?.email ?? '—'}
                      {p.phone ? ` · ${p.phone}` : ''}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {(p.students ?? []).length === 0 ? (
                        <span className="text-xs text-slate-400">
                          Без детей
                        </span>
                      ) : (
                        (p.students ?? []).map((link) => (
                          <Badge key={link.student.id} variant="blue">
                            {link.student.fullName}
                          </Badge>
                        ))
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
