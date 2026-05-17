// FILE: src/services/escalationEngine.ts

import type { EscalationRule, EscalationItem, EscalationLevel, EscalationReason, EscalationStats } from '../types/escalation';

export const DEFAULT_RULES: EscalationRule[] = [
  {
    id: 'rule-1',
    reason: 'GOAL_NOT_SUBMITTED',
    triggerAfterDays: 7,
    level: 'L1_SELF_REMINDER',
    notifyEmployee: true,
    notifyManager: false,
    notifyHR: false,
    enabled: true,
    description: 'Goal not submitted after 7 days from window open',
  },
  {
    id: 'rule-2',
    reason: 'GOAL_NOT_SUBMITTED',
    triggerAfterDays: 14,
    level: 'L2_MANAGER_ALERT',
    notifyEmployee: true,
    notifyManager: true,
    notifyHR: false,
    enabled: true,
    description: 'Goal not submitted after 14 days - manager alert',
  },
  {
    id: 'rule-3',
    reason: 'GOAL_NOT_SUBMITTED',
    triggerAfterDays: 21,
    level: 'L3_HR_ESCALATION',
    notifyEmployee: true,
    notifyManager: true,
    notifyHR: true,
    enabled: true,
    description: 'Goal not submitted after 21 days - HR escalation',
  },
  {
    id: 'rule-4',
    reason: 'GOAL_NOT_APPROVED',
    triggerAfterDays: 5,
    level: 'L2_MANAGER_ALERT',
    notifyEmployee: false,
    notifyManager: true,
    notifyHR: false,
    enabled: true,
    description: 'Goal pending approval for more than 5 days',
  },
  {
    id: 'rule-5',
    reason: 'CHECKIN_MISSED',
    triggerAfterDays: 3,
    level: 'L1_SELF_REMINDER',
    notifyEmployee: true,
    notifyManager: false,
    notifyHR: false,
    enabled: true,
    description: 'Quarterly check-in not done within 3 days of window open',
  },
  {
    id: 'rule-6',
    reason: 'CHECKIN_MISSED',
    triggerAfterDays: 7,
    level: 'L2_MANAGER_ALERT',
    notifyEmployee: true,
    notifyManager: true,
    notifyHR: false,
    enabled: true,
    description: 'Quarterly check-in not done within 7 days - manager alert',
  },
];

interface MockEmployee {
  id: string;
  name: string;
  department: string;
  managerId: string;
  managerName: string;
  goalsSubmitted: boolean;
  goalsApproved: boolean;
  lastCheckinDate?: string;
  daysSinceSubmission?: number;
  daysSinceApproval?: number;
  daysSinceCheckin?: number;
}

// Mock employees for demo
export const MOCK_EMPLOYEES: MockEmployee[] = [
  {
    id: 'emp-1',
    name: 'Aisha Khan',
    department: 'Marketing',
    managerId: 'mgr-1',
    managerName: 'Meera Kapoor',
    goalsSubmitted: false,
    goalsApproved: false,
    daysSinceSubmission: 12, // GOAL_NOT_SUBMITTED, L2
  },
  {
    id: 'emp-2',
    name: 'Dev Patel',
    department: 'Operations',
    managerId: 'mgr-2',
    managerName: 'Vikram Nair',
    goalsSubmitted: true,
    goalsApproved: true,
    lastCheckinDate: '2026-02-15',
    daysSinceCheckin: 4, // CHECKIN_MISSED, L1
  },
  {
    id: 'emp-3',
    name: 'Rohit Mehta',
    department: 'Engineering',
    managerId: 'mgr-2',
    managerName: 'Vikram Nair',
    goalsSubmitted: true,
    goalsApproved: false,
    daysSinceSubmission: 9, // Should have been approved by now, L2
  },
  {
    id: 'emp-4',
    name: 'Priya Sharma',
    department: 'Sales',
    managerId: 'mgr-1',
    managerName: 'Meera Kapoor',
    goalsSubmitted: true,
    goalsApproved: true,
    lastCheckinDate: '2026-03-01',
    daysSinceCheckin: 1, // OK
  },
  {
    id: 'emp-5',
    name: 'Sneha Iyer',
    department: 'HR',
    managerId: 'mgr-3',
    managerName: 'Admin HR',
    goalsSubmitted: true,
    goalsApproved: true,
    lastCheckinDate: '2026-03-10',
    daysSinceCheckin: 0, // OK
  },
  {
    id: 'emp-6',
    name: 'Arjun Singh',
    department: 'Finance',
    managerId: 'mgr-3',
    managerName: 'Admin HR',
    goalsSubmitted: true,
    goalsApproved: true,
    lastCheckinDate: '2026-03-15',
    daysSinceCheckin: 0, // OK
  },
];

export function checkAllEscalations(
  employees: MockEmployee[] = MOCK_EMPLOYEES,
  rules: EscalationRule[] = DEFAULT_RULES,
  _cycleOpenDate?: string
): EscalationItem[] {
  const escalations: EscalationItem[] = [];
  const now = new Date();

  for (const employee of employees) {
    for (const rule of rules) {
      if (!rule.enabled) continue;

      let shouldEscalate = false;
      let daysOverdue = 0;

      switch (rule.reason) {
        case 'GOAL_NOT_SUBMITTED':
          if (!employee.goalsSubmitted && employee.daysSinceSubmission) {
            daysOverdue = employee.daysSinceSubmission;
            shouldEscalate = daysOverdue >= rule.triggerAfterDays;
          }
          break;

        case 'GOAL_NOT_APPROVED':
          if (employee.goalsSubmitted && !employee.goalsApproved && employee.daysSinceSubmission) {
            daysOverdue = employee.daysSinceSubmission;
            shouldEscalate = daysOverdue >= rule.triggerAfterDays;
          }
          break;

        case 'CHECKIN_MISSED':
        case 'CHECKIN_OVERDUE':
          if (employee.lastCheckinDate && employee.daysSinceCheckin) {
            daysOverdue = employee.daysSinceCheckin;
            shouldEscalate = daysOverdue >= rule.triggerAfterDays;
          }
          break;
      }

      if (shouldEscalate) {
        // Check if escalation already exists for this employee+rule
        const existing = escalations.find(
          e => e.employeeId === employee.id && e.ruleId === rule.id
        );
        
        if (!existing) {
          const triggeredAt = new Date();
          triggeredAt.setDate(triggeredAt.getDate() - daysOverdue);

          escalations.push({
            id: `esc-${employee.id}-${rule.id}`,
            employeeId: employee.id,
            employeeName: employee.name,
            employeeDept: employee.department,
            managerId: employee.managerId,
            managerName: employee.managerName,
            reason: rule.reason,
            level: rule.level,
            status: 'OPEN',
            triggeredAt: triggeredAt.toISOString(),
            daysOverdue,
            ruleId: rule.id,
          });
        }
      }
    }
  }

  return escalations;
}

export function getEscalationStats(items: EscalationItem[]): EscalationStats {
  const stats: EscalationStats = {
    total: items.length,
    open: 0,
    inProgress: 0,
    resolved: 0,
    byLevel: {
      L1_SELF_REMINDER: 0,
      L2_MANAGER_ALERT: 0,
      L3_HR_ESCALATION: 0,
    },
    byReason: {
      GOAL_NOT_SUBMITTED: 0,
      GOAL_NOT_APPROVED: 0,
      CHECKIN_MISSED: 0,
      CHECKIN_OVERDUE: 0,
    },
  };

  items.forEach(item => {
    if (item.status === 'OPEN') stats.open++;
    if (item.status === 'IN_PROGRESS') stats.inProgress++;
    if (item.status === 'RESOLVED' || item.status === 'DISMISSED') stats.resolved++;

    stats.byLevel[item.level]++;
    stats.byReason[item.reason]++;
  });

  return stats;
}

export function groupByLevel(items: EscalationItem[]): Record<EscalationLevel, EscalationItem[]> {
  return {
    L1_SELF_REMINDER: items.filter(i => i.level === 'L1_SELF_REMINDER'),
    L2_MANAGER_ALERT: items.filter(i => i.level === 'L2_MANAGER_ALERT'),
    L3_HR_ESCALATION: items.filter(i => i.level === 'L3_HR_ESCALATION'),
  };
}

export function groupByEmployee(items: EscalationItem[]): Record<string, EscalationItem[]> {
  return items.reduce((acc, item) => {
    if (!acc[item.employeeId]) {
      acc[item.employeeId] = [];
    }
    acc[item.employeeId].push(item);
    return acc;
  }, {} as Record<string, EscalationItem[]>);
}

export function getAvgDaysOverdue(items: EscalationItem[]): number {
  if (items.length === 0) return 0;
  const total = items.reduce((sum, item) => sum + item.daysOverdue, 0);
  return Math.round(total / items.length);
}