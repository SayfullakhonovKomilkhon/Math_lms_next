'use client';

import { Badge } from '@/components/ui/badge';
import { PaymentRecordStatus } from '@/types';

interface PaymentStatusBadgeProps {
  status: PaymentRecordStatus | 'PAID' | 'UNPAID' | string;
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  switch (status) {
    case 'CONFIRMED':
    case 'PAID':
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Оплачено ✓</Badge>;
    case 'PENDING':
      return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">На проверке</Badge>;
    case 'REJECTED':
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Отклонено</Badge>;
    case 'UNPAID':
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Не оплачено</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}
