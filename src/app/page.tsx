import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Khanov Math Academy — онлайн академия математики',
  description:
    'Khanov Math Academy — онлайн академия математики для школьников. Уроки, домашние задания, рейтинги, подготовка к олимпиадам и поступлению.',
  alternates: { canonical: '/' },
};

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
  'https://khanovmathacademy.uz';

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  '@id': `${SITE_URL}#organization`,
  name: 'Khanov Math Academy',
  alternateName: ['Khanov Math', 'Ханов математика', 'Khanov'],
  url: SITE_URL,
  logo: `${SITE_URL}/icon`,
  description:
    'Онлайн академия математики Khanov Math Academy. Уроки, домашние задания, рейтинги и подготовка к олимпиадам.',
  areaServed: 'UZ',
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}#website`,
  name: 'Khanov Math Academy',
  url: SITE_URL,
  inLanguage: 'ru',
  publisher: { '@id': `${SITE_URL}#organization` },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([organizationJsonLd, websiteJsonLd]),
        }}
      />

      <main className="relative min-h-screen overflow-hidden bg-white text-[#0E1541]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-white via-[#f1f3f7] to-[#e4e7ee]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 -right-32 -z-10 h-[520px] w-[520px] rounded-full bg-[#ABDF00]/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-48 -left-24 -z-10 h-[520px] w-[520px] rounded-full bg-[#0E1541]/10 blur-3xl"
        />

        <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 sm:px-10">
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9">
              <div className="absolute left-0 top-0 h-6 w-6 rounded-[8px] bg-[#ABDF00]" />
              <div className="absolute bottom-0 right-0 h-6 w-6 rounded-[8px] bg-[#4C5E81] mix-blend-multiply" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[20px] font-extrabold tracking-tight">
                khanovMath
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] opacity-50">
                academy
              </span>
            </div>
          </div>

          <Link
            href="/login"
            className="rounded-full border border-[#0E1541]/15 bg-white/80 px-5 py-2 text-sm font-semibold text-[#0E1541] backdrop-blur transition hover:bg-[#0E1541] hover:text-white"
          >
            Войти
          </Link>
        </header>

        <section className="mx-auto flex max-w-6xl flex-col items-start px-6 pb-24 pt-10 sm:px-10 sm:pt-20">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#ABDF00]/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#0E1541]">
            <span className="h-2 w-2 rounded-full bg-[#ABDF00]" />
            Khanov Math Academy
          </span>

          <h1 className="max-w-4xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Онлайн академия математики{' '}
            <span className="bg-gradient-to-r from-[#0E1541] via-[#15236b] to-[#0E1541] bg-clip-text text-transparent">
              Khanov Math
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#0E1541]/75 sm:text-xl">
            Учим школьников думать как математик. Уроки, домашние задания,
            рейтинги и индивидуальный прогресс — всё в одном личном кабинете
            ученика, родителя и преподавателя.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl bg-[#0E1952] px-7 py-4 text-base font-semibold text-white shadow-[0_10px_30px_-10px_rgba(14,25,82,0.5)] transition hover:bg-[#15236b]"
            >
              Войти в кабинет
            </Link>
            <a
              href="#features"
              className="inline-flex items-center justify-center rounded-xl border border-[#0E1541]/15 bg-white px-7 py-4 text-base font-semibold text-[#0E1541] transition hover:border-[#0E1541]/30"
            >
              О платформе
            </a>
          </div>

          <dl
            id="features"
            className="mt-20 grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {[
              {
                title: 'Уроки и материалы',
                desc: 'Структурированные курсы по математике для школьников: от арифметики до олимпиадных задач.',
              },
              {
                title: 'Домашние задания',
                desc: 'Преподаватели задают, ученики решают, родители видят прогресс — всё в одном месте.',
              },
              {
                title: 'Рейтинг и достижения',
                desc: 'Игровая мотивация: очки, рейтинги и достижения помогают учиться регулярно.',
              },
              {
                title: 'Личные кабинеты',
                desc: 'Отдельные интерфейсы для учеников, родителей, преподавателей и администраторов.',
              },
              {
                title: 'Олимпиадная подготовка',
                desc: 'Программа подготовки к школьным и районным олимпиадам по математике.',
              },
              {
                title: 'Прозрачно для родителей',
                desc: 'Родители видят расписание, посещаемость, оценки и оплату обучения ребёнка.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-[#0E1541]/10 bg-white/70 p-6 backdrop-blur transition hover:-translate-y-0.5 hover:border-[#0E1541]/20 hover:shadow-lg"
              >
                <dt className="text-base font-semibold text-[#0E1541]">
                  {f.title}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-[#0E1541]/70">
                  {f.desc}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <footer className="border-t border-[#0E1541]/10 bg-white/60 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-6 py-8 text-sm text-[#0E1541]/60 sm:flex-row sm:items-center sm:px-10">
            <span>
              © {new Date().getFullYear()} Khanov Math Academy. Все права
              защищены.
            </span>
            <Link
              href="/login"
              className="font-semibold text-[#0E1541] hover:underline"
            >
              Войти в кабинет →
            </Link>
          </div>
        </footer>
      </main>
    </>
  );
}
