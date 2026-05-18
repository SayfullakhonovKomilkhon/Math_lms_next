'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  MessageCircle,
  Phone,
  Save,
  ShieldCheck,
  Unlink,
} from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { syncAuthCookie } from '@/lib/auth-cookie';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { InputField } from '@/components/ui/input-field';
import { toast } from '@/components/ui/toast';
import { useTelegramLink, useTelegramStatus } from '@/hooks/useTelegramLink';

interface UpdateMePayload {
  phone?: string;
  newPassword?: string;
  currentPassword: string;
}

interface UpdateMeResponse {
  user: { id: string; phone: string; role: string; isActive: boolean };
  accessToken: string;
  refreshToken: string;
}

type Accent = 'indigo' | 'violet' | 'emerald' | 'blue' | 'orange';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Panel accent — matches user's role. */
  accent?: Accent;
}

const accentStyles: Record<Accent, { btn: string; title: string; ring: string }> = {
  indigo: { btn: 'bg-indigo-600 hover:bg-indigo-700', title: 'text-indigo-700', ring: 'focus-visible:ring-indigo-500' },
  violet: { btn: 'bg-violet-600 hover:bg-violet-700', title: 'text-violet-700', ring: 'focus-visible:ring-violet-500' },
  emerald: { btn: 'bg-emerald-600 hover:bg-emerald-700', title: 'text-emerald-700', ring: 'focus-visible:ring-emerald-500' },
  blue: { btn: 'bg-blue-600 hover:bg-blue-700', title: 'text-blue-700', ring: 'focus-visible:ring-blue-500' },
  orange: { btn: 'bg-orange-500 hover:bg-orange-600', title: 'text-orange-700', ring: 'focus-visible:ring-orange-500' },
};

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function AccountSettingsDialog({ open, onClose, accent = 'indigo' }: Props) {
  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent title="Настройки аккаунта" className="flex flex-col">
        {open ? <AccountSettingsForm accent={accent} onClose={onClose} /> : null}
      </SheetContent>
    </Sheet>
  );
}

function AccountSettingsForm({ accent, onClose }: { accent: Accent; onClose: () => void }) {
  const user = useAuthStore((s) => s.user);
  const setTokens = useAuthStore((s) => s.setTokens);
  const a = accentStyles[accent];

  const initialPhone = user?.phone ?? '';

  const [phone, setPhone] = useState(initialPhone);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changePassword, setChangePassword] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: (payload: UpdateMePayload) =>
      api.patch<{ success: boolean; data: UpdateMeResponse }>('/auth/me', payload)
        .then((r) => r.data.data),
    onSuccess: (res) => {
      if (user) {
        const nextUser = { ...user, phone: res.user.phone };
        useAuthStore.setState({ user: nextUser });
        syncAuthCookie(nextUser, true);
      }
      setTokens(res.accessToken, res.refreshToken);
      toast('Данные аккаунта обновлены');
      onClose();
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string | string[] } } }).response?.data?.message
          : undefined;
      const text = Array.isArray(msg) ? msg.join(', ') : msg;
      toast(text || 'Не удалось сохранить', 'error');
    },
  });

  const validate = (): { ok: boolean; payload?: UpdateMePayload } => {
    const e: Record<string, string> = {};

    const phoneChanged = phone.trim() !== initialPhone.trim();
    if (phoneChanged) {
      if (!phone.trim()) e.phone = 'Обязательное поле';
      else if (!/^\+?[0-9]{9,15}$/.test(phone.trim()))
        e.phone = 'Некорректный номер телефона';
    }

    if (changePassword) {
      if (!newPassword || newPassword.length < 8) e.newPassword = 'Минимум 8 символов';
      if (newPassword !== confirmPassword) e.confirmPassword = 'Пароли не совпадают';
    }

    if (!phoneChanged && !changePassword) {
      e._form = 'Нет изменений для сохранения';
    }

    if (!e._form && !currentPassword) {
      e.currentPassword = 'Введите текущий пароль';
    }

    setErrors(e);
    if (Object.keys(e).length > 0) return { ok: false };

    return {
      ok: true,
      payload: {
        currentPassword,
        phone: phoneChanged ? phone.trim() : undefined,
        newPassword: changePassword ? newPassword : undefined,
      },
    };
  };

  const handleSave = () => {
    const { ok, payload } = validate();
    if (!ok || !payload) {
      if (errors._form) toast(errors._form, 'info');
      return;
    }
    mutation.mutate(payload);
  };

  return (
    <>
      <div className="flex items-start gap-3 border-b border-slate-100 px-6 py-5 pr-14">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 ${a.title}`}>
          <ShieldCheck className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Настройки аккаунта</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Измените номер телефона (логин) и, при необходимости, пароль. Для подтверждения введите текущий пароль.
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
        <Field label="Телефон (логин)" error={errors.phone}>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <InputField
              accent="admin"
              type="tel"
              placeholder="+998901234567"
              value={phone}
              onChange={(ev) => setPhone(ev.target.value)}
              className="pl-9"
            />
          </div>
        </Field>

        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              className={`mt-1 h-4 w-4 rounded border-slate-300 text-slate-700 ${a.ring}`}
              checked={changePassword}
              onChange={(ev) => setChangePassword(ev.target.checked)}
            />
            <span>
              <span className="block text-sm font-medium text-slate-800">Сменить пароль</span>
              <span className="mt-0.5 block text-xs text-slate-500">
                Минимум 8 символов. Потребуется ввести новый пароль дважды.
              </span>
            </span>
          </label>

          {changePassword && (
            <div className="mt-4 space-y-4">
              <Field label="Новый пароль" error={errors.newPassword}>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <InputField
                    accent="admin"
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(ev) => setNewPassword(ev.target.value)}
                    className="pl-9 pr-9"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    onClick={() => setShowNew((v) => !v)}
                    aria-label={showNew ? 'Скрыть пароль' : 'Показать пароль'}
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>

              <Field label="Повторите новый пароль" error={errors.confirmPassword}>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <InputField
                    accent="admin"
                    type={showNew ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(ev) => setConfirmPassword(ev.target.value)}
                    className="pl-9"
                    autoComplete="new-password"
                  />
                </div>
              </Field>
            </div>
          )}
        </div>

        <TelegramSection accent={accent} />

        <div className="border-t border-slate-100 pt-5">
          <Field
            label="Текущий пароль"
            error={errors.currentPassword}
            hint="Нужен для подтверждения изменений"
          >
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <InputField
                accent="admin"
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(ev) => setCurrentPassword(ev.target.value)}
                className="pl-9 pr-9"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                onClick={() => setShowCurrent((v) => !v)}
                aria-label={showCurrent ? 'Скрыть пароль' : 'Показать пароль'}
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-white px-6 py-4">
        <Button type="button" variant="secondary" onClick={onClose} disabled={mutation.isPending}>
          Отмена
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          loading={mutation.isPending}
          className={a.btn}
        >
          <Save className="mr-1.5 h-4 w-4" />
          Сохранить
        </Button>
      </div>
    </>
  );
}

function TelegramSection({ accent }: { accent: Accent }) {
  const a = accentStyles[accent];
  const qc = useQueryClient();
  const { data: status, isLoading: statusLoading } = useTelegramStatus(true);
  const linked = Boolean(status?.linked);

  const { code, deepLink, linked: justLinked, polling, isGenerating, generateAndOpen, reset } =
    useTelegramLink({
      onLinked: () => {
        // Refresh the badge to "Подключён" once the bot confirms.
        qc.invalidateQueries({ queryKey: ['telegram-status'] });
      },
    });

  const unlinkMutation = useMutation({
    mutationFn: () => api.post('/telegram/unlink'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['telegram-status'] });
      qc.invalidateQueries({ queryKey: ['auth-user'] });
      toast('Telegram отключён');
    },
    onError: () => toast('Не удалось отключить Telegram', 'error'),
  });

  const isLinked = linked || justLinked;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-sky-200 bg-sky-50 text-sky-600">
          <MessageCircle className="h-4.5 w-4.5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-slate-800">Telegram уведомления</span>
            {statusLoading ? null : isLinked ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                <CheckCircle2 className="h-3 w-3" /> Подключён
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                Не подключён
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Напоминания об уроках, оценки, оплаты и объявления приходят прямо в Telegram.
          </p>
        </div>
      </div>

      {isLinked ? (
        <div className="mt-3 flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => unlinkMutation.mutate()}
            loading={unlinkMutation.isPending}
          >
            <Unlink className="mr-1.5 h-4 w-4" />
            Отключить
          </Button>
        </div>
      ) : !code ? (
        <div className="mt-3">
          <Button
            type="button"
            size="sm"
            onClick={() => generateAndOpen()}
            loading={isGenerating}
            className={a.btn}
          >
            <MessageCircle className="mr-1.5 h-4 w-4" />
            Подключить Telegram
          </Button>
        </div>
      ) : (
        <div className="mt-3 space-y-2 rounded-lg border border-sky-100 bg-sky-50/60 p-3 text-xs text-sky-900">
          <div className="font-medium">
            {polling ? 'Ожидаем подтверждения в Telegram…' : 'Telegram открыт'}
          </div>
          <p className="text-sky-800/80">
            В открывшемся чате нажмите <strong>«Запустить»</strong>. Если вкладка не открылась —
            используйте ссылку ниже.
          </p>
          {deepLink ? (
            <a
              href={deepLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sky-700 underline-offset-2 hover:underline"
            >
              Открыть @{code.botUsername}
            </a>
          ) : null}
          <div className="flex items-center justify-between gap-2 pt-1">
            <details className="text-[11px] text-sky-900/80">
              <summary className="cursor-pointer">Ввести код вручную</summary>
              <div className="mt-1 space-y-0.5">
                <div>Отправьте боту команду:</div>
                <div className="rounded-md bg-white px-2 py-1 font-mono text-slate-800">
                  /link {code.code}
                </div>
              </div>
            </details>
            <button
              type="button"
              onClick={reset}
              className="text-[11px] text-sky-800 hover:underline"
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
