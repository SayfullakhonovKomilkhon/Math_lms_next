'use client';

import * as React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type MenuAccent = 'admin' | 'teacher';

const contentBase =
  'z-50 min-w-[12rem] overflow-hidden rounded-xl border border-slate-200/90 bg-white p-1 text-slate-900 shadow-lg';

const itemHighlight: Record<MenuAccent, string> = {
  admin:
    'data-[highlighted]:bg-indigo-50 data-[highlighted]:text-indigo-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
  teacher:
    'data-[highlighted]:bg-emerald-50 data-[highlighted]:text-emerald-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
};

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuGroup = DropdownMenuPrimitive.Group;

export const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> & {
    accent?: MenuAccent;
  }
>(({ className, sideOffset = 4, accent = 'admin', ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(contentBase, className)}
      data-accent={accent}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

export const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    accent?: MenuAccent;
    destructive?: boolean;
  }
>(({ className, accent = 'admin', destructive, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-pointer select-none items-center rounded-lg px-2 py-2 text-sm outline-none transition-colors',
      destructive
        ? 'text-red-600 data-[highlighted]:bg-red-50 data-[highlighted]:text-red-700'
        : itemHighlight[accent],
      className,
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

export const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-slate-100', className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

export function IconMenuItem({
  icon: Icon,
  label,
  description,
  className,
  iconClassName,
  accent = 'admin',
  destructive,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuItem> & {
  icon: LucideIcon;
  label: string;
  description?: string;
  iconClassName?: string;
  accent?: MenuAccent;
  destructive?: boolean;
}) {
  return (
    <DropdownMenuItem accent={accent} destructive={destructive} className={cn('gap-3', className)} {...props}>
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50',
          destructive && 'border-red-200 bg-red-50 text-red-600',
          iconClassName,
        )}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block font-medium leading-tight">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-xs font-normal text-slate-500">{description}</span>
        ) : null}
      </span>
    </DropdownMenuItem>
  );
}
