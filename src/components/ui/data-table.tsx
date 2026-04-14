import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface DataTableProps {
  children: React.ReactNode;
  className?: string;
}

/** Обёртка: карточка + горизонтальный скролл для таблицы */
export function DataTable({ children, className }: DataTableProps) {
  return (
    <Card className={cn('overflow-hidden p-0', className)}>
      <div className="overflow-x-auto">{children}</div>
    </Card>
  );
}

export function DataTableHead({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={cn('border-b border-slate-200 bg-slate-50/90', className)} {...props}>
      <tr>{children}</tr>
    </thead>
  );
}

export function DataTableHeaderCell({
  className,
  children,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500',
        className,
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function DataTableRow({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        'border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/60',
        className,
      )}
      {...props}
    />
  );
}

export function DataTableCell({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('px-4 py-3 text-sm text-slate-700', className)} {...props} />;
}
