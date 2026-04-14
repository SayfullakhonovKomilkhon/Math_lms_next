'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import {
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
  DataTableCell,
} from '@/components/ui/data-table';

interface SalaryMyResponse {
  teacherId: string;
  fullName: string;
  studentCount: number;
  ratePerStudent: number;
  totalSalary: number;
  groups: { id: string; name: string; studentCount: number; groupSalary: number }[];
}

export default function TeacherSalaryPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['salary-my'],
    queryFn: () => api.get('/salary/my').then((r) => r.data.data as SalaryMyResponse),
  });

  if (isLoading || !data) {
    return <p className="py-8 text-slate-400">Загрузка...</p>;
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Зарплата" description={data.fullName} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="p-6">
          <p className="text-sm text-slate-500">Активных учеников</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{data.studentCount}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-slate-500">Ставка за ученика</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {formatCurrency(data.ratePerStudent)}
          </p>
        </Card>
        <Card className="border-emerald-200/80 bg-emerald-50/50 p-6">
          <p className="text-sm text-emerald-900">Итого (расчётный)</p>
          <p className="mt-2 text-3xl font-bold text-emerald-800">
            {formatCurrency(data.totalSalary)}
          </p>
        </Card>
      </div>

      <Card className="overflow-hidden p-0 shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3 font-semibold text-slate-900">По группам</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <DataTableHead>
              <DataTableHeaderCell>Группа</DataTableHeaderCell>
              <DataTableHeaderCell className="text-right">Учеников</DataTableHeaderCell>
              <DataTableHeaderCell className="text-right">Сумма</DataTableHeaderCell>
            </DataTableHead>
            <tbody>
              {data.groups.length === 0 && (
                <DataTableRow>
                  <DataTableCell colSpan={3} className="py-8 text-center text-slate-400">
                    Нет активных групп
                  </DataTableCell>
                </DataTableRow>
              )}
              {data.groups.map((g) => (
                <DataTableRow key={g.id}>
                  <DataTableCell className="font-medium text-slate-900">{g.name}</DataTableCell>
                  <DataTableCell className="text-right text-slate-600">{g.studentCount}</DataTableCell>
                  <DataTableCell className="text-right font-medium text-slate-900">
                    {formatCurrency(g.groupSalary)}
                  </DataTableCell>
                </DataTableRow>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="text-xs text-slate-400">
        Расчёт: сумма активных учеников во всех ваших активных группах × ставка. Детализация выплат по
        месяцам — на следующих этапах.
      </p>
    </div>
  );
}
