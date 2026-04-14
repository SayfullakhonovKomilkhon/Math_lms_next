import { AppSidebar, type PanelVariant } from '@/components/layout/AppSidebar';

export function DashboardLayout({
  variant,
  children,
}: {
  variant: PanelVariant;
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-app flex min-h-screen bg-slate-100/80">
      <AppSidebar variant={variant} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header
          className="h-14 shrink-0 border-b border-slate-200/90 bg-white/90 backdrop-blur-sm"
          aria-label="Верхняя панель"
        />
        <main className="flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
