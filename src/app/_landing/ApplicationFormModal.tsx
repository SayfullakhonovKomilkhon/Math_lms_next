'use client';

import { FormEvent, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowRight, CheckCircle2, Loader2, X } from 'lucide-react';
import { landingT, type Locale } from '@/lib/i18n/landing';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').replace(
  /\/$/,
  '',
);

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D+/g, '');
  if (digits.length === 9) return `+998${digits}`;
  return digits ? `+${digits}` : '';
}

export function ApplicationFormModal({
  locale,
  variant = 'cta',
}: {
  locale: Locale;
  variant?: 'hero' | 'cta';
}) {
  const t = landingT[locale];
  const formT = t.applicationForm;
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [childAge, setChildAge] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [error, setError] = useState('');

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setError('');
      if (status === 'success') {
        setFullName('');
        setPhone('');
        setChildAge('');
        setStatus('idle');
      }
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const normalizedPhone = normalizePhone(phone);
    const age = Number(childAge);
    if (
      fullName.trim().length < 2 ||
      !/^\+[0-9]{9,15}$/.test(normalizedPhone) ||
      !Number.isInteger(age) ||
      age < 5 ||
      age > 25
    ) {
      setError(formT.requiredError);
      return;
    }

    setStatus('submitting');
    try {
      const response = await fetch(`${API_URL}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: normalizedPhone,
          childAge: age,
        }),
      });

      if (!response.ok) throw new Error('Application request failed');
      setStatus('success');
    } catch {
      setStatus('idle');
      setError(formT.submitError);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className={
            variant === 'hero'
              ? 'group inline-flex items-center gap-2 rounded-xl bg-[#0E1952] px-7 py-4 text-base font-semibold text-white shadow-[0_12px_30px_-12px_rgba(14,25,82,0.55)] transition hover:bg-[#15236b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E1952] focus-visible:ring-offset-2'
              : 'group inline-flex items-center gap-2 rounded-xl bg-[#ABDF00] px-8 py-4 text-base font-bold text-[#0E1541] shadow-[0_10px_30px_-10px_rgba(171,223,0,0.6)] transition hover:bg-[#bef000] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ABDF00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0E1952]'
          }
        >
          {variant === 'hero' ? t.hero.ctaPrimary : t.cta.button}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[#05091f]/65 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-6 text-left shadow-2xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:p-8">
          <Dialog.Close className="absolute right-4 top-4 rounded-full p-2 text-[#0E1541]/50 transition hover:bg-[#0E1541]/5 hover:text-[#0E1541] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E1541]">
            <X className="h-5 w-5" />
            <span className="sr-only">{formT.close}</span>
          </Dialog.Close>

          {status === 'success' ? (
            <div className="py-6 text-center">
              <CheckCircle2 className="mx-auto h-14 w-14 text-[#8fbd00]" />
              <Dialog.Title className="mt-5 text-2xl font-extrabold text-[#0E1541]">
                {formT.successTitle}
              </Dialog.Title>
              <Dialog.Description className="mt-3 text-sm leading-relaxed text-[#0E1541]/65">
                {formT.successText}
              </Dialog.Description>
              <Dialog.Close className="mt-7 rounded-xl bg-[#0E1952] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#15236b]">
                {formT.close}
              </Dialog.Close>
            </div>
          ) : (
            <>
              <Dialog.Title className="pr-8 text-2xl font-extrabold text-[#0E1541]">
                {formT.title}
              </Dialog.Title>
              <Dialog.Description className="mt-2 text-sm leading-relaxed text-[#0E1541]/65">
                {formT.subtitle}
              </Dialog.Description>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-[#0E1541]">
                    {formT.name}
                  </span>
                  <input
                    type="text"
                    autoComplete="name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder={formT.namePlaceholder}
                    maxLength={120}
                    className="h-12 w-full rounded-xl border border-[#0E1541]/15 px-4 text-[#0E1541] outline-none transition placeholder:text-[#0E1541]/35 focus:border-[#0E1541]/40 focus:ring-2 focus:ring-[#ABDF00]/50"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-[#0E1541]">
                    {formT.phone}
                  </span>
                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder={formT.phonePlaceholder}
                    className="h-12 w-full rounded-xl border border-[#0E1541]/15 px-4 text-[#0E1541] outline-none transition placeholder:text-[#0E1541]/35 focus:border-[#0E1541]/40 focus:ring-2 focus:ring-[#ABDF00]/50"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-[#0E1541]">
                    {formT.age}
                  </span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={5}
                    max={25}
                    value={childAge}
                    onChange={(event) => setChildAge(event.target.value)}
                    placeholder={formT.agePlaceholder}
                    className="h-12 w-full rounded-xl border border-[#0E1541]/15 px-4 text-[#0E1541] outline-none transition placeholder:text-[#0E1541]/35 focus:border-[#0E1541]/40 focus:ring-2 focus:ring-[#ABDF00]/50"
                    required
                  />
                </label>

                {error && (
                  <p role="alert" className="text-sm leading-relaxed text-red-600">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0E1952] px-5 text-sm font-bold text-white transition hover:bg-[#15236b] disabled:cursor-wait disabled:opacity-70"
                >
                  {status === 'submitting' && <Loader2 className="h-4 w-4 animate-spin" />}
                  {status === 'submitting' ? formT.submitting : formT.submit}
                </button>
              </form>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
