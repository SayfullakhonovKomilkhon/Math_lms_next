'use client';

import { Card, CardContent } from '@/components/ui/card';

interface ResponsiveTableProps<T> {
  data: T[];
  renderDesktop: (data: T[]) => React.ReactNode;
  renderMobileCard: (item: T) => React.ReactNode;
  emptyState?: React.ReactNode;
}

export function ResponsiveTable<T>({
  data,
  renderDesktop,
  renderMobileCard,
  emptyState,
}: ResponsiveTableProps<T>) {
  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <>
      <div className="hidden md:block">{renderDesktop(data)}</div>
      <div className="space-y-3 md:hidden">
        {data.map((item, index) => (
          <Card key={index}>
            <CardContent className="p-4">{renderMobileCard(item)}</CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

