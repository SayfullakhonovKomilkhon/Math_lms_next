import { cn } from '@/lib/utils';
import { PaymentRecordStatus, AttendanceStatus } from '@/types';

interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | 'green'
    | 'red'
    | 'yellow'
    | 'gray'
    | 'blue'
    | 'violet'
    | 'outline'
    | 'secondary'
    | 'destructive';
  className?: string;
}

export function Badge({ children, variant = 'gray', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variant === 'green' && 'bg-green-100 text-green-800',
        variant === 'red' && 'bg-red-100 text-red-800',
        variant === 'yellow' && 'bg-yellow-100 text-yellow-800',
        variant === 'gray' && 'bg-gray-100 text-gray-800',
        variant === 'blue' && 'bg-blue-100 text-blue-800',
        variant === 'violet' && 'bg-violet-100 text-violet-800',
        variant === 'outline' && 'border border-slate-200 bg-white text-slate-700',
        variant === 'secondary' && 'bg-slate-100 text-slate-700',
        variant === 'destructive' && 'bg-red-100 text-red-700',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentRecordStatus }) {
  const map: Record<PaymentRecordStatus, { label: string; variant: BadgeProps['variant'] }> = {
    PENDING: { label: 'Ожидает', variant: 'yellow' },
    CONFIRMED: { label: 'Подтверждён', variant: 'green' },
    REJECTED: { label: 'Отклонён', variant: 'red' },
  };
  const { label, variant } = map[status];
  return <Badge variant={variant}>{label}</Badge>;
}

export function AttendanceBadge({ status }: { status: AttendanceStatus }) {
  const map: Record<AttendanceStatus, { label: string; variant: BadgeProps['variant'] }> = {
    PRESENT: { label: 'Присутствовал', variant: 'green' },
    ABSENT: { label: 'Отсутствовал', variant: 'red' },
    LATE: { label: 'Опоздал', variant: 'yellow' },
  };
  const { label, variant } = map[status];
  return <Badge variant={variant}>{label}</Badge>;
}
