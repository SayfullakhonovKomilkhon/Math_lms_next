'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, AlertTriangle } from 'lucide-react';

interface PaymentBannerProps {
  daysUntilPayment: number | null;
  status: string;
}

export function PaymentBanner({ daysUntilPayment, status }: PaymentBannerProps) {
  if (status === 'PAID') return null;

  if (daysUntilPayment !== null) {
    if (daysUntilPayment <= 0) {
      return (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Оплата просрочена!</AlertTitle>
          <AlertDescription>
            Пожалуйста, произведите оплату или свяжитесь с администратором.
          </AlertDescription>
        </Alert>
      );
    }

    if (daysUntilPayment <= 5) {
      return (
        <Alert className="mb-6 bg-yellow-50 border-yellow-200 text-yellow-800">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle>Приближается срок оплаты</AlertTitle>
          <AlertDescription>
            До следующей оплаты осталось {daysUntilPayment} {getDayWord(daysUntilPayment)}.
          </AlertDescription>
        </Alert>
      );
    }
  }

  return null;
}

function getDayWord(n: number) {
  const lastDigit = n % 10;
  const lastTwoDigits = n % 100;
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return 'дней';
  if (lastDigit === 1) return 'день';
  if (lastDigit >= 2 && lastDigit <= 4) return 'дня';
  return 'дней';
}
