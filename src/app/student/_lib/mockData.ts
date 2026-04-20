/**
 * Fallback mock data used when the API returns nothing.
 * Uses authentic Uzbek names so the UI looks alive in demo mode.
 */

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
  key: string;
  title: string;
  icon: string;
  description: string;
  condition: string;
  unlocked: boolean;
  unlockedAt?: string;
  accent: 'purple' | 'pink' | 'gold' | 'blue' | 'red';
};

export const mockStudent = {
  id: 'stu_mock_01',
  fullName: 'Диёрбек Усмонов',
  firstName: 'Диёрбек',
  phone: '+998 90 123 45 67',
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
  goldCount: 3,
  silverCount: 2,
  bronzeCount: 1,
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

export const mockMonthGrid: MockAchievement[] = MONTH_NAMES_RU.map((name, i) => {
  const unlocked = [0, 2, 3, 5, 7].includes(i);
  const place: 1 | 2 | 3 | undefined = unlocked
    ? (([1, 2, 1, 3, 2][[0, 2, 3, 5, 7].indexOf(i)] ?? 2) as 1 | 2 | 3)
    : undefined;
  return {
    month: i + 1,
    monthName: name,
    unlocked,
    place,
    title: unlocked
      ? place === 1
        ? 'Лучший месяца'
        : place === 2
          ? 'Серебряный призёр'
          : 'Бронзовый призёр'
      : undefined,
    icon: unlocked ? (place === 1 ? '🥇' : place === 2 ? '🥈' : '🥉') : undefined,
    description: unlocked
      ? `Топ-${place} среди учеников группы по итогам месяца.`
      : undefined,
    year: 2026,
  };
});

export const mockSpecials: MockSpecial[] = [
  {
    key: 'iron_attendance',
    title: 'Железная посещаемость',
    icon: '🔥',
    description: '30 дней подряд без пропусков.',
    condition: 'Посещай все занятия без пропусков 30 дней.',
    unlocked: true,
    unlockedAt: new Date('2026-03-12').toISOString(),
    accent: 'red',
  },
  {
    key: 'perfect_100',
    title: '100 из 100',
    icon: '✨',
    description: 'Получил максимум на контрольной.',
    condition: 'Заработай максимальный балл на контрольной работе.',
    unlocked: true,
    unlockedAt: new Date('2026-02-28').toISOString(),
    accent: 'gold',
  },
  {
    key: 'three_in_a_row',
    title: 'Три месяца подряд',
    icon: '⚡',
    description: 'Топ-3 три месяца подряд.',
    condition: 'Удержись в топ-3 группы три месяца подряд.',
    unlocked: true,
    accent: 'purple',
  },
  {
    key: 'fast_start',
    title: 'На старт!',
    icon: '🚀',
    description: 'Первое выполненное ДЗ.',
    condition: 'Сдай первое домашнее задание вовремя.',
    unlocked: true,
    accent: 'blue',
  },
  {
    key: 'marathon',
    title: 'Марафонец',
    icon: '🏃',
    description: '100 решённых задач.',
    condition: 'Реши 100 задач в системе.',
    unlocked: false,
    accent: 'purple',
  },
  {
    key: 'sharp_mind',
    title: 'Острый ум',
    icon: '🧠',
    description: '5 контрольных на 95%+.',
    condition: 'Напиши пять контрольных на 95% и выше.',
    unlocked: false,
    accent: 'pink',
  },
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

export const mockAnnouncements = [
  {
    id: 'a1',
    title: 'Пробный экзамен в субботу',
    message:
      'В эту субботу пройдёт пробный экзамен по темам февраля. Приходите в 14:00, принесите свою ручку и черновик.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    authorName: 'Фаррух Ибрагимович',
  },
  {
    id: 'a2',
    title: 'Смена кабинета',
    message: 'Со следующей недели занятия проходят в кабинете №205.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    authorName: 'Администрация',
  },
];

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
