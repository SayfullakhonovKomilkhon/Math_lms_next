'use client';

import { useEffect, useState } from 'react';
import { BrandLogo } from '@/components/branding/BrandLogo';
import styles from './SplashScreen.module.css';

export function SplashScreen() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setShow(false), 1600);
    return () => window.clearTimeout(t);
  }, []);
  if (!show) return null;
  return (
    <div className={styles.splash} aria-hidden>
      <BrandLogo className={styles.logo} priority />
      <div className={styles.name}>Khanov Math</div>
      <div className={styles.bar} />
    </div>
  );
}
