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
          <Link key={group.id} href={`/teacher/groups/${group.id}/attendance`}>
            <Card className="p-5 transition-all hover:border-emerald-200 hover:shadow-md cursor-pointer">
              <div className="mb-3 flex items-start justify-between">
                <h3 className="text-lg font-semibold text-slate-900">{group.name}</h3>
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">
                  Активна
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Users className="h-4 w-4" />
                <span>{group._count?.students ?? 0} учеников</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
