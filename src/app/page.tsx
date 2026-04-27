import type { Metadata } from 'next';
import { Landing } from './_landing/Landing';
import { landingT } from '@/lib/i18n/landing';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
  'https://khanovmathacademy.uz';

export const metadata: Metadata = {
  title: landingT.ru.metaTitle,
  description: landingT.ru.metaDescription,
  alternates: {
    canonical: '/',
    languages: {
      ru: '/',
      uz: '/uz',
      'x-default': '/',
    },
  },
  openGraph: {
    locale: 'ru_RU',
    alternateLocale: ['uz_UZ'],
    url: `${SITE_URL}/`,
    title: landingT.ru.metaTitle,
    description: landingT.ru.metaDescription,
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  '@id': `${SITE_URL}#organization`,
  name: 'Khanov Math Academy',
  alternateName: ['Khanov Math', 'Ханов математика', 'Khanov'],
  url: SITE_URL,
  logo: `${SITE_URL}/icon`,
  description: landingT.ru.metaDescription,
  areaServed: 'UZ',
  inLanguage: ['ru', 'uz'],
  telephone: '+998943265225',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'ул. Шахрисабз, 5А',
    addressLocality: 'Ташкент',
    addressRegion: 'Мирабадский район',
    addressCountry: 'UZ',
  },
  hasMap: 'https://yandex.uz/maps/-/CPG-NZYg',
  sameAs: [
    'https://www.instagram.com/khanov_math_academy/',
    'https://t.me/SkhanovMathAcademy',
    'https://yandex.uz/maps/-/CPG-NZYg',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+998943265225',
    contactType: 'customer service',
    areaServed: 'UZ',
    availableLanguage: ['Russian', 'Uzbek'],
  },
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}#website`,
  name: 'Khanov Math Academy',
  url: SITE_URL,
  inLanguage: ['ru', 'uz'],
  publisher: { '@id': `${SITE_URL}#organization` },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([organizationJsonLd, websiteJsonLd]),
        }}
      />
      <Landing locale="ru" />
    </>
  );
}
