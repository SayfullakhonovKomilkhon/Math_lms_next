import type { Metadata, Viewport } from 'next';
import { StudentShell } from './_components/StudentShell';
import './_theme/theme.css';

export const metadata: Metadata = {
  title: {
    default: 'Панель ученика',
    template: '%s | MathCenter',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MathCenter',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
  },
};

export const viewport: Viewport = {
  themeColor: '#08080F',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <StudentShell>{children}</StudentShell>;
}
