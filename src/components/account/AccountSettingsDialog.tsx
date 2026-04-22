'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AtSign, Eye, EyeOff, KeyRound, Lock, Save, ShieldCheck } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { syncAuthCookie } from '@/lib/auth-cookie';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { InputField } from '@/components/ui/input-field';
import { toast } from '@/components/ui/toast';

interface UpdateMePayload {
  email?: string;
  newPassword?: string;
  currentPassword: string;
}

interface UpdateMeResponse {
  user: { id: string; email: string; role: string; isActive: boolean };
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

  const initialEmail = user?.email ?? '';

  const [email, setEmail] = useState(initialEmail);
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
        const nextUser = { ...user, email: res.user.email };
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

    const emailChanged = email.trim() !== initialEmail.trim();
    if (emailChanged) {
      if (!email.trim()) e.email = 'Обязательное поле';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = 'Некорректный email';
    }

    if (changePassword) {
      if (!newPassword || newPassword.length < 8) e.newPassword = 'Минимум 8 символов';
      if (newPassword !== confirmPassword) e.confirmPassword = 'Пароли не совпадают';
    }

    if (!emailChanged && !changePassword) {
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
        email: emailChanged ? email.trim() : undefined,
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
            Измените email (логин) и, при необходимости, пароль. Для подтверждения введите текущий пароль.
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
        <Field label="Email (логин)" error={errors.email}>
          <div className="relative">
            <AtSign className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <InputField
              accent="admin"
              type="email"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
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
