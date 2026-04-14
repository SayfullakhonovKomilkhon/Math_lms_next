'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Users } from 'lucide-react';
import api from '@/lib/api';
import { Group } from '@/types';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';

export default function TeacherGroupsPage() {
  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['teacher-groups'],
    queryFn: () => api.get('/groups').then((r) => r.data.data as Group[]),
  });

  const activeGroups = groups.filter((g) => g.isActive);

  return (
    <div className="space-y-6">
      <PageHeader title="Мои группы" description={`Активных групп: ${activeGroups.length}`} />

      {isLoading && <p className="text-slate-400">Загрузка...</p>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {activeGroups.map((group) => (
          <Card key={group.id} className="p-5 transition-shadow hover:shadow-md">
            <div className="mb-4 flex items-start justify-between">
              <Link href={`/teacher/groups/${group.id}`}>
                <h3 className="text-lg font-semibold text-slate-900 transition-colors hover:text-emerald-700">
                  {group.name}
                </h3>
              </Link>
              <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">
                Активна
              </span>
            </div>

            <div className="mb-4 space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{group._count?.students ?? 0} учеников</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { label: 'Посещаемость', href: 'attendance' },
                { label: 'Оценки', href: 'grades' },
                { label: 'Домашнее задание', href: 'homework' },
                { label: 'Темы уроков', href: 'topics' },
              ].map(({ label, href }) => (
                <Link
                  key={href}
                  href={`/teacher/groups/${group.id}/${href}`}
                  className="rounded-lg bg-slate-100 px-3 py-2 text-center font-medium text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-800"
                >
                  {label}
                </Link>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
