'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ChevronRight, Pencil, Plus, Search } from 'lucide-react';
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
  const router = useRouter();
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
              placeholder="Поиск по имени или телефону"
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
                      <DataTableHeaderCell>Телефон (логин)</DataTableHeaderCell>
                      <DataTableHeaderCell>Дети</DataTableHeaderCell>
                      <DataTableHeaderCell className="text-right">
                        Действия
                      </DataTableHeaderCell>
                    </DataTableHead>
                    <tbody>
                      {parents.map((p) => (
                        <DataTableRow
                          key={p.id}
                          className="cursor-pointer hover:bg-slate-50"
                          onClick={() => router.push(`/admin/parents/${p.id}`)}
                        >
                          <DataTableCell>
                            <Link
                              href={`/admin/parents/${p.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="font-semibold text-slate-900 hover:text-blue-600"
                            >
                              {p.fullName}
                            </Link>
                          </DataTableCell>
                          <DataTableCell className="text-slate-700">
                            {p.user?.phone ?? p.phone ?? '—'}
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
                          <DataTableCell className="text-right">
                            <Link
                              href={`/admin/parents/${p.id}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button variant="ghost" size="sm">
                                <Pencil className="mr-1 h-4 w-4" />
                                Изменить
                              </Button>
                            </Link>
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
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:bg-slate-50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900">
                        {p.fullName}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {p.user?.phone ?? p.phone ?? '—'}
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
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
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
