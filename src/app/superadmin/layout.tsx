import { SuperAdminSidebar } from '@/components/layout/SuperAdminSidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { PanelPrefetcher } from '@/components/layout/PanelPrefetcher';
import { TopBarAccount } from '@/components/account/TopBarAccount';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-app flex h-screen overflow-hidden bg-slate-100/80">
      <PanelPrefetcher variant="superadmin" />
      <SuperAdminSidebar />
      <div className="flex h-screen min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-end gap-2 border-b border-slate-200/90 bg-white/90 px-3 backdrop-blur-sm sm:px-5">
          <TopBarAccount accent="violet" />
        </header>
        <main className="min-h-0 flex-1 overflow-auto px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:py-8 lg:pb-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
        <MobileNav variant="superadmin" />
      </div>
    </div>
  );
}
