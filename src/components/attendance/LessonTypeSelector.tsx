'use client';

import { LessonType } from '@/types';
import { cn } from '@/lib/utils';

interface Props {
  value: LessonType | null;
  onChange: (type: LessonType) => void;
}

const TYPES: { value: LessonType; label: string; desc: string; color: string }[] = [
  {
    value: 'REGULAR',
    label: 'Обычный урок',
    desc: 'Отметка присутствия',
    color: 'border-sky-300 bg-sky-50 text-sky-800',
  },
  {
    value: 'PRACTICE',
    label: 'Практическая работа',
    desc: 'Присутствие + оценка',
    color: 'border-violet-300 bg-violet-50 text-violet-800',
  },
  {
    value: 'CONTROL',
    label: 'Контрольная работа',
    desc: 'Присутствие + оценка',
    color: 'border-amber-300 bg-amber-50 text-amber-900',
  },
  {
    value: 'TEST',
    label: 'Тест',
    desc: 'Присутствие + оценка',
    color: 'border-emerald-300 bg-emerald-50 text-emerald-800',
  },
];

export function LessonTypeSelector({ value, onChange }: Props) {
  return (
    <div>
      <p className="mb-3 text-sm font-medium text-slate-700">Выберите тип урока:</p>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => onChange(t.value)}
            className={cn(
              'rounded-xl border-2 p-4 text-left shadow-sm transition-all',
              value === t.value
                ? t.color + ' border-current shadow-sm'
                : 'border-slate-200/90 bg-white hover:border-slate-300',
            )}
          >
            <div className="text-sm font-semibold">{t.label}</div>
            <div className="mt-1 text-xs opacity-80">{t.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
