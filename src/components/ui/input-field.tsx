import * as React from 'react';
import { cn } from '@/lib/utils';

export type InputAccent = 'admin' | 'teacher' | 'neutral';

const accentRing: Record<InputAccent, string> = {
  admin: 'focus:border-indigo-500 focus:ring-indigo-500',
  teacher: 'focus:border-emerald-500 focus:ring-emerald-500',
  neutral: 'focus:border-slate-400 focus:ring-slate-400',
};

export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  accent?: InputAccent;
}

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ className, accent = 'neutral', type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400',
          'shadow-sm transition-shadow',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          accentRing[accent],
          'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
          className,
        )}
        {...props}
      />
    );
  },
);
InputField.displayName = 'InputField';

export interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  accent?: InputAccent;
}

export const SelectField = React.forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ className, accent = 'neutral', children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900',
          'shadow-sm transition-shadow',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          accentRing[accent],
          'disabled:cursor-not-allowed disabled:bg-slate-50',
          className,
        )}
        {...props}
      >
        {children}
      </select>
    );
  },
);
SelectField.displayName = 'SelectField';

export interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  accent?: InputAccent;
}

export const TextareaField = React.forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ className, accent = 'neutral', rows = 4, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400',
          'shadow-sm transition-shadow',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          accentRing[accent],
          'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
          className,
        )}
        {...props}
      />
    );
  },
);
TextareaField.displayName = 'TextareaField';
