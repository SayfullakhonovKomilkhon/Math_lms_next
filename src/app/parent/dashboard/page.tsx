'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ApiResponse, PaymentSummary, GradeRecord } from '@/types';
import {
  Calendar,
  BarChart2,
  CreditCard,
  ArrowRight,
  Trophy,
  Megaphone,
  BookOpen,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useMyAnnouncements } from '@/hooks/useAnnouncements';
import {
  useParentProfile,
  useSelectedChild,
  PARENT_CHILD_QUERY_DEFAULTS,
} from '@/hooks/useParentProfile';
import { ChildSelector } from '@/components/parent/ChildSelector';
import Link from 'next/link';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { CardSkeleton, ProfileSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';

interface AchievementGridEntry {
  unlocked?: boolean;
  icon?: string;
  title?: string;
}

const PAYMENT_ACCENT: Record<string, { bg: string; text: string; label: string }> = {
  PAID: {
    bg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    text: 'text-emerald-50',
    label: 'Оплачено',
  },
  PENDING: {
    bg: 'bg-gradient-to-br from-amber-400 to-orange-500',
    text: 'text-amber-50',
    label: 'На проверке',
  },
  REJECTED: {
    bg: 'bg-gradient-to-br from-rose-500 to-red-600',
    text: 'text-rose-50',
    label: 'Отклонено',
  },
  UNPAID: {
    bg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    text: 'text-blue-50',
    label: 'Не оплачено',
  },
};

export default function ParentDashboard() {
  const {
    data: profile,
    isLoading: profileLoading,
    isFetching: profileFetching,
    isError: profileError,
    refetch,
  } = useParentProfile();

  const { children, selected, selectedId, select } = useSelectedChild(profile);

  const { data: announcementsData } = useMyAnnouncements({ limit: 3 });
  const latestAnnouncements = announcementsData?.data ?? [];

  const { data: paymentRes } = useQuery({
    queryKey: ['parent-child-payment', selectedId],
    queryFn: () =>
      api
        .get<ApiResponse<PaymentSummary>>('/parents/me/child/payments', {
          params: selectedId ? { studentId: selectedId } : {},
        })
        .then((res) => res.data),
    enabled: !!selectedId,
    ...PARENT_CHILD_QUERY_DEFAULTS,
  });

  const { data: gradesRes } = useQuery({
    queryKey: ['parent-child-grades-latest', selectedId],
    queryFn: () =>
      api
        .get<ApiResponse<GradeRecord[]>>('/parents/me/child/grades', {
          params: selectedId ? { studentId: selectedId } : {},
        })
        .then((res) => res.data),
    enabled: !!selectedId,
    ...PARENT_CHILD_QUERY_DEFAULTS,
  });

  const childId = selected?.id;
  const { data: achievementsRes } = useQuery({
    queryKey: ['child-achievements', childId],
    queryFn: () => api.get(`/achievements/student/${childId}`).then((r) => r.data.data),
    enabled: !!childId,
    staleTime: 1000 * 60 * 10,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const profileEmpty = !profile || (profile.children?.length ?? 0) === 0;
  if (profileLoading || (profileFetching && profileEmpty)) {
    return (
      <div className="space-y-5">
        <ProfileSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (profileError) {
    return (
      <ErrorState
        message="Не удалось загрузить панель родителя"
        description="Данные о ребёнке временно недоступны."
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  const payment = paymentRes?.data;
  const grades = (gradesRes?.data || []).slice(0, 3);
  const latestAchievement =
    (achievementsRes?.monthGrid as AchievementGridEntry[] | undefined)?.find(
      (entry) => entry.unlocked,
    ) ?? null;

  if (!profile) {
    return (
      <EmptyState
        icon="👨‍👩‍👧"
        message="Профиль родителя пока недоступен"
        description="Попробуйте войти снова или обратитесь к администратору."
      />
    );
  }

  const child = selected;
  const group = child?.group;
  const teacher = group?.teacher;

  const greetName =
    (profile.fullName && profile.fullName.trim()) || profile.phone || 'родитель';
  const firstName = greetName.split(' ')[0] || greetName;

  if (!child) {
    return (
      <div className="space-y-5">
        <HeaderHello firstName={firstName} childName={null} />
        <EmptyState
          icon="👧"
          message="Ребёнок ещё не привязан"
          description="Обратитесь к администратору, чтобы связать ваш профиль с учеником. Как только ребёнка добавят — данные подгрузятся автоматически."
        />
      </div>
    );
  }

  const childInitials = child.fullName
    .split(' ')
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const paymentStatus = payment?.currentMonth.status ?? 'UNPAID';
  const paymentAccent = PAYMENT_ACCENT[paymentStatus] ?? PAYMENT_ACCENT.UNPAID;
  const paymentAmount = payment?.currentMonth.amount ?? 0;
  const paymentDue = payment?.currentMonth.nextPaymentDate;
  const daysLeft = payment?.currentMonth.daysUntilPayment ?? null;

  return (
    <div className="space-y-5 pb-2">
      <ChildSelector children={children} selectedId={selectedId} onSelect={select} />

      {/* Hero greeting + child profile */}
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-5 text-white shadow-[0_8px_24px_-8px_rgba(79,70,229,0.5)] sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-lg font-bold backdrop-blur-sm sm:h-16 sm:w-16 sm:text-xl">
            {childInitials || '👧'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-blue-100/80">
              Здравствуйте, {firstName}
            </p>
            <h1 className="mt-0.5 truncate text-xl font-bold leading-tight sm:text-2xl">
              {child.fullName}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-blue-100/90">
              {group?.name && (
                <span className="rounded-full bg-white/15 px-2 py-0.5 backdrop-blur-sm">
                  {group.name}
                </span>
              )}
              {teacher?.fullName && (
                <span className="truncate">· {teacher.fullName}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment hero card */}
      <Link
        href="/parent/payment"
        className={`group block overflow-hidden rounded-3xl ${paymentAccent.bg} relative p-5 text-white shadow-[0_8px_24px_-12px_rgba(15,23,42,0.4)] transition-transform active:scale-[0.99] sm:p-6`}
      >
        <div className="absolute right-0 top-0 h-40 w-40 -translate-y-12 translate-x-12 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm">
                <CreditCard className="h-3 w-3" />
                {paymentAccent.label}
              </div>
              <p className="mt-3 text-xs font-medium opacity-90">К оплате за месяц</p>
              <p className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
                {paymentAmount.toLocaleString('ru-RU')}
                <span className="ml-1 text-base font-bold opacity-90">сум</span>
              </p>
              {paymentDue && (
                <p className="mt-1 text-xs opacity-85">
                  до {format(new Date(paymentDue), 'd MMMM', { locale: ru })}
                  {typeof daysLeft === 'number' && daysLeft >= 0 && paymentStatus === 'UNPAID'
                    ? ` · осталось ${daysLeft} ${pluralDays(daysLeft)}`
                    : ''}
                </p>
              )}
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 opacity-70 transition-transform group-active:translate-x-0.5" />
          </div>
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-2 text-xs font-semibold backdrop-blur-sm">
            Загрузить чек
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </Link>

      {/* Quick actions grid */}
      <div className="grid grid-cols-2 gap-3">
        <ActionTile
          href="/parent/attendance"
          icon={Calendar}
          label="Посещаемость"
          tint="bg-blue-50 text-blue-600"
        />
        <ActionTile
          href="/parent/grades"
          icon={BarChart2}
          label="Оценки"
          tint="bg-indigo-50 text-indigo-600"
        />
        <ActionTile
          href="/parent/homework"
          icon={BookOpen}
          label="Домашка"
          tint="bg-emerald-50 text-emerald-600"
        />
        <ActionTile
          href="/parent/achievements"
          icon={Trophy}
          label="Награды"
          tint="bg-amber-50 text-amber-600"
        />
      </div>

      {/* Latest grades */}
      <SectionCard
        title="Последние оценки"
        icon={BarChart2}
        href="/parent/grades"
        accent="text-indigo-600"
      >
        {grades.length === 0 ? (
          <EmptyRow text="Оценок пока нет" />
        ) : (
          <ul className="divide-y divide-slate-100">
            {grades.map((g) => {
              const tone = g.scorePercent >= 80
                ? 'text-emerald-600'
                : g.scorePercent >= 60
                  ? 'text-amber-600'
                  : 'text-rose-600';
              const dot = g.scorePercent >= 80
                ? 'bg-emerald-500'
                : g.scorePercent >= 60
                  ? 'bg-amber-500'
                  : 'bg-rose-500';
              return (
                <li key={g.id} className="flex items-center gap-3 px-4 py-3">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800 capitalize">
                      {g.lessonType.toLowerCase()}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {format(new Date(g.date), 'd MMMM', { locale: ru })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold leading-none ${tone}`}>{g.score}</p>
                    <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      из {g.maxScore}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>

      {/* Latest achievement */}
      {latestAchievement && (
        <Link
          href="/parent/achievements"
          className="block rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-4 transition-transform active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
              {latestAchievement.icon || '🏆'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                <Sparkles className="h-3 w-3" /> Новое достижение
              </p>
              <p className="truncate font-bold text-slate-900">
                {latestAchievement.title}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-amber-500" />
          </div>
        </Link>
      )}

      {/* Announcements */}
      <SectionCard
        title="Объявления"
        icon={Megaphone}
        href="/parent/announcements"
        accent="text-blue-600"
      >
        {latestAnnouncements.length === 0 ? (
          <EmptyRow text="Объявлений пока нет" />
        ) : (
          <ul className="divide-y divide-slate-100">
            {latestAnnouncements.map((a) => (
              <li key={a.id}>
                <Link
                  href="/parent/announcements"
                  className="flex items-start gap-3 px-4 py-3 transition-colors active:bg-slate-50"
                >
                  <span
                    aria-hidden
                    className={`mt-2 h-2 w-2 shrink-0 rounded-full ${
                      a.isRead ? 'bg-slate-200' : 'bg-blue-500'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-sm ${
                        a.isRead
                          ? 'font-medium text-slate-700'
                          : 'font-semibold text-slate-900'
                      }`}
                    >
                      {a.title}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-slate-400">
                      {a.authorName} ·{' '}
                      {format(new Date(a.createdAt), 'd MMM, HH:mm', { locale: ru })}
                    </p>
                  </div>
                  {a.isPinned && (
                    <span className="ml-1 mt-0.5 shrink-0 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-700">
                      📌
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}

function HeaderHello({
  firstName,
  childName,
}: {
  firstName: string;
  childName: string | null;
}) {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 p-5 text-white shadow-[0_8px_24px_-8px_rgba(79,70,229,0.5)]">
      <p className="text-xs font-medium text-blue-100/80">Здравствуйте,</p>
      <h1 className="mt-0.5 text-xl font-bold sm:text-2xl">{firstName}</h1>
      {childName && (
        <p className="mt-2 text-sm text-blue-100/90">Ваш ребёнок: {childName}</p>
      )}
    </div>
  );
}

function ActionTile({
  href,
  icon: Icon,
  label,
  tint,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  tint: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all active:scale-[0.98] active:bg-slate-50"
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tint}`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="text-sm font-semibold text-slate-800">{label}</span>
    </Link>
  );
}

function SectionCard({
  title,
  icon: Icon,
  href,
  accent,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <Icon className={`h-4 w-4 ${accent}`} />
          {title}
        </h2>
        <Link
          href={href}
          className="-mr-1 rounded-lg p-1.5 text-slate-400 transition-colors active:bg-slate-100 active:text-slate-600"
          aria-label={`Открыть ${title}`}
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="border-t border-slate-100">{children}</div>
    </section>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <div className="px-4 py-8 text-center text-sm text-slate-400">{text}</div>
  );
}

function pluralDays(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'день';
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return 'дня';
  return 'дней';
}
