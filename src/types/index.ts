export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';
export type Gender = 'MALE' | 'FEMALE';
export type LessonType = 'REGULAR' | 'PRACTICE' | 'CONTROL' | 'TEST';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';
export type PaymentRecordStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED';

export interface User {
  id: string;
  email: string;
  role: Role;
  isActive: boolean;
}

export interface Student {
  id: string;
  fullName: string;
  phone?: string;
  birthDate?: string;
  gender: Gender;
  enrolledAt: string;
  groupId?: string;
  monthlyFee: number;
  isActive: boolean;
  createdAt: string;
  user?: { id: string; email: string; role: Role };
  group?: { id: string; name: string };
}

export interface Teacher {
  id: string;
  fullName: string;
  phone?: string;
  ratePerStudent: number;
  isActive: boolean;
  user?: { id: string; email: string };
}

export interface Group {
  id: string;
  name: string;
  maxStudents: number;
  schedule: Record<string, unknown>;
  isActive: boolean;
  archivedAt?: string;
  teacher?: { id: string; fullName: string };
  _count?: { students: number };
}

export interface ParentChildLink {
  student: {
    id: string;
    fullName: string;
    isActive?: boolean;
    group?: { id: string; name: string } | null;
  };
}

export interface Parent {
  id: string;
  fullName: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
  user?: { id: string; email: string; isActive?: boolean };
  students?: ParentChildLink[];
}

export interface AttendanceRecord {
  id: string;
  date: string;
  studentId: string;
  groupId: string;
  lessonType: LessonType;
  status: AttendanceStatus;
  editedAt?: string;
  editReason?: string;
  student?: { id: string; fullName: string };
}

export interface AttendanceSummary {
  studentId: string;
  fullName: string;
  totalLessons: number;
  present: number;
  absent: number;
  late: number;
  percentage: number;
}

export interface Grade {
  id: string;
  date: string;
  studentId: string;
  groupId: string;
  lessonType: LessonType;
  score: number;
  maxScore: number;
  comment?: string;
  gradedAt: string;
  student?: { id: string; fullName: string };
}

export interface RatingEntry {
  place: number;
  studentId: string;
  fullName: string;
  /** Sum of raw score across all grades in the period — primary ranking metric. */
  totalPoints: number;
  /** Average percentage (totalScore / totalMax * 100), kept for charts/backcompat. */
  averageScore: number;
  totalWorks: number;
  attendancePercent: number;
}

export interface Homework {
  id: string;
  text: string;
  imageUrls: string[];
  youtubeUrl?: string;
  dueDate?: string;
  createdAt: string;
  group?: { id: string; name: string };
  teacher?: { id: string; fullName: string };
}

export interface LessonTopic {
  id: string;
  date: string;
  topic: string;
  materials?: Record<string, unknown>;
  group?: { id: string; name: string };
  teacher?: { id: string; fullName: string };
}

export interface Payment {
  id: string;
  amount: number;
  status: PaymentRecordStatus;
  receiptUrl?: string;
  nextPaymentDate?: string;
  confirmedAt?: string;
  rejectedAt?: string;
  rejectReason?: string;
  createdAt: string;
  student?: {
    id: string;
    fullName: string;
    monthlyFee: number;
    group?: { id: string; name: string };
  };
}

export interface Debtor {
  studentId: string;
  fullName: string;
  groupName: string;
  monthlyFee: number;
  lastPaymentDate?: string;
}

export interface ApiResponse<T> {
  data: T;
  statusCode: number;
  timestamp: string;
}

export interface StudentProfile {
  id: string;
  fullName: string;
  phone?: string;
  birthDate?: string;
  gender: Gender;
  enrolledAt: string;
  monthlyFee: number;
  group: {
    id: string;
    name: string;
    schedule: GroupSchedule;
    teacher: { fullName: string; phone?: string };
  };
  totalLessons: number;
  attendanceStats: {
    present: number;
    absent: number;
    late: number;
    percentage: number;
  };
}

export interface ParentChild {
  id: string;
  fullName: string;
  gender: Gender;
  enrolledAt: string;
  isActive?: boolean;
  monthlyFee?: number;
  group: {
    id: string;
    name: string;
    schedule: GroupSchedule;
    teacher: { fullName: string; phone?: string };
  } | null;
}

export interface ParentProfile {
  id: string;
  fullName: string;
  phone?: string;
  email?: string;
  // List of all children linked to this parent. Frontend should pick the
  // active one via a selector when there is more than one.
  children: ParentChild[];
}

export interface GroupSchedule {
  days: {
    day: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
    startTime: string;  // "09:00"
    endTime: string;    // "11:00"
  }[];
}

export interface GradeRecord {
  id: string;
  date: string;
  lessonType: LessonType;
  score: number;
  maxScore: number;
  scorePercent: number;
  comment?: string;
  groupName: string;
}

export interface GradeStats {
  averageScore: number;
  totalWorks: number;
  byMonth: { month: string; averageScore: number }[];
  byType: { lessonType: string; averageScore: number; count: number }[];
}

export interface MyRating {
  myPlace: number;
  totalStudents: number;
  myAverageScore: number;
  myTotalPoints: number;
  isVisible: boolean;
  rating: RatingEntry[];
}

export interface PaymentSummary {
  currentMonth: {
    status: 'PAID' | 'UNPAID' | 'PENDING';
    amount: number;
    nextPaymentDate: string | null;
    daysUntilPayment: number | null;
  };
  history: Payment[];
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  authorId: string;
  authorName: string;
  group: { id: string; name: string } | null;
  isPinned: boolean;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
  readCount?: number;
}

export interface AnnouncementsResponse {
  data: Announcement[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    unreadCount?: number;
  };
}

export interface CreateAnnouncementPayload {
  title: string;
  message: string;
  groupId?: string;
  isPinned?: boolean;
}
