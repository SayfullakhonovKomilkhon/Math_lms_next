'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  Megaphone,
  Pin,
  PinOff,
  Trash2,
  User,
  Users,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Announcement } from '@/types';

interface Props {
  announcement: Announcement;
  onRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  onPin?: (id: string) => void;
  canDelete?: boolean;
  canPin?: boolean;
  showReadStatus?: boolean;
  showReadCount?: boolean;
}

export function AnnouncementCard({
  announcement,
  onRead,
  onDelete,
  onPin,
  canDelete,
  canPin,
  showReadStatus = true,
  showReadCount = false,
}: Props) {
  const {
    id,
    title,
    message,
    authorName,
    group,
    isPinned,
    isRead,
    createdAt,
    readCount,
  } = announcement;

  const isLong = message.length > 220;
  const [expanded, setExpanded] = useState(!isLong);

  const markRead = () => {
    if (!isRead && onRead) onRead(id);
  };

  return (
    <article
      className={cn(
        'relative rounded-2xl border bg-white p-4 shadow-sm transition-all sm:p-5',
        isPinned
          ? 'border-indigo-200 bg-gradient-to-br from-indigo-50/60 via-white to-white'
          : 'border-slate-200',
        !isRead && showReadStatus && 'ring-1 ring-inset ring-blue-200',
      )}
    >
      {!isRead && showReadStatus && (
        <span
          aria-hidden
          className="absolute inset-y-4 left-0 w-1 rounded-r-full bg-blue-500"
        />
      )}

      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {isPinned && (
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
              <Pin className="h-3 w-3" />
              Закреплено
            </span>
          )}
          {!group ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">
              <Megaphone className="h-3 w-3" />
              Весь центр
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
              <Users className="h-3 w-3" />
              {group.name}
            </span>
          )}
          {showReadStatus && !isRead && (
            <span className="inline-flex items-center rounded-full bg-blue-500 px-2 py-0.5 text-xs font-medium text-white">
              Новое
            </span>
          )}
          {showReadCount && typeof readCount === 'number' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              <Check className="h-3 w-3" />
              Прочитано: {readCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {canPin && (
            <button
              type="button"
              onClick={() => onPin?.(id)}
              title={isPinned ? 'Открепить' : 'Закрепить'}
              className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-indigo-600"
            >
              {isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={() => onDelete?.(id)}
              title="Удалить"
              className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <h3
        className={cn(
          'mt-2 text-base font-semibold leading-tight sm:text-lg',
          isRead || !showReadStatus ? 'text-slate-800' : 'text-slate-900',
        )}
      >
        {title}
      </h3>

      <p
        className={cn(
          'mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-slate-600',
          !expanded && 'line-clamp-3',
        )}
        onMouseEnter={markRead}
      >
        {message}
      </p>

      {isLong && (
        <button
          type="button"
          onClick={() => {
            setExpanded((v) => !v);
            markRead();
          }}
          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
        >
          {expanded ? (
            <>
              Свернуть <ChevronUp className="h-3 w-3" />
            </>
          ) : (
            <>
              Читать полностью <ChevronDown className="h-3 w-3" />
            </>
          )}
        </button>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2 text-xs text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <User className="h-3 w-3" />
          {authorName}
          <span>·</span>
          {format(new Date(createdAt), 'd MMM, HH:mm', { locale: ru })}
        </span>
        {showReadStatus && isRead && (
          <span className="inline-flex items-center gap-1 text-emerald-600">
            <Check className="h-3 w-3" />
            Прочитано
          </span>
        )}
      </div>
    </article>
  );
}
