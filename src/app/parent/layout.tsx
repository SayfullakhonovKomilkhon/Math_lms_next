import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ParentLevelUpWatcher } from '@/components/parent/ParentLevelUpWatcher';

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout variant="parent">
      {children}
      <ParentLevelUpWatcher />
    </DashboardLayout>
  );
}
