/**
 * Fallback mock data used when the API returns nothing.
 * Uses authentic Uzbek names so the UI looks alive in demo mode.
 */

import type { SpecialKey } from './achievementsCatalog';

export type MockAchievement = {
  month: number;
  monthName: string;
  unlocked: boolean;
  place?: 1 | 2 | 3;
  title?: string;
  icon?: string;
  description?: string;
  year?: number;
  createdAt?: string;
};

export type MockSpecial = {
  key: SpecialKey;
  unlocked: boolean;
  unlockedAt?: string;
};

export const mockStudent = {
  id: 'stu_mock_01',
  fullName: 'Диёрбек Усмонов',
  firstName: 'Диёрбек',
  phone: '+998 90 123 45 67',
  gender: 'male' as 'male' | 'female',
  level: 7,
  xp: 1280,
  xpNeeded: 1800,
  title: 'Умный боец',
  titleEmoji: '⚡',
  groupName: 'Алгебра · Уровень 2',
  teacherName: 'Фаррух Ибрагимович',
  centerName: 'MathCenter · Филиал Экопарк',
  streak: 12,
};

export const mockStats = {
  totalLessons: 64,
  attendancePercent: 96,
  averageScore: 89,
  placeInGroup: 2,
  totalStudents: 14,
  goldCount: 5,
  silverCount: 4,
  bronzeCount: 3,
};

export const mockLatestHomework = {
  id: 'hw_mock_01',
  text: 'Решить задачи № 142–148 из учебника. Обратите внимание на систему уравнений с параметром. Последнюю задачу разобрать до конца, даже если сложно — в понедельник обсудим на уроке.',
  dueDate: new Date(Date.now() + 1000 * 60 * 60 * 36).toISOString(),
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
  imageUrls: [] as string[],
  youtubeUrl: undefined as string | undefined,
};

const MONTH_NAMES_RU = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

// Preview: все 12 месяцев показываем в разблокированном виде с чередованием
// мест (1/2/3), чтобы видеть все варианты медалей сразу.
const MOCK_PLACES: (1 | 2 | 3)[] = [1, 2, 1, 3, 2, 1, 2, 3, 1, 2, 3, 1];

export const mockMonthGrid: MockAchievement[] = MONTH_NAMES_RU.map((name, i) => {
  const place = MOCK_PLACES[i] ?? 2;
  return {
    month: i + 1,
    monthName: name,
    unlocked: true,
    place,
    title:
      place === 1
        ? 'Лучший месяца'
        : place === 2
          ? 'Серебряный призёр'
          : 'Бронзовый призёр',
    icon: place === 1 ? '🥇' : place === 2 ? '🥈' : '🥉',
    description: `Топ-${place} среди учеников группы по итогам месяца.`,
    year: 2026,
  };
});

export const mockSpecials: MockSpecial[] = [
  { key: 'first_step', unlocked: true, unlockedAt: new Date('2025-09-05').toISOString() },
  { key: 'iron_attendance', unlocked: true, unlockedAt: new Date('2026-01-31').toISOString() },
  { key: 'perfect_100', unlocked: true, unlockedAt: new Date('2026-02-28').toISOString() },
  { key: 'three_months', unlocked: true, unlockedAt: new Date('2026-03-30').toISOString() },
  { key: 'quiet_hero', unlocked: true, unlockedAt: new Date('2026-04-10').toISOString() },
  { key: 'year_legend', unlocked: false },
  { key: 'no_miss', unlocked: false },
];

export const mockLeaderboard = [
  { id: 'u1', fullName: 'Азиза Рахимова', score: 97, place: 1, change: 1 },
  { id: 'u2', fullName: 'Диёрбек Усмонов', score: 94, place: 2, change: 0, isMe: true },
  { id: 'u3', fullName: 'Жасур Каримов', score: 91, place: 3, change: -1 },
  { id: 'u4', fullName: 'Мадина Хасанова', score: 88, place: 4, change: 2 },
  { id: 'u5', fullName: 'Шохрух Абдуллаев', score: 85, place: 5, change: -2 },
  { id: 'u6', fullName: 'Нилуфар Юлдашева', score: 82, place: 6, change: 0 },
  { id: 'u7', fullName: 'Бахтиёр Тошмуродов', score: 80, place: 7, change: 3 },
  { id: 'u8', fullName: 'Севинч Эргашева', score: 78, place: 8, change: -1 },
  { id: 'u9', fullName: 'Акмал Исаев', score: 75, place: 9, change: 0 },
  { id: 'u10', fullName: 'Зарина Каримова', score: 74, place: 10, change: 1 },
];

export const mockSchedule = [
  { day: 'MON', dayName: 'Понедельник', startTime: '16:00', endTime: '18:00' },
  { day: 'WED', dayName: 'Среда', startTime: '16:00', endTime: '18:00' },
  { day: 'FRI', dayName: 'Пятница', startTime: '16:00', endTime: '18:00' },
];

export const mockNextTopic = {
  date: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
  topic: 'Квадратные уравнения с параметром',
};

export const mockNotifications = [
  {
    id: 'n1',
    type: 'ACHIEVEMENT',
    message: 'Новое достижение: «Железная посещаемость» 🔥',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'n2',
    type: 'HOMEWORK',
    message: 'Новое ДЗ по алгебре — срок сдачи до пятницы.',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: 'n3',
    type: 'PAYMENT',
    message: 'Оплата за март подтверждена. Спасибо!',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];

export const mockGrades = [
  { id: 'g1', date: new Date('2026-04-14').toISOString(), lessonType: 'CONTROL', score: 95, maxScore: 100, scorePercent: 95, comment: 'Отличная работа!' },
  { id: 'g2', date: new Date('2026-04-07').toISOString(), lessonType: 'PRACTICE', score: 18, maxScore: 20, scorePercent: 90, comment: '' },
  { id: 'g3', date: new Date('2026-03-28').toISOString(), lessonType: 'TEST', score: 48, maxScore: 50, scorePercent: 96, comment: 'Молодец' },
  { id: 'g4', date: new Date('2026-03-21').toISOString(), lessonType: 'PRACTICE', score: 16, maxScore: 20, scorePercent: 80, comment: '' },
  { id: 'g5', date: new Date('2026-03-14').toISOString(), lessonType: 'REGULAR', score: 9, maxScore: 10, scorePercent: 90, comment: '' },
];
