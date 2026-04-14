'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import api from '@/lib/api';
import { Student, LessonType, AttendanceStatus, AttendanceRecord, Grade } from '@/types';
import { LessonTypeSelector } from '@/components/attendance/LessonTypeSelector';
import { AttendanceTable } from '@/components/attendance/AttendanceTable';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { InputField } from '@/components/ui/input-field';

export default function AttendancePage() {
  const qc = useQueryClient();
  const { id: groupId } = useParams<{ id: string }>();
  const [lessonType, setLessonType] = useState<LessonType | null>(null);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['group-students', groupId],
    queryFn: () => api.get(`/groups/${groupId}/students`).then((r) => r.data.data as Student[]),
  });

  const { data: existingAttendance = [] } = useQuery({
    queryKey: ['attendance', groupId, date],
    queryFn: () =>
      api
        .get('/attendance', { params: { groupId, date } })
        .then((r) => r.data.data as AttendanceRecord[]),
    enabled: !!groupId && !!date && !!lessonType,
  });

  const { data: existingGrades = [] } = useQuery({
    queryKey: ['grades', groupId, date, lessonType],
    queryFn: () =>
      api
        .get('/grades', {
          params: {
            groupId,
            from: date,
            to: date,
            lessonType,
          },
        })
        .then((r) => r.data.data as Grade[]),
    enabled: !!groupId && !!date && !!lessonType && lessonType !== 'REGULAR',
  });

  const activeStudents = students.filter((s) => s.isActive);

  const seedRows = useMemo(() => {
    if (!activeStudents.length || !lessonType) return undefined;
    return activeStudents.map((s) => {
      const att = existingAttendance.find((a) => a.studentId === s.id);
      const g = existingGrades.find((x) => x.studentId === s.id);
      return {
        studentId: s.id,
        status: (att?.status as AttendanceStatus) ?? 'PRESENT',
        score: g != null ? Number(g.score) : null,
        comment: g?.comment ?? '',
      };
    });
  }, [activeStudents, existingAttendance, existingGrades, lessonType]);

  const attendanceTableKey = useMemo(
    () =>
      [
        groupId,
        date,
        lessonType ?? '',
        activeStudents
          .map((s) => s.id)
          .sort()
          .join(','),
        existingAttendance
          .map((a) => `${a.studentId}:${a.status}`)
          .sort()
          .join(';'),
        lessonType && lessonType !== 'REGULAR'
          ? existingGrades
              .map((g) => `${g.studentId}:${g.score}`)
              .sort()
              .join(';')
          : '',
      ].join('|'),
    [groupId, date, lessonType, activeStudents, existingAttendance, existingGrades],
  );

  const bulkAttendanceMutation = useMutation({
    mutationFn: (records: { studentId: string; status: AttendanceStatus }[]) =>
      api.post('/attendance/bulk', { groupId, date, lessonType, records }),
  });

  const bulkGradesMutation = useMutation({
    mutationFn: (data: {
      records: { studentId: string; score: number | null; comment?: string }[];
      maxScore: number;
    }) =>
      api.post('/grades/bulk', {
        groupId,
        date,
        lessonType,
        maxScore: data.maxScore,
        records: data.records,
      }),
  });

  const handleSave = async (
    rows: {
      studentId: string;
      status: AttendanceStatus;
      score?: number | null;
      comment?: string;
    }[],
  ) => {
    try {
      await bulkAttendanceMutation.mutateAsync(
        rows.map(({ studentId, status }) => ({ studentId, status })),
      );

      if (lessonType && lessonType !== 'REGULAR') {
        const gradeRecords = rows
          .filter((r) => r.status !== 'ABSENT')
          .map((r) => ({ studentId: r.studentId, score: r.score ?? null, comment: r.comment }));

        if (gradeRecords.length > 0) {
          await bulkGradesMutation.mutateAsync({ records: gradeRecords, maxScore: 100 });
        }
      }

      toast('Отметки сохранены');
      await qc.invalidateQueries({ queryKey: ['attendance', groupId, date] });
      if (lessonType && lessonType !== 'REGULAR') {
        await qc.invalidateQueries({ queryKey: ['grades', groupId, date, lessonType] });
      }
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast(msg || 'Ошибка сохранения', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/teacher/groups/${groupId}`}>
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0" aria-label="Назад">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Журнал посещаемости</h1>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Дата урока</label>
        <InputField
          accent="teacher"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="max-w-[200px]"
        />
      </div>

      {!lessonType ? (
        <Card>
          <CardContent className="pt-6">
            <LessonTypeSelector value={lessonType} onChange={setLessonType} />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setLessonType(null)}
                className="text-sm text-emerald-700 hover:underline"
              >
                ← Изменить тип урока
              </button>
              <span className="text-sm text-slate-500">
                Тип: <strong className="text-slate-800">{lessonType}</strong>
              </span>
            </div>
          </div>

          {isLoading ? (
            <p className="text-slate-400">Загрузка учеников...</p>
          ) : activeStudents.length === 0 ? (
            <p className="py-8 text-center text-slate-400">В этой группе нет активных учеников</p>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <AttendanceTable
                  key={attendanceTableKey}
                  groupId={groupId}
                  date={date}
                  lessonType={lessonType}
                  students={activeStudents}
                  seedRows={seedRows}
                  onSave={handleSave}
                  loading={bulkAttendanceMutation.isPending || bulkGradesMutation.isPending}
                />
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
