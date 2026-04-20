'use client';

import { useEffect, useState } from 'react';
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
      <div className={styles.logo}>M</div>
      <div className={styles.name}>MathCenter</div>
      <div className={styles.bar} />
    </div>
  );
}
