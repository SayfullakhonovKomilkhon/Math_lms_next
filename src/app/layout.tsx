import type { Metadata, Viewport } from 'next';
import { Geist, Sora } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { ToastContainer } from '@/components/ui/toast';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });
const sora = Sora({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-sora',
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
  'https://khanovmathacademy.uz';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Khanov Math Academy — учебный центр математики',
    template: '%s | Khanov Math Academy',
  },
  description:
    'Khanov Math Academy — учебный центр математики. Подготовка к поступлению в лицеи и международные университеты, к Milliy сертификату и IQ-экзаменам.',
  applicationName: 'Khanov Math Academy',
  keywords: [
    'Khanov',
    'Khanov Math',
    'Khanov Math Academy',
    'khanovmath',
    'khanovmathacademy',
    'Ханов',
    'Ханов математика',
    'учебный центр математики',
    'очный учебный центр математики',
    'репетитор по математике',
    'подготовка к лицею',
    'учебный центр математики',
    'Узбекистан математика',
    'Tashkent math school',
  ],
  authors: [{ name: 'Khanov Math Academy' }],
  creator: 'Khanov Math Academy',
  publisher: 'Khanov Math Academy',
  category: 'education',
  alternates: {
    canonical: '/',
    languages: {
      ru: '/',
      uz: '/uz',
      'x-default': '/',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: SITE_URL,
    siteName: 'Khanov Math Academy',
    title: 'Khanov Math Academy — учебный центр математики',
    description:
      'Учебный центр математики Khanov Math Academy. Подготовка к поступлению, международным экзаменам и сертификации.',
    images: [
      {
        url: '/icon.png',
        width: 512,
        height: 512,
        alt: 'Khanov Math Academy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Khanov Math Academy',
    description:
      'Учебный центр математики. Подготовка к поступлению, международным экзаменам и сертификации.',
    images: ['/icon.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: '#0E1541',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${geist.variable} ${sora.variable} h-full`}>
      <body className="min-h-full bg-slate-50 font-sans antialiased">
        <Providers>
          {children}
          <ToastContainer />
        </Providers>
      </body>
    </html>
  );
}
