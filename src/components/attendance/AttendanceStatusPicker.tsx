'use client';

import { Check, Clock, UserX } from 'lucide-react';
import type { AttendanceStatus } from '@/types';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  IconMenuItem,
} from '@/components/ui/dropdown-menu';

const STATUS_META: {
  value: AttendanceStatus;
  label: string;
  description: string;
  triggerClass: string;
  icon: typeof Check;
}[] = [
  {
    value: 'PRESENT',
    label: 'Присутствует',
    description: 'На уроке',
    triggerClass: 'border-emerald-500 bg-emerald-50 text-emerald-700',
    icon: Check,
  },
  {
    value: 'LATE',
    label: 'Опоздал',
    description: 'Пришёл с опозданием',
    triggerClass: 'border-amber-400 bg-amber-50 text-amber-800',
    icon: Clock,
  },
  {
    value: 'ABSENT',
    label: 'Отсутствует',
    description: 'Не пришёл',
    triggerClass: 'border-red-400 bg-red-50 text-red-700',
    icon: UserX,
  },
];

function metaFor(value: AttendanceStatus) {
  return STATUS_META.find((m) => m.value === value) ?? STATUS_META[0];
}

const ariaLabel: Record<AttendanceStatus, string> = {
  PRESENT: 'Статус: присутствует. Открыть выбор статуса',
  LATE: 'Статус: опоздал. Открыть выбор статуса',
  ABSENT: 'Статус: отсутствует. Открыть выбор статуса',
};

interface Props {
  value: AttendanceStatus;
  onChange: (value: AttendanceStatus) => void;
  disabled?: boolean;
}

export function AttendanceStatusPicker({ value, onChange, disabled }: Props) {
  const current = metaFor(value);
  const TriggerIcon = current.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <button
          type="button"
          aria-label={ariaLabel[value]}
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-shadow',
            'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            current.triggerClass,
          )}
        >
          <TriggerIcon className="h-5 w-5" strokeWidth={2.5} aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" accent="teacher" className="min-w-[220px]">
        {STATUS_META.map((m) => (
          <IconMenuItem
            key={m.value}
            accent="teacher"
            icon={m.icon}
            label={m.label}
            description={m.description}
            iconClassName={cn(
              m.value === 'PRESENT' && 'border-emerald-200 bg-emerald-50 text-emerald-700',
              m.value === 'LATE' && 'border-amber-200 bg-amber-50 text-amber-800',
              m.value === 'ABSENT' && 'border-red-200 bg-red-50 text-red-700',
            )}
            onSelect={() => onChange(m.value)}
          />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
