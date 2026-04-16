'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, CheckCircle2, Link2Off } from 'lucide-react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { toast } from '@/components/ui/toast';
import { useAuth } from '@/hooks/useAuth';

interface CodeResponse {
  code: string;
  botUsername: string;
}

export default function TelegramSettingsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [codeData, setCodeData] = useState<CodeResponse | null>(null);

  const isLinked = !!(user as any)?.telegramChatId;

  const generateCode = useMutation({
    mutationFn: () => api.post('/telegram/generate-code').then((r) => r.data.data as CodeResponse),
    onSuccess: (data) => setCodeData(data),
    onError: () => toast('Ошибка генерации кода', 'error'),
  });

  const unlink = useMutation({
    mutationFn: () => api.post('/telegram/unlink'),
    onSuccess: () => {
      toast('Telegram отвязан');
      qc.invalidateQueries({ queryKey: ['auth-user'] });
    },
    onError: () => toast('Ошибка', 'error'),
  });

  const botUsername = codeData?.botUsername ?? 'mathcenter_bot';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Telegram уведомления"
        description="Получайте важные уведомления в Telegram"
      />

      {isLinked ? (
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Telegram подключён</p>
                <p className="text-sm text-slate-500">Вы будете получать уведомления в Telegram</p>
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
              Получайте уведомления об оплате, ДЗ и достижениях прямо в Telegram
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            {!codeData ? (
              <Button
                onClick={() => generateCode.mutate()}
                loading={generateCode.isPending}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Сгенерировать код привязки
              </Button>
            ) : (
              <div className="space-y-4">
                {/* Code display */}
                <div className="rounded-xl border-2 border-dashed border-blue-200 bg-blue-50 p-5 text-center">
                  <p className="mb-1 text-sm text-blue-600">Ваш код привязки</p>
                  <p className="font-mono text-4xl font-bold tracking-widest text-blue-900">
                    {codeData.code}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">Действителен 10 минут</p>
                </div>

                {/* Instructions */}
                <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700 space-y-2">
                  <p className="font-semibold text-slate-800">Инструкция:</p>
                  <p>1. Найдите бота <span className="font-mono font-semibold text-blue-600">@{botUsername}</span> в Telegram</p>
                  <p>2. Напишите ему <span className="font-mono font-semibold">/start</span></p>
                  <p>3. Введите команду: <span className="font-mono font-semibold">/link {codeData.code}</span></p>
                </div>

                <Button
                  variant="secondary"
                  onClick={() => generateCode.mutate()}
                  loading={generateCode.isPending}
                  size="sm"
                >
                  Получить новый код
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
