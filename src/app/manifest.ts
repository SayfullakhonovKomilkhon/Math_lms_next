import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'KhanovMath Academy — Панель ученика',
    short_name: 'KhanovMath',
    description:
      'Учебный центр KhanovMath Academy. Домашние задания, расписание, достижения и рейтинг.',
    start_url: '/student/dashboard',
    scope: '/student',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#F8F8FF',
    theme_color: '#F8F8FF',
    icons: [
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
