'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InputField, SelectField } from '@/components/ui/input-field';
import { PageHeader } from '@/components/ui/page-header';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AuditRecord {
  id: string; action: string; entity: string; entityId: string | null;
  details: unknown; createdAt: string;
  user: { phone: string; role: string };
}
interface AuditResponse { total: number; records: AuditRecord[] }

const ACTION_COLORS: Record<string, 'green' | 'red' | 'yellow' | 'blue' | 'gray'> = {
  CREATE: 'green', CREATE_PAYMENT: 'green', CONFIRM_PAYMENT: 'green',
  UPDATE: 'blue', UPDATE_SETTINGS: 'blue',
  ARCHIVE: 'yellow', DEACTIVATE_USER: 'yellow', REJECT_PAYMENT: 'yellow',
  DELETE: 'red',
};

const ACTION_OPTIONS = [
  'CREATE', 'UPDATE', 'ARCHIVE', 'DELETE',
  'CREATE_PAYMENT', 'CONFIRM_PAYMENT', 'REJECT_PAYMENT',
  'UPDATE_SETTINGS', 'DEACTIVATE_USER',
];

const LIMIT = 50;

export default function AuditPage() {
  const [page, setPage] = useState(0);
  const [action, setAction] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const { data, isLoading } = useQuery<AuditResponse>({
    queryKey: ['sa-audit', page, action, from, to],
    queryFn: () => {
      const params = new URLSearchParams({
        limit: String(LIMIT),
        offset: String(page * LIMIT),
      });
      if (action) params.append('action', action);
      if (from) params.append('from', from);
      if (to) params.append('to', to);
      return api.get(`/users/audit-log?${params}`).then((r) => r.data.data);
    },
  });

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 0;

  const hasFilters = action || from || to;
  const resetFilters = () => { setAction(''); setFrom(''); setTo(''); setPage(0); };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Журнал действий"
        description={`Всего записей: ${data?.total ?? '...'}`}
      />

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs text-slate-500">Действие</label>
          <SelectField
            accent="admin"
            value={action}
            onChange={(e) => { setAction(e.target.value); setPage(0); }}
            className="w-52"
          >
            <option value="">Все действия</option>
            {ACTION_OPTIONS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </SelectField>
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500">От</label>
          <InputField
            accent="admin" type="date"
            value={from}
            onChange={(e) => { setFrom(e.target.value); setPage(0); }}
            className="w-36"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500">До</label>
          <InputField
            accent="admin" type="date"
            value={to}
            onChange={(e) => { setTo(e.target.value); setPage(0); }}
            className="w-36"
          />
        </div>
        {hasFilters && (
          <Button variant="ghost" onClick={resetFilters}>
            Сбросить
          </Button>
        )}
      </div>

      <Card>
        {isLoading ? (
          <p className="py-10 text-center text-sm text-slate-400">Загрузка...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-xs text-slate-500">
                  <th className="px-4 py-3 text-left font-medium">Дата/время</th>
                  <th className="px-4 py-3 text-left font-medium">Пользователь</th>
                  <th className="px-4 py-3 text-left font-medium">Роль</th>
                  <th className="px-4 py-3 text-left font-medium">Действие</th>
                  <th className="px-4 py-3 text-left font-medium">Объект</th>
                  <th className="px-4 py-3 text-left font-medium">ID</th>
                </tr>
              </thead>
              <tbody>
                {data?.records.map((r) => (
                  <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="whitespace-nowrap px-4 py-2.5 text-xs text-slate-500">
                      {formatDate(r.createdAt)}
                    </td>
                    <td className="px-4 py-2.5 text-slate-800">{r.user.phone}</td>
                    <td className="px-4 py-2.5">
                      <Badge variant="gray" className="text-xs">{r.user.role}</Badge>
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge variant={ACTION_COLORS[r.action] ?? 'gray'} className="font-mono text-xs">
                        {r.action}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">{r.entity}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-slate-400">
                      {r.entityId ? r.entityId.slice(0, 12) + '…' : '—'}
                    </td>
                  </tr>
                ))}
                {!data?.records.length && (
                  <tr><td colSpan={6} className="py-10 text-center text-slate-400">Нет записей</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Страница {page + 1} из {totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
