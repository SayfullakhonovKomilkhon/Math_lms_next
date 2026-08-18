export type ApplicationStatus =
  | 'NEW'
  | 'IN_PROGRESS'
  | 'NO_ANSWER'
  | 'INTERESTED'
  | 'TRIAL_SCHEDULED'
  | 'ENROLLED'
  | 'REJECTED';

export type ApplicationActivityType =
  | 'COMMENT'
  | 'STATUS_CHANGE'
  | 'CALLBACK'
  | 'ASSIGNMENT';

export type ApplicationSource =
  | 'WEBSITE'
  | 'ADVERTISEMENT'
  | 'INSTAGRAM'
  | 'TELEGRAM'
  | 'PHONE_CALL'
  | 'WALK_IN'
  | 'REFERRAL'
  | 'OTHER';

export interface ApplicationAssignee {
  id: string;
  fullName?: string | null;
  phone: string;
  isActive?: boolean;
}

export interface ApplicationActivity {
  id: string;
  type: ApplicationActivityType;
  note?: string | null;
  fromStatus?: ApplicationStatus | null;
  toStatus?: ApplicationStatus | null;
  nextCallAt?: string | null;
  createdAt: string;
  actor: ApplicationAssignee & { role: string };
}

export interface AdmissionApplication {
  id: string;
  fullName: string;
  phone: string;
  childAge: number;
  parentFullName?: string | null;
  parentPhone?: string | null;
  source: ApplicationSource;
  sourceDetails?: string | null;
  status: ApplicationStatus;
  assignedToId?: string | null;
  assignedTo?: ApplicationAssignee | null;
  nextCallAt?: string | null;
  lastContactAt?: string | null;
  createdAt: string;
  updatedAt: string;
  activities?: ApplicationActivity[];
  _count?: { activities: number };
}

export interface ApplicationsSummary {
  total: number;
  new: number;
  active: number;
  callbacksToday: number;
  overdue: number;
  trials: number;
  enrolled: number;
}
