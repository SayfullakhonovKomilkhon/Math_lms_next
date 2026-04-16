'use client';

import {
  Bar, BarChart, CartesianGrid, Cell,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';

interface DataPoint { groupName: string; averageScore: number }
interface Props { data: DataPoint[] }

function barColor(score: number): string {
  if (score >= 80) return '#16a34a';
  if (score >= 60) return '#d97706';
  return '#dc2626';
}

export function GradesByGroupChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
        <XAxis
          type="number"
          domain={[0, 100]}
          tick={{ fontSize: 10 }}
          tickFormatter={(v) => `${v}%`}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="groupName"
          tick={{ fontSize: 10 }}
          width={90}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(v) => [`${v}%`, 'Средний балл']}
          contentStyle={{ borderRadius: 8, fontSize: 12 }}
        />
        <Bar dataKey="averageScore" radius={[0, 4, 4, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={barColor(entry.averageScore)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
