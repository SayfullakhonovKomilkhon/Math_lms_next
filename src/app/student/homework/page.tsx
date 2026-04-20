'use client';

import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import api from '@/lib/api';
import type { ApiResponse, Homework } from '@/types';
import { PageTitle } from '../_components/PageTitle';
import { SectionHeading } from '../_components/Card';
import { mockLatestHomework } from '../_lib/mockData';
import styles from './homework.module.css';

function extractVideoId(url?: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.searchParams.has('v')) return u.searchParams.get('v');
    const parts = u.pathname.split('/').filter(Boolean);
    return parts[parts.length - 1] || null;
  } catch {
    return null;
  }
}

function formatDue(due?: string): { label: string; late: boolean } {
  if (!due) return { label: 'без срока', late: false };
  const d = new Date(due);
  const diff = d.getTime() - Date.now();
  const late = diff < 0;
  return {
    label: `до ${d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}`,
    late,
  };
}

function formatHistoryDate(d: string) {
  return new Date(d).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function StudentHomeworkPage() {
  const { data } = useQuery({
    queryKey: ['student-homework-all'],
    queryFn: () =>
      api.get<ApiResponse<Homework[]>>('/homework/my').then((r) => r.data.data ?? []),
    retry: 0,
  });

  const [openId, setOpenId] = useState<string | null>(null);

  const homeworks: Homework[] =
    data && data.length > 0
      ? data
      : [
          {
            id: mockLatestHomework.id,
            text: mockLatestHomework.text,
            dueDate: mockLatestHomework.dueDate,
            createdAt: mockLatestHomework.createdAt,
            imageUrls: mockLatestHomework.imageUrls,
            youtubeUrl: mockLatestHomework.youtubeUrl,
          },
        ];

  const latest = homeworks[0];
  const history = homeworks.slice(1);
  const dueInfo = formatDue(latest?.dueDate ?? undefined);
  const videoId = extractVideoId(latest?.youtubeUrl);

  return (
    <div>
      <PageTitle
        kicker="Домашка"
        title="Твои задания"
        description="Каждое ДЗ — шанс закрепить тему и собрать XP."
        gradient
      />

      {latest ? (
        <article className={styles.current}>
          <div className={styles.head}>
            <span className={`${styles.pill} ${dueInfo.late ? styles.late : ''}`}>
              {dueInfo.late ? '🔥 просрочено' : '🎯 текущее'}
            </span>
            <span className={styles.due}>{dueInfo.label}</span>
          </div>
          <p className={styles.text}>{latest.text}</p>

          {videoId ? (
            <div className={styles.video}>
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title="Видео к ДЗ"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : null}

          {latest.imageUrls && latest.imageUrls.length > 0 ? (
            <div className={styles.media}>
              {latest.imageUrls.map((url, i) => (
                <Image
                  key={i}
                  src={url}
                  alt={`Материал ${i + 1}`}
                  width={600}
                  height={600}
                  unoptimized
                  className={styles.mediaItem}
                  onClick={() => window.open(url, '_blank')}
                />
              ))}
            </div>
          ) : null}
        </article>
      ) : (
        <div className={styles.empty}>
          <span>📚</span>
          Домашних заданий пока нет
        </div>
      )}

      {history.length > 0 ? (
        <div className={styles.history}>
          <SectionHeading icon={<BookOpen size={14} />} label="История заданий" />
          {history.map((hw) => {
            const open = openId === hw.id;
            return (
              <div
                key={hw.id}
                className={styles.historyItem}
                onClick={() => setOpenId(open ? null : hw.id)}
              >
                <div className={styles.historyRow}>
                  <div>
                    <div className={styles.historyDate}>
                      {formatHistoryDate(hw.createdAt)}
                    </div>
                    <div className={styles.historyPreview}>{hw.text}</div>
                  </div>
                  <span style={{ color: 'var(--s-text-secondary)' }}>{open ? '▲' : '▼'}</span>
                </div>
                {open ? <div className={styles.historyBody}>{hw.text}</div> : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
