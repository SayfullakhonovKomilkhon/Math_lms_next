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
