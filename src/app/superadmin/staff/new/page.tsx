'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Eye, EyeOff, RefreshCw } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { InputField, SelectField } from '@/components/ui/input-field';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { toast } from '@/components/ui/toast';

type Role = 'TEACHER' | 'ADMIN';

function generatePassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function NewStaffPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    role: 'TEACHER' as Role,
    fullName: '',
    email: '',
    password: generatePassword(),
    phone: '',
    ratePerStudent: 50000,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (field: string, value: string | number) =>
    setForm((f) => ({ ...f, [field]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = 'Обязательное поле';
    if (!form.email.trim()) e.email = 'Обязательное поле';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Некорректный email';
    if (!form.password || form.password.length < 8) e.password = 'Минимум 8 символов';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post('/users/staff', {
        email: form.email,
        password: form.password,
        role: form.role,
        fullName: form.role === 'TEACHER' ? form.fullName : undefined,
        phone: form.role === 'TEACHER' && form.phone ? form.phone : undefined,
      });
      toast('Сотрудник добавлен');
      router.push('/superadmin/staff');
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string | string[] } } }).response?.data?.message
          : undefined;
      const text = Array.isArray(msg) ? msg.join(', ') : msg;
      toast(text || 'Ошибка при создании', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Добавить сотрудника"
        description="Создание учётной записи учителя или администратора"
      />

      <Link
        href="/superadmin/staff"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        К персоналу
      </Link>

      <Card className="max-w-xl">
        <CardHeader>
          <h2 className="font-semibold text-slate-900">Данные сотрудника</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <Field label="Роль">
              <SelectField
                accent="admin"
                value={form.role}
                onChange={(e) => set('role', e.target.value)}
              >
                <option value="TEACHER">Учитель</option>
                <option value="ADMIN">Администратор</option>
              </SelectField>
            </Field>

            {form.role === 'TEACHER' && (
              <Field label="ФИО" error={errors.fullName}>
                <InputField
                  accent="admin"
                  placeholder="Иван Иванов"
                  value={form.fullName}
                  onChange={(e) => set('fullName', e.target.value)}
                />
              </Field>
            )}

            <Field label="Email (логин)" error={errors.email}>
              <InputField
                accent="admin"
                type="email"
                placeholder="staff@mathcenter.uz"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
              />
            </Field>

            <Field label="Пароль" error={errors.password}>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <InputField
                    accent="admin"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => set('password', e.target.value)}
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
                  onClick={() => set('password', generatePassword())}
                  title="Сгенерировать новый пароль"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-1 text-xs text-slate-500">Скопируйте пароль и передайте сотруднику</p>
            </Field>

            {form.role === 'TEACHER' && (
              <>
                <Field label="Телефон">
                  <InputField
                    accent="admin"
                    placeholder="+998901234567"
                    value={form.phone}
                    onChange={(e) => set('phone', e.target.value)}
                  />
                </Field>
                <Field label="Ставка за ученика (сум)">
                  <InputField
                    accent="admin"
                    type="number"
                    value={form.ratePerStudent}
                    onChange={(e) => set('ratePerStudent', Number(e.target.value))}
                  />
                </Field>
              </>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={loading} className="bg-violet-600 hover:bg-violet-700">
                Создать
              </Button>
              <Link href="/superadmin/staff">
                <Button type="button" variant="secondary">Отмена</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
