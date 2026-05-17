// FILE: src/types/escalation.ts

export type EscalationReason = 
  | 'GOAL_NOT_SUBMITTED'
  | 'GOAL_NOT_APPROVED'
  | 'CHECKIN_MISSED'
  | 'CHECKIN_OVERDUE';

export type EscalationLevel = 
  | 'L1_SELF_REMINDER'
  | 'L2_MANAGER_ALERT'
  | 'L3_HR_ESCALATION';

export type EscalationStatus = 
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'DISMISSED';

export interface EscalationRule {
  id: string;
  reason: EscalationReason;
  triggerAfterDays: number;
  level: EscalationLevel;
  notifyEmployee: boolean;
  notifyManager: boolean;
  notifyHR: boolean;
  enabled: boolean;
  description: string;
}

export interface EscalationItem {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeDept: string;
  managerId: string;
  managerName: string;
  reason: EscalationReason;
  level: EscalationLevel;
  status: EscalationStatus;
  triggeredAt: string;
  daysOverdue: number;
  ruleId: string;
  notes?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface EscalationStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  byLevel: Record<EscalationLevel, number>;
  byReason: Record<EscalationReason, number>;
}

export const REASON_LABELS: Record<EscalationReason, string> = {
  GOAL_NOT_SUBMITTED: 'Goal Not Submitted',
  GOAL_NOT_APPROVED: 'Goal Not Approved',
  CHECKIN_MISSED: 'Check-in Missed',
  CHECKIN_OVERDUE: 'Check-in Overdue',
};

export const LEVEL_LABELS: Record<EscalationLevel, string> = {
  L1_SELF_REMINDER: 'L1 - Self Reminder',
  L2_MANAGER_ALERT: 'L2 - Manager Alert',
  L3_HR_ESCALATION: 'L3 - HR Escalation',
};

export const STATUS_LABELS: Record<EscalationStatus, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  DISMISSED: 'Dismissed',
};

export const LEVEL_COLORS: Record<EscalationLevel, string> = {
  L1_SELF_REMINDER: 'bg-amber-500',
  L2_MANAGER_ALERT: 'bg-orange-500',
  L3_HR_ESCALATION: 'bg-red-500',
};

export const STATUS_COLORS: Record<EscalationStatus, string> = {
  OPEN: 'text-red-500 bg-red-500/10',
  IN_PROGRESS: 'text-amber-500 bg-amber-500/10',
  RESOLVED: 'text-green-500 bg-green-500/10',
  DISMISSED: 'text-gray-500 bg-gray-500/10',
};