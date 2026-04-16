'use client';

import {
  CartesianGrid, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';

interface DataPoint { month: string; percentage: number }
interface Props { data: DataPoint[] }

function lineColor(data: DataPoint[]): string {
  if (!data.length) return '#7c3aed';
  const avg = data.reduce((s, d) => s + d.percentage, 0) / data.length;
  if (avg >= 80) return '#16a34a';
  if (avg >= 60) return '#d97706';
  return '#dc2626';
}

export function AttendanceLineChart({ data }: Props) {
  const color = lineColor(data);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
        <YAxis
          domain={[0, 100]}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11 }}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip
          formatter={(v) => [`${v}%`, 'Посещаемость']}
          contentStyle={{ borderRadius: 8, fontSize: 12 }}
        />
        <Line type="monotone" dataKey="percentage" stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
