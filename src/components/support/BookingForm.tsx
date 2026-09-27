"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  Booking,
  Feedback,
  Person,
  Slot,
  button,
  dateTime,
  errorMessage,
  field,
} from "./support-api";
import { SupportModal } from "./SupportModal";
export function BookingForm({
  feedback,
  booking,
  onClose,
}: {
  feedback: Feedback;
  booking?: Booking;
  onClose: () => void;
}) {
  const client = useQueryClient();
  const [teacherId, setTeacherId] = useState(booking?.session.teacherId ?? "");
  const [startAt, setStartAt] = useState("");
  const [task, setTask] = useState(
    `Разобрать тему: ${feedback.topic}`,
  );
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const teachers = useQuery({
    queryKey: ["support-teachers"],
    queryFn: () =>
      api.get("/support/teachers").then((r) => r.data.data as Person[]),
  });
  const slots = useQuery({
    queryKey: ["support-slots", teacherId, feedback.id, booking?.id],
    enabled: !!teacherId,
    queryFn: () =>
      api
        .get("/support/slots", {
          params: {
            teacherId,
            feedbackId: feedback.id,
            bookingId: booking?.id,
          },
        })
        .then((r) => r.data.data as Slot[]),
    staleTime: 0,
  });
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (booking)
        await api.post(`/support/bookings/${booking.id}/move`, {
          teacherId,
          startAt,
          reason,
        });
      else
        await api.post("/support/bookings", {
          feedbackId: feedback.id,
          teacherId,
          startAt,
          task,
        });
      await client.invalidateQueries({ queryKey: ["support"] });
      await client.invalidateQueries({ queryKey: ["support-slots"] });
      onClose();
    } catch (e) {
      setError(errorMessage(e));
      setStartAt("");
      await slots.refetch();
    } finally {
      setBusy(false);
    }
  }
  return (
    <SupportModal
      title={booking ? "Перенести занятие" : "Записать к суппорту"}
      onClose={onClose}
    >
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-slate-600">
          {feedback.student?.fullName || booking?.student.fullName} ·{" "}
          {feedback.topic}
        </p>
        <p className="rounded-xl bg-emerald-50 p-3 text-sm">
          Бесплатное дополнительное занятие. Запись подтверждается сразу. Время
          — Ташкент.
        </p>
        <label className="block space-y-1">
          <span>Суппорт</span>
          <select
            required
            className={field}
            value={teacherId}
            onChange={(e) => {
              setTeacherId(e.target.value);
              setStartAt("");
            }}
          >
            <option value="">Выберите преподавателя</option>
            {teachers.data?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.fullName}
              </option>
            ))}
          </select>
        </label>
        {teachers.isError && <p role="alert">{errorMessage(teachers.error)}</p>}
        {teachers.data?.length === 0 && (
          <p>
            Нет доступных суппортов. Администратор должен назначить суппорта, а суппорт — опубликовать свободное время.
          </p>
        )}
        {teacherId && (
          <label className="block space-y-1">
            <span>Свободное время на ближайшие 28 дней</span>
            <select
              required
              className={field}
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
            >
              <option value="">
                {slots.isFetching ? "Проверяем расписание…" : "Выберите время"}
              </option>
              {slots.data?.map((s) => (
                <option key={s.startAt} value={s.startAt}>
                  {dateTime(s.startAt)} ·{" "}
                  {Math.round(
                    (Date.parse(s.endAt) - Date.parse(s.startAt)) / 60000,
                  )}{" "}
                  мин · {s.remaining} из {s.capacity} мест · {s.location}
                </option>
              ))}
            </select>
          </label>
        )}
        {teacherId && !slots.isFetching && slots.data?.length === 0 && (
          <p className="text-sm text-amber-800">
            Нет подходящих окон без пересечений с занятиями ученика и суппорта.
            Выберите другого преподавателя.
          </p>
        )}
        {slots.isError && <p role="alert">{errorMessage(slots.error)}</p>}
        <label className="block space-y-1">
          <span>{booking ? "Причина переноса" : "Что нужно разобрать"}</span>
          <textarea
            required
            maxLength={booking ? 500 : 2000}
            className={field}
            value={booking ? reason : task}
            onChange={(e) =>
              booking ? setReason(e.target.value) : setTask(e.target.value)
            }
          />
        </label>
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
        <button
          className={button}
          disabled={busy || !startAt || slots.isFetching}
        >
          {busy
            ? "Сохраняем…"
            : booking
              ? "Перенести и уведомить"
              : "Записать и уведомить"}
        </button>
      </form>
    </SupportModal>
  );
}
