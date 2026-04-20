'use client';

import { forwardRef } from 'react';
import { haptic } from '../_lib/hooks';
import styles from './Button.module.css';

type Variant = 'primary' | 'gold' | 'ghost' | 'danger';
type Size = 'md' | 'sm';

type SButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  hapticOnPress?: boolean;
};

export const SButton = forwardRef<HTMLButtonElement, SButtonProps>(function SButton(
  {
    children,
    variant = 'primary',
    size = 'md',
    className,
    onClick,
    hapticOnPress = true,
    ...rest
  },
  ref,
) {
  const cn = [
    styles.btn,
    styles[variant],
    size === 'sm' ? styles.sm : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <button
      ref={ref}
      className={cn}
      onClick={(e) => {
        if (hapticOnPress) haptic(12);
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </button>
  );
});
