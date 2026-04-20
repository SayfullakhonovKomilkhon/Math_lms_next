/**
 * Полный каталог ежемесячных и специальных достижений MathCenter.
 * Каждая из 12 месячных тем имеет 6 вариантов (3 места × 2 пола).
 * Специальные достижения — 8 уникальных карточек с тематикой.
 *
 * Темы описаны строковыми CSS значениями, чтобы их можно было подставить
 * прямо в inline-style: `style={{ background: theme.background }}`.
 */

export type Gender = 'male' | 'female';
export type Place = 1 | 2 | 3;
export type AnimationKey =
  | 'snowstorm'       // январь
  | 'salute_roses'    // февраль
  | 'bloom'           // март
  | 'lightning'       // апрель
  | 'fireworks'       // май
  | 'sunburst'        // июнь
  | 'wave'            // июль
  | 'starfall'        // август
  | 'leaffall'        // сентябрь
  | 'magic'           // октябрь
  | 'storm'           // ноябрь
  | 'newyear';        // декабрь

export type CardTheme = {
  background: string;
  borderColor: string;
  borderWidth: number;
  glow: string;
  decor: string[];
  textLight: boolean;
  accent: string;
};

export type MonthlyTitle = {
  title: string;
  icon: string;
  description: string;
  theme: CardTheme;
};

export type MonthEntry = {
  male: MonthlyTitle;
  female: MonthlyTitle;
};

export type MonthMeta = {
  month: number;
  name: string;
  short: string;
  emoji: string;
  animation: AnimationKey;
  titles: Record<Place, MonthEntry>;
};

/* ------------------------------------------------------------------ */
/* Общие пресеты рамок                                                 */
/* ------------------------------------------------------------------ */

const GOLD_BORDER = {
  borderColor: '#D97706',
  borderWidth: 2,
  glow: '0 0 24px rgba(217, 119, 6, 0.55), 0 14px 36px rgba(120, 53, 15, 0.28)',
};
const SILVER_BORDER = {
  borderColor: '#94A3B8',
  borderWidth: 1.5,
  glow: '0 8px 20px rgba(100, 116, 139, 0.2)',
};
const BRONZE_BORDER = {
  borderColor: '#EA8C4A',
  borderWidth: 1,
  glow: '0 6px 16px rgba(234, 140, 74, 0.2)',
};

/* ------------------------------------------------------------------ */
/* Каталог                                                             */
/* ------------------------------------------------------------------ */

export const MONTHS: MonthMeta[] = [
  /* ------------------------- ЯНВАРЬ ------------------------- */
  {
    month: 1,
    name: 'Январь',
    short: 'Янв',
    emoji: '❄️',
    animation: 'snowstorm',
    titles: {
      1: {
        male: {
          title: 'Снежный Властелин',
          icon: '👑',
          description: 'Завоевал январь — группа у твоих ног',
          theme: {
            background: 'linear-gradient(145deg, #0C4A6E 0%, #0EA5E9 100%)',
            ...GOLD_BORDER,
            decor: ['✦', '✧', '❄', '✦'],
            textLight: true,
            accent: '#BAE6FD',
          },
        },
        female: {
          title: 'Снежная Королева',
          icon: '👑',
          description: 'Завоевала январь умом и характером',
          theme: {
            background: 'linear-gradient(145deg, #1E3A5F 0%, #7DD3FC 100%)',
            ...GOLD_BORDER,
            decor: ['✦', '❄', '✧', '✦'],
            textLight: true,
            accent: '#E0F2FE',
          },
        },
      },
      2: {
        male: {
          title: 'Правая рука Властелина',
          icon: '🧊',
          description: 'Совсем рядом с троном — один шаг',
          theme: {
            background: 'linear-gradient(145deg, #E0F2FE 0%, #BAE6FD 100%)',
            ...SILVER_BORDER,
            decor: ['❄'],
            textLight: false,
            accent: '#0369A1',
          },
        },
        female: {
          title: 'Первая фрейлина',
          icon: '❄️',
          description: 'Рядом с троном — почти там',
          theme: {
            background: 'linear-gradient(145deg, #F0F9FF 0%, #DBEAFE 100%)',
            ...SILVER_BORDER,
            decor: ['❄'],
            textLight: false,
            accent: '#0369A1',
          },
        },
      },
      3: {
        male: {
          title: 'Претендент на трон',
          icon: '❄️',
          description: 'Ты уже виден — следующий январь твой',
          theme: {
            background: 'linear-gradient(145deg, #F8FAFC 0%, #E2E8F0 100%)',
            ...BRONZE_BORDER,
            decor: [],
            textLight: false,
            accent: '#475569',
          },
        },
        female: {
          title: 'Претендентка на корону',
          icon: '🌨️',
          description: 'Корона ждёт — следующий январь твой',
          theme: {
            background: 'linear-gradient(145deg, #F8FAFC 0%, #E0E7FF 100%)',
            ...BRONZE_BORDER,
            decor: [],
            textLight: false,
            accent: '#475569',
          },
        },
      },
    },
  },

  /* ------------------------- ФЕВРАЛЬ ------------------------- */
  {
    month: 2,
    name: 'Февраль',
    short: 'Фев',
    emoji: '🎖️',
    animation: 'salute_roses',
    titles: {
      1: {
        male: {
          title: 'Защитник Отечества',
          icon: '🎖️',
          description: '23 февраля — и первое место в классе',
          theme: {
            background: 'linear-gradient(145deg, #14532D 0%, #4D7C0F 100%)',
            ...GOLD_BORDER,
            decor: ['★', '★', '★', '★'],
            textLight: true,
            accent: '#BEF264',
          },
        },
        female: {
          title: 'Весенняя Муза',
          icon: '🌹',
          description: 'Вдохновила всю группу своей победой',
          theme: {
            background: 'linear-gradient(145deg, #9D174D 0%, #EC4899 100%)',
            ...GOLD_BORDER,
            decor: ['🌸', '🌸', '🌸', '🌸'],
            textLight: true,
            accent: '#FBCFE8',
          },
        },
      },
      2: {
        male: {
          title: 'Верный соратник',
          icon: '🛡️',
          description: 'Рядом с героем — тоже почётно',
          theme: {
            background: 'linear-gradient(145deg, #F0FDF4 0%, #DCFCE7 100%)',
            ...SILVER_BORDER,
            decor: ['★'],
            textLight: false,
            accent: '#166534',
          },
        },
        female: {
          title: 'Правая рука Музы',
          icon: '🌸',
          description: 'Почти вдохновила — ещё чуть-чуть',
          theme: {
            background: 'linear-gradient(145deg, #FDF2F8 0%, #FCE7F3 100%)',
            ...SILVER_BORDER,
            decor: ['🌸'],
            textLight: false,
            accent: '#9D174D',
          },
        },
      },
      3: {
        male: {
          title: 'Будущий защитник',
          icon: '⚔️',
          description: 'Ещё немного — и трон твой',
          theme: {
            background: 'linear-gradient(145deg, #F7FEE7 0%, #ECFCCB 100%)',
            ...BRONZE_BORDER,
            decor: [],
            textLight: false,
            accent: '#3F6212',
          },
        },
        female: {
          title: 'Первый бутон',
          icon: '🌷',
          description: 'Ещё не расцвела — но уже в тройке',
          theme: {
            background: 'linear-gradient(145deg, #FFF1F2 0%, #FFE4E6 100%)',
            ...BRONZE_BORDER,
            decor: [],
            textLight: false,
            accent: '#9F1239',
          },
        },
      },
    },
  },

  /* ------------------------- МАРТ ------------------------- */
  {
    month: 3,
    name: 'Март',
    short: 'Мар',
    emoji: '🌸',
    animation: 'bloom',
    titles: {
      1: {
        male: {
          title: 'Весенний Воин',
          icon: '⚔️',
          description: 'Первым ворвался в весну с победой',
          theme: {
            background: 'linear-gradient(145deg, #14532D 0%, #22C55E 100%)',
            ...GOLD_BORDER,
            decor: ['🍃', '🍃', '🍃', '🍃'],
            textLight: true,
            accent: '#BBF7D0',
          },
        },
        female: {
          title: 'Королева весны',
          icon: '👑',
          description: '8 марта — и первое место в классе',
          theme: {
            background: 'linear-gradient(145deg, #9D174D 0%, #86EFAC 100%)',
            ...GOLD_BORDER,
            decor: ['🌸', '🌺', '🌸', '🌺'],
            textLight: true,
            accent: '#FBCFE8',
          },
        },
      },
      2: {
        male: {
          title: 'Второй клинок',
          icon: '🗡️',
          description: 'Рядом с первым — тоже острый',
          theme: {
            background: 'linear-gradient(145deg, #F0FDF4 0%, #DCFCE7 100%)',
            ...SILVER_BORDER,
            decor: ['🍃'],
            textLight: false,
            accent: '#166534',
          },
        },
        female: {
          title: 'Принцесса весны',
          icon: '🌺',
          description: 'Рядом с королевой — почти на троне',
          theme: {
            background: 'linear-gradient(145deg, #FDF2F8 0%, #FCE7F3 100%)',
            ...SILVER_BORDER,
            decor: ['🌸'],
            textLight: false,
            accent: '#9D174D',
          },
        },
      },
      3: {
        male: {
          title: 'Восходящий боец',
          icon: '🌱',
          description: 'Только прорастает — но уже в тройке',
          theme: {
            background: 'linear-gradient(145deg, #F7FEE7 0%, #ECFCCB 100%)',
            ...BRONZE_BORDER,
            decor: [],
            textLight: false,
            accent: '#3F6212',
          },
        },
        female: {
          title: 'Юная наследница',
          icon: '🌱',
          description: 'Трон ждёт — весна только начинается',
          theme: {
            background: 'linear-gradient(145deg, #FFF0F5 0%, #FFE4E6 100%)',
            ...BRONZE_BORDER,
            decor: [],
            textLight: false,
            accent: '#9F1239',
          },
        },
      },
    },
  },

  /* ------------------------- АПРЕЛЬ ------------------------- */
  {
    month: 4,
    name: 'Апрель',
    short: 'Апр',
    emoji: '⚡',
    animation: 'lightning',
    titles: {
      1: {
        male: {
          title: 'Повелитель апреля',
          icon: '⚡',
          description: 'Громче грома, быстрее молнии',
          theme: {
            background: 'linear-gradient(145deg, #1E1B4B 0%, #4F46E5 100%)',
            ...GOLD_BORDER,
            decor: ['⚡', '⚡', '⚡', '⚡'],
            textLight: true,
            accent: '#C7D2FE',
          },
        },
        female: {
          title: 'Властительница апреля',
          icon: '🌈',
          description: 'После дождя — только её радуга побед',
          theme: {
            background: 'linear-gradient(145deg, #1D4ED8 0%, #A855F7 100%)',
            ...GOLD_BORDER,
            decor: ['🌈', '💧', '🌈', '💧'],
            textLight: true,
            accent: '#E9D5FF',
          },
        },
      },
      2: {
        male: {
          title: 'Гром без молнии',
          icon: '🌩️',
          description: 'Мощный — чуть-чуть не долетел',
          theme: {
            background: 'linear-gradient(145deg, #EEF2FF 0%, #DBEAFE 100%)',
            ...SILVER_BORDER,
            decor: ['⚡'],
            textLight: false,
            accent: '#3730A3',
          },
        },
        female: {
          title: 'Хранительница радуги',
          icon: '🌦️',
          description: 'Почти поймала дугу — ещё немного',
          theme: {
            background: 'linear-gradient(145deg, #F5F3FF 0%, #EDE9FE 100%)',
            ...SILVER_BORDER,
            decor: ['🌈'],
            textLight: false,
            accent: '#6D28D9',
          },
        },
      },
      3: {
        male: {
          title: 'Первые капли',
          icon: '🌧️',
          description: 'Буря впереди — апрель запомнит тебя',
          theme: {
            background: 'linear-gradient(145deg, #EFF6FF 0%, #DBEAFE 100%)',
            ...BRONZE_BORDER,
            decor: [],
            textLight: false,
            accent: '#1E40AF',
          },
        },
        female: {
          title: 'После дождя придёт солнце',
          icon: '🌧️',
          description: 'Капли усилий уже видны — апрель запомнит',
          theme: {
            background: 'linear-gradient(145deg, #FAF5FF 0%, #EDE9FE 100%)',
            ...BRONZE_BORDER,
            decor: [],
            textLight: false,
            accent: '#6D28D9',
          },
        },
      },
    },
  },

  /* ------------------------- МАЙ ------------------------- */
  {
    month: 5,
    name: 'Май',
    short: 'Май',
    emoji: '🌟',
    animation: 'fireworks',
    titles: {
      1: {
        male: {
          title: 'Защитник Родины',
          icon: '🪖',
          description: 'Майский праздник — майский трон',
          theme: {
            background: 'linear-gradient(145deg, #14532D 0%, #991B1B 100%)',
            ...GOLD_BORDER,
            decor: ['★', '🎗️', '★', '🎗️'],
            textLight: true,
            accent: '#FECACA',
          },
        },
        female: {
          title: 'Цветок победы',
          icon: '🌺',
          description: 'Расцвела в мае — ярче всех',
          theme: {
            background: 'linear-gradient(145deg, #9D174D 0%, #FDE047 100%)',
            ...GOLD_BORDER,
            decor: ['🌺', '🌷', '🌺', '🌷'],
            textLight: true,
            accent: '#FEF3C7',
          },
        },
      },
      2: {
        male: {
          title: 'Верный солдат',
          icon: '🎗️',
          description: 'Рядом с командиром — надёжный тыл',
          theme: {
            background: 'linear-gradient(145deg, #F0FDF4 0%, #FEE2E2 100%)',
            ...SILVER_BORDER,
            decor: ['🎗️'],
            textLight: false,
            accent: '#166534',
          },
        },
        female: {
          title: 'Второй лепесток',
          icon: '🌻',
          description: 'Почти первый — и тоже красивый',
          theme: {
            background: 'linear-gradient(145deg, #FEFCE8 0%, #FEF3C7 100%)',
            ...SILVER_BORDER,
            decor: ['🌻'],
            textLight: false,
            accent: '#A16207',
          },
        },
      },
      3: {
        male: {
          title: 'Новобранец побед',
          icon: '🌿',
          description: 'Уже в строю — следующий май твой',
          theme: {
            background: 'linear-gradient(145deg, #F7FEE7 0%, #ECFCCB 100%)',
            ...BRONZE_BORDER,
            decor: [],
            textLight: false,
            accent: '#3F6212',
          },
        },
        female: {
          title: 'Росток чемпионки',
          icon: '🌿',
          description: 'Ещё растёт — но уже тянется к солнцу',
          theme: {
            background: 'linear-gradient(145deg, #FFF9C4 0%, #FEF3C7 100%)',
            ...BRONZE_BORDER,
            decor: [],
            textLight: false,
            accent: '#854D0E',
          },
        },
      },
    },
  },

  /* ------------------------- ИЮНЬ ------------------------- */
  {
    month: 6,
    name: 'Июнь',
    short: 'Июн',
    emoji: '☀️',
    animation: 'sunburst',
    titles: {
      1: {
        male: {
          title: 'Солнечный боец',
          icon: '🔥',
          description: 'Ярче всех даже в самый жаркий день',
          theme: {
            background: 'linear-gradient(145deg, #7C2D12 0%, #EA580C 100%)',
            ...GOLD_BORDER,
            decor: ['🔥', '🔥', '🔥', '🔥'],
            textLight: true,
            accent: '#FED7AA',
          },
        },
        female: {
          title: 'Солнечная звезда',
          icon: '✨',
          description: 'Сияет ярче всех в самый жаркий день',
          theme: {
            background: 'linear-gradient(145deg, #92400E 0%, #FDE047 100%)',
            ...GOLD_BORDER,
            decor: ['✨', '⭐', '✨', '⭐'],
            textLight: true,
            accent: '#FEF3C7',
          },
        },
      },
      2: {
        male: {
          title: 'Тень солнца',
          icon: '☀️',
          description: 'Почти такой же горячий — чуть ближе',
          theme: {
            background: 'linear-gradient(145deg, #FFF7ED 0%, #FED7AA 100%)',
            ...SILVER_BORDER,
            decor: ['☀️'],
            textLight: false,
            accent: '#9A3412',
          },
        },
        female: {
          title: 'Вторая звезда',
          icon: '🌟',
          description: 'Почти такая же яркая — почти первая',
          theme: {
            background: 'linear-gradient(145deg, #FEFCE8 0%, #FEF3C7 100%)',
            ...SILVER_BORDER,
            decor: ['✨'],
            textLight: false,
            accent: '#A16207',
          },
        },
      },
      3: {
        male: {
          title: 'Рассвет чемпиона',
          icon: '🌤️',
          description: 'Солнце встаёт — и ты вместе с ним',
          theme: {
            background: 'linear-gradient(145deg, #FFF7ED 0%, #FDBA74 100%)',
            ...BRONZE_BORDER,
            decor: [],
            textLight: false,
            accent: '#9A3412',
          },
        },
        female: {
          title: 'Восходящая звезда',
          icon: '🌤️',
          description: 'Только появляется на небосводе',
          theme: {
            background: 'linear-gradient(145deg, #FEFCE8 0%, #FDE68A 100%)',
            ...BRONZE_BORDER,
            decor: [],
            textLight: false,
            accent: '#854D0E',
          },
        },
      },
    },
  },

  /* ------------------------- ИЮЛЬ ------------------------- */
  {
    month: 7,
    name: 'Июль',
    short: 'Июл',
    emoji: '🏖️',
    animation: 'wave',
    titles: {
      1: {
        male: {
          title: 'Король каникул',
          icon: '👑',
          description: 'Даже летом — сильнее всех',
          theme: {
            background: 'linear-gradient(145deg, #0C4A6E 0%, #0891B2 100%)',
            ...GOLD_BORDER,
            decor: ['〰️', '🐚', '〰️', '🐚'],
            textLight: true,
            accent: '#A5F3FC',
          },
        },
        female: {
          title: 'Принцесса лета',
          icon: '🏝️',
          description: 'Правит летом умом и характером',
          theme: {
            background: 'linear-gradient(145deg, #0369A1 0%, #67E8F9 100%)',
            ...GOLD_BORDER,
            decor: ['🐚', '⭐', '🐚', '⭐'],
            textLight: true,
            accent: '#CFFAFE',
          },
        },
      },
      2: {
        male: {
          title: 'Принц пляжа',
          icon: '🏄',
          description: 'Почти у трона — волна ещё придёт',
          theme: {
            background: 'linear-gradient(145deg, #F0F9FF 0%, #BAE6FD 100%)',
            ...SILVER_BORDER,
            decor: ['〰️'],
            textLight: false,
            accent: '#0369A1',
          },
        },
        female: {
          title: 'Фрейлина принцессы',
          icon: '🐚',
          description: 'Рядом с троном — море тёплое для всех',
          theme: {
            background: 'linear-gradient(145deg, #E0F7FA 0%, #A5F3FC 100%)',
            ...SILVER_BORDER,
            decor: ['🐚'],
            textLight: false,
            accent: '#0E7490',
          },
        },
      },
      3: {
        male: {
          title: 'Искатель трона',
          icon: '🐚',
          description: 'Ищет своё место — и уже нашёл третье',
          theme: {
            background: 'linear-gradient(145deg, #F0F9FF 0%, #DBEAFE 100%)',
            ...BRONZE_BORDER,
            decor: [],
            textLight: false,
            accent: '#0369A1',
          },
        },
        female: {
          title: 'Волна перемен',
          icon: '🌊',
          description: 'Ещё не на берегу — но уже близко',
          theme: {
            background: 'linear-gradient(145deg, #E0F2FE 0%, #BAE6FD 100%)',
            ...BRONZE_BORDER,
            decor: [],
            textLight: false,
            accent: '#075985',
          },
        },
      },
    },
  },

  /* ------------------------- АВГУСТ ------------------------- */
  {
    month: 8,
    name: 'Август',
    short: 'Авг',
    emoji: '🌠',
    animation: 'starfall',
    titles: {
      1: {
        male: {
          title: 'Начало легенды',
          icon: '🌠',
          description: 'Август принадлежит ему',
          theme: {
            background: 'linear-gradient(145deg, #0F0A1E 0%, #1E1B4B 100%)',
            ...GOLD_BORDER,
            decor: ['✦', '✧', '★', '✦'],
            textLight: true,
            accent: '#C7D2FE',
          },
        },
        female: {
          title: 'Рождение легенды',
          icon: '🦋',
          description: 'Август запомнит её имя навсегда',
          theme: {
            background: 'linear-gradient(145deg, #2D1B69 0%, #7C3AED 100%)',
            ...GOLD_BORDER,
            decor: ['🦋', '✨', '🦋', '✨'],
            textLight: true,
            accent: '#E9D5FF',
          },
        },
      },
      2: {
        male: {
          title: 'Второй свет',
          icon: '🌙',
          description: 'Рядом со звездой — тоже светишь',
          theme: {
            background: 'linear-gradient(145deg, #1E1B4B 0%, #312E81 100%)',
            ...SILVER_BORDER,
            decor: ['✦'],
            textLight: true,
            accent: '#C7D2FE',
          },
        },
        female: {
          title: 'Лунный свет',
          icon: '🌙',
          description: 'Рядом с легендой — тоже светит',
          theme: {
            background: 'linear-gradient(145deg, #2E1065 0%, #4C1D95 100%)',
            ...SILVER_BORDER,
            decor: ['✨'],
            textLight: true,
            accent: '#DDD6FE',
          },
        },
      },
      3: {
        male: {
          title: 'Рождение звезды',
          icon: '✨',
          description: 'Маленькая — но уже на небе',
          theme: {
            background: 'linear-gradient(145deg, #312E81 0%, #4338CA 100%)',
            ...BRONZE_BORDER,
            decor: [],
            textLight: true,
            accent: '#E0E7FF',
          },
        },
        female: {
          title: 'Первый блеск',
          icon: '✨',
          description: 'Ещё не звезда — но уже блестит',
          theme: {
            background: 'linear-gradient(145deg, #F5F3FF 0%, #EDE9FE 100%)',
            ...BRONZE_BORDER,
            decor: [],
            textLight: false,
            accent: '#6D28D9',
          },
        },
      },
    },
  },

  /* ------------------------- СЕНТЯБРЬ ------------------------- */
  {
    month: 9,
    name: 'Сентябрь',
    short: 'Сен',
    emoji: '🍂',
    animation: 'leaffall',
    titles: {
      1: {
        male: {
          title: 'Властитель нового года',
          icon: '🏁',
          description: 'Первый день учёбы — первое место',
          theme: {
            background: 'linear-gradient(145deg, #78350F 0%, #D97706 100%)',
            ...GOLD_BORDER,
            decor: ['🍁', '🍂', '🍁', '🍂'],
            textLight: true,
            accent: '#FED7AA',
          },
        },
        female: {
          title: 'Королева нового года',
          icon: '🍁',
          description: 'Первый день учёбы — её победа',
          theme: {
            background: 'linear-gradient(145deg, #9A3412 0%, #FB923C 100%)',
            ...GOLD_BORDER,
            decor: ['🍂', '🍁', '🍂', '🍁'],
            textLight: true,
            accent: '#FFEDD5',
          },
        },
      },
      2: {
        male: {
          title: 'Первый помощник',
          icon: '📐',
          description: 'Рядом с лидером с самого старта',
          theme: {
            background: 'linear-gradient(145deg, #FFF7ED 0%, #FED7AA 100%)',
            ...SILVER_BORDER,
            decor: ['🍁'],
            textLight: false,
            accent: '#9A3412',
          },
        },
        female: {
          title: 'Первая ученица',
          icon: '📚',
          description: 'Рядом с королевой с первого урока',
          theme: {
            background: 'linear-gradient(145deg, #FEF3C7 0%, #FDE68A 100%)',
            ...SILVER_BORDER,
            decor: ['🍂'],
            textLight: false,
            accent: '#854D0E',
          },
        },
      },
      3: {
        male: {
          title: 'Новый претендент',
          icon: '🎒',
          description: 'Учебный год только начался — всё впереди',
          theme: {
            background: 'linear-gradient(145deg, #FFFBEB 0%, #FEF3C7 100%)',
            ...BRONZE_BORDER,
            decor: [],
            textLight: false,
            accent: '#92400E',
          },
        },
        female: {
          title: 'Зерно чемпионки',
          icon: '🌰',
          description: 'Посеяно в сентябре — взойдёт обязательно',
          theme: {
            background: 'linear-gradient(145deg, #FEF3C7 0%, #FDE68A 100%)',
            ...BRONZE_BORDER,
            decor: [],
            textLight: false,
            accent: '#78350F',
          },
        },
      },
    },
  },

  /* ------------------------- ОКТЯБРЬ ------------------------- */
  {
    month: 10,
    name: 'Октябрь',
    short: 'Окт',
    emoji: '🔮',
    animation: 'magic',
    titles: {
      1: {
        male: {
          title: 'Магистр октября',
          icon: '🔮',
          description: 'Магия цифр и формул в его руках',
          theme: {
            background: 'linear-gradient(145deg, #1E1B4B 0%, #6D28D9 100%)',
            ...GOLD_BORDER,
            decor: ['✦', '⬡', '✦', '⬡'],
            textLight: true,
            accent: '#DDD6FE',
          },
        },
        female: {
          title: 'Волшебница октября',
          icon: '🔮',
          description: 'Творит магию из цифр и формул',
          theme: {
            background: 'linear-gradient(145deg, #4A044E 0%, #A21CAF 100%)',
            ...GOLD_BORDER,
            decor: ['✨', '★', '✨', '★'],
            textLight: true,
            accent: '#F5D0FE',
          },
        },
      },
      2: {
        male: {
          title: 'Ученик магистра',
          icon: '🧙',
          description: 'Почти освоил заклинание победы',
          theme: {
            background: 'linear-gradient(145deg, #F5F3FF 0%, #EDE9FE 100%)',
            ...SILVER_BORDER,
            decor: ['✦'],
            textLight: false,
            accent: '#6D28D9',
          },
        },
        female: {
          title: 'Ученица волшебницы',
          icon: '🧿',
          description: 'Почти выучила все заклинания',
          theme: {
            background: 'linear-gradient(145deg, #FAF5FF 0%, #F3E8FF 100%)',
            ...SILVER_BORDER,
            decor: ['✨'],
            textLight: false,
            accent: '#86198F',
          },
        },
      },
      3: {
        male: {
          title: 'Юный маг',
          icon: '🕯️',
          description: 'Огонёк горит — магия приходит',
          theme: {
            background: 'linear-gradient(145deg, #312E81 0%, #4338CA 100%)',
            ...BRONZE_BORDER,
            decor: [],
            textLight: true,
            accent: '#E0E7FF',
          },
        },
        female: {
          title: 'Юная чародейка',
          icon: '🕯️',
          description: 'Огонёк таланта уже горит',
          theme: {
            background: 'linear-gradient(145deg, #FAF5FF 0%, #F3E8FF 100%)',
            ...BRONZE_BORDER,
            decor: [],
            textLight: false,
            accent: '#86198F',
          },
        },
      },
    },
  },

  /* ------------------------- НОЯБРЬ ------------------------- */
  {
    month: 11,
    name: 'Ноябрь',
    short: 'Ноя',
    emoji: '🌧️',
    animation: 'storm',
    titles: {
      1: {
        male: {
          title: 'Непромокаемый мозг',
          icon: '🧠',
          description: 'Дождь из задач — не помеха',
          theme: {
            background: 'linear-gradient(145deg, #1E3A5F 0%, #1E40AF 100%)',
            ...GOLD_BORDER,
            decor: ['💧', '💧', '💧', '💧'],
            textLight: true,
            accent: '#BFDBFE',
          },
        },
        female: {
          title: 'Гроза решений',
          icon: '⛈️',
          description: 'Пока другие мокнут — она побеждает',
          theme: {
            background: 'linear-gradient(145deg, #0F172A 0%, #1D4ED8 100%)',
            ...GOLD_BORDER,
            decor: ['⚡', '💧', '⚡', '💧'],
            textLight: true,
            accent: '#DBEAFE',
          },
        },
      },
      2: {
        male: {
          title: 'Крепкий зонт',
          icon: '☂️',
          description: 'Почти не промок — держится рядом',
          theme: {
            background: 'linear-gradient(145deg, #EFF6FF 0%, #DBEAFE 100%)',
            ...SILVER_BORDER,
            decor: ['☂️'],
            textLight: false,
            accent: '#1E3A8A',
          },
        },
        female: {
          title: 'Укрытие от бури',
          icon: '☂️',
          description: 'Держится рядом с грозой — почти первая',
          theme: {
            background: 'linear-gradient(145deg, #EFF6FF 0%, #DBEAFE 100%)',
            ...SILVER_BORDER,
            decor: ['☂️'],
            textLight: false,
            accent: '#1E3A8A',
          },
        },
      },
      3: {
        male: {
          title: 'Капля упорства',
          icon: '💧',
          description: 'Капля за каплей — станет океаном',
          theme: {
            background: 'linear-gradient(145deg, #F0F9FF 0%, #E0F2FE 100%)',
            ...BRONZE_BORDER,
            decor: [],
            textLight: false,
            accent: '#075985',
          },
        },
        female: {
          title: 'Первая капля бури',
          icon: '💧',
          description: 'Маленькая — но уже часть грозы',
          theme: {
            background: 'linear-gradient(145deg, #EFF6FF 0%, #DBEAFE 100%)',
            ...BRONZE_BORDER,
            decor: [],
            textLight: false,
            accent: '#1E40AF',
          },
        },
      },
    },
  },

  /* ------------------------- ДЕКАБРЬ ------------------------- */
  {
    month: 12,
    name: 'Декабрь',
    short: 'Дек',
    emoji: '🎄',
    animation: 'newyear',
    titles: {
      1: {
        male: {
          title: 'Математический Дед Мороз',
          icon: '🎅',
          description: 'Подарил всем результат под ёлку',
          theme: {
            background: 'linear-gradient(145deg, #7F1D1D 0%, #DC2626 100%)',
            ...GOLD_BORDER,
            decor: ['❄', '★', '❄', '★'],
            textLight: true,
            accent: '#FECACA',
          },
        },
        female: {
          title: 'Снегурочка центра',
          icon: '🎀',
          description: 'Завершила год с подарком — первым местом',
          theme: {
            background: 'linear-gradient(145deg, #0F4C75 0%, #60A5FA 100%)',
            ...GOLD_BORDER,
            decor: ['❄', '✨', '❄', '✨'],
            textLight: true,
            accent: '#DBEAFE',
          },
        },
      },
      2: {
        male: {
          title: 'Верный олень',
          icon: '🦌',
          description: 'Возил подарки — почти добрался первым',
          theme: {
            background: 'linear-gradient(145deg, #FEF2F2 0%, #FEE2E2 100%)',
            ...SILVER_BORDER,
            decor: ['❄'],
            textLight: false,
            accent: '#991B1B',
          },
        },
        female: {
          title: 'Серебряный бубенец',
          icon: '🔔',
          description: 'Звенит рядом — почти такая же звонкая',
          theme: {
            background: 'linear-gradient(145deg, #F0F9FF 0%, #DBEAFE 100%)',
            ...SILVER_BORDER,
            decor: ['🔔'],
            textLight: false,
            accent: '#1E40AF',
          },
        },
      },
      3: {
        male: {
          title: 'Подарок под ёлкой',
          icon: '🎁',
          description: 'Ещё не открыли — но уже в тройке лучших',
          theme: {
            background: 'linear-gradient(145deg, #F0FDF4 0%, #DCFCE7 100%)',
            ...BRONZE_BORDER,
            decor: [],
            textLight: false,
            accent: '#166534',
          },
        },
        female: {
          title: 'Новогодняя надежда',
          icon: '🎁',
          description: 'Ещё не открыли — но уже под ёлкой',
          theme: {
            background: 'linear-gradient(145deg, #EFF6FF 0%, #DBEAFE 100%)',
            ...BRONZE_BORDER,
            decor: [],
            textLight: false,
            accent: '#1E40AF',
          },
        },
      },
    },
  },
];

/* ------------------------------------------------------------------ */
/* Специальные достижения                                              */
/* ------------------------------------------------------------------ */

export type SpecialKey =
  | 'iron_attendance'
  | 'perfect_100'
  | 'first_step'
  | 'three_months'
  | 'year_legend'
  | 'quiet_hero'
  | 'no_miss';

export type SpecialTheme = CardTheme & {
  label: string;
};

export type SpecialDef = {
  key: SpecialKey;
  title: string;
  titleFemale?: string;
  icon: string;
  description: string;
  descriptionFemale?: string;
  condition: string;
  theme: SpecialTheme;
};

export const SPECIALS: SpecialDef[] = [
  {
    key: 'iron_attendance',
    title: 'Железная посещаемость',
    icon: '🧲',
    description: 'Не пропустил ни одного урока за месяц',
    descriptionFemale: 'Не пропустила ни одного урока за месяц',
    condition: '0 пропусков за месяц',
    theme: {
      background: 'linear-gradient(145deg, #1E3A5F 0%, #3B82F6 100%)',
      borderColor: '#64748B',
      borderWidth: 2,
      glow: '0 0 24px rgba(59, 130, 246, 0.45), 0 14px 30px rgba(30, 58, 95, 0.3)',
      decor: ['🧲', '⚙'],
      textLight: true,
      accent: '#DBEAFE',
      label: 'Железная дисциплина',
    },
  },
  {
    key: 'perfect_100',
    title: '100 из 100',
    icon: '💯',
    description: 'Получил максимальный балл на работе',
    descriptionFemale: 'Получила максимальный балл на работе',
    condition: 'Максимальный балл на практической работе',
    theme: {
      background: 'linear-gradient(145deg, #14532D 0%, #22C55E 100%)',
      borderColor: '#166534',
      borderWidth: 2,
      glow: '0 0 24px rgba(34, 197, 94, 0.45), 0 14px 30px rgba(20, 83, 45, 0.28)',
      decor: ['💯', '✓'],
      textLight: true,
      accent: '#BBF7D0',
      label: 'Идеальный результат',
    },
  },
  {
    key: 'first_step',
    title: 'На старт!',
    icon: '🎯',
    description: 'Первые шаги в мире побед',
    condition: 'Первое достижение в системе',
    theme: {
      background: 'linear-gradient(145deg, #7C3AED 0%, #A78BFA 100%)',
      borderColor: '#7C3AED',
      borderWidth: 2,
      glow: '0 0 24px rgba(167, 139, 250, 0.5), 0 14px 28px rgba(91, 33, 182, 0.28)',
      decor: ['🎯', '✦'],
      textLight: true,
      accent: '#DDD6FE',
      label: 'Начало пути',
    },
  },
  {
    key: 'three_months',
    title: 'Три месяца подряд',
    icon: '🔥',
    description: 'В тройке лучших три месяца без остановки',
    condition: '3 месяца подряд в топ-3 без перерыва',
    theme: {
      background: 'linear-gradient(145deg, #7C2D12 0%, #F97316 100%)',
      borderColor: '#EA580C',
      borderWidth: 2,
      glow: '0 0 28px rgba(249, 115, 22, 0.55), 0 14px 30px rgba(124, 45, 18, 0.32)',
      decor: ['🔥', '🔥', '🔥'],
      textLight: true,
      accent: '#FED7AA',
      label: 'Огненная серия',
    },
  },
  {
    key: 'year_legend',
    title: 'Легенда года',
    titleFemale: 'Звезда года',
    icon: '🌠',
    description: 'Был лучшим в группе за год',
    descriptionFemale: 'Была лучшей в группе за год',
    condition: 'Хотя бы раз топ-1 за учебный год',
    theme: {
      background: 'linear-gradient(145deg, #0F0A1E 0%, #4F46E5 100%)',
      borderColor: '#D97706',
      borderWidth: 2,
      glow: '0 0 30px rgba(217, 119, 6, 0.55), 0 0 60px rgba(79, 70, 229, 0.35)',
      decor: ['✦', '★', '✦', '★'],
      textLight: true,
      accent: '#FEF3C7',
      label: 'Звёздное достижение',
    },
  },
  {
    key: 'quiet_hero',
    title: 'Тихий герой',
    titleFemale: 'Тихая героиня',
    icon: '📈',
    description: 'Улучшил результат на 30%+ за месяц',
    descriptionFemale: 'Улучшила результат на 30%+ за месяц',
    condition: 'Рост результатов на 30%+ за месяц',
    theme: {
      background: 'linear-gradient(145deg, #064E3B 0%, #10B981 100%)',
      borderColor: '#059669',
      borderWidth: 2,
      glow: '0 0 24px rgba(16, 185, 129, 0.45), 0 14px 28px rgba(6, 78, 59, 0.28)',
      decor: ['📈', '↑'],
      textLight: true,
      accent: '#A7F3D0',
      label: 'Взрывной рост',
    },
  },
  {
    key: 'no_miss',
    title: 'Без единого пропуска',
    icon: '🏅',
    description: 'Ни одного пропуска за весь учебный год',
    condition: '0 пропусков за весь учебный год',
    theme: {
      background: 'linear-gradient(145deg, #1C1917 0%, #D97706 100%)',
      borderColor: '#D97706',
      borderWidth: 2,
      glow:
        '0 0 0 2px #D97706, 0 0 0 4px #FDE047, 0 0 30px rgba(253, 224, 71, 0.55), 0 16px 34px rgba(28, 25, 23, 0.4)',
      decor: ['🏅', '★', '★', '★'],
      textLight: true,
      accent: '#FEF3C7',
      label: 'Редчайшая награда',
    },
  },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export function getMonth(month: number): MonthMeta {
  return MONTHS[Math.max(0, Math.min(11, month - 1))];
}

export function getMonthlyTitle(
  month: number,
  place: Place,
  gender: Gender,
): MonthlyTitle {
  return getMonth(month).titles[place][gender];
}

export function getSpecial(key: SpecialKey): SpecialDef | undefined {
  return SPECIALS.find((s) => s.key === key);
}

export function placeMedal(place: Place): string {
  return place === 1 ? '🥇' : place === 2 ? '🥈' : '🥉';
}

export function placeLabel(place: Place): string {
  return place === 1 ? '1-е место' : place === 2 ? '2-е место' : '3-е место';
}
