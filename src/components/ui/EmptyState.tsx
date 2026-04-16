'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  message: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export function EmptyState({ icon = '•', message, description, action }: EmptyStateProps) {
  const actionButton = action ? (
    action.href ? (
      <Link href={action.href}>
        <Button>{action.label}</Button>
      </Link>
    ) : (
      <Button onClick={action.onClick}>{action.label}</Button>
    )
  ) : null;

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
        <div className="text-4xl leading-none">{icon}</div>
        <div className="space-y-1">
          <p className="text-base font-semibold text-slate-900">{message}</p>
          {description ? <p className="max-w-md text-sm text-slate-500">{description}</p> : null}
        </div>
        {actionButton}
      </CardContent>
    </Card>
  );
}

