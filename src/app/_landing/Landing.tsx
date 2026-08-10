import Link from 'next/link';
import {
  BookOpen,
  Trophy,
  Users,
  Sparkles,
  Target,
  ShieldCheck,
  GraduationCap,
  Brain,
  Award,
  Phone,
  MapPin,
  Check,
} from 'lucide-react';
import {
  landingT,
  type Locale,
  LOCALE_NAMES,
  LOCALE_HOMES,
} from '@/lib/i18n/landing';
import { Faq } from './Faq';
import { ApplicationFormModal } from './ApplicationFormModal';
import { BrandLogo } from '@/components/branding/BrandLogo';

// Real contacts — single source of truth for the whole landing page.
export const CONTACTS = {
  phone: '+998 94 326 52 25',
  phoneHref: 'tel:+998943265225',
  instagram: 'https://www.instagram.com/khanov_math_academy/',
  telegram: 'https://t.me/SkhanovMathAcademy',
  yandexMaps: 'https://yandex.uz/maps/-/CPG-NZYg',
  addressRu: 'Ташкент, ул. Шахрисабз, 5А',
  addressUz: "Toshkent, Shahrisabz ko'chasi, 5A",
  addressShortRu: 'Ташкент, Мирабадский район',
  addressShortUz: 'Toshkent, Mirobod tumani',
} as const;

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M21.198 2.433a2.242 2.242 0 0 0-1.022.215l-16.5 7.5a2.25 2.25 0 0 0 .126 4.073l3.928 1.310 1.853 5.557a1.5 1.5 0 0 0 2.585.43l2.244-2.532 4.328 3.193a2.25 2.25 0 0 0 3.51-1.262l3.5-15.5a2.25 2.25 0 0 0-2.552-2.984Z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

const FEATURE_ICONS = [
  BookOpen,
  Target,
  Trophy,
  Users,
  ShieldCheck,
];

const PROGRAM_ICONS = [GraduationCap, BookOpen, Award, Brain];

export function Landing({ locale }: { locale: Locale }) {
  const t = landingT[locale];
  const otherLocale: Locale = locale === 'ru' ? 'uz' : 'ru';

  return (
    <main className="relative overflow-hidden bg-white text-[#0E1541]">
      {/* Decorative background blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[900px] bg-gradient-to-b from-[#f6f8fc] via-white to-white"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-32 -z-10 h-[520px] w-[520px] rounded-full bg-[#ABDF00]/25 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-[600px] -left-40 -z-10 h-[520px] w-[520px] rounded-full bg-[#0E1541]/10 blur-3xl"
      />

      {/* ============ Header ============ */}
      <header className="sticky top-0 z-40 border-b border-transparent bg-white/70 backdrop-blur-md transition-colors">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-8">
          <Link
            href={LOCALE_HOMES[locale]}
            className="flex items-center gap-3"
            aria-label="Khanov Math Academy"
          >
            <BrandLogo className="h-11 w-11 rounded-xl shadow-sm" priority />
            <div className="flex flex-col leading-none">
              <span className="font-brand text-[20px] font-extrabold tracking-[-0.055em]">
                KhanovMath
              </span>
              <span className="font-brand text-[9px] font-bold uppercase tracking-[0.32em] opacity-55">
                academy
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-[#0E1541]/70 lg:flex">
            <a href="#programs" className="transition hover:text-[#0E1541]">
              {t.nav.programs}
            </a>
            <a href="#features" className="transition hover:text-[#0E1541]">
              {t.nav.whyUs}
            </a>
            <a href="#how" className="transition hover:text-[#0E1541]">
              {t.nav.howItWorks}
            </a>
            <a href="#faq" className="transition hover:text-[#0E1541]">
              {t.nav.faq}
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={CONTACTS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hidden h-9 w-9 items-center justify-center rounded-full border border-[#0E1541]/10 bg-white text-[#0E1541]/70 transition hover:border-[#0E1541]/25 hover:text-[#0E1541] sm:inline-flex"
            >
              <InstagramIcon className="h-4 w-4" />
            </a>
            <a
              href={CONTACTS.telegram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
              className="hidden h-9 w-9 items-center justify-center rounded-full border border-[#0E1541]/10 bg-white text-[#0E1541]/70 transition hover:border-[#0E1541]/25 hover:text-[#0E1541] sm:inline-flex"
            >
              <TelegramIcon className="h-4 w-4" />
            </a>
            <Link
              href={LOCALE_HOMES[otherLocale]}
              className="hidden rounded-full border border-[#0E1541]/15 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#0E1541] transition hover:border-[#0E1541]/30 sm:inline-flex"
              aria-label={`Switch to ${LOCALE_NAMES[otherLocale]}`}
            >
              {LOCALE_NAMES[otherLocale]}
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-[#0E1952] px-5 py-2 text-sm font-semibold text-white shadow-[0_6px_20px_-8px_rgba(14,25,82,0.5)] transition hover:bg-[#15236b]"
            >
              {t.nav.login}
            </Link>
          </div>
        </div>
      </header>

      {/* ============ Hero ============ */}
      <section className="relative">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 pb-20 pt-16 sm:px-8 sm:pt-24 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:pt-28">
          <div>
            <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#ABDF00]/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#0E1541]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#ABDF00]" />
              {t.hero.badge}
            </span>

            <h1 className="text-[40px] font-extrabold leading-[1.05] tracking-tight sm:text-[56px] lg:text-[64px]">
              {t.hero.title}{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-[#0E1541] via-[#15236b] to-[#0E1541] bg-clip-text text-transparent">
                  {t.hero.titleAccent}
                </span>
                <span
                  aria-hidden
                  className="absolute -bottom-1 left-0 h-2 w-full rounded-full bg-[#ABDF00]/60"
                />
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#0E1541]/75 sm:text-xl">
              {t.hero.subtitle}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <ApplicationFormModal locale={locale} variant="hero" />
              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-xl border border-[#0E1541]/15 bg-white px-7 py-4 text-base font-semibold text-[#0E1541] transition hover:border-[#0E1541]/30"
              >
                {t.hero.ctaSecondary}
              </a>
            </div>

          </div>

          {/* Hero visual */}
          <div className="relative hidden lg:block">
            <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-[#f3f5fa] via-white to-[#eef2f9]" />
            <div className="absolute inset-0 rounded-[32px] border border-[#0E1541]/5" />

            {/* Floating stat card */}
            <div className="absolute left-6 top-10 w-[230px] rounded-2xl border border-[#0E1541]/10 bg-white/95 p-5 shadow-[0_30px_60px_-30px_rgba(14,21,65,0.35)] backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ABDF00]/20 text-[#0E1541]">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-[#0E1541]">
                    +28%
                  </div>
                  <div className="text-xs text-[#0E1541]/60">
                    {locale === 'ru' ? 'рост за месяц' : 'oylik o\'sish'}
                  </div>
                </div>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#0E1541]/10">
                <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-[#ABDF00] to-[#0E1541]" />
              </div>
            </div>

            {/* Big formula card */}
            <div className="absolute right-8 top-32 w-[280px] rotate-[-3deg] rounded-2xl border border-[#0E1541]/10 bg-[#0E1952] p-6 text-white shadow-[0_30px_60px_-30px_rgba(14,21,65,0.5)]">
              <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#ABDF00]">
                <Sparkles className="h-3 w-3" />
                {locale === 'ru' ? 'Формула дня' : 'Kunlik formula'}
              </div>
              <div className="font-mono text-2xl tracking-wider">
                e<sup>iπ</sup> + 1 = 0
              </div>
              <div className="mt-3 text-xs text-white/60">
                {locale === 'ru'
                  ? 'Тождество Эйлера'
                  : "Eyler tengligi"}
              </div>
            </div>

            {/* Bottom progress card */}
            <div className="absolute bottom-10 left-12 w-[260px] rounded-2xl border border-[#0E1541]/10 bg-white p-5 shadow-[0_30px_60px_-30px_rgba(14,21,65,0.35)]">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#0E1541]/50">
                  {locale === 'ru' ? 'Прогресс' : 'Taraqqiyot'}
                </span>
                <span className="text-xs font-bold text-[#ABDF00]">85%</span>
              </div>
              <div className="space-y-2">
                {[
                  locale === 'ru' ? 'Алгебра' : 'Algebra',
                  locale === 'ru' ? 'Геометрия' : 'Geometriya',
                  locale === 'ru' ? 'IQ и логика' : 'IQ va mantiq',
                ].map((label, i) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#ABDF00]/20">
                      <Check className="h-3 w-3 text-[#0E1541]" />
                    </div>
                    <div className="flex-1 text-xs font-medium text-[#0E1541]">
                      {label}
                    </div>
                    <div className="text-[10px] text-[#0E1541]/50">
                      {[92, 78, 85][i]}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Background math symbols */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[32px]">
              <span className="absolute right-12 top-6 text-7xl font-bold text-[#0E1541]/5">
                ∑
              </span>
              <span className="absolute bottom-32 right-32 text-6xl font-bold text-[#0E1541]/5">
                π
              </span>
              <span className="absolute bottom-6 right-10 text-8xl font-bold text-[#ABDF00]/15">
                ∞
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ Programs ============ */}
      <section id="programs" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <SectionHeader
            eyebrow={locale === 'ru' ? 'Программы' : 'Dasturlar'}
            title={t.programs.title}
            subtitle={t.programs.subtitle}
          />

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {t.programs.list.map((p, i) => {
              const Icon = PROGRAM_ICONS[i] ?? BookOpen;
              return (
                <div
                  key={p.title}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#0E1541]/10 bg-white p-6 transition hover:-translate-y-1 hover:border-[#0E1541]/20 hover:shadow-[0_20px_50px_-20px_rgba(14,21,65,0.25)]"
                >
                  <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#ABDF00]/10 transition-transform group-hover:scale-150" />
                  <div className="relative">
                    <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#0E1541] text-white">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="mb-3 inline-block rounded-full bg-[#0E1541]/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#0E1541]/70">
                      {p.level}
                    </span>
                    <h3 className="text-xl font-bold text-[#0E1541]">
                      {p.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-[#0E1541]/65">
                      {p.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ Features ============ */}
      <section
        id="features"
        className="relative bg-gradient-to-b from-[#fafbfd] to-white py-24 sm:py-32"
      >
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <SectionHeader
            eyebrow={locale === 'ru' ? 'Преимущества' : 'Afzalliklar'}
            title={t.features.title}
            subtitle={t.features.subtitle}
          />

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {t.features.list.map((f, i) => {
              const Icon = FEATURE_ICONS[i] ?? Sparkles;
              return (
                <div
                  key={f.title}
                  className="group rounded-2xl border border-[#0E1541]/10 bg-white p-7 transition hover:-translate-y-0.5 hover:border-[#0E1541]/20 hover:shadow-lg"
                >
                  <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#ABDF00]/30 to-[#ABDF00]/10 text-[#0E1541] transition group-hover:from-[#ABDF00]/50 group-hover:to-[#ABDF00]/20">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0E1541]">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#0E1541]/65">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ How it works ============ */}
      <section id="how" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <SectionHeader
            eyebrow={locale === 'ru' ? 'Процесс' : 'Jarayon'}
            title={t.howItWorks.title}
            subtitle={t.howItWorks.subtitle}
          />

          <div className="relative mt-14">
            <div
              aria-hidden
              className="absolute left-12 top-12 hidden h-[2px] w-[calc(100%-6rem)] bg-gradient-to-r from-[#ABDF00] via-[#0E1541] to-transparent lg:block"
            />
            <div className="grid gap-6 lg:grid-cols-3">
              {t.howItWorks.steps.map((step) => (
                <div
                  key={step.num}
                  className="relative rounded-2xl border border-[#0E1541]/10 bg-white p-7"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0E1541] text-xl font-extrabold text-[#ABDF00]">
                    {step.num}
                  </div>
                  <h3 className="text-xl font-bold text-[#0E1541]">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#0E1541]/65">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section
        id="faq"
        className="relative bg-gradient-to-b from-white to-[#fafbfd] py-24 sm:py-32"
      >
        <div className="mx-auto max-w-3xl px-6 sm:px-8">
          <SectionHeader
            eyebrow={locale === 'ru' ? 'Вопросы' : 'Savollar'}
            title={t.faq.title}
            subtitle={t.faq.subtitle}
            align="center"
          />

          <div className="mt-12">
            <Faq items={t.faq.items} />
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="relative py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="relative overflow-hidden rounded-[32px] bg-[#0E1952] px-8 py-16 text-center shadow-[0_40px_100px_-40px_rgba(14,21,65,0.5)] sm:px-16 sm:py-20">
            <div
              aria-hidden
              className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#ABDF00]/30 blur-3xl"
            />
            <div
              aria-hidden
              className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-[#ABDF00]/10 blur-3xl"
            />
            <div className="relative">
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                {t.cta.title}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">
                {t.cta.subtitle}
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <ApplicationFormModal locale={locale} />
                <a
                  href={CONTACTS.phoneHref}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur transition hover:bg-white/10"
                >
                  <Phone className="h-4 w-4" />
                  {CONTACTS.phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ Footer ============ */}
      <footer className="border-t border-[#0E1541]/10 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr_1fr]">
            <div>
              <Link
                href={LOCALE_HOMES[locale]}
                className="flex items-center gap-3"
              >
                <BrandLogo className="h-11 w-11 rounded-xl shadow-sm" />
                <div className="flex flex-col leading-none">
                  <span className="font-brand text-[20px] font-extrabold tracking-[-0.055em]">
                    KhanovMath
                  </span>
                  <span className="font-brand text-[9px] font-bold uppercase tracking-[0.32em] opacity-55">
                    academy
                  </span>
                </div>
              </Link>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-[#0E1541]/60">
                {t.footer.tagline}
              </p>

              <div className="mt-6 flex gap-2">
                {LOCALE_HOMES &&
                  (Object.keys(LOCALE_HOMES) as Locale[]).map((l) => (
                    <Link
                      key={l}
                      href={LOCALE_HOMES[l]}
                      className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                        l === locale
                          ? 'bg-[#0E1541] text-white'
                          : 'border border-[#0E1541]/15 bg-white text-[#0E1541] hover:border-[#0E1541]/30'
                      }`}
                    >
                      {LOCALE_NAMES[l]}
                    </Link>
                  ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-[#0E1541]/50">
                {t.footer.navTitle}
              </h4>
              <ul className="mt-5 space-y-3 text-sm">
                <li>
                  <a
                    href="#programs"
                    className="text-[#0E1541]/70 transition hover:text-[#0E1541]"
                  >
                    {t.nav.programs}
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    className="text-[#0E1541]/70 transition hover:text-[#0E1541]"
                  >
                    {t.nav.whyUs}
                  </a>
                </li>
                <li>
                  <a
                    href="#how"
                    className="text-[#0E1541]/70 transition hover:text-[#0E1541]"
                  >
                    {t.nav.howItWorks}
                  </a>
                </li>
                <li>
                  <a
                    href="#faq"
                    className="text-[#0E1541]/70 transition hover:text-[#0E1541]"
                  >
                    {t.nav.faq}
                  </a>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="text-[#0E1541]/70 transition hover:text-[#0E1541]"
                  >
                    {t.nav.login}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-[#0E1541]/50">
                {t.footer.contactTitle}
              </h4>
              <ul className="mt-5 space-y-3 text-sm text-[#0E1541]/70">
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#0E1541]/40" />
                  <a href={CONTACTS.phoneHref} className="hover:text-[#0E1541]">
                    {CONTACTS.phone}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <InstagramIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#0E1541]/40" />
                  <a
                    href={CONTACTS.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#0E1541]"
                  >
                    @khanov_math_academy
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <TelegramIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#0E1541]/40" />
                  <a
                    href={CONTACTS.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#0E1541]"
                  >
                    {locale === 'ru' ? 'Telegram канал' : 'Telegram kanali'}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#0E1541]/40" />
                  <a
                    href={CONTACTS.yandexMaps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#0E1541]"
                  >
                    {locale === 'ru' ? CONTACTS.addressRu : CONTACTS.addressUz}
                    <span className="ml-1.5 text-xs text-[#0E1541]/50 underline-offset-2 hover:underline">
                      {locale === 'ru' ? '— на Яндекс.Картах' : "— Yandex xaritada"}
                    </span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-[#0E1541]/10 pt-6 text-sm text-[#0E1541]/50 sm:flex-row sm:items-center">
            <span>
              © {new Date().getFullYear()} Khanov Math Academy.{' '}
              {t.footer.rights}
            </span>
            <Link
              href="/login"
              className="font-semibold text-[#0E1541] hover:underline"
            >
              {t.nav.login} →
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = 'left',
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  align?: 'left' | 'center';
}) {
  return (
    <div className={align === 'center' ? 'text-center' : ''}>
      <span className="inline-flex items-center gap-2 rounded-full bg-[#0E1541]/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#0E1541]/70">
        {eyebrow}
      </span>
      <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-[#0E1541] sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      <p
        className={`mt-4 max-w-2xl text-base leading-relaxed text-[#0E1541]/65 sm:text-lg ${
          align === 'center' ? 'mx-auto' : ''
        }`}
      >
        {subtitle}
      </p>
    </div>
  );
}
