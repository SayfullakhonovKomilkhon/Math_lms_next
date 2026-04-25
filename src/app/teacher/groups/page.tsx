'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowUpRight, Users, GraduationCap, Archive } from 'lucide-react';
import api from '@/lib/api';
import { Group } from '@/types';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Soft-pastel palette used to give each group card a unique accent color.
// Picked from the existing emerald/sky/violet/amber tokens already used in
// the app so it visually matches the rest of the dashboard.
const ACCENTS = [
  {
    ring: 'from-emerald-400/30 via-emerald-200/0 to-emerald-200/0',
    badge: 'bg-emerald-100 text-emerald-700',
    icon: 'bg-emerald-100 text-emerald-700',
    hoverBorder: 'hover:border-emerald-300',
    bar: 'bg-emerald-500',
  },
  {
    ring: 'from-sky-400/30 via-sky-200/0 to-sky-200/0',
    badge: 'bg-sky-100 text-sky-700',
    icon: 'bg-sky-100 text-sky-700',
    hoverBorder: 'hover:border-sky-300',
    bar: 'bg-sky-500',
  },
  {
    ring: 'from-violet-400/30 via-violet-200/0 to-violet-200/0',
    badge: 'bg-violet-100 text-violet-700',
    icon: 'bg-violet-100 text-violet-700',
    hoverBorder: 'hover:border-violet-300',
    bar: 'bg-violet-500',
  },
  {
    ring: 'from-amber-400/30 via-amber-200/0 to-amber-200/0',
    badge: 'bg-amber-100 text-amber-700',
    icon: 'bg-amber-100 text-amber-700',
    hoverBorder: 'hover:border-amber-300',
    bar: 'bg-amber-500',
  },
  {
    ring: 'from-rose-400/30 via-rose-200/0 to-rose-200/0',
    badge: 'bg-rose-100 text-rose-700',
    icon: 'bg-rose-100 text-rose-700',
    hoverBorder: 'hover:border-rose-300',
    bar: 'bg-rose-500',
  },
] as const;

function pickAccent(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return ACCENTS[hash % ACCENTS.length];
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function pluralStudents(count: number): string {
  const n = Math.abs(count) % 100;
  const n10 = n % 10;
  if (n > 10 && n < 20) return 'учеников';
  if (n10 > 1 && n10 < 5) return 'ученика';
  if (n10 === 1) return 'ученик';
  return 'учеников';
}

export default function TeacherGroupsPage() {
  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['teacher-groups'],
    queryFn: () => api.get('/groups').then((r) => r.data.data as Group[]),
  });

  const activeGroups = groups.filter((g) => g.isActive);
  const archivedGroups = groups.filter((g) => !g.isActive);
  const totalStudents = activeGroups.reduce(
    (sum, g) => sum + (g._count?.students ?? 0),
    0,
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Мои группы"
        description={`Активных групп: ${activeGroups.length} · всего учеников: ${totalStudents}`}
      />

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-2xl border border-slate-200/80 bg-white"
            />
          ))}
        </div>
      )}

      {!isLoading && activeGroups.length === 0 && archivedGroups.length === 0 && (
        <Card className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">У вас пока нет групп</h3>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            Как только администратор закрепит за вами группу, она появится здесь.
          </p>
        </Card>
      )}

      {activeGroups.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activeGroups.map((group) => {
            const accent = pickAccent(group.id);
            const count = group._count?.students ?? 0;
            const max = Math.max(group.maxStudents || 0, count, 1);
            const fill = Math.round((count / max) * 100);
            return (
              <Link
                key={group.id}
                href={`/teacher/groups/${group.id}`}
                className="group block focus:outline-none"
              >
                <Card
                  className={cn(
                    'relative overflow-hidden p-5 transition-all duration-200',
                    'hover:-translate-y-0.5 hover:shadow-lg',
                    accent.hoverBorder,
                  )}
                >
                  <div
                    className={cn(
                      'pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br opacity-80 blur-2xl',
                      accent.ring,
                    )}
                    aria-hidden
                  />

                  <div className="relative flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-semibold',
                          accent.icon,
                        )}
                      >
                        {getInitials(group.name)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-semibold text-slate-900">
                          {group.name}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {group.teacher?.fullName ?? 'Преподаватель не назначен'}
                        </p>
                      </div>
                    </div>

                    <span
                      className={cn(
                        'inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold',
                        accent.badge,
                      )}
                    >
                      Активна
                    </span>
                  </div>

                  <div className="relative mt-5 space-y-2.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Users className="h-4 w-4" />
                        <span className="font-medium text-slate-800">
                          {count}
                        </span>
                        <span>
                          {pluralStudents(count)}
                          {group.maxStudents
                            ? ` из ${group.maxStudents}`
                            : ''}
                        </span>
                      </div>
                      <span className="text-xs font-medium text-slate-400 transition-colors group-hover:text-slate-600">
                        Открыть
                      </span>
                    </div>

                    {group.maxStudents > 0 && (
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            accent.bar,
                          )}
                          style={{ width: `${Math.min(fill, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>

                  <span
                    className="pointer-events-none absolute right-4 top-4 hidden text-slate-400 transition-all group-hover:flex"
                    aria-hidden
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {archivedGroups.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <Archive className="h-4 w-4" />
            Архив ({archivedGroups.length})
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {archivedGroups.map((group) => (
              <Link
                key={group.id}
                href={`/teacher/groups/${group.id}`}
                className="block"
              >
                <Card className="flex items-center justify-between p-4 opacity-80 transition hover:opacity-100">
                  <div className="min-w-0">
                    <h4 className="truncate text-sm font-semibold text-slate-700">
                      {group.name}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {group._count?.students ?? 0}{' '}
                      {pluralStudents(group._count?.students ?? 0)}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                    В архиве
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
