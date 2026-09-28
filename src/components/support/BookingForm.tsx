"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Booking, Feedback, Person, button, errorMessage, field } from "./support-api";
import { SupportModal } from "./SupportModal";
import { LegacyBookingForm } from "./LegacyBookingForm";

export function BookingForm(props: { feedback: Feedback; booking?: Booking; onClose: () => void }) {
  if (props.booking) return <LegacyBookingForm {...props} />;
  return <DirectionForm feedback={props.feedback} onClose={props.onClose} />;
}
function DirectionForm({ feedback, onClose }: { feedback: Feedback; onClose: () => void }) {
  const client = useQueryClient();
  const [teacherId, setTeacherId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const teachers = useQuery({ queryKey: ["support-teachers"], staleTime: 0, refetchOnMount: "always", queryFn: () => api.get('/support/teachers').then(r => r.data.data as Person[]) });
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    try {
      await api.post('/support/directions', { feedbackId: feedback.id, teacherId });
      setSent(true);
      await client.invalidateQueries({ queryKey: ['support'] });
    } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); }
  }
  return <SupportModal title="Направить к суппорту" onClose={onClose}>
    {sent ? <div role="status" className="space-y-4"><p>Направление отправлено. Суппорт увидит ученика и отзыв в своей панели.</p><button className={button} onClick={onClose}>Готово</button></div> : <form onSubmit={submit} className="space-y-4">
      <p className="font-medium">{feedback.student?.fullName} · {feedback.topic}</p>
      <p className="whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-sm">{feedback.comment}</p>
      <p className="text-sm text-slate-500">Отзыв доступен преподавателям. Суппорт сам организует дальнейшую работу.</p>
      <label className="block space-y-1"><span>Суппорт</span><select required className={field} value={teacherId} onChange={e => setTeacherId(e.target.value)}><option value="">Выберите суппорта</option>{teachers.data?.map(t => <option key={t.id} value={t.id}>{t.fullName}</option>)}</select></label>
      {teachers.isPending && <p>Загрузка суппортов…</p>}
      {teachers.isError && <p role="alert">{errorMessage(teachers.error)}</p>}
      {teachers.data?.length === 0 && <p>Нет назначенных активных суппортов. Администратор должен включить переключатель у нужного преподавателя.</p>}
      {!feedback.comment.trim() && <p className="text-sm text-amber-800">Сначала добавьте отзыв учителя через кружок посещаемости.</p>}
      {error && <p role="alert" className="text-red-700">{error}</p>}
      <button className={button} disabled={busy || !teacherId || !feedback.comment.trim()}>{busy ? 'Отправляем…' : 'Направить к суппорту'}</button>
    </form>}
  </SupportModal>;
}
