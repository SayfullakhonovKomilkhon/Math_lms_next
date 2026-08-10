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
    metaTitle: 'Khanov Math Academy — учебный центр математики',
    metaDescription:
      'Khanov Math Academy — учебный центр математики. Подготовка к поступлению в лицеи и международные университеты, к Milliy сертификату и IQ-экзаменам.',
    nav: {
      programs: 'Программы',
      whyUs: 'Почему мы',
      howItWorks: 'Как это работает',
      faq: 'Вопросы',
      login: 'Войти',
    },
    hero: {
      badge: 'Khanov Math Academy',
      title: 'Учебный центр математики',
      titleAccent: 'Khanov Math',
      subtitle:
        'Готовим школьников к поступлению в ведущие лицеи, в том числе Westminster и International House, международные университеты, а также к Milliy sertifikat и IQ-экзаменам. Системная программа, сильная математика и результат на каждом этапе.',
      ctaPrimary: 'Оставить заявку',
      ctaSecondary: 'Узнать о платформе',
    },
    programs: {
      title: 'Программы обучения',
      subtitle:
        'Целевая подготовка к поступлению, международным экзаменам и сертификации.',
      list: [
        {
          level: 'Лицеи',
          title: 'Подготовка к топовым лицеям',
          desc: 'Системная подготовка к вступительным экзаменам в ведущие лицеи, в том числе Westminster и International House.',
        },
        {
          level: 'Университеты',
          title: 'Международные университеты',
          desc: 'Углублённая математика и экзаменационная подготовка для поступления в ведущие международные университеты.',
        },
        {
          level: 'Milliy sertifikat',
          title: 'Подготовка к Milliy сертификату',
          desc: 'Изучаем все разделы математики, разбираем формат экзамена и работаем над скоростью и точностью.',
        },
        {
          level: 'IQ',
          title: 'Подготовка к IQ-экзаменам',
          desc: 'Развиваем логику, аналитическое мышление и навыки решения задач для успешной сдачи IQ-экзаменов.',
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
          a: 'Мы принимаем учеников с 8 класса. Программа подбирается индивидуально под уровень и цели каждого ребёнка.',
        },
        {
          q: 'Сколько длится одно занятие?',
          a: 'Стандартный урок — 90 минут. Расписание формируется так, чтобы ребёнку было комфортно совмещать со школой.',
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
        'Оставьте заявку, и мы свяжемся с вами, чтобы подобрать подходящую программу.',
      button: 'Оставить заявку',
      secondary: 'Связаться с нами',
    },
    applicationForm: {
      title: 'Оставить заявку',
      subtitle: 'Заполните форму — мы свяжемся с вами и ответим на вопросы.',
      name: 'Имя',
      namePlaceholder: 'Ваше имя',
      phone: 'Номер телефона',
      phonePlaceholder: '+998 90 123 45 67',
      age: 'Возраст ребёнка',
      agePlaceholder: 'Например, 14',
      submit: 'Отправить заявку',
      submitting: 'Отправляем…',
      successTitle: 'Заявка принята',
      successText: 'Спасибо! Мы свяжемся с вами в ближайшее время.',
      close: 'Закрыть',
      requiredError: 'Заполните все поля корректно.',
      submitError: 'Не удалось отправить заявку. Позвоните нам или попробуйте ещё раз.',
    },
    footer: {
      tagline:
        'Khanov Math Academy — учебный центр математики.',
      navTitle: 'Навигация',
      contactTitle: 'Контакты',
      rights: 'Все права защищены.',
    },
  },
  uz: {
    htmlLang: 'uz',
    metaTitle: "Khanov Math Academy — matematika o'quv markazi",
    metaDescription:
      "Khanov Math Academy — matematika o'quv markazi. Litseylar va xalqaro universitetlarga kirish, Milliy sertifikat va IQ imtihonlariga tayyorgarlik.",
    nav: {
      programs: 'Dasturlar',
      whyUs: 'Nima uchun biz',
      howItWorks: 'Qanday ishlaydi',
      faq: 'Savol-javob',
      login: 'Kirish',
    },
    hero: {
      badge: 'Khanov Math Academy',
      title: "Matematika o'quv markazi",
      titleAccent: 'Khanov Math',
      subtitle:
        "O'quvchilarni yetakchi litseylarga, jumladan Westminster va International House, xalqaro universitetlarga, shuningdek, Milliy sertifikat va IQ imtihonlariga tayyorlaymiz. Tizimli dastur, kuchli matematika va har bir bosqichda aniq natija.",
      ctaPrimary: 'Ariza qoldirish',
      ctaSecondary: 'Platforma haqida',
    },
    programs: {
      title: "Ta'lim dasturlari",
      subtitle:
        "O'qishga kirish, xalqaro imtihonlar va sertifikatlash uchun maqsadli tayyorgarlik.",
      list: [
        {
          level: 'Litseylar',
          title: 'Yetakchi litseylarga tayyorgarlik',
          desc: 'Yetakchi litseylar, jumladan Westminster va International House kirish imtihonlariga tizimli tayyorgarlik.',
        },
        {
          level: 'Universitetlar',
          title: 'Xalqaro universitetlar',
          desc: "Yetakchi xalqaro universitetlarga kirish uchun chuqurlashtirilgan matematika va imtihonlarga tayyorgarlik.",
        },
        {
          level: 'Milliy sertifikat',
          title: 'Milliy sertifikatga tayyorgarlik',
          desc: "Matematikaning barcha bo'limlarini o'rganamiz, imtihon formatini tahlil qilamiz hamda tezlik va aniqlik ustida ishlaymiz.",
        },
        {
          level: 'IQ',
          title: 'IQ imtihonlariga tayyorgarlik',
          desc: "IQ imtihonlarini muvaffaqiyatli topshirish uchun mantiq, tahliliy fikrlash va masala yechish ko'nikmalarini rivojlantiramiz.",
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
          a: "8-sinfdan boshlab o'quvchilarni qabul qilamiz. Dastur har bir bolaning darajasi va maqsadlariga moslab tanlanadi.",
        },
        {
          q: 'Bitta dars qancha davom etadi?',
          a: "Standart dars — 90 daqiqa. Jadval bola maktab bilan birga olib borishi qulay bo'lishi uchun tuziladi.",
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
        "Ariza qoldiring — siz bilan bog'lanib, mos dasturni tanlashga yordam beramiz.",
      button: 'Ariza qoldirish',
      secondary: "Biz bilan bog'lanish",
    },
    applicationForm: {
      title: 'Ariza qoldirish',
      subtitle: "Formani to'ldiring — siz bilan bog'lanib, savollaringizga javob beramiz.",
      name: 'Ism',
      namePlaceholder: 'Ismingiz',
      phone: 'Telefon raqami',
      phonePlaceholder: '+998 90 123 45 67',
      age: 'Bolaning yoshi',
      agePlaceholder: 'Masalan, 14',
      submit: 'Arizani yuborish',
      submitting: 'Yuborilmoqda…',
      successTitle: 'Ariza qabul qilindi',
      successText: "Rahmat! Tez orada siz bilan bog'lanamiz.",
      close: 'Yopish',
      requiredError: "Barcha maydonlarni to'g'ri to'ldiring.",
      submitError: "Arizani yuborib bo'lmadi. Bizga qo'ng'iroq qiling yoki qayta urinib ko'ring.",
    },
    footer: {
      tagline:
        "Khanov Math Academy — matematika o'quv markazi.",
      navTitle: 'Navigatsiya',
      contactTitle: 'Aloqa',
      rights: 'Barcha huquqlar himoyalangan.',
    },
  },
} as const;

export type LandingDict = (typeof landingT)['ru'];
