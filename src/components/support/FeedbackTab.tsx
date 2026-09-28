"use client";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Feedback, Person, button, errorMessage, field, secondary } from "./support-api";
export { FeedbackStatistics as FeedbackTab } from "./FeedbackStatistics";

export function FeedbackRow({
  groupId,
  date,
  student,
  feedback,
  onBook,
  defaultTopic = "",
  onSaved,
}: {
  groupId: string;
  date: string;
  student: Person;
  feedback?: Feedback;
  onBook: (f: Feedback) => void;
  defaultTopic?: string;
  onSaved?: () => void;
}) {
  const client = useQueryClient();
  const [topic, setTopic] = useState(feedback?.topic ?? defaultTopic);
  const [comment, setComment] = useState(feedback?.comment ?? "");
  const privateNote = feedback?.privateNote ?? "";
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
        understanding: "NEEDS_HELP",
        topic,
        comment,
        privateNote,
      });
      await client.invalidateQueries({ queryKey: ["support"] });
      if (book) onBook(result.data.data as Feedback);
      else onSaved?.();
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
      <div className="grid gap-3">
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
      </div>
      <label className="block text-sm">
        Отзыв учителя
        <textarea
          required
          maxLength={2000}
          className={field}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Что ученик не понял и над чем нужно поработать"
        />
      </label>
      <p className="text-xs text-slate-500">Отзыв доступен только преподавателям. Ученик появится в статистике как нуждающийся в помощи.</p>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <button disabled={busy || !topic.trim() || !comment.trim()} className={button}>
          {busy ? "Сохраняем…" : "Сохранить отзыв"}
        </button>
        <button
          type="button"
          disabled={busy || !topic.trim() || !comment.trim()}
          className={secondary}
          onClick={() => void save(true)}
        >
          Сохранить и направить к суппорту
        </button>
      </div>
    </form>
  );
}
