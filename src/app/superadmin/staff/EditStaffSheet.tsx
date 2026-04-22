'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff, RefreshCw, X } from 'lucide-react';
import api from '@/lib/api';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { InputField } from '@/components/ui/input-field';
import { toast } from '@/components/ui/toast';

export type EditStaffTarget =
  | {
      kind: 'teacher';
      id: string;
      fullName: string;
      phone?: string | null;
      ratePerStudent: number;
      email?: string | null;
    }
  | {
      kind: 'admin';
      id: string;
      email: string;
    };

interface Props {
  target: EditStaffTarget | null;
  onClose: () => void;
}

function generatePassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

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

export function EditStaffSheet({ target, onClose }: Props) {
  const qc = useQueryClient();
  const open = target !== null;

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [rate, setRate] = useState<number>(0);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [changePassword, setChangePassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!target) return;
    setErrors({});
    setShowPassword(false);
    setChangePassword(false);
    setPassword('');
    if (target.kind === 'teacher') {
      setFullName(target.fullName);
      setPhone(target.phone ?? '');
      setRate(Number(target.ratePerStudent) || 0);
      setEmail(target.email ?? '');
    } else {
      setEmail(target.email);
      setFullName('');
      setPhone('');
      setRate(0);
    }
  }, [target]);

  const teacherMutation = useMutation({
    mutationFn: (payload: { id: string; fullName: string; phone?: string; ratePerStudent: number }) =>
      api.patch(`/teachers/${payload.id}`, {
        fullName: payload.fullName,
        phone: payload.phone,
        ratePerStudent: payload.ratePerStudent,
      }),
  });

  const userCredsMutation = useMutation({
    mutationFn: (payload: { id: string; email?: string; password?: string }) =>
      api.patch(`/users/${payload.id}`, {
        email: payload.email,
        password: payload.password,
      }),
  });

  const saving = teacherMutation.isPending || userCredsMutation.isPending;

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (target?.kind === 'teacher') {
      if (!fullName.trim()) e.fullName = 'Обязательное поле';
      if (Number.isNaN(rate) || rate < 0) e.rate = 'Некорректная ставка';
    }
    if (target?.kind === 'admin') {
      if (!email.trim()) e.email = 'Обязательное поле';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Некорректный email';
      if (changePassword && (!password || password.length < 8)) e.password = 'Минимум 8 символов';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!target || !validate()) return;
    try {
      if (target.kind === 'teacher') {
        await teacherMutation.mutateAsync({
          id: target.id,
          fullName: fullName.trim(),
          phone: phone.trim() || undefined,
          ratePerStudent: Number(rate) || 0,
        });
        qc.invalidateQueries({ queryKey: ['sa-teachers'] });
        qc.invalidateQueries({ queryKey: ['sa-teachers-load'] });
        toast('Изменения сохранены');
      } else {
        await userCredsMutation.mutateAsync({
          id: target.id,
          email: email.trim() !== target.email ? email.trim() : undefined,
          password: changePassword ? password : undefined,
        });
        qc.invalidateQueries({ queryKey: ['sa-admins'] });
        toast('Изменения сохранены');
      }
      onClose();
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string | string[] } } }).response?.data?.message
          : undefined;
      const text = Array.isArray(msg) ? msg.join(', ') : msg;
      toast(text || 'Не удалось сохранить', 'error');
    }
  };

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent
        title={target?.kind === 'teacher' ? 'Редактировать учителя' : 'Редактировать администратора'}
        className="overflow-y-auto"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {target?.kind === 'teacher' ? 'Редактировать учителя' : 'Редактировать администратора'}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {target?.kind === 'teacher'
                ? 'Измените профиль, телефон и ставку за ученика.'
                : 'Измените email и, при необходимости, сбросьте пароль.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Закрыть"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
          {target?.kind === 'teacher' ? (
            <>
              <Field label="ФИО" error={errors.fullName}>
                <InputField
                  accent="admin"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </Field>

              <Field label="Телефон">
                <InputField
                  accent="admin"
                  placeholder="+998901234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </Field>

              <Field label="Ставка за ученика (сум)" error={errors.rate}>
                <InputField
                  accent="admin"
                  type="number"
                  min={0}
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                />
              </Field>

              {target.email && (
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-600">
                  <span className="block text-xs font-medium uppercase tracking-wide text-slate-400">
                    Email (логин)
                  </span>
                  <span className="mt-1 block font-medium text-slate-800">{target.email}</span>
                  <span className="mt-2 block text-xs text-slate-500">
                    Смена email и пароля учителя выполняется вручную — обратитесь к разработчику.
                  </span>
                </div>
              )}
            </>
          ) : (
            <>
              <Field label="Email (логин)" error={errors.email}>
                <InputField
                  accent="admin"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>

              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                    checked={changePassword}
                    onChange={(e) => setChangePassword(e.target.checked)}
                  />
                  <span>
                    <span className="block text-sm font-medium text-slate-800">Сбросить пароль</span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      Пользователь сможет войти только с новым паролем. Обязательно передайте его вручную.
                    </span>
                  </span>
                </label>

                {changePassword && (
                  <div className="mt-4">
                    <Field label="Новый пароль" error={errors.password} hint="Минимум 8 символов">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <InputField
                            accent="admin"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pr-9"
                          />
                          <button
                            type="button"
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            onClick={() => setShowPassword((v) => !v)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => {
                            setPassword(generatePassword());
                            setShowPassword(true);
                          }}
                          title="Сгенерировать новый пароль"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </Field>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-white px-6 py-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
            Отмена
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            loading={saving}
            className="bg-violet-600 hover:bg-violet-700"
          >
            Сохранить
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
