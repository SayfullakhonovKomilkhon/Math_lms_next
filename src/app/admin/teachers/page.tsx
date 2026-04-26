'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import { Teacher } from '@/types';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pencil, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function AdminTeachersPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const { data: teachers = [], isLoading } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => api.get('/teachers').then((r) => r.data.data as Teacher[]),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Учителя"
        description={
          isSuperAdmin
            ? 'Создание учётных записей учителей (доступно только супер-администратору)'
            : 'Список учителей'
        }
        actions={
          isSuperAdmin ? (
            <Link href="/admin/teachers/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Добавить учителя
              </Button>
            </Link>
          ) : null
        }
      />

      {isLoading ? (
        <p className="text-sm text-slate-500">Загрузка…</p>
      ) : teachers.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-slate-600">
            Учителей пока нет.
            {isSuperAdmin && (
              <>
                {' '}
                <Link href="/admin/teachers/new" className="font-medium text-indigo-600 hover:underline">
                  Добавить первого
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teachers.map((t) => (
            <Card key={t.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-slate-900">{t.fullName}</h3>
                    <p className="mt-1 text-sm text-slate-600">{t.user?.phone ?? t.phone ?? '—'}</p>
                  </div>
                  <Badge variant={t.isActive ? 'green' : 'gray'}>
                    {t.isActive ? 'Активен' : 'Неактивен'}
                  </Badge>
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  Ставка за ученика: {Number(t.ratePerStudent).toLocaleString('ru-RU')} сум
                </p>
                {isSuperAdmin ? (
                  <div className="mt-4">
                    <Link href={`/admin/teachers/${t.id}`}>
                      <Button variant="secondary" size="sm">
                        <Pencil className="mr-2 h-4 w-4" />
                        Редактировать
                      </Button>
                    </Link>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
