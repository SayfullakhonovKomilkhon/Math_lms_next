'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { User, Megaphone } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface AnnouncementCardProps {
  title: string;
  message: string;
  createdAt: string;
  authorName?: string;
}

export function AnnouncementCard({ title, message, createdAt, authorName }: AnnouncementCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLongText = message.length > 200;

  return (
    <Card className="overflow-hidden border-teal-100 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="bg-teal-50/50 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-teal-600" />
            <CardTitle className="text-lg font-semibold text-teal-900 line-clamp-1">
              {title}
            </CardTitle>
          </div>
          <span className="text-xs text-teal-600 whitespace-nowrap">
            {format(new Date(createdAt), 'd MMMM yyyy', { locale: ru })}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className={`text-slate-700 leading-relaxed whitespace-pre-wrap ${!isExpanded && isLongText ? 'line-clamp-3' : ''}`}>
          {message}
        </div>
        
        {isLongText && (
          <Button 
            variant="link" 
            className="p-0 h-auto text-teal-600 mt-2 font-medium" 
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Свернуть' : 'Читать полностью'}
          </Button>
        )}

        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <User className="h-3 w-3" />
          <span>{authorName || 'Администрация'}</span>
        </div>
      </CardContent>
    </Card>
  );
}
