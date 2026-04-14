import * as React from 'react';
import { cn } from '@/lib/utils';

export type ButtonAccent = 'default' | 'admin' | 'teacher';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success' | 'outline' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  /** Уточняет цвет focus-ring для компактных иконок (`size="icon"`) и ghost */
  accent?: ButtonAccent;
}

const accentRing: Record<ButtonAccent, string> = {
  default: 'focus:ring-slate-400',
  admin: 'focus:ring-indigo-500',
  teacher: 'focus:ring-emerald-500',
};

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  children,
  accent = 'default',
  ...props
}: ButtonProps) {
  const isIconSize = size === 'icon';

  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' &&
          'rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
        variant === 'secondary' && 'rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400',
        variant === 'danger' && 'rounded-lg bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        variant === 'outline' &&
          cn(
            'rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50',
            accentRing[accent],
          ),
        variant === 'link' && 'p-0 text-indigo-600 underline-offset-4 hover:underline focus:ring-indigo-500',
        variant === 'ghost' &&
          cn(
            'text-gray-600 hover:bg-gray-100',
            isIconSize
              ? cn(
                  'rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50',
                  accentRing[accent],
                )
              : cn('rounded-lg', accentRing[accent === 'default' ? 'default' : accent]),
          ),
        variant === 'success' &&
          'rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500',
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-4 py-2 text-sm',
        size === 'lg' && 'px-6 py-3 text-base',
        isIconSize && 'h-9 w-9 shrink-0 p-0',
        className,
      )}
      {...props}
    >
      {loading && (
        <svg
          className={cn('h-4 w-4 animate-spin', !isIconSize && 'mr-2')}
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
