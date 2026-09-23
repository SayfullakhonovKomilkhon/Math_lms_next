"use client";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  Overview,
  Window,
  button,
  dateTime,
  errorMessage,
  field,
  secondary,
} from "./support-api";
import { SupportModal } from "./SupportModal";
const days = [
  "Воскресенье",
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
];
function time(minute: number) {
  return `${Math.floor(minute / 60)
    .toString()
    .padStart(2, "0")}:${(minute % 60).toString().padStart(2, "0")}`;
}
function minute(value: string) {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}
export function AvailabilityEditor({
  data,
  onClose,
}: {
  data: Overview;
  onClose: () => void;
}) {
  const client = useQueryClient();
  const [windows, setWindows] = useState<Window[]>(
    data.availability.map(
      ({ weekday, startMinute, endMinute, duration, capacity, location }) => ({
        weekday,
        startMinute,
        endMinute,
        duration,
        capacity,
        location,
      }),
    ),
  );
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState("");
  const [from, setFrom] = useState(""),
    [to, setTo] = useState(""),
    [reason, setReason] = useState("");
  async function action(work: () => Promise<unknown>) {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await work();
      await client.invalidateQueries({ queryKey: ["support"] });
      await client.invalidateQueries({ queryKey: ["support-slots"] });
      await client.invalidateQueries({ queryKey: ["support-teachers"] });
      setSuccess("Изменения сохранены");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  function edit(index: number, patch: Partial<Window>) {
    setWindows((w) =>
      w.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }
  return (
    <SupportModal
      title="Моя доступность для дополнительных занятий"
      onClose={onClose}
    >
      <p className="mb-4 text-sm text-slate-600">
        Время — Ташкент. Добавьте отдельные окна до и после перерыва. Основные
        уроки автоматически исключаются при записи. Уже созданные занятия
        сохраняют своё время, место и вместимость.
      </p>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          void action(() => api.put("/support/availability", { windows }));
        }}
      >
        {windows.map((w, i) => (
          <fieldset
            key={i}
            className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 p-3"
          >
            <legend className="px-1 text-sm">Окно {i + 1}</legend>
            <label className="col-span-2 text-sm">
              День недели
              <select
                className={field}
                value={w.weekday}
                onChange={(e) => edit(i, { weekday: Number(e.target.value) })}
              >
                {days.map((day, n) => (
                  <option key={day} value={n}>
                    {day}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              С
              <input
                required
                type="time"
                className={field}
                value={time(w.startMinute)}
                onChange={(e) =>
                  edit(i, { startMinute: minute(e.target.value) })
                }
              />
            </label>
            <label className="text-sm">
              До
              <input
                required
                type="time"
                className={field}
                value={time(w.endMinute)}
                onChange={(e) => edit(i, { endMinute: minute(e.target.value) })}
              />
            </label>
            <label className="text-sm">
              Длительность, мин
              <input
                required
                type="number"
                min={15}
                max={180}
                className={field}
                value={w.duration}
                onChange={(e) => edit(i, { duration: Number(e.target.value) })}
              />
            </label>
            <label className="text-sm">
              Количество мест
              <input
                required
                type="number"
                min={2}
                max={30}
                className={field}
                value={w.capacity}
                onChange={(e) => edit(i, { capacity: Number(e.target.value) })}
              />
            </label>
            <label className="col-span-2 text-sm">
              Место / кабинет
              <input
                required
                maxLength={300}
                className={field}
                value={w.location}
                onChange={(e) => edit(i, { location: e.target.value })}
              />
            </label>
            <button
              type="button"
              className={secondary}
              disabled={busy}
              onClick={() => setWindows((w) => w.filter((_, n) => n !== i))}
            >
              Убрать окно
            </button>
          </fieldset>
        ))}
        {!windows.length && (
          <p className="text-sm">Новые окна пока не опубликованы.</p>
        )}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy || windows.length >= 28}
            className={secondary}
            onClick={() =>
              setWindows((w) => [
                ...w,
                {
                  weekday: 1,
                  startMinute: 900,
                  endMinute: 1080,
                  duration: 60,
                  capacity: 6,
                  location: "",
                },
              ])
            }
          >
            Добавить окно
          </button>
          <button className={button} disabled={busy}>
            Сохранить доступность
          </button>
        </div>
      </form>
      <h3 className="mb-2 mt-7 font-semibold">Отсутствие / выходной</h3>
      <p className="mb-3 text-sm text-slate-600">
        Если уже есть записи, сначала перенесите или отмените их.
      </p>
      <form
        className="grid gap-3 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          void action(() =>
            api.post("/support/time-off", {
              startAt: new Date(`${from}:00+05:00`).toISOString(),
              endAt: new Date(`${to}:00+05:00`).toISOString(),
              reason,
            }),
          );
        }}
      >
        <label className="text-sm">
          С
          <input
            type="datetime-local"
            required
            className={field}
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label className="text-sm">
          До
          <input
            type="datetime-local"
            required
            className={field}
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
        <label className="text-sm sm:col-span-2">
          Причина
          <input
            required
            maxLength={500}
            className={field}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </label>
        <button className={secondary} disabled={busy}>
          Закрыть время для записи
        </button>
      </form>
      <ul className="mt-4 space-y-3">
        {data.timeOff.map((t) => (
          <li key={t.id} className="rounded-xl bg-slate-50 p-3 text-sm">
            <p>
              {dateTime(t.startAt)} — {dateTime(t.endAt)}
            </p>
            <p>{t.reason}</p>
            <button
              type="button"
              className={`${secondary} mt-2`}
              disabled={busy}
              onClick={() =>
                void action(() => api.delete(`/support/time-off/${t.id}`))
              }
            >
              Убрать отсутствие
            </button>
          </li>
        ))}
      </ul>
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="mt-3 text-sm text-emerald-700">
          {success}
        </p>
      )}
    </SupportModal>
  );
}
