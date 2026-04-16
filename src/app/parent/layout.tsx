import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout variant="parent">{children}</DashboardLayout>;
}
