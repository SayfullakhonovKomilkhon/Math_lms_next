'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Link2Off, MessageCircle } from 'lucide-react';
import api from '@/lib/api';
import { useTelegramStatus } from '@/hooks/useTelegramLink';
import { TelegramLinkModal } from '@/components/telegram/TelegramLinkModal';
import { toast } from '@/components/ui/toast';
import { PageTitle } from '../../_components/PageTitle';
import { SButton } from '../../_components/SButton';
import styles from './telegram.module.css';

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
    <div>
      <PageTitle
        kicker="Настройки"
        title="Telegram"
        description="Получай оповещения об уроках, оценках, оплатах и достижениях прямо в Telegram."
        gradient
      />

      {isLoading ? null : isLinked ? (
        <div className={styles.linked}>
          <div className={styles.linkedIcon}>
            <CheckCircle2 size={22} />
          </div>
          <div className={styles.linkedBody}>
            <div className={styles.linkedTitle}>Telegram подключён</div>
            <div className={styles.linkedSub}>
              Уведомления уже приходят в ваш Telegram
            </div>
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
            Один клик — и наш бот сам привяжется к твоему аккаунту. Никаких
            кодов вручную вводить не нужно.
          </p>
          <SButton onClick={() => setOpen(true)}>
            <MessageCircle size={16} />
            Подключиться
          </SButton>
        </div>
      )}

      <TelegramLinkModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
