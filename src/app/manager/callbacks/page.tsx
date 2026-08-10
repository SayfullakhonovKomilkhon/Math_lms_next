import { ApplicationsWorkspace } from '@/components/applications/ApplicationsWorkspace';

export default function ManagerCallbacksPage() {
  return (
    <ApplicationsWorkspace
      title="Повторные звонки"
      description="Звонки, запланированные на сегодня, и просроченные напоминания"
      initialCallback="today"
    />
  );
}
