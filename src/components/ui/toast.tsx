'use client';

import { Toaster, toast as sonnerToast } from 'sonner';

type ToastType = 'success' | 'error' | 'info';
type ToastOptions = {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'warning';
};

export function toast(message: string, type: ToastType = 'success') {
  if (type === 'error') {
    sonnerToast.error(message);
    return;
  }

  if (type === 'info') {
    sonnerToast.info(message);
    return;
  }

  sonnerToast.success(message);
}

export function useToast() {
  return {
    toast: (input: string | ToastOptions) => {
      if (typeof input === 'string') {
        toast(input, 'success');
        return;
      }

      const title = input.title || 'Уведомление';
      const description = input.description;

      if (input.variant === 'destructive') {
        sonnerToast.error(title, { description });
        return;
      }

      if (input.variant === 'warning') {
        sonnerToast.warning(title, { description });
        return;
      }

      sonnerToast.success(title, { description });
    },
  };
}

export function ToastContainer() {
  return <Toaster richColors position="bottom-right" closeButton />;
}
