'use client';

import { FormEvent, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  LogOut,
  Phone,
  Save,
  ShieldCheck,
  User,
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/auth.store';
import { toast } from '@/components/ui/toast';
import { PageTitle } from '../_components/PageTitle';
import { SButton } from '../_components/SButton';
import { useStudentSummary } from '../_lib/useStudentSummary';
import styles from './profile.module.css';

type UpdatePayload = {
  fullName?: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
};

export default function StudentProfilePage() {
  const { summary, profile } = useStudentSummary();
  const { user, logout } = useAuth();

  const formKey = `${profile?.id ?? 'mock'}:${user?.phone ?? ''}`;

  return (
    <div>
      <PageTitle kicker="Профиль" title="Моя карточка" gradient />

      <section className={styles.hero}>
        <div className={styles.avatar}>{summary.initials}</div>
        <div className={styles.name}>{summary.fullName}</div>
        <div className={styles.meta}>
          {summary.groupName}
          <br />
          Учитель: {summary.teacherName}
        </div>
        <div className={styles.levelPill}>
          {summary.titleEmoji} {summary.title} · уровень {summary.level}
        </div>
      </section>

      <ProfileForm
        key={formKey}
        initialFullName={profile?.fullName ?? ''}
        initialPhone={profile?.phone ?? user?.phone ?? ''}
      />

      <div className={styles.logoutBtn}>
        <SButton variant="danger" onClick={logout}>
          <LogOut size={16} /> Выйти
        </SButton>
      </div>
    </div>
  );
}

type ProfileFormProps = {
  initialFullName: string;
  initialPhone: string;
};

function ProfileForm({
  initialFullName,
  initialPhone,
}: ProfileFormProps) {
  const qc = useQueryClient();
  const { user } = useAuth();

  const [fullName, setFullName] = useState(initialFullName);
  const [phone, setPhone] = useState(initialPhone);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const mutation = useMutation({
    mutationFn: (payload: UpdatePayload) =>
      api.patch('/students/me', payload).then((r) => r.data?.data ?? r.data),
    onSuccess: (_data, variables) => {
      toast('Данные аккаунта обновлены');
      qc.invalidateQueries({ queryKey: ['student-profile'] });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      if (variables.phone && user) {
        useAuthStore.setState({ user: { ...user, phone: variables.phone } });
      }
    },
    onError: (err: unknown) => {
      const message = extractErrorMessage(err);
      toast(message, 'error');
    },
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload: UpdatePayload = {};

    const trimmedName = fullName.trim();
    if (trimmedName && trimmedName !== initialFullName.trim()) {
      payload.fullName = trimmedName;
    }

    const trimmedPhone = phone.trim();
    if (trimmedPhone !== initialPhone.trim()) {
      payload.phone = trimmedPhone;
    }

    const wantsPasswordChange = newPassword.length > 0 || confirmPassword.length > 0;
    if (wantsPasswordChange) {
      if (newPassword.length < 8) {
        toast('Новый пароль должен быть минимум 8 символов', 'error');
        return;
      }
      if (newPassword !== confirmPassword) {
        toast('Пароли не совпадают', 'error');
        return;
      }
      payload.newPassword = newPassword;
    }

    const needsCurrentPassword = !!payload.phone || !!payload.newPassword;
    if (needsCurrentPassword) {
      if (!currentPassword) {
        toast('Введите текущий пароль для подтверждения', 'error');
        return;
      }
      payload.currentPassword = currentPassword;
    }

    if (Object.keys(payload).length === 0) {
      toast('Нет изменений для сохранения', 'info');
      return;
    }

    mutation.mutate(payload);
  };

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <User size={16} /> Личные данные
        </div>

        <Field
          label="Имя и фамилия"
          icon={<User size={16} />}
          type="text"
          value={fullName}
          onChange={setFullName}
          placeholder="Например, Алижон Валиев"
          autoComplete="name"
        />

        <Field
          label="Телефон (логин)"
          icon={<Phone size={16} />}
          type="tel"
          value={phone}
          onChange={setPhone}
          placeholder="+998 90 123 45 67"
          autoComplete="tel"
          hint="Используется как логин для входа в кабинет"
        />
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <ShieldCheck size={16} /> Безопасность
        </div>

        <Field
          label="Текущий пароль"
          icon={<Lock size={16} />}
          type={showCurrent ? 'text' : 'password'}
          value={currentPassword}
          onChange={setCurrentPassword}
          placeholder="Введите текущий пароль"
          autoComplete="current-password"
          trailing={
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowCurrent((v) => !v)}
              aria-label={showCurrent ? 'Скрыть пароль' : 'Показать пароль'}
            >
              {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          hint="Нужен только при смене телефона или пароля"
        />

        <Field
          label="Новый пароль"
          icon={<KeyRound size={16} />}
          type={showNew ? 'text' : 'password'}
          value={newPassword}
          onChange={setNewPassword}
          placeholder="Минимум 8 символов"
          autoComplete="new-password"
          trailing={
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowNew((v) => !v)}
              aria-label={showNew ? 'Скрыть пароль' : 'Показать пароль'}
            >
              {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
        />

        <Field
          label="Повторите новый пароль"
          icon={<KeyRound size={16} />}
          type={showNew ? 'text' : 'password'}
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Повторите новый пароль"
          autoComplete="new-password"
        />
      </div>

      <div className={styles.actions}>
        <SButton type="submit" disabled={mutation.isPending}>
          <Save size={16} />
          {mutation.isPending ? 'Сохранение…' : 'Сохранить изменения'}
        </SButton>
      </div>
    </form>
  );
}

type FieldProps = {
  label: string;
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
  hint?: string;
  type: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  autoComplete?: string;
};

function Field({
  label,
  icon,
  trailing,
  hint,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
}: FieldProps) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <span className={styles.fieldControl}>
        {icon ? <span className={styles.fieldIcon}>{icon}</span> : null}
        <input
          className={styles.input}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          spellCheck={false}
        />
        {trailing}
      </span>
      {hint ? <span className={styles.fieldHint}>{hint}</span> : null}
    </label>
  );
}

function extractErrorMessage(err: unknown): string {
  const fallback = 'Не удалось сохранить. Попробуйте ещё раз.';
  if (!err || typeof err !== 'object') return fallback;
  const maybeAxios = err as {
    response?: { data?: { message?: string | string[] } };
    message?: string;
  };
  const msg = maybeAxios.response?.data?.message;
  if (Array.isArray(msg)) return msg[0] ?? fallback;
  if (typeof msg === 'string') return msg;
  if (typeof maybeAxios.message === 'string') return maybeAxios.message;
  return fallback;
}
