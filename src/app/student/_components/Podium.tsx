'use client';

import styles from './Podium.module.css';

export type PodiumEntry = {
  id: string;
  fullName: string;
  score: number;
  place: 1 | 2 | 3;
  isMe?: boolean;
};

type PodiumProps = {
  entries: PodiumEntry[];
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
}

export function Podium({ entries }: PodiumProps) {
  const first = entries.find((e) => e.place === 1);
  const second = entries.find((e) => e.place === 2);
  const third = entries.find((e) => e.place === 3);
  const order: Array<{ e?: PodiumEntry; cls: string; place: 1 | 2 | 3 }> = [
    { e: second, cls: styles.p2, place: 2 },
    { e: first, cls: styles.p1, place: 1 },
    { e: third, cls: styles.p3, place: 3 },
  ];

  return (
    <div className={styles.stage}>
      <div className={styles.floor} aria-hidden />
      <div className={styles.row}>
        {order.map(({ e, cls, place }) => (
          <div key={place} className={`${styles.col} ${cls}`}>
            {place === 1 ? (
              <span className={styles.crown} aria-hidden>
                👑
              </span>
            ) : null}
            <div className={styles.avatarWrap}>
              <div className={styles.avatarRing} />
              <div className={styles.avatar}>{e ? initials(e.fullName) : '—'}</div>
            </div>
            <div className={styles.name} title={e?.fullName}>
              {e?.fullName ?? '—'}
            </div>
            {e?.isMe ? <span className={styles.meLabel}>ВЫ</span> : null}
            <div className={styles.score}>{e ? `${e.score} балл.` : ''}</div>
            <div className={styles.pedestal}>{place}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
