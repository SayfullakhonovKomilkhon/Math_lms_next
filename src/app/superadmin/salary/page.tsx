'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileSpreadsheet, ChevronDown, ChevronRight, Pencil } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { downloadFromApi, extractApiErrorMessage } from '@/lib/download';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { InputField, SelectField } from '@/components/ui/input-field';
import { toast } from '@/components/ui/toast';

interface TeacherLoad {
  teacherId: string; fullName: string; phone: string | null;
  groupsCount: number; studentsCount: number;
  ratePerStudent: number; totalSalary: number; attendancePercent: number;
}

interface SalaryHistoryMonth {
  month: string; studentsCount: number; ratePerStudent: number; totalSalary: number;
}

interface SalaryHistory {
  teacherId: string; fullName: string; currentRate: number; history: SalaryHistoryMonth[];
}

const MONTH_NAMES = ['Январь','Февраль','Март','Апрель','Май','Июнь',
  'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];

export default function SalaryPage() {
  const qc = useQueryClient();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRate, setEditRate] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: teachers = [], isLoading } = useQuery<TeacherLoad[]>({
    queryKey: ['sa-teachers-load', month, year],
    queryFn: () => api.get('/analytics/teachers-load').then((r) => r.data.data),
  });

  const { data: history } = useQuery<SalaryHistory>({
    queryKey: ['sa-salary-history', expandedId],
    queryFn: () => api.get(`/salary/teachers/${expandedId}/history`).then((r) => r.data.data),
    enabled: !!expandedId,
  });

  const updateRateMutation = useMutation({
    mutationFn: ({ id, rate }: { id: string; rate: number }) =>
      api.patch(`/salary/teachers/${id}/rate`, { rate }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sa-teachers-load'] });
      setEditingId(null);
      toast('Ставка обновлена');
    },
    onError: () => toast('Ошибка', 'error'),
  });

  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await downloadFromApi(
        '/reports/salary/excel',
        `salary-${year}-${String(month).padStart(2, '0')}.xlsx`,
      );
    } catch (err) {
      toast(extractApiErrorMessage(err, 'Ошибка экспорта'), 'error');
    } finally {
      setExporting(false);
    }
  };

  const total = teachers.reduce((s, t) => s + t.totalSalary, 0);
  const years = [now.getFullYear() - 1, now.getFullYear()];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Зарплаты учителей"
        description="Расчёт на основе активных учеников × ставка"
        actions={
          <Button
            variant="secondary"
            size="sm"
            loading={exporting}
            onClick={handleExport}
          >
            <FileSpreadsheet className="mr-1.5 h-4 w-4 text-green-600" />
            Экспорт ведомости
          </Button>
        }
      />

      <div className="flex items-end gap-3">
        <div>
          <label className="mb-1 block text-xs text-slate-500">Месяц</label>
          <SelectField accent="admin" value={month} onChange={(e) => setMonth(Number(e.target.value))} className="w-40">
            {MONTH_NAMES.map((name, i) => (
              <option key={i + 1} value={i + 1}>{name}</option>
            ))}
          </SelectField>
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500">Год</label>
          <SelectField accent="admin" value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-28">
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </SelectField>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-400">Загрузка...</p>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-xs text-slate-500">
                  <th className="w-8 px-4 py-3" />
                  <th className="px-4 py-3 text-left font-medium">Учитель</th>
                  <th className="px-4 py-3 text-left font-medium">Телефон</th>
                  <th className="px-4 py-3 text-right font-medium">Групп</th>
                  <th className="px-4 py-3 text-right font-medium">Учеников</th>
                  <th className="px-4 py-3 text-right font-medium">Ставка / уч.</th>
                  <th className="px-4 py-3 text-right font-medium">Посещ. %</th>
                  <th className="px-4 py-3 text-right font-medium">К выплате</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((t) => (
                  <>
                    <tr
                      key={t.teacherId}
                      className="cursor-pointer border-b border-slate-50 hover:bg-slate-50/50"
                      onClick={() => setExpandedId((p) => (p === t.teacherId ? null : t.teacherId))}
                    >
                      <td className="px-4 py-3 text-slate-400">
                        {expandedId === t.teacherId
                          ? <ChevronDown className="h-4 w-4" />
                          : <ChevronRight className="h-4 w-4" />}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">{t.fullName}</td>
                      <td className="px-4 py-3 text-slate-500">{t.phone ?? '—'}</td>
                      <td className="px-4 py-3 text-right text-slate-700">{t.groupsCount}</td>
                      <td className="px-4 py-3 text-right text-slate-700">{t.studentsCount}</td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        {editingId === t.teacherId ? (
                          <div className="flex items-center justify-end gap-1">
                            <InputField
                              accent="admin" type="number"
                              className="w-24 text-right text-xs"
                              value={editRate}
                              onChange={(e) => setEditRate(e.target.value)}
                            />
                            <button
                              className="text-xs font-semibold text-violet-600 hover:text-violet-700"
                              onClick={() => updateRateMutation.mutate({ id: t.teacherId, rate: Number(editRate) })}
                            >ОК</button>
                            <button className="text-xs text-slate-400" onClick={() => setEditingId(null)}>✕</button>
                          </div>
                        ) : (
                          <button
                            className="flex items-center justify-end gap-1 text-slate-700 hover:text-violet-600"
                            onClick={() => { setEditingId(t.teacherId); setEditRate(String(t.ratePerStudent)); }}
                          >
                            {formatCurrency(t.ratePerStudent)}
                            <Pencil className="h-3 w-3 opacity-50" />
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={t.attendancePercent >= 80 ? 'text-green-600' : t.attendancePercent >= 60 ? 'text-amber-600' : 'text-red-600'}>
                          {t.attendancePercent}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900">
                        {formatCurrency(t.totalSalary)}
                      </td>
                    </tr>

                    {expandedId === t.teacherId && (
                      <tr key={`${t.teacherId}-hist`}>
                        <td colSpan={8} className="bg-violet-50/30 px-10 py-3">
                          {!history || history.teacherId !== t.teacherId ? (
                            <p className="text-xs text-slate-400">Загрузка истории...</p>
                          ) : (
                            <div>
                              <p className="mb-2 text-xs font-semibold text-slate-600">История начислений (6 мес.)</p>
                              <table className="w-full max-w-lg text-xs">
                                <thead>
                                  <tr className="text-slate-400">
                                    <th className="pb-1 text-left font-medium">Месяц</th>
                                    <th className="pb-1 text-right font-medium">Учеников</th>
                                    <th className="pb-1 text-right font-medium">Ставка</th>
                                    <th className="pb-1 text-right font-medium">Итого</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {history.history.map((h) => (
                                    <tr key={h.month} className="border-t border-violet-100">
                                      <td className="py-1 font-medium text-slate-700">{h.month}</td>
                                      <td className="py-1 text-right text-slate-600">{h.studentsCount}</td>
                                      <td className="py-1 text-right text-slate-600">{formatCurrency(h.ratePerStudent)}</td>
                                      <td className="py-1 text-right font-semibold text-slate-800">{formatCurrency(h.totalSalary)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-200 bg-violet-50/40">
                  <td colSpan={7} className="px-4 py-3 text-sm font-semibold text-slate-700">
                    Итого к выплате:
                  </td>
                  <td className="px-4 py-3 text-right text-base font-bold text-violet-700">
                    {formatCurrency(total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
