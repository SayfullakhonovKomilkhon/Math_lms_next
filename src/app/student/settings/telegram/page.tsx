'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Link2Off, MessageCircle } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/toast';
import { PageTitle } from '../../_components/PageTitle';
import { SButton } from '../../_components/SButton';
import styles from './telegram.module.css';

interface CodeResponse {
  code: string;
  botUsername: string;
}

export default function TelegramSettingsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [codeData, setCodeData] = useState<CodeResponse | null>(null);

  const isLinked = !!(user as unknown as { telegramChatId?: string })?.telegramChatId;

  const generateCode = useMutation({
    mutationFn: () =>
      api.post('/telegram/generate-code').then((r) => r.data.data as CodeResponse),
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
    <div>
      <PageTitle
        kicker="Настройки"
        title="Telegram"
        description="Получай оповещения об оплате, ДЗ и достижениях прямо в Telegram."
        gradient
      />

      {isLinked ? (
        <div className={styles.linked}>
          <div className={styles.linkedIcon}>
            <CheckCircle2 size={22} />
          </div>
          <div className={styles.linkedBody}>
            <div className={styles.linkedTitle}>Telegram подключён</div>
            <div className={styles.linkedSub}>Уведомления уже приходят в ваш Telegram</div>
          </div>
          <SButton
            size="sm"
            variant="danger"
            disabled={unlink.isPending}
            onClick={() => unlink.mutate()}
          >
            <Link2Off size={14} /> Отвязать
          </SButton>
        </div>
      ) : (
        <div className={styles.card}>
          <div className={styles.head}>
            <MessageCircle size={20} />
            Подключить Telegram
          </div>
          <p className={styles.desc}>
            Нажми на кнопку ниже, чтобы получить одноразовый код. Затем открой Telegram-бот и
            введи команду привязки.
          </p>

          {!codeData ? (
            <SButton
              onClick={() => generateCode.mutate()}
              disabled={generateCode.isPending}
            >
              <MessageCircle size={16} />
              {generateCode.isPending ? 'Генерация…' : 'Сгенерировать код'}
            </SButton>
          ) : (
            <>
              <div className={styles.code}>
                <div className={styles.codeLabel}>Ваш код привязки</div>
                <div className={styles.codeValue}>{codeData.code}</div>
                <div className={styles.codeExpire}>Действителен 10 минут</div>
              </div>
              <div className={styles.steps}>
                1. Найдите бота <strong>@{botUsername}</strong>
                <br />
                2. Отправьте <strong>/start</strong>
                <br />
                3. Введите команду: <strong>/link {codeData.code}</strong>
              </div>
              <div style={{ marginTop: 14 }}>
                <SButton
                  size="sm"
                  variant="ghost"
                  onClick={() => generateCode.mutate()}
                  disabled={generateCode.isPending}
                >
                  Получить новый код
                </SButton>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
