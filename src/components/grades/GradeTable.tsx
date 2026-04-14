'use client';

import { Grade } from '@/types';
import { formatDate } from '@/lib/utils';
import {
  DataTable,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
  DataTableCell,
} from '@/components/ui/data-table';

interface Props {
  grades: Grade[];
}

export function GradeTable({ grades }: Props) {
  return (
    <DataTable>
      <table className="w-full min-w-[720px] text-sm">
        <DataTableHead>
          <DataTableHeaderCell>Дата</DataTableHeaderCell>
          <DataTableHeaderCell>Ученик</DataTableHeaderCell>
          <DataTableHeaderCell>Тип</DataTableHeaderCell>
          <DataTableHeaderCell className="text-right">Балл</DataTableHeaderCell>
          <DataTableHeaderCell>Комментарий</DataTableHeaderCell>
        </DataTableHead>
        <tbody>
          {grades.length === 0 && (
            <DataTableRow>
              <DataTableCell colSpan={5} className="py-8 text-center text-slate-400">
                Оценок пока нет
              </DataTableCell>
            </DataTableRow>
          )}
          {grades.map((g) => (
            <DataTableRow key={g.id}>
              <DataTableCell className="text-slate-600">{formatDate(g.date)}</DataTableCell>
              <DataTableCell className="font-medium text-slate-900">{g.student?.fullName}</DataTableCell>
              <DataTableCell className="capitalize text-slate-600">{g.lessonType}</DataTableCell>
              <DataTableCell className="text-right font-bold">
                <span
                  className={
                    Number(g.score) >= Number(g.maxScore) * 0.8 ? 'text-emerald-600' : 'text-amber-600'
                  }
                >
                  {Number(g.score)}/{Number(g.maxScore)}
                </span>
              </DataTableCell>
              <DataTableCell className="text-slate-500">{g.comment ?? '—'}</DataTableCell>
            </DataTableRow>
          ))}
        </tbody>
      </table>
    </DataTable>
  );
}
