import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MathCenter — Панель ученика',
    short_name: 'MathCenter',
    description:
      'Учебный центр MathCenter. Домашние задания, расписание, достижения и рейтинг.',
    start_url: '/student/dashboard',
    scope: '/student',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#F8F8FF',
    theme_color: '#F8F8FF',
    icons: [
      {
        src: '/icon',
        sizes: 'any',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
