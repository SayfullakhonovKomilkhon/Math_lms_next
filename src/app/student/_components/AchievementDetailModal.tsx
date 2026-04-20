'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { Share2, Copy, X, Check } from 'lucide-react';
import {
  getMonth,
  getMonthlyTitle,
  getSpecial,
  placeLabel,
  placeMedal,
  type Gender,
  type Place,
  type SpecialKey,
} from '../_lib/achievementsCatalog';
import { haptic } from '../_lib/hooks';
import { SButton } from './SButton';
import styles from './AchievementDetailModal.module.css';

export type MonthlyDetail = {
  kind: 'monthly';
  month: number;
  place: Place;
  unlockedAt?: string;
  year?: number;
};

export type SpecialDetail = {
  kind: 'special';
  key: SpecialKey;
  unlockedAt?: string;
};

export type AchievementDetail = MonthlyDetail | SpecialDetail;

type Props = {
  detail: AchievementDetail | null;
  gender: Gender;
  groupName?: string;
  onClose: () => void;
};

function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function formatDate(iso?: string): string {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return '';
  }
}

export function AchievementDetailModal({
  detail,
  gender,
  groupName,
  onClose,
}: Props) {
  const mounted = useMounted();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!detail) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [detail, onClose]);

  if (!mounted || !detail) return null;

  let title: string;
  let description: string;
  let icon: string;
  let theme:
    | ReturnType<typeof getMonthlyTitle>['theme']
    | ReturnType<typeof getSpecial>[keyof ReturnType<typeof getSpecial> & 'theme']
    | undefined;
  let placeValue: Place | null = null;
  let monthName: string | null = null;
  let year: number | undefined;

  if (detail.kind === 'monthly') {
    const data = getMonthlyTitle(detail.month, detail.place, gender);
    const meta = getMonth(detail.month);
    title = data.title;
    description = data.description;
    icon = data.icon;
    theme = data.theme;
    placeValue = detail.place;
    monthName = meta.name;
    year = detail.year;
  } else {
    const def = getSpecial(detail.key);
    if (!def) return null;
    title =
      gender === 'female' && def.titleFemale ? def.titleFemale : def.title;
    description =
      gender === 'female' && def.descriptionFemale
        ? def.descriptionFemale
        : def.description;
    icon = def.icon;
    theme = def.theme;
  }

  if (!theme) return null;

  const shareText =
    detail.kind === 'monthly'
      ? `🏆 Я получил${gender === 'female' ? 'а' : ''} звание «${title}» в MathCenter CRM! ${monthName} ${year ?? new Date().getFullYear()} ${placeMedal(placeValue!)}`
      : `🏆 Я получил${gender === 'female' ? 'а' : ''} достижение «${title}» в MathCenter CRM! ✨`;

  const doShare = async () => {
    haptic(18);
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ text: shareText });
        return;
      } catch {
        /* fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      /* noop */
    }
  };

  const content = (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <button
          className={styles.close}
          onClick={onClose}
          aria-label="Закрыть"
          type="button"
        >
          <X size={18} />
        </button>
        <div className={styles.handle} aria-hidden />

        <div
          className={styles.hero}
          style={{
            background: theme.background,
            border: `${theme.borderWidth}px solid ${theme.borderColor}`,
            boxShadow: theme.glow,
          }}
        >
          <div className={styles.heroSheen} />
          {theme.decor.length > 0 ? (
            <div className={styles.heroDecor} aria-hidden>
              {theme.decor.map((c, i) => (
                <span key={i}>{c}</span>
              ))}
            </div>
          ) : null}

          {placeValue ? (
            <span className={styles.heroMedal} aria-hidden>
              {placeMedal(placeValue)}
            </span>
          ) : null}

          <span className={theme.textLight ? styles.darkText : styles.lightText}>
            <span className={styles.heroIcon} aria-hidden>
              {icon}
            </span>
          </span>

          <div className={theme.textLight ? styles.darkText : styles.lightText}>
            {placeValue ? (
              <div className={styles.heroPlace}>{placeLabel(placeValue)}</div>
            ) : detail.kind === 'special' ? (
              <div className={styles.heroPlace}>Особое достижение</div>
            ) : null}
            <div className={styles.heroTitle}>{title}</div>
          </div>

          <div className={`${styles.heroDesc} ${theme.textLight ? styles.darkText : styles.lightText}`}>
            {description}
          </div>
        </div>

        <div className={styles.meta}>
          {monthName ? (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Месяц</span>
              <span className={styles.metaValue}>
                {monthName} {year ?? new Date().getFullYear()}
              </span>
            </div>
          ) : null}
          {placeValue ? (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Место</span>
              <span className={styles.metaValue}>{placeLabel(placeValue)}</span>
            </div>
          ) : null}
          {groupName ? (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Группа</span>
              <span className={styles.metaValue}>{groupName}</span>
            </div>
          ) : null}
          {detail.unlockedAt ? (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Дата получения</span>
              <span className={styles.metaValue}>
                {formatDate(detail.unlockedAt)}
              </span>
            </div>
          ) : null}
        </div>

        <div className={styles.actions}>
          <SButton variant="primary" onClick={doShare}>
            {copied ? <Check size={16} /> : <Share2 size={16} />}
            {copied ? 'Скопировано!' : 'Поделиться'}
          </SButton>
          <SButton variant="ghost" onClick={onClose}>
            <Copy size={16} /> Закрыть
          </SButton>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
