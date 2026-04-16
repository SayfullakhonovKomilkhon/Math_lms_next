'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Trophy } from 'lucide-react';
import api from '@/lib/api';
import { MONTH_NAMES_RU as MONTHS } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { InputField, SelectField } from '@/components/ui/input-field';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { toast } from '@/components/ui/toast';
import { MONTH_NAMES_RU } from '@/lib/format';

interface Setting { id: string; key: string; value: string; label: string | null }

export default function SettingsPage() {
  const qc = useQueryClient();
  const [values, setValues] = useState<Record<string, string>>({});
  const now = new Date();
  const [calcMonth, setCalcMonth] = useState(String(now.getMonth() + 1));
  const [calcYear, setCalcYear] = useState(String(now.getFullYear()));

  const { data: settings = [], isLoading } = useQuery<Setting[]>({
    queryKey: ['sa-settings'],
    queryFn: () => api.get('/settings').then((r) => r.data.data),
  });

  useEffect(() => {
    if (settings.length > 0) {
      setValues(Object.fromEntries(settings.map((s) => [s.key, s.value])));
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: () =>
      api.patch('/settings', {
        settings: Object.entries(values).map(([key, value]) => ({ key, value })),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sa-settings'] });
      toast('Настройки сохранены');
    },
    onError: () => toast('Ошибка сохранения', 'error'),
  });

  const calcMutation = useMutation({
    mutationFn: () =>
      api.post('/achievements/calculate', { month: Number(calcMonth), year: Number(calcYear) }),
    onSuccess: (r) => {
      const awarded = r.data?.data?.awarded ?? 0;
      toast(`Расчёт завершён. Выдано достижений: ${awarded}`);
    },
    onError: () => toast('Ошибка расчёта', 'error'),
  });

  const set = (key: string, val: string) =>
    setValues((prev) => ({ ...prev, [key]: val }));

  const hasChanges = settings.some((s) => values[s.key] !== s.value);

  const academicMonth = values['academic_year_start']
    ? parseInt(values['academic_year_start'].split('-')[0], 10)
    : 9;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Настройки центра"
        description="Общие параметры учебного центра"
        actions={
          <Button
            className="bg-violet-600 hover:bg-violet-700"
            disabled={!hasChanges}
            loading={saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
          >
            <Save className="mr-2 h-4 w-4" />
            Сохранить
          </Button>
        }
      />

      {isLoading ? (
        <p className="text-sm text-slate-400">Загрузка...</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">

          {/* 1. Уведомления об оплате */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-slate-900">Уведомления об оплате</h2>
              <p className="mt-0.5 text-xs text-slate-500">Дни месяца, когда отправляются напоминания</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'payment_reminder_days_1', label: '1-е напоминание (день месяца)', placeholder: '1' },
                { key: 'payment_reminder_days_2', label: '2-е напоминание (день месяца)', placeholder: '10' },
                { key: 'payment_reminder_days_3', label: '3-е напоминание (день месяца)', placeholder: '20' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
                  <InputField
                    accent="admin" type="number" min={1} max={31}
                    placeholder={placeholder}
                    value={values[key] ?? ''}
                    onChange={(e) => set(key, e.target.value)}
                    className="w-32"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 2. Учебный год */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-slate-900">Учебный год</h2>
              <p className="mt-0.5 text-xs text-slate-500">Начало нового учебного года</p>
            </CardHeader>
            <CardContent>
              <label className="mb-1 block text-sm font-medium text-slate-700">Месяц начала учебного года</label>
              <SelectField
                accent="admin" className="w-52"
                value={academicMonth}
                onChange={(e) => {
                  const m = String(Number(e.target.value)).padStart(2, '0');
                  set('academic_year_start', `${m}-01`);
                }}
              >
                {MONTH_NAMES_RU.map((name, i) => (
                  <option key={i + 1} value={i + 1}>{name}</option>
                ))}
              </SelectField>
            </CardContent>
          </Card>

          {/* 3. Информация о центре */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <h2 className="font-semibold text-slate-900">Информация о центре</h2>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Название центра</label>
                <InputField
                  accent="admin"
                  value={values['center_name'] ?? values['centerName'] ?? ''}
                  onChange={(e) => { set('center_name', e.target.value); set('centerName', e.target.value); }}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Базовая ставка за ученика (сум)</label>
                <InputField
                  accent="admin" type="number"
                  value={values['default_rate_per_student'] ?? ''}
                  onChange={(e) => set('default_rate_per_student', e.target.value)}
                />
                <p className="mt-1 text-xs text-slate-400">Применяется к новым учителям</p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Телефон центра</label>
                <InputField
                  accent="admin"
                  value={values['centerPhone'] ?? ''}
                  onChange={(e) => set('centerPhone', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* 4. Геймификация */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                <div>
                  <h2 className="font-semibold text-slate-900">Геймификация</h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Ручной запуск расчёта достижений (обычно запускается автоматически 1-го числа каждого месяца)
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Месяц</label>
                  <SelectField
                    accent="admin"
                    value={calcMonth}
                    onChange={(e) => setCalcMonth(e.target.value)}
                    className="w-40"
                  >
                    {MONTHS.map((name, i) => (
                      <option key={i + 1} value={i + 1}>{name}</option>
                    ))}
                  </SelectField>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Год</label>
                  <InputField
                    accent="admin"
                    type="number"
                    value={calcYear}
                    onChange={(e) => setCalcYear(e.target.value)}
                    className="w-28"
                  />
                </div>
                <Button
                  className="bg-amber-500 hover:bg-amber-600"
                  loading={calcMutation.isPending}
                  onClick={() => calcMutation.mutate()}
                >
                  <Trophy className="mr-2 h-4 w-4" />
                  Пересчитать достижения
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
      )}
    </div>
  );
}
