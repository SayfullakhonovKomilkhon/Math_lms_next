'use client';

import { useQuery } from '@tanstack/react-query';
import { CreditCard, Info, Wallet } from 'lucide-react';
import api from '@/lib/api';
import type { ApiResponse, PaymentSummary } from '@/types';
import { PageTitle } from '../_components/PageTitle';
import { SectionHeading } from '../_components/Card';
import styles from './payment.module.css';

const STATUS_COPY: Record<string, { label: string; icon: string; cls: string }> = {
  PAID: { label: 'Оплата за месяц внесена', icon: '✅', cls: 'paid' },
  PENDING: { label: 'Платёж на проверке у администратора', icon: '⏳', cls: 'pending' },
  UNPAID: { label: 'Необходимо оплатить обучение', icon: '⚠️', cls: 'unpaid' },
};

const PAYMENT_STATUS_BADGES: Record<string, string> = {
  CONFIRMED: 'paid',
  PENDING: 'pending',
  REJECTED: 'rejected',
  PAID: 'paid',
  UNPAID: 'unpaid',
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  CONFIRMED: 'Оплачено',
  PENDING: 'На проверке',
  REJECTED: 'Отклонено',
};

function formatMoney(n?: number) {
  if (typeof n !== 'number') return '—';
  return n.toLocaleString('ru-RU') + ' сум';
}

export default function StudentPaymentPage() {
  const { data } = useQuery({
    queryKey: ['student-payment-page'],
    queryFn: () =>
      api.get<ApiResponse<PaymentSummary>>('/payments/my').then((r) => r.data.data),
    retry: 0,
  });

  const current = data?.currentMonth;
  const statusKey = current?.status ?? 'UNPAID';
  const copy = STATUS_COPY[statusKey] ?? STATUS_COPY.UNPAID;
  const nextPay = current?.nextPaymentDate
    ? new Date(current.nextPaymentDate).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
      })
    : '—';
  const days = current?.daysUntilPayment;
  const history = data?.history ?? [];

  return (
    <div>
      <PageTitle
        kicker="Оплата"
        title="Обучение"
        description="Здесь — сумма, методы и история платежей."
        gradient
      />

      <div className={`${styles.banner} ${styles[copy.cls]}`}>
        <div className={styles.bannerRow}>
          <div className={styles.bannerIcon}>{copy.icon}</div>
          <div className={styles.bannerBody}>
            <div className={styles.bannerLabel}>Текущий статус</div>
            <div className={styles.bannerValue}>{copy.label}</div>
            {typeof days === 'number' ? (
              <div className={styles.bannerSub}>
                {days > 0
                  ? `Оплатить до ${nextPay} (ещё ${days} дн.)`
                  : days === 0
                    ? `Сегодня последний день для оплаты`
                    : `Оплата просрочена на ${Math.abs(days)} дн.`}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className={styles.amount}>
        <div className={styles.amountLabel}>К оплате в этом месяце</div>
        <div className={styles.amountValue}>{formatMoney(current?.amount)}</div>
        <div className={styles.amountSub}>Следующий платёж: {nextPay}</div>
      </div>

      <SectionHeading icon={<Wallet size={14} />} label="Как оплатить" />
      <div className={styles.payways}>
        <div className={styles.payWay}>
          <div className={styles.payWayIcon}>💳</div>
          <div className={styles.payWayName}>Payme</div>
          <div className={styles.payWayHint}>Поиск «MathCenter»</div>
        </div>
        <div className={styles.payWay}>
          <div className={styles.payWayIcon}>🟢</div>
          <div className={styles.payWayName}>Click</div>
          <div className={styles.payWayHint}>Поиск «MathCenter»</div>
        </div>
        <div className={styles.payWay}>
          <div className={styles.payWayIcon}>🧡</div>
          <div className={styles.payWayName}>Apelsin</div>
          <div className={styles.payWayHint}>Поиск «MathCenter»</div>
        </div>
        <div className={styles.payWay}>
          <div className={styles.payWayIcon}>🏦</div>
          <div className={styles.payWayName}>Банк</div>
          <div className={styles.payWayHint}>Реквизиты ниже</div>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <SectionHeading icon={<Info size={14} />} label="Банковские реквизиты" />
        <div className={styles.bank}>
          <div>
            <span>Р/С:</span> 2020 8000 1054 2200 0001
          </div>
          <div>
            <span>Банк:</span> ЧАКБ «Универсал банк»
          </div>
          <div>
            <span>МФО:</span> 01084
          </div>
          <div>
            <span>ИНН:</span> 308765432
          </div>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <SectionHeading icon={<CreditCard size={14} />} label="История платежей" />
        <div className={styles.historyList}>
          {history.length === 0 ? (
            <div style={{ padding: '24px', color: 'var(--s-text-secondary)', textAlign: 'center', fontSize: 13 }}>
              История платежей пока пуста
            </div>
          ) : (
            history.map((p) => {
              const badgeCls = PAYMENT_STATUS_BADGES[p.status] ?? 'pending';
              const badgeLabel = PAYMENT_STATUS_LABELS[p.status] ?? p.status;
              return (
                <div key={p.id} className={styles.historyRow}>
                  <div>
                    <div className={styles.historyAmount}>{formatMoney(p.amount)}</div>
                    <div className={styles.historyDate}>
                      {new Date(p.createdAt).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                  <span className={`${styles.badge} ${styles[badgeCls]}`}>{badgeLabel}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
