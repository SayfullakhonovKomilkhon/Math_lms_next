'use client';

import { cn } from '@/lib/utils';
import { useUnreadAnnouncementsCount } from '@/hooks/useAnnouncements';

interface Props {
  enabled?: boolean;
  className?: string;
}

export function AnnouncementsBadge({ enabled = true, className }: Props) {
  const { data } = useUnreadAnnouncementsCount(enabled);
  const count = data?.count ?? 0;
  if (count <= 0) return null;

  return (
    <span
      aria-label={`${count} непрочитанных объявлений`}
      className={cn(
        'ml-auto inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-semibold leading-none text-white',
        'h-5',
        className,
      )}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}
