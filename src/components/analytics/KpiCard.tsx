import { TrendingDown, TrendingUp, Minus, type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  valueClassName?: string;
}

export function KpiCard({
  title, value, subtitle, icon: Icon, iconClassName,
  trend, trendValue, valueClassName,
}: KpiCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-slate-500">{title}</p>
            <p className={`mt-1 text-2xl font-semibold leading-tight ${valueClassName ?? 'text-slate-900'}`}>
              {value}
            </p>
            {subtitle && (
              <p className="mt-0.5 truncate text-xs text-slate-400">{subtitle}</p>
            )}
            {trendValue && (
              <div className={`mt-1 flex items-center gap-1 text-xs font-medium ${
                trend === 'up' ? 'text-green-600' :
                trend === 'down' ? 'text-red-600' :
                'text-slate-400'
              }`}>
                {trend === 'up' && <TrendingUp className="h-3 w-3" />}
                {trend === 'down' && <TrendingDown className="h-3 w-3" />}
                {trend === 'neutral' && <Minus className="h-3 w-3" />}
                {trendValue}
              </div>
            )}
          </div>
          {Icon && (
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClassName ?? 'bg-violet-100 text-violet-600'}`}>
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
