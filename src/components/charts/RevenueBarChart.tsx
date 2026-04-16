'use client';

import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/format';

interface DataPoint { month: string; revenue: number; count?: number }

interface Props {
  data: DataPoint[];
  year: number;
  onYearChange: (y: number) => void;
}

export function RevenueBarChart({ data, year, onYearChange }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end gap-1">
        <Button variant="ghost" size="icon" onClick={() => onYearChange(year - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="min-w-[48px] text-center text-sm font-semibold text-slate-700">{year}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onYearChange(year + 1)}
          disabled={year >= new Date().getFullYear()}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10 }}
            tickFormatter={(v) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : `${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            formatter={(value, name) => [
              name === 'revenue' ? formatCurrency(Number(value)) : value,
              name === 'revenue' ? 'Выручка' : 'Оплат',
            ]}
            contentStyle={{ borderRadius: 8, fontSize: 12 }}
          />
          <Bar dataKey="revenue" fill="#1565C0" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
