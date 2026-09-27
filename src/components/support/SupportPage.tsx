"use client";
import { FeedbackStatistics } from "./FeedbackStatistics";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from '@/hooks/useAuth';
import api from "@/lib/api";
import { AvailabilityEditor } from "./AvailabilityEditor";
import { BookingForm } from "./BookingForm";
import { SupportModal } from "./SupportModal";
import {
  Booking,
  Feedback,
  Overview,
  button,
  dateTime,
  errorMessage,
  field,
  secondary,
  statusLabels,
  today,
} from "./support-api";

export function SupportPage({ staff = false }: { staff?: boolean }) {
  const { user } = useAuth();
  const [tab, setTab] = useState<"today" | "upcoming" | "history" | "feedback">(
    staff ? "today" : "upcoming",
  );
  const [onlyMine, setOnlyMine] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [availability, setAvailability] = useState(false);
  const [bookingForm, setBookingForm] = useState<{
    feedback: Feedback;
    booking?: Booking;
  } | null>(null);
  const [actionForm, setActionForm] = useState<{
    booking: Booking;
    type: "cancel" | "result";
  } | null>(null);
  const query = useQuery({
    queryKey: ["support", "overview", user?.id],
    queryFn: () => api.get("/support/me").then((r) => r.data.data as Overview),
    enabled: !!user,
    refetchInterval: 60000,
  });
  const data = query.data;
  const students = data
    ? [
        ...new Map(
          [
            ...data.feedback.map((f) => f.student),
            ...data.bookings.map((b) => b.student),
          ]
            .filter((s) => !!s)
            .map((s) => [s.id, s]),
        ).values(),
      ]
    : [];
  const bookings = data?.bookings.filter((b) => {
    if (studentId && b.student.id !== studentId) return false;
    if (staff && onlyMine && b.session.teacherId !== data.teacherId)
      return false;
    const future = b.status === "BOOKED";
    const day = new Date(Date.parse(b.session.startAt) + 5 * 3600000)
      .toISOString()
      .slice(0, 10);
    return tab === "today"
      ? day === today() && future
      : tab === "upcoming"
        ? future
        : !future;
  });
  return (
    <main className="mx-auto max-w-5xl space-y-5 p-4 pb-24 text-slate-900 md:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            {staff ? (data?.isSupport ? "Панель суппорта" : "Отзывы и направления") : "Отзывы и помощь"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Бесплатные дополнительные занятия · время Ташкента
          </p>
        </div>
        {staff && data?.isSupport && (
          <button className={button} onClick={() => setAvailability(true)}>
            Моя доступность
          </button>
        )}
      </header>
      {staff && (
        <p className="rounded-xl bg-emerald-50 p-3 text-sm">
          {data?.isSupport ? 'Публикуйте свободное время, чтобы коллеги могли записывать учеников к вам.' : 'Вы можете направлять учеников к суппортам. Проводить новые дополнительные занятия можно после назначения администратором. Ранее назначенные вам занятия остаются доступны.'}
          {' '}Отзыв и запись доступны из кружка посещаемости или вкладки «Статистика» в группе.
        </p>
      )}
      <nav aria-label="Разделы помощи" className="flex flex-wrap gap-2">
        {(
          [
            ["today", "Сегодня"],
            ["upcoming", "Записи"],
            ["history", "История занятий"],
            ...(staff ? [["feedback", "Статистика"] as const] : []),
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={tab === id ? button : secondary}
            aria-pressed={tab === id}
          >
            {label}
          </button>
        ))}
      </nav>
      {staff && tab !== "feedback" && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={onlyMine}
            onChange={(e) => setOnlyMine(e.target.checked)}
          />
          Только занятия, которые провожу я
        </label>
      )}
      {students.length > 1 && (
        <label className="block max-w-sm text-sm">
          Ученик
          <select
            className={field}
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          >
            <option value="">Все ученики</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.fullName}
              </option>
            ))}
          </select>
        </label>
      )}
      {query.isLoading && <p>Загружаем расписание…</p>}
      {query.isError && (
        <div role="alert" className="rounded-xl bg-red-50 p-4">
          <p>{errorMessage(query.error)}</p>
          <button
            className={`${secondary} mt-2`}
            onClick={() => void query.refetch()}
          >
            Повторить
          </button>
        </div>
      )}
      {staff && tab === "feedback" && <FeedbackStatistics />}
      {data && tab !== "feedback" && (
        <>
          {tab === "history" && (
            <p className="text-xs text-slate-500">
              Занятия за последние 90 дней
            </p>
          )}
          {bookings?.map((b) => (
            <article
              key={b.id}
              className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div className="flex flex-wrap justify-between gap-2">
                <h2 className="font-semibold">
                  {b.student.fullName} · {b.feedback.topic}
                </h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs">
                  {statusLabels[b.status]}
                </span>
              </div>
              <p className="font-medium">
                {dateTime(b.session.startAt)} —{" "}
                {new Date(b.session.endAt).toLocaleTimeString("ru-RU", {
                  timeZone: "Asia/Tashkent",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p className="text-sm text-slate-600">
                Суппорт: {b.session.teacher.fullName} · {b.session.location}
              </p>
              <p className="text-sm text-slate-500">
                Направил: {b.referrer.fullName}
              </p>
              <p className="whitespace-pre-wrap text-sm">Задача: {b.task}</p>
              {staff && b.feedback.privateNote && (
                <p className="whitespace-pre-wrap rounded-lg bg-amber-50 p-2 text-sm">
                  Внутренняя заметка: {b.feedback.privateNote}
                </p>
              )}
              {b.result && (
                <p className="whitespace-pre-wrap rounded-lg bg-emerald-50 p-3 text-sm">
                  {b.outcome === "RESOLVED"
                    ? "Тема усвоена. "
                    : b.outcome === "NEEDS_MORE"
                      ? "Нужна ещё помощь. "
                      : ""}
                  {b.result}
                </p>
              )}
              {b.changeReason && (
                <p className="text-sm text-slate-500">
                  Причина изменения: {b.changeReason}
                </p>
              )}
              {staff && (
                <div className="flex flex-wrap gap-2">
                  {b.status === "BOOKED" && (
                    <>
                      <button
                        className={secondary}
                        onClick={() =>
                          setBookingForm({ feedback: b.feedback, booking: b })
                        }
                      >
                        Перенести
                      </button>
                      <button
                        className={secondary}
                        onClick={() =>
                          setActionForm({ booking: b, type: "cancel" })
                        }
                      >
                        Отменить
                      </button>
                      {b.session.teacherId === data.teacherId &&
                        Date.parse(b.session.endAt) <= query.dataUpdatedAt && (
                          <button
                            className={button}
                            onClick={() =>
                              setActionForm({ booking: b, type: "result" })
                            }
                          >
                            Отметить результат
                          </button>
                        )}
                    </>
                  )}
                  {(b.status === "NO_SHOW" || b.outcome === "NEEDS_MORE") && (
                    <button
                      className={button}
                      onClick={() =>
                        setBookingForm({
                          feedback: { ...b.feedback, student: b.student },
                        })
                      }
                    >
                      Записать повторно
                    </button>
                  )}
                </div>
              )}
            </article>
          ))}
          {bookings?.length === 0 && (
            <Empty
              text={
                tab === "today"
                  ? "На сегодня записей нет."
                  : "В этом разделе пока нет занятий."
              }
            />
          )}
        </>
      )}
      {availability && data?.isSupport && (
        <AvailabilityEditor
          data={data}
          onClose={() => setAvailability(false)}
        />
      )}
      {bookingForm && (
        <BookingForm {...bookingForm} onClose={() => setBookingForm(null)} />
      )}
      {actionForm && (
        <ActionForm {...actionForm} onClose={() => setActionForm(null)} />
      )}
    </main>
  );
}
function Empty({ text }: { text: string }) {
  return (
    <p className="rounded-2xl border border-dashed bg-white p-8 text-center text-sm text-slate-500">
      {text}
    </p>
  );
}
function ActionForm({
  booking,
  type,
  onClose,
}: {
  booking: Booking;
  type: "cancel" | "result";
  onClose: () => void;
}) {
  const client = useQueryClient();
  const [text, setText] = useState(""),
    [status, setStatus] = useState("COMPLETED"),
    [outcome, setOutcome] = useState("RESOLVED");
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <SupportModal
      title={type === "cancel" ? "Отменить запись" : "Результат занятия"}
      onClose={onClose}
    >
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          try {
            await api.post(
              `/support/bookings/${booking.id}/${type}`,
              type === "cancel"
                ? { reason: text }
                : { status, outcome, result: text },
            );
            await client.invalidateQueries({ queryKey: ["support"] });
            await client.invalidateQueries({ queryKey: ["support-slots"] });
            onClose();
          } catch (error) {
            setError(errorMessage(error));
          } finally {
            setBusy(false);
          }
        }}
      >
        <p>
          {booking.student.fullName} · {dateTime(booking.session.startAt)}
        </p>
        {type === "result" && (
          <>
            <label className="block text-sm">
              Посещение
              <select
                className={field}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="COMPLETED">Присутствовал</option>
                <option value="NO_SHOW">Не пришёл</option>
              </select>
            </label>
            {status === "COMPLETED" && (
              <label className="block text-sm">
                Понимание темы
                <select
                  className={field}
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                >
                  <option value="RESOLVED">Тема усвоена</option>
                  <option value="NEEDS_MORE">Нужна ещё помощь</option>
                </select>
              </label>
            )}
          </>
        )}
        <label className="block text-sm">
          {type === "cancel" ? "Причина отмены" : "Итог и рекомендации"}
          <textarea
            required
            maxLength={type === "cancel" ? 500 : 2000}
            className={field}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </label>
        <p className="text-xs text-slate-500">
          Информация будет доступна ученику, родителям и преподавателю.
        </p>
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
        <button className={button} disabled={busy || !text.trim()}>
          {busy ? "Сохраняем…" : "Сохранить и уведомить"}
        </button>
      </form>
    </SupportModal>
  );
}
