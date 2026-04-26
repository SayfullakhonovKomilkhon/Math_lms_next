'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { ROLE_HOME_PATHS } from '@/lib/auth-routing';
import { Role } from '@/types';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';

// Strip everything except digits and a leading "+", so "+998 90 962 51 46",
// "90-962-51-46", or "(90) 962 51 46" all reduce to the same canonical form
// before we hand it off to the backend (which then prepends +998 if absent).
const normalizePhoneInput = (raw: string) => {
  const trimmed = raw.trim();
  const plus = trimmed.startsWith('+') ? '+' : '';
  return plus + trimmed.replace(/\D+/g, '');
};

const schema = z.object({
  phone: z
    .string()
    .trim()
    .transform(normalizePhoneInput)
    .refine((v) => /^\+?[0-9]{9,15}$/.test(v), {
      message: 'Введите номер телефона. Префикс +998 можно опустить.',
    }),
  password: z.string().min(6, 'Минимум 6 символов'),
});

type FormData = z.infer<typeof schema>;
type Portal = 'student' | 'staff';

const PORTAL_ROLES: Record<Portal, Role[]> = {
  student: ['STUDENT', 'PARENT'],
  staff: ['SUPER_ADMIN', 'ADMIN', 'TEACHER'],
};

const PORTAL_COPY: Record<Portal, { title: string; subtitle: string; placeholder: string; wrongRole: string }> = {
  student: {
    title: 'Student Login',
    subtitle: 'Вход для учеников и родителей',
    placeholder: '901234567',
    wrongRole:
      'Этот аккаунт не относится к ученикам или родителям. Вернитесь назад и выберите «Staff».',
  },
  staff: {
    title: 'Staff Login',
    subtitle: 'Вход для учителей, администраторов и супер-администраторов',
    placeholder: '901234567',
    wrongRole:
      'Этот аккаунт не относится к сотрудникам. Вернитесь назад и выберите «Student».',
  },
};

export default function LoginPage() {
  const router = useRouter();
  const storeLogin = useAuthStore((s) => s.login);
  const storeLogout = useAuthStore((s) => s.logout);
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'select' | 'staff' | 'student'>('select');

  useEffect(() => {
    if (searchParams.get('reason') === 'session-expired') {
      toast('Сессия истекла. Войдите снова.', 'info');
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const goBack = () => {
    setStep('select');
    reset();
  };

  const onSubmit = async (portal: Portal, data: FormData) => {
    setLoading(true);
    try {
      await storeLogin(data.phone, data.password);
      const user = useAuthStore.getState().user;
      const role = user?.role;
      if (!role) throw new Error('No role in auth response');

      const allowed = PORTAL_ROLES[portal];
      if (!allowed.includes(role)) {
        storeLogout();
        toast(PORTAL_COPY[portal].wrongRole, 'error');
        return;
      }

      router.push(ROLE_HOME_PATHS[role] ?? '/login');
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast(msg || 'Неверный номер телефона или пароль', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans overflow-hidden">
      {/* Left Pane - Content */}
      <div className="flex-1 flex flex-col px-6 sm:px-12 lg:px-20 h-screen overflow-y-auto justify-center">
        <div className="w-full max-w-[390px] mx-auto flex flex-col">
          {/* Top Logo */}
          <div className="flex flex-col items-start mb-12">
            <div className="relative w-[36px] h-[36px] mb-[16px]">
              <div className="absolute top-0 left-0 w-[24px] h-[24px] bg-[#ABDF00] rounded-[8px]" />
              <div className="absolute bottom-0 right-0 w-[24px] h-[24px] bg-[#4C5E81] rounded-[8px] mix-blend-multiply" />
            </div>
            <div className="flex flex-col">
              <span className="text-[#0E1541] font-extrabold text-[26px] leading-[1.1] tracking-[-0.03em]">khanovMath</span>
              <span className="text-[#0E1541] font-bold text-[12px] uppercase tracking-[0.25em] leading-none opacity-50 ml-[2px]">academy</span>
            </div>
          </div>

          {/* Main Box */}
          <div className="w-full relative">
          
          {step === 'select' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-[#0E1541] text-[40px] font-bold leading-tight mb-0.5 tracking-tight">Hello!</h2>
              <p className="text-[#0E1541] text-[17px] mb-9 font-medium opacity-90">Choose your login option</p>

              <div className="space-y-4">
                <button
                  onClick={() => setStep('student')}
                  className="w-full min-h-[92px] py-4 flex items-center justify-between bg-[#0E1952] text-white px-6 rounded-[14px] hover:bg-[#15236b] transition-all text-left shadow-[0_4px_14px_rgba(14,25,82,0.2)] group"
                >
                  <div className="flex flex-col justify-center pr-2">
                    <span className="font-semibold text-[18px] mb-0.5">Student</span>
                    <span className="text-[13.5px] text-[#AAB0C8]">Access the students&apos; portal here.</span>
                  </div>
                  <ChevronRight className="w-[22px] h-[22px] text-white shrink-0 transform group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => setStep('staff')}
                  className="w-full min-h-[92px] py-4 flex items-center justify-between bg-[#F8FAFC] border border-[#E2E8F0] text-[#0E1541] px-6 rounded-[14px] hover:bg-[#F1F5F9] transition-all text-left group"
                >
                  <div className="flex flex-col justify-center pr-2">
                    <span className="font-semibold text-[18px] mb-0.5">Staff</span>
                    <span className="text-[13.5px] text-[#64748B]">Exclusive to staff members only.</span>
                  </div>
                  <ChevronRight className="w-[22px] h-[22px] text-[#0E1541] shrink-0 transform group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {(step === 'staff' || step === 'student') && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <button
                onClick={goBack}
                className="flex items-center text-sm font-medium text-gray-500 hover:text-[#0E1541] mb-6 transition-colors"
                type="button"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>

              <div className="mb-8">
                <h2 className="text-[#0E1541] text-[32px] font-bold leading-tight mb-2 tracking-tight">
                  {PORTAL_COPY[step].title}
                </h2>
                <p className="text-gray-500 text-[15px]">{PORTAL_COPY[step].subtitle}</p>
              </div>

              <form onSubmit={handleSubmit((data) => onSubmit(step, data))} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-[#0E1541] mb-2">Номер телефона</label>
                  <input
                    {...register('phone')}
                    type="tel"
                    autoComplete="tel"
                    placeholder={PORTAL_COPY[step].placeholder}
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-[15px] text-[#0E1541] placeholder:text-gray-400 bg-white focus:ring-2 focus:ring-[#0E1541] focus:border-[#0E1541] outline-none transition-all"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1.5">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0E1541] mb-2">Password</label>
                  <input
                    {...register('password')}
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-[15px] text-[#0E1541] placeholder:text-gray-400 bg-white focus:ring-2 focus:ring-[#0E1541] focus:border-[#0E1541] outline-none transition-all"
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1.5">{errors.password.message}</p>
                  )}
                </div>

                <Button type="submit" loading={loading} className="w-full py-4 text-[16px] bg-[#0E1952] hover:bg-[#15236b] text-white rounded-xl h-auto font-semibold mt-4">
                  Log in
                </Button>
              </form>
            </div>
          )}

        </div>
        </div>
      </div>

      {/* Right Pane - Visual Background */}
      <div className="hidden lg:flex flex-1 p-6 pl-0 justify-end h-screen">
        <div className="w-full h-full rounded-[28px] overflow-hidden bg-[#eef1f6] relative border border-gray-100 flex items-center justify-center">
            
            {/* Base gradients for lighting */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#ffffff] via-[#f1f3f7] to-[#e4e7ee]" />
            <div className="absolute inset-0 opacity-60" style={{
              backgroundImage: 'radial-gradient(circle at 70% 30%, #ffffff 0%, transparent 60%)',
            }} />
            
            {/* SVG Wavy abstraction mirroring the figma 3D wave background */}
            <svg width="100%" height="100%" viewBox="0 0 1000 1000" preserveAspectRatio="none" className="absolute inset-0 opacity-80 mix-blend-overlay">
               {/* Filled waves for 3D depth */}
               <path d="M-200,1000 C200,600 500,200 1200,-100 L1200,1200 Z" fill="rgba(255,255,255,0.7)" />
               <path d="M-100,1000 C300,700 600,300 1200,0 L1200,1200 Z" fill="rgba(255,255,255,0.5)" />
               <path d="M0,1000 C400,800 700,400 1200,100 L1200,1200 Z" fill="rgba(220,225,235,0.4)" />
               
               {/* Outlined waves for texture */}
               <path d="M-200,1000 C200,600 500,200 1200,-100" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="6" />
               <path d="M-150,1000 C250,650 550,250 1200,-50" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="12" />
               <path d="M-100,1000 C300,700 600,300 1200,0" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="8" />
               <path d="M-50,1000 C350,750 650,350 1200,50" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="16" />
               <path d="M0,1000 C400,800 700,400 1200,100" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="4" />
               <path d="M50,1000 C450,850 750,450 1200,150" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="20" />
               <path d="M200,1000 C600,950 900,600 1200,300" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="10" />
               <path d="M400,1000 C800,1000 1000,700 1200,500" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="5" />
            </svg>

            {/* Another layer to smooth out the edges */}
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(238,241,246,0.3)] to-transparent" />
        </div>
      </div>
    </div>
  );
}
