"use client";
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Direction, button, secondary, field, dateLabel, directionLabels, errorMessage } from './support-api';
import { SupportModal } from './SupportModal';
export function DirectionsPanel({ directions, teacherId }: { directions: Direction[]; teacherId?: string }) {
  const [filter, setFilter] = useState<'active' | 'history'>('active');
  const [action, setAction] = useState<{ row: Direction; type: 'start' | 'result' | 'cancel' } | null>(null);
  const rows = directions.filter(d => (filter === 'active') === ['NEW', 'IN_PROGRESS'].includes(d.status));
  return <section className="space-y-4">
    <div className="flex gap-2"><button className={filter === 'active' ? button : secondary} onClick={() => setFilter('active')}>Активные</button><button className={filter === 'history' ? button : secondary} onClick={() => setFilter('history')}>История направлений</button></div>
    {rows.map(row => <article key={row.id} className="space-y-3 rounded-xl border bg-white p-4">
      <div className="flex justify-between gap-3"><h2 className="font-semibold">{row.feedback.student.fullName}</h2><span>{directionLabels[row.status]}</span></div>
      <p className="font-medium">{row.feedback.topic}</p>
      <p className="text-xs text-slate-500">Урок: {dateLabel(row.feedback.date)} · {row.feedback.group?.name}</p>
      <p className="whitespace-pre-wrap">{row.feedback.comment}</p>
      {row.feedback.privateNote && <p className="whitespace-pre-wrap text-sm">{row.feedback.privateNote}</p>}
      <p className="text-sm">Суппорт: {row.teacher.fullName} · Направил: {row.referrer.fullName}</p>
      {row.result && <p className="whitespace-pre-wrap rounded-lg bg-emerald-50 p-3">{row.outcome === 'RESOLVED' ? 'Тема усвоена. ' : row.outcome === 'NEEDS_MORE' ? 'Нужна ещё помощь. ' : ''}{row.result}</p>}
      {['NEW', 'IN_PROGRESS'].includes(row.status) && <div className="flex flex-wrap gap-2">
        {row.teacherId === teacherId && <>{row.status === 'NEW' && <button className={button} onClick={() => setAction({row,type:'start'})}>Взять в работу</button>}<button className={secondary} onClick={() => setAction({row,type:'result'})}>Отметить результат</button></>}
        <button className={secondary} onClick={() => setAction({row,type:'cancel'})}>Отменить направление</button>
      </div>}
    </article>)}
    {!rows.length && <p className="rounded-xl bg-slate-50 p-4">В этом разделе пока нет направлений.</p>}
    {action && <DirectionAction {...action} onClose={() => setAction(null)} />}
  </section>;
}
function DirectionAction({ row, type, onClose }: { row: Direction; type: 'start' | 'result' | 'cancel'; onClose: () => void }) {
  const client = useQueryClient(); const [result,setResult]=useState(''); const [outcome,setOutcome]=useState('RESOLVED'); const [busy,setBusy]=useState(false); const [error,setError]=useState('');
  async function submit(e: React.FormEvent) { e.preventDefault();setBusy(true);setError('');try { await api.post(`/support/directions/${row.id}/${type}`,type === 'start' ? {} : type === 'cancel' ? {reason:result} : {result,outcome});await client.invalidateQueries({queryKey:['support']});onClose(); }catch(e){setError(errorMessage(e));}finally{setBusy(false);} }
  return <SupportModal title={type === 'start' ? 'Взять в работу' : type === 'result' ? 'Результат работы' : 'Отмена направления'} onClose={onClose}><form onSubmit={submit} className="space-y-4"><p>{row.feedback.student.fullName} · {row.feedback.topic}</p>{type === 'result' && <label className="block">Итог<select className={field} value={outcome} onChange={e=>setOutcome(e.target.value)}><option value="RESOLVED">Тема усвоена</option><option value="NEEDS_MORE">Нужна ещё помощь</option></select></label>}{type !== 'start' && <label className="block">{type === 'cancel' ? 'Причина' : 'Результат'}<textarea required maxLength={type === 'cancel' ? 500 : 2000} className={field} value={result} onChange={e=>setResult(e.target.value)} /></label>}{error && <p role="alert">{error}</p>}<button className={button} disabled={busy || (type !== 'start' && !result.trim())}>{busy ? 'Сохраняем…' : 'Подтвердить'}</button></form></SupportModal>;
}
