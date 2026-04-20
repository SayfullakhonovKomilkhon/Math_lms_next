'use client';

import { useTypewriter } from '../_lib/hooks';
import styles from './Hero.module.css';

type HeroProps = {
  firstName: string;
  title: string;
  titleEmoji: string;
  groupName: string;
  teacherName: string;
};

export function Hero({ firstName, title, titleEmoji, groupName, teacherName }: HeroProps) {
  const typed = useTypewriter(firstName, 60);
  return (
    <section className={styles.hero}>
      <div className={styles.greet}>Привет, боец</div>
      <h1 className={styles.title}>
        {typed}
        {typed.length < firstName.length ? <span className={styles.caret} /> : null}
        <span style={{ fontSize: '0.6em' }}> 👋</span>
      </h1>
      <div className={styles.badge}>
        <span className={styles.badgeEmoji}>{titleEmoji}</span>
        {title}
      </div>
      <p className={styles.sub}>
        Группа: <strong>{groupName}</strong>
        <br />
        Учитель: <strong>{teacherName}</strong>
      </p>
    </section>
  );
}
