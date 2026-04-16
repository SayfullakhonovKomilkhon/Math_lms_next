'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { AlertTriangle, CircleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
  confirmDisabled?: boolean;
  confirmLoading?: boolean;
  children?: React.ReactNode;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = 'Подтвердить',
  cancelLabel = 'Отмена',
  variant = 'default',
  onConfirm,
  onCancel,
  confirmDisabled,
  confirmLoading,
  children,
}: ConfirmDialogProps) {
  const tone = {
    default: {
      icon: <CircleAlert className="h-5 w-5" />,
      iconWrap: 'bg-slate-100 text-slate-700',
      confirmVariant: 'primary' as const,
    },
    warning: {
      icon: <AlertTriangle className="h-5 w-5" />,
      iconWrap: 'bg-amber-50 text-amber-600',
      confirmVariant: 'outline' as const,
    },
    danger: {
      icon: <AlertTriangle className="h-5 w-5" />,
      iconWrap: 'bg-red-50 text-red-600',
      confirmVariant: 'danger' as const,
    },
  }[variant];

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => (!open ? onCancel() : undefined)}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <div className={cn('rounded-full p-2', tone.iconWrap)}>{tone.icon}</div>
              <div className="space-y-1">
                <Dialog.Title className="text-lg font-semibold text-slate-900">{title}</Dialog.Title>
                <Dialog.Description className="text-sm text-slate-500">
                  {description}
                </Dialog.Description>
              </div>
            </div>

            {children ? <div className="space-y-3">{children}</div> : null}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" className="w-full sm:w-auto" onClick={onCancel}>
                {cancelLabel}
              </Button>
              <Button
                variant={tone.confirmVariant}
                className="w-full sm:w-auto"
                onClick={onConfirm}
                disabled={confirmDisabled}
                loading={confirmLoading}
              >
                {confirmLabel}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

