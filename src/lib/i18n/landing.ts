export type Locale = 'ru' | 'uz';

export const LOCALES: Locale[] = ['ru', 'uz'];

export const LOCALE_NAMES: Record<Locale, string> = {
  ru: 'Русский',
  uz: "O'zbekcha",
};

export const LOCALE_HOMES: Record<Locale, string> = {
  ru: '/',
  uz: '/uz',
};

export const landingT = {
  ru: {
    htmlLang: 'ru',
    metaTitle: 'Khanov Math Academy — онлайн академия математики',
    metaDescription:
      'Khanov Math Academy — онлайн академия математики для школьников. Уроки, домашние задания, рейтинги, олимпиадная подготовка и личный прогресс.',
    nav: {
      programs: 'Программы',
      whyUs: 'Почему мы',
      howItWorks: 'Как это работает',
      faq: 'Вопросы',
      login: 'Войти',
    },
    hero: {
      badge: 'Khanov Math Academy',
      title: 'Онлайн академия математики',
      titleAccent: 'Khanov Math',
      subtitle:
        'Учим школьников думать как математик. Уроки, домашние задания, рейтинг и индивидуальный прогресс — всё в одном личном кабинете ученика, родителя и преподавателя.',
      ctaPrimary: 'Войти в кабинет',
      ctaSecondary: 'Узнать о платформе',
      microProof: 'Уже более 500 учеников учатся с нами',
    },
    stats: [
      { value: '500+', label: 'Учеников' },
      { value: '12', label: 'Программ обучения' },
      { value: '20+', label: 'Преподавателей' },
      { value: '95%', label: 'Довольных родителей' },
    ],
    programs: {
      title: 'Программы обучения',
      subtitle:
        'Курсы математики для школьников всех уровней — от арифметики младших классов до олимпиадной подготовки.',
      list: [
        {
          level: '1–4 класс',
          title: 'Младшая школа',
          desc: 'Арифметика, логика и базовые понятия. Учим считать быстро, думать структурно и любить математику.',
        },
        {
          level: '5–9 класс',
          title: 'Средняя школа',
          desc: 'Алгебра, геометрия и подготовка к школьным экзаменам. Закрываем пробелы и формируем уверенность.',
        },
        {
          level: '10–11 класс',
          title: 'Старшая школа',
          desc: 'Углублённая математика и подготовка к поступлению в университеты Узбекистана и зарубежья.',
        },
        {
          level: 'Все классы',
          title: 'Олимпиадная подготовка',
          desc: 'Тренировки для участия в районных, городских и республиканских олимпиадах по математике.',
        },
      ],
    },
    features: {
      title: 'Почему выбирают Khanov Math',
      subtitle:
        'Современный подход к обучению математике — структурно, прозрачно и с реальным прогрессом, который видит и ученик, и родитель.',
      list: [
        {
          title: 'Уроки и материалы',
          desc: 'Структурированные курсы с понятными объяснениями, примерами и теорией от преподавателей с опытом.',
        },
        {
          title: 'Домашние задания',
          desc: 'Преподаватели задают, ученики решают, родители видят прогресс — всё в одном личном кабинете.',
        },
        {
          title: 'Рейтинги и достижения',
          desc: 'Игровая мотивация: очки, рейтинги и достижения помогают учиться регулярно и с интересом.',
        },
        {
          title: 'Личные кабинеты',
          desc: 'Отдельные интерфейсы для учеников, родителей, преподавателей и администраторов.',
        },
        {
          title: 'Олимпиадная подготовка',
          desc: 'Системная программа для тех, кто хочет побеждать на школьных и районных олимпиадах.',
        },
        {
          title: 'Прозрачно для родителей',
          desc: 'Расписание, посещаемость, оценки и оплата ребёнка — в одном удобном месте.',
        },
      ],
    },
    howItWorks: {
      title: 'Как это работает',
      subtitle: 'Три простых шага от знакомства до уверенного знания математики.',
      steps: [
        {
          num: '01',
          title: 'Знакомимся',
          desc: 'Заполните форму или свяжитесь с нами. Проведём короткое тестирование и подберём программу под уровень ребёнка.',
        },
        {
          num: '02',
          title: 'Учимся',
          desc: 'Уроки в группах или индивидуально, регулярные домашние задания и постоянный контроль со стороны преподавателей.',
        },
        {
          num: '03',
          title: 'Видим результат',
          desc: 'Родители следят за прогрессом в личном кабинете, дети растут в рейтинге и получают реальные знания.',
        },
      ],
    },
    faq: {
      title: 'Часто задаваемые вопросы',
      subtitle: 'Если ваш вопрос не нашёлся в списке — напишите нам.',
      items: [
        {
          q: 'Как записать ребёнка в академию?',
          a: 'Свяжитесь с нами по телефону или через форму на сайте. Мы проведём короткое собеседование, определим уровень ребёнка и подберём подходящую программу.',
        },
        {
          q: 'С какого класса можно учиться?',
          a: 'Мы принимаем учеников с 1 по 11 классы. Программа подбирается индивидуально под уровень и цели каждого ребёнка.',
        },
        {
          q: 'Сколько длится одно занятие?',
          a: 'Стандартный урок — 60 минут. Расписание формируется так, чтобы ребёнку было комфортно совмещать с школой.',
        },
        {
          q: 'Можно ли заниматься онлайн?',
          a: 'Да, у нас есть как очные занятия, так и онлайн-формат. В любом случае ученик и родители получают доступ к личному кабинету с прогрессом.',
        },
        {
          q: 'Готовите ли вы к олимпиадам?',
          a: 'Да, у нас есть отдельная программа олимпиадной подготовки — от районного до республиканского уровня.',
        },
        {
          q: 'Как родители контролируют обучение?',
          a: 'У каждого родителя есть свой личный кабинет, где видны посещаемость, оценки, домашние задания и оплата ребёнка.',
        },
      ],
    },
    cta: {
      title: 'Готовы начать?',
      subtitle:
        'Войдите в личный кабинет или свяжитесь с нами для записи на занятия.',
      button: 'Войти в кабинет',
      secondary: 'Связаться с нами',
    },
    footer: {
      tagline:
        'Khanov Math Academy — онлайн академия математики для школьников.',
      navTitle: 'Навигация',
      contactTitle: 'Контакты',
      rights: 'Все права защищены.',
    },
  },
  uz: {
    htmlLang: 'uz',
    metaTitle: 'Khanov Math Academy — onlayn matematika akademiyasi',
    metaDescription:
      "Khanov Math Academy — maktab o'quvchilari uchun onlayn matematika akademiyasi. Darslar, uy vazifalari, reytinglar, olimpiada tayyorgarligi va shaxsiy taraqqiyot.",
    nav: {
      programs: 'Dasturlar',
      whyUs: 'Nima uchun biz',
      howItWorks: 'Qanday ishlaydi',
      faq: 'Savol-javob',
      login: 'Kirish',
    },
    hero: {
      badge: 'Khanov Math Academy',
      title: 'Onlayn matematika akademiyasi',
      titleAccent: 'Khanov Math',
      subtitle:
        "Maktab o'quvchilarini matematik kabi fikrlashga o'rgatamiz. Darslar, uy vazifalari, reytinglar va shaxsiy taraqqiyot — bularning barchasi o'quvchi, ota-ona va o'qituvchining bitta shaxsiy kabinetida.",
      ctaPrimary: 'Kabinetga kirish',
      ctaSecondary: 'Platforma haqida',
      microProof: "500 dan ortiq o'quvchi biz bilan o'qiyapti",
    },
    stats: [
      { value: '500+', label: "O'quvchilar" },
      { value: '12', label: "Ta'lim dasturlari" },
      { value: '20+', label: "O'qituvchilar" },
      { value: '95%', label: 'Mamnun ota-onalar' },
    ],
    programs: {
      title: "Ta'lim dasturlari",
      subtitle:
        "Boshlang'ich sinflarning arifmetikasidan to olimpiada tayyorgarligigacha — barcha bosqichdagi maktab o'quvchilari uchun matematika kurslari.",
      list: [
        {
          level: '1–4 sinf',
          title: "Boshlang'ich sinflar",
          desc: "Arifmetika, mantiq va asosiy tushunchalar. Tez hisoblashga, tuzilgan fikrlashga va matematikani sevishga o'rgatamiz.",
        },
        {
          level: '5–9 sinf',
          title: "O'rta sinflar",
          desc: "Algebra, geometriya va maktab imtihonlariga tayyorgarlik. Bo'shliqlarni to'ldiramiz va ishonch hosil qilamiz.",
        },
        {
          level: '10–11 sinf',
          title: 'Yuqori sinflar',
          desc: "Chuqurlashtirilgan matematika va O'zbekiston hamda xorijiy universitetlariga tayyorgarlik.",
        },
        {
          level: 'Barcha sinflar',
          title: 'Olimpiada tayyorgarligi',
          desc: "Tuman, shahar va respublika matematika olimpiadalariga tayyorgarlik mashg'ulotlari.",
        },
      ],
    },
    features: {
      title: 'Nima uchun Khanov Math?',
      subtitle:
        "Matematikani o'qitishga zamonaviy yondashuv — tuzilgan, shaffof va o'quvchi bilan ota-ona ko'radigan haqiqiy natijalar bilan.",
      list: [
        {
          title: 'Darslar va materiallar',
          desc: "Tushunarli izohlar, misollar va tajribali o'qituvchilarning nazariyasi bilan tuzilgan kurslar.",
        },
        {
          title: 'Uy vazifalari',
          desc: "O'qituvchilar topshiradi, o'quvchilar yechadi, ota-onalar taraqqiyotni ko'radi — barchasi shaxsiy kabinetda.",
        },
        {
          title: 'Reyting va yutuqlar',
          desc: "O'yinli motivatsiya: muntazam o'qish uchun ballar, reytinglar va yutuqlar.",
        },
        {
          title: 'Shaxsiy kabinetlar',
          desc: "O'quvchilar, ota-onalar, o'qituvchilar va administratorlar uchun alohida interfeyslar.",
        },
        {
          title: 'Olimpiada tayyorgarligi',
          desc: "Maktab va tuman olimpiadalarida g'olib bo'lishni xohlovchilar uchun tizimli dastur.",
        },
        {
          title: 'Ota-onalar uchun shaffof',
          desc: "Bola jadvali, davomati, baholari va to'lovi — bitta qulay joyda.",
        },
      ],
    },
    howItWorks: {
      title: 'Bu qanday ishlaydi',
      subtitle:
        "Tanishishdan to ishonchli matematika bilimigacha uch oddiy qadam.",
      steps: [
        {
          num: '01',
          title: 'Tanishamiz',
          desc: "Formani to'ldiring yoki biz bilan bog'laning. Qisqa testdan o'tkazib, bola darajasiga mos dasturni tanlaymiz.",
        },
        {
          num: '02',
          title: "O'qiymiz",
          desc: "Guruhli yoki individual darslar, muntazam uy vazifalari va o'qituvchilar tomonidan doimiy nazorat.",
        },
        {
          num: '03',
          title: "Natijani ko'ramiz",
          desc: "Ota-onalar shaxsiy kabinetda taraqqiyotni kuzatib boradi, bolalar reytingda ko'tariladi va haqiqiy bilimlarga ega bo'ladi.",
        },
      ],
    },
    faq: {
      title: 'Tez-tez beriladigan savollar',
      subtitle: "Agar savolingiz ro'yxatda bo'lmasa — bizga yozing.",
      items: [
        {
          q: "Bolani akademiyaga qanday yozdirsam bo'ladi?",
          a: "Telefon yoki saytdagi forma orqali biz bilan bog'laning. Qisqa suhbat o'tkazib, bola darajasini aniqlab, mos dasturni tanlaymiz.",
        },
        {
          q: "Qaysi sinfdan o'qish mumkin?",
          a: "1 sinfdan 11 sinfgacha o'quvchilarni qabul qilamiz. Dastur har bir bolaning darajasi va maqsadlariga moslab tanlanadi.",
        },
        {
          q: 'Bitta dars qancha davom etadi?',
          a: "Standart dars — 60 daqiqa. Jadval bola maktab bilan birga olib borishi qulay bo'lishi uchun tuziladi.",
        },
        {
          q: "Onlayn o'qish mumkinmi?",
          a: "Ha, bizda ham o'quv markazida, ham onlayn formatda darslar mavjud. Har holatda o'quvchi va ota-onalar shaxsiy kabinetga kirish huquqiga ega bo'ladi.",
        },
        {
          q: 'Olimpiadaga tayyorlaysizmi?',
          a: "Ha, bizda alohida olimpiada tayyorgarlik dasturi mavjud — tumandan respublika darajasigacha.",
        },
        {
          q: "Ota-onalar o'qishni qanday nazorat qiladi?",
          a: "Har bir ota-onaning o'z shaxsiy kabineti bor — u yerda davomat, baholar, uy vazifalari va to'lov ko'rinadi.",
        },
      ],
    },
    cta: {
      title: 'Boshlashga tayyormisiz?',
      subtitle:
        "Shaxsiy kabinetga kiring yoki darslarga yozilish uchun biz bilan bog'laning.",
      button: 'Kabinetga kirish',
      secondary: "Biz bilan bog'lanish",
    },
    footer: {
      tagline:
        "Khanov Math Academy — maktab o'quvchilari uchun onlayn matematika akademiyasi.",
      navTitle: 'Navigatsiya',
      contactTitle: 'Aloqa',
      rights: 'Barcha huquqlar himoyalangan.',
    },
  },
} as const;

export type LandingDict = (typeof landingT)['ru'];
