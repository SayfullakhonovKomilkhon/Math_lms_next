'use client';

import { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'info';
type ToastOptions = {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
};

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

let addToastFn: ((message: string, type?: ToastType) => void) | null = null;

export function toast(message: string, type: ToastType = 'success') {
  addToastFn?.(message, type);
}

export function useToast() {
  return {
    toast: (input: string | ToastOptions) => {
      if (typeof input === 'string') {
        toast(input, 'success');
        return;
      }

      const message = [input.title, input.description].filter(Boolean).join(' ');
      toast(message || 'Уведомление', input.variant === 'destructive' ? 'error' : 'success');
    },
  };
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  useEffect(() => {
    addToastFn = addToast;
    return () => { addToastFn = null; };
  }, [addToast]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'px-4 py-3 rounded-lg shadow-lg text-white text-sm max-w-sm animate-in slide-in-from-right',
            t.type === 'success' && 'bg-green-600',
            t.type === 'error' && 'bg-red-600',
            t.type === 'info' && 'bg-blue-600',
          )}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
