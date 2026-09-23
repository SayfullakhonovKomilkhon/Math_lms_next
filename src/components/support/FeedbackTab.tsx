"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { BookingForm } from "./BookingForm";
import {
  Feedback,
  Person,
  Understanding,
  button,
  errorMessage,
  field,
  secondary,
  today,
  understandingLabels,
} from "./support-api";

export function FeedbackTab({
  groupId,
  students,
}: {
  groupId: string;
  students: Person[];
}) {
  const [date, setDate] = useState(today());
  const [booking, setBooking] = useState<Feedback | null>(null);
  const query = useQuery({
    queryKey: ["support", "feedback", groupId, date],
    enabled: !!date,
    queryFn: () =>
      api
        .get("/support/feedback", { params: { groupId, date } })
        .then((r) => r.data.data as Feedback[]),
  });
  return (
    <section className="space-y-4 p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Обратная связь после урока</h2>
          <p className="text-sm text-slate-500">
            Оцените понимание темы и при необходимости запишите ученика к
            суппорту.
          </p>
        </div>
        <label className="text-sm">
          Дата урока
          <input
            aria-label="Дата урока"
            className={field}
            type="date"
            max={today()}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
      </div>
      {query.isLoading && <p>Загрузка отзывов…</p>}
      {query.isError && (
        <p role="alert" className="text-red-700">
          {errorMessage(query.error)}
        </p>
      )}
      {query.data &&
        students.map((student) => {
          const feedback = query.data.find((f) => f.studentId === student.id);
          return (
            <FeedbackRow
              key={`${student.id}-${date}-${feedback?.updatedAt ?? "new"}`}
              groupId={groupId}
              date={date}
              student={student}
              feedback={feedback}
              onBook={(f) => setBooking({ ...f, student })}
            />
          );
        })}
      {!students.length && <p>В группе пока нет учеников.</p>}
      {booking && (
        <BookingForm feedback={booking} onClose={() => setBooking(null)} />
      )}
    </section>
  );
}
function FeedbackRow({
  groupId,
  date,
  student,
  feedback,
  onBook,
}: {
  groupId: string;
  date: string;
  student: Person;
  feedback?: Feedback;
  onBook: (f: Feedback) => void;
}) {
  const client = useQueryClient();
  const [understanding, setUnderstanding] = useState<Understanding>(
    feedback?.understanding ?? "UNDERSTOOD",
  );
  const [topic, setTopic] = useState(feedback?.topic ?? "");
  const [comment, setComment] = useState(feedback?.comment ?? "");
  const [privateNote, setPrivateNote] = useState(feedback?.privateNote ?? "");
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function save(book: boolean) {
    setBusy(true);
    setError("");
    try {
      const result = await api.post("/support/feedback", {
        groupId,
        studentId: student.id,
        date,
        understanding,
        topic,
        comment,
        privateNote,
      });
      await client.invalidateQueries({ queryKey: ["support"] });
      if (book) onBook(result.data.data as Feedback);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void save(false);
      }}
      className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 text-slate-900"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-semibold">{student.fullName}</h3>
        <span className="text-xs text-slate-500">
          {feedback ? "Отзыв сохранён" : "Отзыва пока нет"}
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          Тема урока
          <input
            required
            maxLength={300}
            className={field}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </label>
        <label className="text-sm">
          Как понял тему
          <select
            className={field}
            value={understanding}
            onChange={(e) => setUnderstanding(e.target.value as Understanding)}
          >
            {Object.entries(understandingLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="block text-sm">
        Отзыв для ученика и родителей
        <textarea
          maxLength={2000}
          className={field}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Что получилось и над чем поработать"
        />
      </label>
      <label className="block text-sm">
        Внутренняя заметка для преподавателей
        <textarea
          maxLength={2000}
          className={field}
          value={privateNote}
          onChange={(e) => setPrivateNote(e.target.value)}
        />
      </label>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <button disabled={busy || !topic.trim()} className={button}>
          {busy ? "Сохраняем…" : "Сохранить отзыв"}
        </button>
        <button
          type="button"
          disabled={busy || !topic.trim()}
          className={secondary}
          onClick={() => void save(true)}
        >
          Сохранить и записать к суппорту
        </button>
      </div>
    </form>
  );
}
