"use client";
import { useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { SupportModal } from "./SupportModal";
import { BookingForm } from "./BookingForm";
import { Feedback, Person, dateLabel, errorMessage, secondary } from "./support-api";

type Summary = { student: Person; count: number; lastDate: string };
export function FeedbackStatistics({ groupId }: { groupId?: string }) {
  const { user } = useAuth();
  const [selected, setSelected] = useState<Person | null>(null);
  const query = useQuery({
    queryKey: ["support", "statistics", user?.id, groupId],
    queryFn: () => api.get("/support/statistics", { params: { groupId } }).then(r => r.data.data as Summary[]),
  });
  return <section className="space-y-4 p-4">
    <div>
      <h2 className="text-lg font-semibold">Статистика</h2>
      <p className="text-sm text-slate-500">Ученики, у которых учитель отметил трудности. Нажмите на ученика, чтобы открыть все отзывы.</p>
    </div>
    {query.isPending && <p role="status">Загрузка статистики…</p>}
    {query.isError && <div role="alert"><p>{errorMessage(query.error)}</p><button className={secondary} onClick={() => void query.refetch()}>Повторить</button></div>}
    {query.data && <>
      <p className="text-sm text-slate-600">Нужна помощь: {query.data.length}</p>
      <div className="space-y-2">{query.data.map(row => <button type="button" key={row.student.id} onClick={() => setSelected(row.student)} className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left hover:bg-emerald-50 focus-visible:outline-emerald-600">
        <span><span className="block font-semibold">{row.student.fullName}</span><span className="text-xs text-slate-500">Последняя отметка: {dateLabel(row.lastDate)}</span></span>
        <span className="text-sm text-amber-800">Отметок о трудностях: {row.count} →</span>
      </button>)}</div>
      {!query.data.length && <p className="rounded-xl bg-slate-50 p-4 text-sm">Пока нет учеников с отмеченными трудностями. Оставьте отзыв из кружка посещаемости.</p>}
    </>}
    {selected && <StudentHistory key={selected.id} student={selected} groupId={groupId} onClose={() => setSelected(null)} />}
  </section>;
}
function StudentHistory({ student, groupId, onClose }: { student: Person; groupId?: string; onClose: () => void }) {
  const { user } = useAuth();
  const [booking, setBooking] = useState<Feedback | null>(null);
  const history = useInfiniteQuery({
    queryKey: ["support", "student-history", user?.id, groupId, student.id],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => api.get("/support/student-feedback", { params: { groupId, studentId: student.id, cursor: pageParam } }).then(r => r.data.data as { items: Feedback[]; nextCursor: string | null }),
    getNextPageParam: page => page.nextCursor ?? undefined,
  });
  if (booking) return <BookingForm feedback={booking} onClose={() => setBooking(null)} />;
  return <SupportModal title={student.fullName} onClose={onClose} drawer>
    <p className="mb-4 text-sm text-slate-500">История отзывов учителя · только для преподавателей</p>
    {history.isPending && <p>Загрузка истории…</p>}
    {history.isError && <div role="alert"><p>{errorMessage(history.error)}</p><button className={secondary} onClick={() => void history.refetch()}>Повторить</button></div>}
    <div className="space-y-4">{history.data?.pages.flatMap(p => p.items).map(f => <article key={f.id} className="space-y-2 rounded-xl border border-slate-200 p-4">
      <p className="text-xs text-slate-500">{dateLabel(f.date)} · {f.group?.name} · {f.teacher?.fullName}</p>
      <h3 className="font-semibold">{f.topic}</h3>
      {f.comment && <p className="whitespace-pre-wrap text-sm">{f.comment}</p>}
      {f.privateNote && <p className="whitespace-pre-wrap rounded-lg bg-amber-50 p-2 text-sm">Ранее сохранённая заметка: {f.privateNote}</p>}
      {!f.comment && !f.privateNote && <p className="text-sm text-slate-500">Без текста отзыва</p>}
      <button className={secondary} onClick={() => setBooking({ ...f, student })}>Записать к суппорту</button>
    </article>)}</div>
    {history.hasNextPage && <button className={`${secondary} mt-4`} disabled={history.isFetchingNextPage} onClick={() => void history.fetchNextPage()}>{history.isFetchingNextPage ? "Загрузка…" : "Показать ещё отзывы"}</button>}
  </SupportModal>;
}
