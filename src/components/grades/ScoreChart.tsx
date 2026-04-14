'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ru } from 'date-fns/locale';
import { format, parseISO } from 'date-fns';

interface ScoreChartProps {
  data: { month: string; averageScore: number }[];
}

export function ScoreChart({ data }: ScoreChartProps) {
  if (!data?.length) {
    return (
      <Card className="h-[350px] flex items-center justify-center text-slate-400 italic">
        Пока нет оценок для графика
      </Card>
    );
  }

  const formattedData = data.map((d) => ({
    ...d,
    monthName: format(parseISO(d.month + '-01'), 'MMM', { locale: ru }),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Динамика успеваемости</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="monthName" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#94a3b8' }} 
              />
              <YAxis 
                domain={[0, 100]} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '8px', 
                  border: 'none', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                }}
                formatter={(value) => [`${Number(value ?? 0)}%`, 'Средний балл']}
                labelFormatter={(label) => `Месяц: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="averageScore"
                stroke="#0d9488"
                strokeWidth={3}
                dot={{ r: 4, fill: '#0d9488', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
