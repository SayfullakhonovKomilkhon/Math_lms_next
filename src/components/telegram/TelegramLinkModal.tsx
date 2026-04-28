'use client';

import * as Dialog from '@radix-ui/react-dialog';
import {
  CheckCircle2,
  ExternalLink,
  Loader2,
  MessageCircle,
  X,
} from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useTelegramLink } from '@/hooks/useTelegramLink';

interface TelegramLinkModalProps {
  open: boolean;
  onClose: () => void;
  onRemindLater?: () => void;
}

export function TelegramLinkModal({
  open,
  onClose,
  onRemindLater,
}: TelegramLinkModalProps) {
  const {
    code,
    deepLink,
    linked,
    polling,
    isGenerating,
    generateAndOpen,
    reset,
  } = useTelegramLink({
    onLinked: () => {
      // Auto-close after a short success state so the user sees the checkmark.
      setTimeout(() => {
        onClose();
        reset();
      }, 1600);
    },
  });

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Закрыть"
          >
            <X size={18} />
          </button>

          {/* Hero band */}
          <div className="bg-gradient-to-br from-sky-50 to-blue-50 px-6 pb-5 pt-7 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
              <MessageCircle className="h-7 w-7 text-sky-500" />
            </div>
            <Dialog.Title className="text-lg font-semibold text-slate-900">
              Подключите Telegram
            </Dialog.Title>
            <Dialog.Description className="mx-auto mt-1.5 max-w-sm text-sm text-slate-600">
              Получайте напоминания об уроках, оценки, оплаты и важные объявления
              прямо в Telegram.
            </Dialog.Description>
          </div>

          <div className="space-y-4 px-6 pb-6 pt-5">
            {linked ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-5 text-center">
                <CheckCircle2 className="mx-auto mb-2 h-7 w-7 text-emerald-600" />
                <div className="text-base font-semibold text-emerald-900">
                  Готово! Аккаунт привязан
                </div>
                <div className="mt-1 text-sm text-emerald-700">
                  Можете закрыть это окно
                </div>
              </div>
            ) : !code ? (
              <>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex gap-2">
                    <span className="font-semibold text-sky-500">1.</span>
                    Нажмите «Подключиться» — откроется наш бот
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-sky-500">2.</span>
                    В Telegram нажмите кнопку <strong>«Запустить»</strong> /{' '}
                    <strong>«Start»</strong>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-sky-500">3.</span>
                    Возвращайтесь сюда — мы сами всё подтвердим
                  </li>
                </ul>
                <Button
                  className="w-full bg-sky-500 hover:bg-sky-600 focus:ring-sky-500"
                  onClick={() => generateAndOpen()}
                  loading={isGenerating}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Подключиться через Telegram
                </Button>
                {onRemindLater ? (
                  <button
                    type="button"
                    onClick={onRemindLater}
                    className="w-full text-center text-xs text-slate-400 hover:text-slate-600"
                  >
                    Напомнить позже
                  </button>
                ) : null}
              </>
            ) : (
              <>
                <div className="rounded-xl border border-sky-100 bg-sky-50/60 p-4">
                  <div className="flex items-center gap-2 text-sm text-sky-900">
                    {polling ? (
                      <Loader2 className="h-4 w-4 animate-spin text-sky-500" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-sky-500" />
                    )}
                    <span className="font-medium">
                      {polling
                        ? 'Ожидаем подтверждения в Telegram…'
                        : 'Telegram открыт'}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-sky-800/80">
                    В открывшемся чате нажмите кнопку{' '}
                    <strong>«Запустить»</strong>. Если вкладка не открылась —
                    нажмите ссылку ниже.
                  </p>
                </div>

                {deepLink ? (
                  <a
                    href={deepLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Открыть @{code.botUsername}
                  </a>
                ) : null}

                <details className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                  <summary className="cursor-pointer font-medium text-slate-600">
                    Не работает кнопка? Введите код вручную
                  </summary>
                  <div className="mt-2 space-y-1">
                    <p>
                      Откройте бота{' '}
                      <span className="font-mono">@{code.botUsername}</span> и
                      отправьте:
                    </p>
                    <p className="rounded-md bg-white px-2 py-1 font-mono text-slate-800">
                      /link {code.code}
                    </p>
                    <p>Код действителен 10 минут.</p>
                  </div>
                </details>

                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    reset();
                  }}
                >
                  Отмена
                </Button>
              </>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
