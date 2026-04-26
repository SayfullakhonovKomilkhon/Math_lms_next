// Group schedule helpers shared across teacher / admin / student views.
//
// The DB stores `Group.schedule` as a JSON blob whose shape evolved over
// time, so any UI that reads it has to be defensive:
//
//   1) Newest format — multi-slot:
//        { slots: [{ days: ['MONDAY', ...], time: '15:00', duration: 90 }],
//          days:  [{ day: 'MON', startTime: '15:00', endTime: '16:30' }] }
//      (the flat `days` is kept for legacy readers.)
//
//   2) Older flat format:
//        { days: [{ day: 'MON', startTime: '...', endTime: '...' }] }
//
//   3) Oldest single-slot format:
//        { days: ['MONDAY', ...], time: '15:00', duration: 90 }
//
// `normalizeScheduleSlots` collapses all three into the same shape so the
// rest of the UI doesn't have to care.

export interface GroupScheduleSlot {
  days?: string[];
  time?: string;
  duration?: number;
}

export interface GroupSchedule extends GroupScheduleSlot {
  slots?: GroupScheduleSlot[];
}

const SHORT_TO_LONG_DAY: Record<string, string> = {
  MON: 'MONDAY',
  TUE: 'TUESDAY',
  WED: 'WEDNESDAY',
  THU: 'THURSDAY',
  FRI: 'FRIDAY',
  SAT: 'SATURDAY',
  SUN: 'SUNDAY',
};

interface FlatDayEntry {
  day: string;
  startTime?: string;
  endTime?: string;
}

function isFlatDayEntry(x: unknown): x is FlatDayEntry {
  return (
    typeof x === 'object' &&
    x !== null &&
    typeof (x as { day?: unknown }).day === 'string'
  );
}

export function normalizeScheduleSlots(
  schedule?: GroupSchedule | null,
): GroupScheduleSlot[] {
  if (!schedule) return [];

  if (Array.isArray(schedule.slots) && schedule.slots.length > 0) {
    return schedule.slots
      .map((s) => ({
        days: Array.isArray(s.days) ? s.days.filter((d) => typeof d === 'string') : [],
        time: typeof s.time === 'string' ? s.time : undefined,
        duration: typeof s.duration === 'number' ? s.duration : undefined,
      }))
      .filter((s) => (s.days?.length ?? 0) > 0);
  }

  const days = schedule.days as unknown;
  if (Array.isArray(days) && days.length > 0) {
    if (typeof days[0] === 'string') {
      return [
        {
          days: days as string[],
          time: schedule.time,
          duration: schedule.duration,
        },
      ];
    }
    if (isFlatDayEntry(days[0])) {
      const byTime = new Map<string, string[]>();
      (days as FlatDayEntry[]).forEach((entry) => {
        const long = SHORT_TO_LONG_DAY[entry.day] ?? entry.day;
        const key = entry.startTime ?? '';
        if (!byTime.has(key)) byTime.set(key, []);
        byTime.get(key)!.push(long);
      });
      return Array.from(byTime.entries()).map(([time, list]) => {
        let duration: number | undefined;
        const sample = (days as FlatDayEntry[]).find(
          (d) => (d.startTime ?? '') === time,
        );
        if (sample?.startTime && sample.endTime) {
          const [sh, sm] = sample.startTime.split(':').map(Number);
          const [eh, em] = sample.endTime.split(':').map(Number);
          if (
            Number.isFinite(sh) &&
            Number.isFinite(sm) &&
            Number.isFinite(eh) &&
            Number.isFinite(em)
          ) {
            duration = eh * 60 + em - (sh * 60 + sm);
            if (duration < 0) duration += 24 * 60;
          }
        }
        return {
          days: Array.from(new Set(list)),
          time: time || undefined,
          duration,
        };
      });
    }
  }

  return [];
}

export function getScheduleWeekdayIndexes(
  schedule?: GroupSchedule | null,
): number[] {
  const DAY_INDEX: Record<string, number> = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
  };
  const set = new Set<number>();
  normalizeScheduleSlots(schedule).forEach((slot) => {
    (slot.days ?? []).forEach((d) => {
      const idx = DAY_INDEX[d];
      if (idx !== undefined) set.add(idx);
    });
  });
  return Array.from(set);
}

const RU_DAY_LABELS: Record<string, string> = {
  MONDAY: 'Понедельник',
  TUESDAY: 'Вторник',
  WEDNESDAY: 'Среда',
  THURSDAY: 'Четверг',
  FRIDAY: 'Пятница',
  SATURDAY: 'Суббота',
  SUNDAY: 'Воскресенье',
};

const ODD_DAYS = new Set(['MONDAY', 'WEDNESDAY', 'FRIDAY']);
const EVEN_DAYS = new Set(['TUESDAY', 'THURSDAY', 'SATURDAY']);

function formatSlotLabel(slot: GroupScheduleSlot): string | null {
  const days = slot.days ?? [];
  if (days.length === 0) return null;
  const allOdd = days.every((d) => ODD_DAYS.has(d));
  const allEven = days.every((d) => EVEN_DAYS.has(d));
  let daysLabel: string;
  if (allOdd && days.length === ODD_DAYS.size) daysLabel = 'Нечётные дни';
  else if (allEven && days.length === EVEN_DAYS.size) daysLabel = 'Чётные дни';
  else daysLabel = days.map((d) => RU_DAY_LABELS[d] ?? d).join(', ');
  if (slot.time) return `${daysLabel} · ${slot.time}`;
  return daysLabel;
}

export function formatScheduleLabel(schedule?: GroupSchedule | null): string {
  const slots = normalizeScheduleSlots(schedule);
  const labels = slots
    .map(formatSlotLabel)
    .filter((s): s is string => Boolean(s));
  if (labels.length === 0) return '—';
  return labels.join(' · ');
}
