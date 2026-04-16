'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  message?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = 'Не удалось загрузить данные',
  description = 'Проверьте подключение и попробуйте снова.',
  onRetry,
}: ErrorStateProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
      return;
    }

    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <Card className="border-red-200/80">
      <CardContent className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
        <div className="rounded-full bg-red-50 p-3 text-red-600">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <p className="text-base font-semibold text-slate-900">{message}</p>
          <p className="max-w-md text-sm text-slate-500">{description}</p>
        </div>
        <Button variant="outline" onClick={handleRetry}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Попробовать снова
        </Button>
      </CardContent>
    </Card>
  );
}

