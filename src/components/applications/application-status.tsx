import { Badge } from '@/components/ui/badge';
import { ApplicationStatus } from '@/types/applications';

export const APPLICATION_STATUS_OPTIONS: Array<{
  value: ApplicationStatus;
  label: string;
}> = [
  { value: 'NEW', label: 'Новая' },
  { value: 'IN_PROGRESS', label: 'В работе' },
  { value: 'NO_ANSWER', label: 'Не дозвонились' },
  { value: 'INTERESTED', label: 'Заинтересован' },
  { value: 'TRIAL_SCHEDULED', label: 'Пробный урок' },
  { value: 'ENROLLED', label: 'Стал учеником' },
  { value: 'REJECTED', label: 'Отказ' },
];

export const APPLICATION_STATUS_LABELS = Object.fromEntries(
  APPLICATION_STATUS_OPTIONS.map((status) => [status.value, status.label]),
) as Record<ApplicationStatus, string>;

const variants: Record<
  ApplicationStatus,
  'blue' | 'yellow' | 'gray' | 'violet' | 'green' | 'red'
> = {
  NEW: 'blue',
  IN_PROGRESS: 'yellow',
  NO_ANSWER: 'gray',
  INTERESTED: 'violet',
  TRIAL_SCHEDULED: 'blue',
  ENROLLED: 'green',
  REJECTED: 'red',
};

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  return <Badge variant={variants[status]}>{APPLICATION_STATUS_LABELS[status]}</Badge>;
}
