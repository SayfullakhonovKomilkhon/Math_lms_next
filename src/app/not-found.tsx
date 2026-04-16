import Link from 'next/link';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-700">
          <Search className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-semibold text-slate-900">Страница не найдена</h1>
        <p className="mt-2 text-sm text-slate-500">
          Возможно, страница была удалена или адрес введён неверно.
        </p>
        <div className="mt-6">
          <Link href="/">
            <Button>Вернуться на главную</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

