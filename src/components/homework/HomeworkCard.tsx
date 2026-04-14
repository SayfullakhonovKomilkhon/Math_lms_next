'use client';

import { Homework } from '@/types';
import { formatDate } from '@/lib/utils';
import { YoutubeEmbed } from './YoutubeEmbed';
import { Calendar, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Props {
  homework: Homework;
  onDelete?: (id: string) => void;
  canDelete?: boolean;
}

export function HomeworkCard({ homework, onDelete, canDelete }: Props) {
  return (
    <Card className="space-y-4 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500">
            {formatDate(homework.createdAt)} · {homework.teacher?.fullName}
          </p>
          {homework.dueDate && (
            <div className="mt-1 flex items-center gap-1 text-xs text-amber-700">
              <Calendar className="h-3 w-3" />
              Срок: {formatDate(homework.dueDate)}
            </div>
          )}
        </div>
        {canDelete && onDelete && (
          <button
            type="button"
            onClick={() => onDelete(homework.id)}
            className="text-slate-400 transition-colors hover:text-red-600"
            aria-label="Удалить"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <p className="text-sm leading-relaxed text-slate-800">{homework.text}</p>

      {homework.imageUrls?.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {homework.imageUrls.map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={url} alt="" className="h-32 w-full rounded-lg object-cover" />
          ))}
        </div>
      )}

      {homework.youtubeUrl && <YoutubeEmbed url={homework.youtubeUrl} />}
    </Card>
  );
}
