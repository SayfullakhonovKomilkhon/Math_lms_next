'use client';

import { useQuery } from '@tanstack/react-query';
import { BookOpen, Clock, Info, MapPin } from 'lucide-react';
import api from '@/lib/api';
import type { ApiResponse } from '@/types';
import {
  GroupSchedule,
  GroupScheduleSlot,
  normalizeScheduleSlots,
} from '@/lib/group-schedule';
import { PageTitle } from '../_components/PageTitle';
import { SectionHeading } from '../_components/Card';
import styles from './schedule.module.css';

interface ScheduleData {
  groupName?: string;
  // The DB JSON shape for `schedule` evolved over time, so we accept the
  // union of all known shapes and normalize at render time.
  schedule?: GroupSchedule;
  teacher?: { fullName: string; phone?: string };
  nextTopic?: { date: string; topic: string } | null;
}

const DAY_LABEL: Record<string, string> = {
  MONDAY: 'Понедельник',
  TUESDAY: 'Вторник',
  WEDNESDAY: 'Среда',
  THURSDAY: 'Четверг',
  FRIDAY: 'Пятница',
  SATURDAY: 'Суббота',
  SUNDAY: 'Воскресенье',
};

const DAY_ORDER = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

function computeEndTime(time?: string, duration?: number): string | null {
  if (!time) return null;
  const [hh, mm] = time.split(':').map(Number);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
  const total = hh * 60 + mm + (Number.isFinite(duration) ? Number(duration) : 0);
  const eh = Math.floor(total / 60) % 24;
  const em = total % 60;
  return `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
}

function sortSlotDays(days: string[]): string[] {
  return [...days].sort(
    (a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b),
  );
}

function initials(n: string) {
  const p = n.trim().split(/\s+/);
  return ((p[0]?.[0] ?? '') + (p[1]?.[0] ?? '')).toUpperCase();
}

export default function StudentSchedulePage() {
  const { data } = useQuery({
    queryKey: ['student-schedule-page'],
    queryFn: () =>
      api.get<ApiResponse<ScheduleData>>('/schedule/my').then((r) => r.data.data),
    retry: 0,
  });

  const slots: GroupScheduleSlot[] = normalizeScheduleSlots(data?.schedule);
  const next = data?.nextTopic ?? null;
  const teacher = data?.teacher && data.teacher.fullName ? data.teacher : null;
  const groupName = data?.groupName ?? '—';
  const showSlotHeaders = slots.length > 1;

  return (
    <div>
      <PageTitle
        kicker="Расписание"
        title="Твои занятия"
        description={`Группа: ${groupName}`}
        gradient
      />

      <SectionHeading icon={<Clock size={14} />} label="Еженедельно" />
      {slots.length === 0 ? (
        <div style={{ padding: 20, color: 'var(--s-text-secondary)' }}>
          Расписание пока не задано.
        </div>
      ) : (
        <div>
          {slots.map((slot, idx) => {
            const sortedDays = sortSlotDays(slot.days ?? []);
            const endTime = computeEndTime(slot.time, slot.duration);
            return (
              <div key={`${slot.time ?? idx}-${idx}`} className={styles.slotBlock}>
                {showSlotHeaders && (
                  <div className={styles.slotHeader}>
                    <span>Расписание №{idx + 1}</span>
                    {slot.time && (
                      <span className={styles.slotHeaderTime}>
                        {slot.time}
                        {endTime ? ` – ${endTime}` : ''}
                      </span>
                    )}
                    {slot.duration ? (
                      <span className={styles.slotHeaderDuration}>
                        {slot.duration} мин
                      </span>
                    ) : null}
                  </div>
                )}
                <div className={styles.scheduleGrid}>
                  {sortedDays.map((day) => (
                    <div key={`${idx}-${day}`} className={styles.dayCard}>
                      <div className={styles.dayLabel}>
                        {DAY_LABEL[day] ?? day}
                      </div>
                      <div className={styles.dayTime}>{slot.time ?? '—'}</div>
                      <div className={styles.dayEnd}>
                        {endTime ? `до ${endTime}` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className={styles.section}>
        <SectionHeading icon={<BookOpen size={14} />} label="Ближайшая тема" />
        {next ? (
          <div className={styles.nextLessonCard}>
            <div className={styles.nextLabel}>
              {new Date(next.date).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
            <div className={styles.nextTopic}>{next.topic}</div>
            <div className={styles.nextDate}>Приходи подготовленным!</div>
          </div>
        ) : (
          <div style={{ padding: 20, color: 'var(--s-text-secondary)' }}>
            Тема ближайшего урока скоро появится.
          </div>
        )}
      </div>

      {teacher && (
        <div className={styles.section}>
          <SectionHeading icon={<MapPin size={14} />} label="Учитель" />
          <div className={styles.centerCard}>
            <div className={styles.teacherRow}>
              <div className={styles.teacherAvatar}>{initials(teacher.fullName)}</div>
              <div>
                <div className={styles.teacherName}>{teacher.fullName}</div>
                <div className={styles.teacherPhone}>{teacher.phone ?? '—'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={styles.info}>
        <Info size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
        Приходи за 5–10 минут до начала урока — успеешь подготовить ручку и тетрадь.
      </div>
    </div>
  );
}
