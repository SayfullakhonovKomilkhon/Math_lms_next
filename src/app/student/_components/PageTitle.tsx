import styles from './PageTitle.module.css';

type PageTitleProps = {
  kicker?: string;
  title: string;
  description?: string;
  gradient?: boolean;
};

export function PageTitle({ kicker, title, description, gradient }: PageTitleProps) {
  return (
    <header className={styles.page}>
      {kicker ? <span className={styles.kicker}>{kicker}</span> : null}
      <h1 className={`${styles.title} ${gradient ? styles.gradient : ''}`}>{title}</h1>
      {description ? <p className={styles.desc}>{description}</p> : null}
    </header>
  );
}
