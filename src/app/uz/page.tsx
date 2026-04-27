import type { Metadata } from 'next';
import { Landing } from '../_landing/Landing';
import { landingT } from '@/lib/i18n/landing';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
  'https://khanovmathacademy.uz';

export const metadata: Metadata = {
  title: landingT.uz.metaTitle,
  description: landingT.uz.metaDescription,
  alternates: {
    canonical: '/uz',
    languages: {
      ru: '/',
      uz: '/uz',
      'x-default': '/',
    },
  },
  openGraph: {
    locale: 'uz_UZ',
    alternateLocale: ['ru_RU'],
    url: `${SITE_URL}/uz`,
    title: landingT.uz.metaTitle,
    description: landingT.uz.metaDescription,
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  '@id': `${SITE_URL}#organization`,
  name: 'Khanov Math Academy',
  alternateName: ['Khanov Math', 'Khanov'],
  url: SITE_URL,
  logo: `${SITE_URL}/icon`,
  description: landingT.uz.metaDescription,
  areaServed: 'UZ',
  inLanguage: ['ru', 'uz'],
  telephone: '+998943265225',
  address: {
    '@type': 'PostalAddress',
    streetAddress: "Shahrisabz ko'chasi, 5A",
    addressLocality: 'Toshkent',
    addressRegion: 'Mirobod tumani',
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

export default function HomePageUz() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationJsonLd),
        }}
      />
      <Landing locale="uz" />
    </>
  );
}
