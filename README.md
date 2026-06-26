<div align="center">

<img src="https://img.shields.io/badge/Next.js-16.x-000000?style=for-the-badge&logo=nextdotjs&logoColor=white"/>
<img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
<img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>
<img src="https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white"/>
<img src="https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white"/>

# 🎓 MathCenter Frontend

### Современный веб-интерфейс платформы онлайн-обучения математике

*Интерактивный LMS с дашбордом, управлением курсами, аналитикой и экспортом данных*

[🌐 Живое демо](https://math-lms-next.vercel.app) • [Backend API](https://github.com/SayfullakhonovKomilkhon/Math_lms_nest.js) • [Сообщить об ошибке](https://github.com/SayfullakhonovKomilkhon/Math_lms_next/issues)

</div>

---

## ✨ Возможности

| Функция | Описание |
|---|---|
| 🏠 **Дашборд** | Сводная аналитика с интерактивными графиками (Recharts) |
| 📚 **Управление курсами** | Создание, редактирование и публикация учебного контента |
| 👥 **Управление студентами** | Реестр студентов, прогресс, посещаемость |
| 📊 **Аналитика** | Визуализация данных в реальном времени |
| 📄 **Экспорт** | Скачивание отчётов в PDF (jsPDF) и Excel (xlsx) |
| 🎨 **Анимации** | Плавные переходы через Framer Motion |
| 📱 **Адаптивный дизайн** | Корректное отображение на всех устройствах |
| 🔔 **Уведомления** | Toast-уведомления через Sonner |
| ⚡ **Виртуализация** | Быстрый рендер больших списков через TanStack Virtual |

---

## 🚀 Быстрый старт

### Требования

- Node.js >= 18
- npm / yarn / pnpm
- Запущенный [MathCenter Backend](https://github.com/SayfullakhonovKomilkhon/Math_lms_nest.js)

### Установка

```bash
# 1. Клонируйте репозиторий
git clone https://github.com/SayfullakhonovKomilkhon/Math_lms_next.git
cd Math_lms_next

# 2. Установите зависимости
npm install

# 3. Настройте переменные окружения
cp .env.example .env.local
# Укажите URL вашего API бэкенда
```

### Запуск

```bash
# Режим разработки
npm run dev

# Продакшн сборка
npm run build
npm run start
```

Откройте [http://localhost:3000](http://localhost:3000)

---

## 🛠️ Технологический стек

| Категория | Технология |
|---|---|
| **Фреймворк** | Next.js 16.x (App Router) |
| **UI-библиотека** | React 19 |
| **Язык** | TypeScript 5 |
| **Стили** | Tailwind CSS 4 |
| **Компоненты** | Radix UI (Dialog, Select, Tabs, Toast…) |
| **Состояние** | Zustand |
| **Запросы к API** | TanStack Query v5 + Axios |
| **Формы** | React Hook Form + Zod |
| **Графики** | Recharts |
| **Анимации** | Framer Motion |
| **Экспорт** | jsPDF + xlsx |
| **Дата/время** | date-fns |
| **Деплой** | Vercel |

---

## 🏗️ Структура проекта

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Страницы аутентификации
│   ├── (dashboard)/        # Защищённые страницы
│   │   ├── courses/        # Управление курсами
│   │   ├── students/       # Управление студентами
│   │   ├── analytics/      # Аналитика и отчёты
│   │   └── settings/       # Настройки
│   └── layout.tsx
├── components/
│   ├── ui/                 # Базовые UI-компоненты
│   ├── charts/             # Компоненты графиков
│   └── forms/              # Формы с валидацией
├── lib/
│   ├── api/                # API-клиент (Axios)
│   ├── hooks/              # Кастомные хуки
│   └── utils/              # Утилиты
└── store/                  # Zustand-сторы
```

---

## 🌐 Деплой на Vercel

```bash
# Через Vercel CLI
npm install -g vercel
vercel --prod
```

Или подключите репозиторий напрямую в [vercel.com](https://vercel.com) — деплой произойдёт автоматически при каждом пуше в `main`.

---

## 🔑 Переменные окружения

| Переменная | Описание |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL бэкенд API (NestJS) |
| `NEXT_PUBLIC_APP_URL` | Базовый URL фронтенда |

---

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте ветку: `git checkout -b feature/your-feature`
3. Сделайте коммит: `git commit -m 'feat: add your feature'`
4. Запушьте: `git push origin feature/your-feature`
5. Откройте Pull Request

---

<div align="center">

Часть проекта **MathCenter LMS** · Frontend · Deployed on [Vercel](https://vercel.com)

</div>
