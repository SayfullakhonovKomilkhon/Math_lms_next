'use client';

import { useState } from 'react';
import { Student, AttendanceStatus, LessonType } from '@/types';
import { Button } from '@/components/ui/button';
import { AttendanceStatusPicker } from '@/components/attendance/AttendanceStatusPicker';
import { cn } from '@/lib/utils';

export interface AttendanceRow {
  studentId: string;
  status: AttendanceStatus;
  score?: number | null;
  comment?: string;
}

export interface AttendanceSeedRow {
  studentId: string;
  status: AttendanceStatus;
  score?: number | null;
  comment?: string;
}

interface Props {
  groupId: string;
  date: string;
  lessonType: LessonType;
  students: Student[];
  /** Prefill from GET /attendance (+ оценки за день при не-REGULAR) */
  seedRows?: AttendanceSeedRow[];
  onSave: (records: AttendanceRow[]) => Promise<void>;
  loading?: boolean;
}

const isGraded = (lt: LessonType) => lt !== 'REGULAR';

function buildRows(students: Student[], seedRows?: AttendanceSeedRow[]): AttendanceRow[] {
  return students.map((s) => {
    const seed = seedRows?.find((r) => r.studentId === s.id);
    if (seed) {
      return {
        studentId: s.id,
        status: seed.status,
        score: seed.score ?? null,
        comment: seed.comment ?? '',
      };
    }
    return { studentId: s.id, status: 'PRESENT' as const, score: null, comment: '' };
  });
}

const cellInputClass =
  'rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-100';

export function AttendanceTable({
  lessonType,
  students,
  seedRows,
  onSave,
  loading,
}: Props) {
  const [rows, setRows] = useState(() => buildRows(students, seedRows));

  const update = (studentId: string, field: keyof AttendanceRow, value: string | number | null) => {
    setRows((prev) =>
      prev.map((r) =>
        r.studentId === studentId
          ? { ...r, [field]: value, ...(field === 'status' && value === 'ABSENT' ? { score: null } : {}) }
          : r,
      ),
    );
  };

  const handleSave = () => onSave(rows);

  const summary = {
    present: rows.filter((r) => r.status === 'PRESENT').length,
    late: rows.filter((r) => r.status === 'LATE').length,
    absent: rows.filter((r) => r.status === 'ABSENT').length,
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 text-sm">
        <span className="font-medium text-emerald-800">✓ Был на уроке: {summary.present}</span>
        <span className="font-medium text-amber-800">⏱ Опоздал: {summary.late}</span>
        <span className="font-medium text-red-800">✗ Не был на уроке: {summary.absent}</span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200/90">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50/90">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Ученик
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Статус
              </th>
              {isGraded(lessonType) && (
                <>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Оценка
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Комментарий
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map((student, idx) => {
              const row = rows.find((r) => r.studentId === student.id)!;
              const isAbsent = row.status === 'ABSENT';
              return (
                <tr
                  key={student.id}
                  className={cn('transition-colors hover:bg-slate-50/60', isAbsent && 'opacity-60')}
                >
                  <td className="px-4 py-3 text-slate-400">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{student.fullName}</td>
                  <td className="px-4 py-3">
                    <AttendanceStatusPicker
                      value={row.status}
                      onChange={(v) => update(student.id, 'status', v)}
                    />
                  </td>
                  {isGraded(lessonType) && (
                    <>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          disabled={isAbsent}
                          value={row.score ?? ''}
                          onChange={(e) =>
                            update(student.id, 'score', e.target.value ? Number(e.target.value) : null)
                          }
                          placeholder="—"
                          className={cn('w-20', cellInputClass)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          disabled={isAbsent}
                          value={row.comment ?? ''}
                          onChange={(e) => update(student.id, 'comment', e.target.value)}
                          placeholder="Комментарий..."
                          className={cn('w-full min-w-[120px]', cellInputClass)}
                        />
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <Button variant="success" onClick={handleSave} loading={loading} size="lg">
          Сохранить отметки
        </Button>
      </div>
    </div>
  );
}
