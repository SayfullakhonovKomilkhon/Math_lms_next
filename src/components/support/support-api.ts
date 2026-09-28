import axios from "axios";
export type Understanding = "UNDERSTOOD" | "PRACTICE" | "NEEDS_HELP" | "ABSENT";
export const understandingLabels: Record<Understanding, string> = {
  UNDERSTOOD: "Понял тему",
  PRACTICE: "Нужна практика",
  NEEDS_HELP: "Нужна помощь",
  ABSENT: "Отсутствовал",
};
export const statusLabels = {
  BOOKED: "Записан",
  COMPLETED: "Завершено",
  NO_SHOW: "Не пришёл",
  CANCELLED: "Отменено",
};
export type Person = { id: string; fullName: string };
export type Feedback = {
  id: string;
  groupId: string;
  studentId: string;
  teacherId: string;
  date: string;
  topic: string;
  understanding: Understanding;
  comment: string;
  privateNote?: string;
  updatedAt: string;
  student?: Person;
  teacher?: Person;
  group?: { id: string; name: string };
};
export type Window = {
  weekday: number;
  startMinute: number;
  endMinute: number;
  duration: number;
  capacity: number;
  location: string;
};
export type TimeOff = {
  id: string;
  startAt: string;
  endAt: string;
  reason: string;
};
export type Slot = {
  startAt: string;
  endAt: string;
  location: string;
  remaining: number;
  capacity: number;
};
export type Booking = {
  id: string;
  student: Person;
  feedback: Feedback;
  task: string;
  referrer: Person;
  session: {
    teacher: Person;
    teacherId: string;
    startAt: string;
    endAt: string;
    location: string;
    capacity: number;
  };
  status: keyof typeof statusLabels;
  outcome: "RESOLVED" | "NEEDS_MORE" | null;
  result: string;
  changeReason: string;
};
export type Overview = {
  directions: Direction[];
  isSupport: boolean;
  teacherId?: string;
  feedback: Feedback[];
  bookings: Booking[];
  availability: Window[];
  timeOff: TimeOff[];
};
export function today() {
  return new Date(Date.now() + 5 * 3600000).toISOString().slice(0, 10);
}
export function dateTime(value: string) {
  return new Date(value).toLocaleString("ru-RU", {
    timeZone: "Asia/Tashkent",
    dateStyle: "medium",
    timeStyle: "short",
  });
}
export function dateLabel(value: string) {
  return new Date(value).toLocaleDateString("ru-RU", {
    timeZone: "Asia/Tashkent",
    dateStyle: "medium",
  });
}
export function errorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) return message.join(". ");
    if (typeof message === "string") return message;
  }
  return "Не удалось выполнить действие. Попробуйте ещё раз.";
}
export const field =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900";
export const button =
  "rounded-xl bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed";
export const secondary =
  "rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50";

export const directionLabels = { NEW: 'Новое', IN_PROGRESS: 'В работе', COMPLETED: 'Завершено', CANCELLED: 'Отменено' };
export type Direction = { id: string; teacherId: string; referrerId: string; teacher: Person; referrer: Person; feedback: Feedback & { student: Person }; status: keyof typeof directionLabels; result: string; outcome: 'RESOLVED' | 'NEEDS_MORE' | null; createdAt: string };
