'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, CheckCircle2, Link2Off } from 'lucide-react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { toast } from '@/components/ui/toast';
import { useTelegramStatus } from '@/hooks/useTelegramLink';
import { TelegramLinkModal } from '@/components/telegram/TelegramLinkModal';

export default function TelegramSettingsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data: status, isLoading } = useTelegramStatus(true);
  const isLinked = Boolean(status?.linked);

  const unlink = useMutation({
    mutationFn: () => api.post('/telegram/unlink'),
    onSuccess: () => {
      toast('Telegram отвязан');
      qc.invalidateQueries({ queryKey: ['telegram-status'] });
      qc.invalidateQueries({ queryKey: ['auth-user'] });
    },
    onError: () => toast('Ошибка', 'error'),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Telegram уведомления"
        description="Получайте уведомления об уроках, ДЗ и зарплате в Telegram"
      />

      {isLoading ? null : isLinked ? (
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Telegram подключён</p>
                <p className="text-sm text-slate-500">
                  Вы будете получать уведомления в Telegram
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={() => unlink.mutate()}
              loading={unlink.isPending}
              className="text-red-500 hover:text-red-600"
            >
              <Link2Off className="mr-1.5 h-4 w-4" />
              Отвязать
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-500" />
              <h2 className="font-semibold text-slate-900">Подключить Telegram</h2>
            </div>
            <p className="text-sm text-slate-500">
              Один клик — наш бот сам привяжется к вашему аккаунту.
            </p>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setOpen(true)}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Подключиться через Telegram
            </Button>
          </CardContent>
        </Card>
      )}

      <TelegramLinkModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
