import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Trophy,
  Users,
  Sparkles,
  Target,
  ShieldCheck,
  Sigma,
  GraduationCap,
  Brain,
  Award,
  Phone,
  Mail,
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

const FEATURE_ICONS = [
  BookOpen,
  Target,
  Trophy,
  Users,
  Award,
  ShieldCheck,
];

const PROGRAM_ICONS = [Sigma, BookOpen, GraduationCap, Brain];

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
              <Link
                href="/login"
                className="group inline-flex items-center gap-2 rounded-xl bg-[#0E1952] px-7 py-4 text-base font-semibold text-white shadow-[0_12px_30px_-12px_rgba(14,25,82,0.55)] transition hover:bg-[#15236b]"
              >
                {t.hero.ctaPrimary}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-xl border border-[#0E1541]/15 bg-white px-7 py-4 text-base font-semibold text-[#0E1541] transition hover:border-[#0E1541]/30"
              >
                {t.hero.ctaSecondary}
              </a>
            </div>

            <div className="mt-10 flex items-center gap-3 text-sm text-[#0E1541]/60">
              <div className="flex -space-x-2">
                {[
                  '#ABDF00',
                  '#0E1541',
                  '#4C5E81',
                  '#FBBF24',
                ].map((c, i) => (
                  <span
                    key={i}
                    className="h-8 w-8 rounded-full border-2 border-white"
                    style={{ background: c }}
                  />
                ))}
              </div>
              <span>{t.hero.microProof}</span>
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
                  locale === 'ru' ? 'Олимпиады' : 'Olimpiadalar',
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

      {/* ============ Stats ============ */}
      <section className="relative -mt-4">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-[#0E1541]/10 bg-[#0E1541]/10 shadow-[0_30px_60px_-30px_rgba(14,21,65,0.15)] lg:grid-cols-4">
            {t.stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white px-6 py-8 text-center transition hover:bg-[#fafbfd] sm:px-8"
              >
                <div className="bg-gradient-to-br from-[#0E1541] to-[#15236b] bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm font-medium text-[#0E1541]/60">
                  {stat.label}
                </div>
              </div>
            ))}
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
              const Icon = PROGRAM_ICONS[i] ?? Sigma;
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
                <Link
                  href="/login"
                  className="group inline-flex items-center gap-2 rounded-xl bg-[#ABDF00] px-8 py-4 text-base font-bold text-[#0E1541] shadow-[0_10px_30px_-10px_rgba(171,223,0,0.6)] transition hover:bg-[#bef000]"
                >
                  {t.cta.button}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <a
                  href="tel:+998000000000"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur transition hover:bg-white/10"
                >
                  <Phone className="h-4 w-4" />
                  {t.cta.secondary}
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
                  <a
                    href="tel:+998000000000"
                    className="hover:text-[#0E1541]"
                  >
                    +998 (00) 000-00-00
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#0E1541]/40" />
                  <a
                    href="mailto:hello@khanovmathacademy.uz"
                    className="hover:text-[#0E1541]"
                  >
                    hello@khanovmathacademy.uz
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#0E1541]/40" />
                  <span>
                    {locale === 'ru'
                      ? 'Ташкент, Узбекистан'
                      : "Toshkent, O'zbekiston"}
                  </span>
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
