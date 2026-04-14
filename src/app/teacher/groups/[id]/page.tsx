'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Users } from 'lucide-react';
import api from '@/lib/api';
import { Group } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const LINKS = [
  { href: 'attendance', label: 'Журнал посещаемости', desc: 'Отметки за урок' },
  { href: 'grades', label: 'Оценки и рейтинг', desc: 'Журнал и рейтинг группы' },
  { href: 'homework', label: 'Домашние задания', desc: 'Создание и список ДЗ' },
  { href: 'topics', label: 'Темы уроков', desc: 'План и история тем' },
] as const;

export default function TeacherGroupHubPage() {
  const { id: groupId } = useParams<{ id: string }>();

  const { data: group, isLoading } = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => api.get(`/groups/${groupId}`).then((r) => r.data.data as Group),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/teacher/groups">
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0" aria-label="Назад к группам">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isLoading ? 'Загрузка...' : group?.name ?? 'Группа'}
          </h1>
          {group && (
            <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
              <Users className="h-4 w-4" />
              {group._count?.students ?? 0} учеников · {group.teacher?.fullName}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {LINKS.map(({ href, label, desc }) => (
          <Link key={href} href={`/teacher/groups/${groupId}/${href}`}>
            <Card className="h-full p-5 transition-all hover:border-emerald-200 hover:shadow-sm">
              <h2 className="font-semibold text-slate-900">{label}</h2>
              <p className="mt-1 text-sm text-slate-500">{desc}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
