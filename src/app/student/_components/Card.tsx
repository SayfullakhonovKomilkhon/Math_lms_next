'use client';

import { forwardRef } from 'react';
import Link from 'next/link';
import styles from './Card.module.css';

type GlassCardProps = React.HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean;
  as?: 'div' | 'article' | 'section';
};

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  function GlassCard({ children, className, interactive, as, ...rest }, ref) {
    const Tag: React.ElementType = as ?? 'div';
    const cn = [styles.glass, interactive ? styles.interactive : '', className]
      .filter(Boolean)
      .join(' ');
    return (
      <Tag ref={ref} className={cn} {...rest}>
        {children}
      </Tag>
    );
  },
);

type SectionHeadingProps = {
  icon?: React.ReactNode;
  label: string;
  linkLabel?: string;
  href?: string;
};

export function SectionHeading({ icon, label, linkLabel, href }: SectionHeadingProps) {
  return (
    <div className={styles.heading}>
      {icon ? <span className={styles.headingIcon}>{icon}</span> : null}
      <span>{label}</span>
      <span className={styles.headingBar} />
      {href && linkLabel ? (
        <Link href={href} className={styles.headingLink}>
          {linkLabel} →
        </Link>
      ) : null}
    </div>
  );
}
