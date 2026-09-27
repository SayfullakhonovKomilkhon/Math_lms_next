"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { SupportModal } from "./SupportModal";
import { FeedbackRow } from "./FeedbackTab";
import { BookingForm } from "./BookingForm";
import {
  Booking,
  Feedback,
  Person,
  dateLabel,
  dateTime,
  errorMessage,
  secondary,
  statusLabels,
} from "./support-api";

export function AttendanceLessonSupport({
  groupId,
  date,
  student,
  topic,
  mode,
  bookings,
  onClose,
}: {
  groupId: string;
  date: string;
  student: Person;
  topic: string;
  mode: "feedback" | "book" | "details";
  bookings: Booking[];
  absent: boolean;
  onClose: () => void;
}) {
  const [booking, setBooking] = useState<Feedback | null>(null);
  const [editing, setEditing] = useState(mode !== "details");
  const [saved, setSaved] = useState(false);
  const query = useQuery({
    queryKey: ["support", "feedback", groupId, date],
    queryFn: () =>
      api
        .get("/support/feedback", { params: { groupId, date } })
        .then((r) => r.data.data as Feedback[]),
  });
  const feedback = query.data?.find((f) => f.studentId === student.id);
  if (booking) return <BookingForm feedback={booking} onClose={onClose} />;
  return (
    <SupportModal
      title={
        mode === "details"
          ? "Дополнительные занятия"
          : mode === "book"
            ? "Направить к суппорту"
            : "Отзыв за урок"
      }
      onClose={onClose}
    >
      <p className="mb-3 text-sm text-slate-600">
        {student.fullName} · {dateLabel(date)}
      </p>
      {mode === "book" && (
        <p className="mb-3 rounded-xl bg-emerald-50 p-3 text-sm">
          Сохраните тему и отзыв, затем выберите суппорта и свободное время.
          Посещаемость не изменится.
        </p>
      )}
      {bookings.length > 0 && (
        <div className="mb-4 space-y-2">
          <h3 className="text-sm font-semibold">Записи по этому уроку</h3>
          {bookings.map((b) => (
            <article
              key={b.id}
              className="space-y-1 rounded-xl border border-slate-200 p-3 text-sm"
            >
              <p className="font-medium">
                {statusLabels[b.status]} · {dateTime(b.session.startAt)}
              </p>
              <p>
                {b.session.teacher.fullName} · {b.session.location}
              </p>
              <p>Задача: {b.task}</p>
              {b.result && (
                <p>
                  Результат:{" "}
                  {b.outcome === "RESOLVED"
                    ? "Тема усвоена. "
                    : b.outcome === "NEEDS_MORE"
                      ? "Нужна ещё помощь. "
                      : ""}
                  {b.result}
                </p>
              )}
              {b.changeReason && (
                <p className="text-slate-500">{b.changeReason}</p>
              )}
            </article>
          ))}
        </div>
      )}
      {!editing && (
        <button className={secondary} onClick={() => setEditing(true)}>
          Отзыв и повторная запись
        </button>
      )}
      {editing && query.isPending && <p>Загрузка отзыва…</p>}
      {editing && query.isError && (
        <div role="alert">
          <p className="text-red-700">{errorMessage(query.error)}</p>
          <button className={secondary} onClick={() => void query.refetch()}>
            Повторить
          </button>
        </div>
      )}
      {editing && query.data && (
        <FeedbackRow
          key={feedback?.updatedAt ?? "new"}
          groupId={groupId}
          date={date}
          student={student}
          feedback={feedback}
          defaultTopic={topic}
          onBook={(f) => setBooking({ ...f, student })}
          onSaved={() => setSaved(true)}
        />
      )}
      {saved && (
        <p role="status" className="mt-3 text-sm text-emerald-700">
          Отзыв сохранён
        </p>
      )}
    </SupportModal>
  );
}
