import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { ToastContainer } from '@/components/ui/toast';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
  'https://khanovmathacademy.uz';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Khanov Math Academy — онлайн академия математики',
    template: '%s | Khanov Math Academy',
  },
  description:
    'Khanov Math Academy — академия математики для школьников. Онлайн-уроки, домашние задания, рейтинги и личный прогресс ученика. Готовим к олимпиадам, школе и поступлению.',
  applicationName: 'Khanov Math Academy',
  keywords: [
    'Khanov',
    'Khanov Math',
    'Khanov Math Academy',
    'khanovmath',
    'khanovmathacademy',
    'Ханов',
    'Ханов математика',
    'академия математики',
    'онлайн математика',
    'репетитор по математике',
    'подготовка к олимпиаде',
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
      'x-default': '/',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: SITE_URL,
    siteName: 'Khanov Math Academy',
    title: 'Khanov Math Academy — онлайн академия математики',
    description:
      'Онлайн академия математики Khanov Math Academy. Уроки, домашние задания, рейтинг и подготовка к олимпиадам.',
    images: [
      {
        url: '/icon',
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
      'Онлайн академия математики. Уроки, домашние задания, рейтинг и подготовка к олимпиадам.',
    images: ['/icon'],
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
  icons: {
    icon: '/icon',
    apple: '/apple-icon',
  },
};

export const viewport: Viewport = {
  themeColor: '#0E1541',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${geist.variable} h-full`}>
      <body className="min-h-full bg-slate-50 font-sans antialiased">
        <Providers>
          {children}
          <ToastContainer />
        </Providers>
      </body>
    </html>
  );
}
