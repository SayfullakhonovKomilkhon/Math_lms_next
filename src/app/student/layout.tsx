'use client';

import { AppSidebar } from '@/components/layout/AppSidebar';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AppSidebar variant="student" />
      <main className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden p-6">
        <div className="mx-auto w-full max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
