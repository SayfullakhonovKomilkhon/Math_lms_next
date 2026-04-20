'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function LegacyAttendanceRedirectPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (id) router.replace(`/teacher/groups/${id}`);
  }, [id, router]);

  return (
    <div className="flex min-h-[300px] items-center justify-center text-sm text-slate-400">
      Перенаправляем в журнал группы…
    </div>
  );
}
