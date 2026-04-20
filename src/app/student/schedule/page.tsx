'use client';

import { useQuery } from '@tanstack/react-query';
import { BookOpen, Clock, Info, MapPin } from 'lucide-react';
import api from '@/lib/api';
import type { ApiResponse, GroupSchedule } from '@/types';
import { PageTitle } from '../_components/PageTitle';
import { SectionHeading } from '../_components/Card';
import { mockNextTopic, mockSchedule, mockStudent } from '../_lib/mockData';
import styles from './schedule.module.css';

interface ScheduleData {
  groupName?: string;
  schedule?: GroupSchedule;
  teacher?: { fullName: string; phone?: string };
  nextTopic?: { date: string; topic: string } | null;
}

const DAY_MAP: Record<string, string> = {
  MON: 'Понедельник',
  TUE: 'Вторник',
  WED: 'Среда',
  THU: 'Четверг',
  FRI: 'Пятница',
  SAT: 'Суббота',
  SUN: 'Воскресенье',
};
const DAY_ORDER = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

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

  const days =
    data?.schedule?.days && data.schedule.days.length > 0
      ? data.schedule.days
      : mockSchedule.map((s) => ({
          day: s.day as GroupSchedule['days'][number]['day'],
          startTime: s.startTime,
          endTime: s.endTime,
        }));
  const sorted = [...days].sort(
    (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day),
  );
  const next = data?.nextTopic ?? mockNextTopic;
  const teacher =
    data?.teacher && data.teacher.fullName
      ? data.teacher
      : { fullName: mockStudent.teacherName, phone: '+998 90 000 00 00' };
  const groupName = data?.groupName ?? mockStudent.groupName;

  return (
    <div>
      <PageTitle
        kicker="Расписание"
        title="Твои занятия"
        description={`Группа: ${groupName}`}
        gradient
      />

      <SectionHeading icon={<Clock size={14} />} label="Еженедельно" />
      <div className={styles.scheduleGrid}>
        {sorted.map((d) => (
          <div key={d.day} className={styles.dayCard}>
            <div className={styles.dayLabel}>{DAY_MAP[d.day] ?? d.day}</div>
            <div className={styles.dayTime}>{d.startTime}</div>
            <div className={styles.dayEnd}>до {d.endTime}</div>
          </div>
        ))}
      </div>

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

      <div className={styles.section}>
        <SectionHeading icon={<MapPin size={14} />} label="Филиал и учитель" />
        <div className={styles.centerCard}>
          <div className={styles.centerTitle}>{mockStudent.centerName}</div>
          <div className={styles.centerMeta}>
            <MapPin size={14} />
            ул. Махтумкули, 79 · ориентир: Экопарк
          </div>
          <div className={styles.teacherRow}>
            <div className={styles.teacherAvatar}>{initials(teacher.fullName)}</div>
            <div>
              <div className={styles.teacherName}>{teacher.fullName}</div>
              <div className={styles.teacherPhone}>{teacher.phone ?? '—'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.info}>
        <Info size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
        Приходи за 5–10 минут до начала урока — успеешь подготовить ручку и тетрадь.
      </div>
    </div>
  );
}
