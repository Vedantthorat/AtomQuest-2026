// FILE: src/services/mockData.ts

import type { Goal, Notification, AuditEvent, Activity, TeamMember, CheckInComment, CycleConfig, SharedGoal, User } from '../types';

const thrustAreas = ['Revenue & Growth', 'Customer Excellence', 'Operational Excellence', 'Innovation & Digital Transformation', 'Talent & Culture', 'Sustainability', 'Compliance & Risk', 'Market Expansion'] as const;

// ============================================
// MOCK USERS - Demo Seed Data
// ============================================

export const mockUsers: User[] = [
  // Employees
  { id: 'u3', email: 'priya@atomberg.com', name: 'Priya Sharma', role: 'EMPLOYEE', department: 'Sales', managerId: 'u2', createdAt: '2026-01-01T00:00:00Z' },
  { id: 'u4', email: 'rohit@atomberg.com', name: 'Rohit Mehta', role: 'EMPLOYEE', department: 'Engineering', managerId: 'u5', createdAt: '2026-01-01T00:00:00Z' },
  { id: 'u6', email: 'aisha@atomberg.com', name: 'Aisha Khan', role: 'EMPLOYEE', department: 'Marketing', managerId: 'u2', createdAt: '2026-01-01T00:00:00Z' },
  { id: 'u7', email: 'dev@atomberg.com', name: 'Dev Patel', role: 'EMPLOYEE', department: 'Operations', managerId: 'u5', createdAt: '2026-01-01T00:00:00Z' },
  { id: 'u8', email: 'sneha@atomberg.com', name: 'Sneha Iyer', role: 'EMPLOYEE', department: 'HR', managerId: 'u1', createdAt: '2026-01-01T00:00:00Z' },
  { id: 'u9', email: 'arjun@atomberg.com', name: 'Arjun Singh', role: 'EMPLOYEE', department: 'Finance', managerId: 'u1', createdAt: '2026-01-01T00:00:00Z' },
  
  // Managers
  { id: 'u2', email: 'meera@atomberg.com', name: 'Meera Kapoor', role: 'MANAGER', department: 'Sales', managerId: 'u1', createdAt: '2025-01-01T00:00:00Z' },
  { id: 'u5', email: 'vikram@atomberg.com', name: 'Vikram Nair', role: 'MANAGER', department: 'Engineering', managerId: 'u1', createdAt: '2025-01-01T00:00:00Z' },
  
  // Admin
  { id: 'u1', email: 'admin@atomberg.com', name: 'HR Admin', role: 'ADMIN', department: 'HR', createdAt: '2024-01-01T00:00:00Z' },
];

// ============================================
// MOCK GOALS - Fully seeded with quarterly data
// ============================================

export const mockGoals: Goal[] = [
  // Priya Sharma (Sales) - 3 approved goals with full Q1-Q3 data
  { 
    id: 'g1', 
    title: 'Increase Q4 Revenue to ₹100L', 
    description: 'Achieve ₹100L in revenue through new customer acquisitions and existing account expansion',
    thrustArea: 'Revenue & Growth',
    status: 'APPROVED', 
    weightage: 40, 
    kpiType: 'QUANTITATIVE',
    uomType: 'MIN',
    targetValue: 100, 
    currentValue: 91,
    actualAchievement: 91,
    unit: 'L', 
    quarter: 'Q4', 
    year: 2026, 
    priority: 'CRITICAL', 
    progressStatus: 'ON_TRACK',
    ownerId: 'u3',
    approvedBy: 'u2',
    approvedAt: '2026-01-20T00:00:00Z',
    lockedAt: '2026-01-21T00:00:00Z',
    createdAt: '2026-01-15T00:00:00Z', 
    updatedAt: '2026-05-15T00:00:00Z',
    q1Actual: 78,
    q2Actual: 85,
    q3Actual: 91,
    checkInComments: [
      { id: 'c1', goalId: 'g1', userId: 'u2', user: { id: 'u2', name: 'Meera Kapoor', email: 'meera@atomberg.com', role: 'MANAGER', department: 'Sales' }, quarter: 'Q1', comment: 'Great start! Keep focus on enterprise deals.', createdAt: '2026-02-15T00:00:00Z' },
      { id: 'c2', goalId: 'g1', userId: 'u2', user: { id: 'u2', name: 'Meera Kapoor', email: 'meera@atomberg.com', role: 'MANAGER', department: 'Sales' }, quarter: 'Q2', comment: 'Strong momentum. On track for target.', createdAt: '2026-05-01T00:00:00Z' }
    ]
  },
  { 
    id: 'g2', 
    title: 'Reduce Customer TAT to 24 hours', 
    description: 'Reduce average ticket resolution time from 48 hours to under 24 hours',
    thrustArea: 'Customer Excellence',
    status: 'APPROVED', 
    weightage: 35, 
    kpiType: 'QUANTITATIVE',
    uomType: 'MAX',
    targetValue: 24, 
    currentValue: 17,
    actualAchievement: 17,
    unit: 'hours', 
    quarter: 'Q4', 
    year: 2026, 
    priority: 'HIGH', 
    progressStatus: 'COMPLETED',
    ownerId: 'u3',
    approvedBy: 'u2',
    approvedAt: '2026-01-18T00:00:00Z',
    lockedAt: '2026-01-19T00:00:00Z',
    createdAt: '2026-01-10T00:00:00Z', 
    updatedAt: '2026-05-15T00:00:00Z',
    q1Actual: 20,
    q2Actual: 18,
    q3Actual: 17,
    checkInComments: [
      { id: 'c3', goalId: 'g2', userId: 'u2', user: { id: 'u2', name: 'Meera Kapoor', email: 'meera@atomberg.com', role: 'MANAGER', department: 'Sales' }, quarter: 'Q1', comment: 'Implementing chatbot helped reduce TAT.', createdAt: '2026-02-20T00:00:00Z' }
    ]
  },
  { 
    id: 'g3', 
    title: 'Zero Safety Incidents', 
    description: 'Maintain zero workplace safety incidents throughout Q4',
    thrustArea: 'Sustainability',
    status: 'APPROVED', 
    weightage: 25, 
    kpiType: 'QUANTITATIVE',
    uomType: 'ZERO',
    targetValue: 0, 
    currentValue: 1,
    actualAchievement: 1,
    unit: 'incidents', 
    quarter: 'Q4', 
    year: 2026, 
    priority: 'CRITICAL', 
    progressStatus: 'AT_RISK',
    ownerId: 'u3',
    approvedBy: 'u2',
    approvedAt: '2026-01-05T00:00:00Z',
    lockedAt: '2026-01-06T00:00:00Z',
    createdAt: '2026-01-02T00:00:00Z', 
    updatedAt: '2026-05-15T00:00:00Z',
    q1Actual: 0,
    q2Actual: 0,
    q3Actual: 1,
    checkInComments: []
  },

  // Rohit Mehta (Engineering) - Pending approval
  { 
    id: 'g4', 
    title: 'Complete AWS Certification', 
    description: 'Obtain AWS Solutions Architect certification',
    thrustArea: 'Innovation & Digital Transformation',
    status: 'PENDING', 
    weightage: 20, 
    kpiType: 'QUALITATIVE',
    uomType: 'ZERO',
    targetValue: 1, 
    currentValue: 0,
    actualAchievement: 0,
    unit: 'cert', 
    quarter: 'Q2', 
    year: 2026, 
    priority: 'MEDIUM', 
    progressStatus: 'NOT_STARTED',
    ownerId: 'u4',
    createdAt: '2026-03-01T00:00:00Z', 
    updatedAt: '2026-03-15T00:00:00Z'
  },

  // Aisha Khan (Marketing) - No goals submitted yet (will trigger escalation)
  // Dev Patel (Operations) - Check-in pending (will trigger escalation)
  { 
    id: 'g5', 
    title: 'Launch New Product Feature', 
    description: 'Complete and launch new dashboard feature by end of Q1',
    thrustArea: 'Innovation & Digital Transformation',
    status: 'APPROVED',
    weightage: 25,
    kpiType: 'QUANTITATIVE',
    uomType: 'TIMELINE',
    targetValue: 100,
    currentValue: 100,
    actualAchievement: 100,
    unit: '%',
    startDate: '2026-01-01',
    deadline: '2026-03-31',
    completedAt: '2026-03-28T00:00:00Z',
    quarter: 'Q1',
    year: 2026,
    priority: 'HIGH',
    progressStatus: 'COMPLETED',
    ownerId: 'u7',
    approvedBy: 'u5',
    approvedAt: '2026-01-05T00:00:00Z',
    lockedAt: '2026-01-06T00:00:00Z',
    createdAt: '2026-01-02T00:00:00Z',
    updatedAt: '2026-03-28T00:00:00Z',
    q1Actual: 100
  },

  // Sneha Iyer (HR) - 2 approved goals
  { 
    id: 'g6', 
    title: 'Reduce Recruitment Time', 
    description: 'Reduce average time-to-hire from 45 days to 30 days',
    thrustArea: 'Talent & Culture',
    status: 'APPROVED', 
    weightage: 50, 
    kpiType: 'QUANTITATIVE',
    uomType: 'MAX',
    targetValue: 30, 
    currentValue: 32,
    actualAchievement: 32,
    unit: 'days', 
    quarter: 'Q4', 
    year: 2026, 
    priority: 'HIGH', 
    progressStatus: 'ON_TRACK',
    ownerId: 'u8',
    approvedBy: 'u1',
    approvedAt: '2026-01-10T00:00:00Z',
    lockedAt: '2026-01-11T00:00:00Z',
    createdAt: '2026-01-05T00:00:00Z', 
    updatedAt: '2026-05-10T00:00:00Z'
  },
  { 
    id: 'g7', 
    title: 'Employee Satisfaction Score > 80%', 
    description: 'Achieve employee satisfaction score above 80% in annual survey',
    thrustArea: 'Talent & Culture',
    status: 'APPROVED', 
    weightage: 50, 
    kpiType: 'QUANTITATIVE',
    uomType: 'MIN',
    targetValue: 80, 
    currentValue: 78,
    actualAchievement: 78,
    unit: '%', 
    quarter: 'Q4', 
    year: 2026, 
    priority: 'MEDIUM', 
    progressStatus: 'ON_TRACK',
    ownerId: 'u8',
    approvedBy: 'u1',
    approvedAt: '2026-01-10T00:00:00Z',
    lockedAt: '2026-01-11T00:00:00Z',
    createdAt: '2026-01-05T00:00:00Z', 
    updatedAt: '2026-05-10T00:00:00Z'
  },

  // Arjun Singh (Finance) - All goals approved, all check-ins done
  { 
    id: 'g8', 
    title: 'Reduce Operational Costs by 15%', 
    description: 'Achieve 15% reduction in operational expenses through process optimization',
    thrustArea: 'Operational Excellence',
    status: 'APPROVED', 
    weightage: 60, 
    kpiType: 'QUANTITATIVE',
    uomType: 'MIN',
    targetValue: 15, 
    currentValue: 12,
    actualAchievement: 12,
    unit: '%', 
    quarter: 'Q4', 
    year: 2026, 
    priority: 'CRITICAL', 
    progressStatus: 'ON_TRACK',
    ownerId: 'u9',
    approvedBy: 'u1',
    approvedAt: '2026-01-08T00:00:00Z',
    lockedAt: '2026-01-09T00:00:00Z',
    createdAt: '2026-01-03T00:00:00Z', 
    updatedAt: '2026-05-15T00:00:00Z',
    q1Actual: 5,
    q2Actual: 8,
    q3Actual: 12
  },
  { 
    id: 'g9', 
    title: 'Zero Financial Errors', 
    description: 'Achieve zero financial reporting errors for the year',
    thrustArea: 'Compliance & Risk',
    status: 'APPROVED', 
    weightage: 40, 
    kpiType: 'QUANTITATIVE',
    uomType: 'ZERO',
    targetValue: 0, 
    currentValue: 0,
    actualAchievement: 0,
    unit: 'errors', 
    quarter: 'Q4', 
    year: 2026, 
    priority: 'CRITICAL', 
    progressStatus: 'COMPLETED',
    ownerId: 'u9',
    approvedBy: 'u1',
    approvedAt: '2026-01-08T00:00:00Z',
    lockedAt: '2026-01-09T00:00:00Z',
    createdAt: '2026-01-03T00:00:00Z', 
    updatedAt: '2026-05-15T00:00:00Z',
    q1Actual: 0,
    q2Actual: 0,
    q3Actual: 0
  },
];

// ============================================
// MOCK ESCALATIONS - Pre-loaded
// ============================================

type MockEscalation = {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeDept: string;
  managerId: string;
  managerName: string;
  reason: 'GOAL_NOT_SUBMITTED' | 'GOAL_NOT_APPROVED' | 'CHECKIN_MISSED' | 'CHECKIN_OVERDUE';
  level: 'L1_SELF_REMINDER' | 'L2_MANAGER_ALERT' | 'L3_HR_ESCALATION';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'DISMISSED';
  triggeredAt: string;
  daysOverdue: number;
  ruleId: string;
  notes?: string;
  resolvedAt?: string;
  resolvedBy?: string;
};

export const mockEscalations: MockEscalation[] = [
  {
    id: 'esc-1',
    employeeId: 'u6',
    employeeName: 'Aisha Khan',
    employeeDept: 'Marketing',
    managerId: 'u2',
    managerName: 'Meera Kapoor',
    reason: 'GOAL_NOT_SUBMITTED',
    level: 'L2_MANAGER_ALERT',
    status: 'OPEN',
    triggeredAt: '2026-03-15T00:00:00Z',
    daysOverdue: 12,
    ruleId: 'rule-2'
  },
  {
    id: 'esc-2',
    employeeId: 'u7',
    employeeName: 'Dev Patel',
    employeeDept: 'Operations',
    managerId: 'u5',
    managerName: 'Vikram Nair',
    reason: 'CHECKIN_MISSED',
    level: 'L1_SELF_REMINDER',
    status: 'OPEN',
    triggeredAt: '2026-05-10T00:00:00Z',
    daysOverdue: 4,
    ruleId: 'rule-5'
  },
  {
    id: 'esc-3',
    employeeId: 'u4',
    employeeName: 'Rohit Mehta',
    employeeDept: 'Engineering',
    managerId: 'u5',
    managerName: 'Vikram Nair',
    reason: 'GOAL_NOT_APPROVED',
    level: 'L2_MANAGER_ALERT',
    status: 'IN_PROGRESS',
    triggeredAt: '2026-03-20T00:00:00Z',
    daysOverdue: 9,
    ruleId: 'rule-4',
    notes: '[2026-03-22T00:00:00Z] Reminder sent to manager'
  },
];

// ============================================
// MOCK AUDIT LOGS - 10 events
// ============================================

export const mockAuditEvents: AuditEvent[] = [
  { id: 'a1', userId: 'u3', user: mockUsers[0], action: 'goal_created', entityType: 'goal', entityId: 'g1', newValue: { title: 'Increase Q4 Revenue to ₹100L', weightage: 40 }, timestamp: '2026-01-15T10:00:00Z' },
  { id: 'a2', userId: 'u3', user: mockUsers[0], action: 'goal_submitted', entityType: 'goal', entityId: 'g1', timestamp: '2026-01-16T09:00:00Z' },
  { id: 'a3', userId: 'u2', user: mockUsers[6], action: 'goal_approved', entityType: 'goal', entityId: 'g1', oldValue: { status: 'PENDING' }, newValue: { status: 'APPROVED' }, timestamp: '2026-01-20T14:00:00Z' },
  { id: 'a4', userId: 'u3', user: mockUsers[0], action: 'checkin_submitted', entityType: 'goal', entityId: 'g1', newValue: { quarter: 'Q1', actual: 78 }, timestamp: '2026-02-15T11:00:00Z' },
  { id: 'a5', userId: 'u2', user: mockUsers[6], action: 'manager_comment', entityType: 'goal', entityId: 'g1', newValue: { comment: 'Great start!' }, timestamp: '2026-02-15T15:00:00Z' },
  { id: 'a6', userId: 'u4', user: mockUsers[1], action: 'goal_created', entityType: 'goal', entityId: 'g4', newValue: { title: 'Complete AWS Certification', weightage: 20 }, timestamp: '2026-03-01T10:00:00Z' },
  { id: 'a7', userId: 'u4', user: mockUsers[1], action: 'goal_submitted', entityType: 'goal', entityId: 'g4', timestamp: '2026-03-02T09:00:00Z' },
  { id: 'a8', userId: 'u7', user: mockUsers[3], action: 'goal_created', entityType: 'goal', entityId: 'g5', newValue: { title: 'Launch New Product Feature', weightage: 25 }, timestamp: '2026-01-02T10:00:00Z' },
  { id: 'a9', userId: 'u5', user: mockUsers[7], action: 'goal_approved', entityType: 'goal', entityId: 'g5', oldValue: { status: 'PENDING' }, newValue: { status: 'APPROVED' }, timestamp: '2026-01-05T14:00:00Z' },
  { id: 'a10', userId: 'u3', user: mockUsers[0], action: 'goal_returned', entityType: 'goal', entityId: 'g2', oldValue: { status: 'APPROVED' }, newValue: { status: 'RETURNED', reason: 'Target too ambitious' }, timestamp: '2026-02-01T10:00:00Z' },
];

// ============================================
// MOCK NOTIFICATIONS - 5 unread
// ============================================

export const mockNotifications: Notification[] = [
  { id: 'n1', userId: 'u3', title: 'Goal Approved', message: 'Your goal "Increase Q4 Revenue" has been approved by Meera Kapoor', type: 'SUCCESS', read: false, createdAt: '2026-01-20T14:00:00Z' },
  { id: 'n2', userId: 'u3', title: 'Check-in Reminder', message: 'Q1 check-in window closes in 5 days. Submit your progress.', type: 'WARNING', read: false, createdAt: '2026-02-10T09:00:00Z' },
  { id: 'n3', userId: 'u2', title: 'Escalation Triggered', message: 'Aisha Khan has not submitted goals for 12 days - escalation triggered', type: 'ERROR', read: false, createdAt: '2026-03-15T10:00:00Z' },
  { id: 'n4', userId: 'u3', title: 'Manager Comment', message: 'Meera Kapoor commented on your Q1 progress', type: 'INFO', read: false, createdAt: '2026-02-15T15:00:00Z' },
  { id: 'n5', userId: 'u3', title: 'Goal Unlocked', message: 'Your goal "Zero Safety Incidents" has been unlocked for editing', type: 'INFO', read: false, createdAt: '2026-03-20T11:00:00Z' },
];

// ============================================
// OTHER MOCK DATA
// ============================================

export const mockSharedGoals: SharedGoal[] = [
  {
    id: 'sg1',
    title: 'Company Revenue Target - Q4 2026',
    description: 'Achieve ₹10Cr in Q4 revenue across all sales teams',
    thrustArea: 'Revenue & Growth',
    weightage: 50,
    targetValue: 10000000,
    currentValue: 7250000,
    actualAchievement: 7250000,
    unit: '₹',
    uomType: 'MIN',
    department: 'Sales',
    isReadOnly: true,
    goals: [],
    contributors: [],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-05-15T00:00:00Z'
  },
];

export const mockTeamMembers: TeamMember[] = [
  { id: 'u3', name: 'Priya Sharma', department: 'Sales', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya', totalGoals: 3, completedGoals: 1, avgProgress: 85, performance: 90, checkInCompleted: true },
  { id: 'u4', name: 'Rohit Mehta', department: 'Engineering', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rohit', totalGoals: 1, completedGoals: 0, avgProgress: 0, performance: 60, checkInCompleted: false },
  { id: 'u6', name: 'Aisha Khan', department: 'Marketing', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=aisha', totalGoals: 0, completedGoals: 0, avgProgress: 0, performance: 0, checkInCompleted: false },
  { id: 'u7', name: 'Dev Patel', department: 'Operations', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dev', totalGoals: 1, completedGoals: 1, avgProgress: 100, performance: 95, checkInCompleted: false },
];

export const mockActivities: Activity[] = [
  { id: 'act1', userId: 'u3', type: 'goal_created', description: 'Created goal "Increase Q4 Revenue to ₹100L"', timestamp: '2026-01-15T10:00:00Z' },
  { id: 'act2', userId: 'u3', type: 'goal_submitted', description: 'Submitted 3 goals for approval', timestamp: '2026-01-16T09:00:00Z' },
  { id: 'act3', userId: 'u2', type: 'goal_approved', description: 'Approved "Increase Q4 Revenue to ₹100L"', timestamp: '2026-01-20T14:00:00Z' },
  { id: 'act4', userId: 'u3', type: 'checkin_submitted', description: 'Submitted Q1 check-in for Revenue goal', timestamp: '2026-02-15T11:00:00Z' },
  { id: 'act5', userId: 'u4', type: 'goal_created', description: 'Created goal "Complete AWS Certification"', timestamp: '2026-03-01T10:00:00Z' },
];

export const mockDashboardData = {
  totalGoals: 9,
  pendingGoals: 1,
  approvedGoals: 7,
  rejectedGoals: 0,
  draftGoals: 1,
  avgProgress: 72,
  completedGoals: 3,
  atRiskGoals: 1,
};

export const mockDepartmentPerformance = [
  { department: 'Sales', performance: 90, goals: 3, employees: 1 },
  { department: 'Engineering', performance: 60, goals: 1, employees: 1 },
  { department: 'Marketing', performance: 0, goals: 0, employees: 1 },
  { department: 'Operations', performance: 95, goals: 1, employees: 1 },
  { department: 'HR', performance: 78, goals: 2, employees: 1 },
  { department: 'Finance', performance: 85, goals: 2, employees: 1 },
];

export const mockThrustAreasData = [
  { name: 'Revenue & Growth', goals: 1 },
  { name: 'Customer Excellence', goals: 1 },
  { name: 'Operational Excellence', goals: 1 },
  { name: 'Innovation & Digital Transformation', goals: 2 },
  { name: 'Talent & Culture', goals: 2 },
  { name: 'Sustainability', goals: 1 },
  { name: 'Compliance & Risk', goals: 1 },
  { name: 'Market Expansion', goals: 0 },
];

export const mockQuarterTrends = [
  { quarter: 'Q1', totalGoals: 6, avgProgress: 65 },
  { quarter: 'Q2', totalGoals: 8, avgProgress: 72 },
  { quarter: 'Q3', totalGoals: 9, avgProgress: 78 },
  { quarter: 'Q4', totalGoals: 9, avgProgress: 72 },
];

export const checkInCompletionData = [
  { quarter: 'Q1', completed: 5, pending: 1 },
  { quarter: 'Q2', completed: 4, pending: 2 },
  { quarter: 'Q3', completed: 3, pending: 3 },
  { quarter: 'Q4', completed: 0, pending: 6 },
];

export const managerEffectivenessData = [
  { manager: 'Meera Kapoor', teamSize: 3, goalsApproved: 5, checkInsCompleted: 4, avgDaysToApprove: 2 },
  { manager: 'Vikram Nair', teamSize: 3, goalsApproved: 4, checkInsCompleted: 3, avgDaysToApprove: 3 },
  { manager: 'HR Admin', teamSize: 4, goalsApproved: 6, checkInsCompleted: 5, avgDaysToApprove: 1 },
];

export const escalationStats = {
  open: 2,
  inProgress: 1,
  resolved: 0,
  byLevel: [
    { level: 'L1', count: 1 },
    { level: 'L2', count: 2 },
    { level: 'L3', count: 0 },
  ],
};

export const mockCycleConfig: CycleConfig = {
  id: 'cycle-2026',
  name: '2026 Goal Cycle',
  startDate: '2026-01-01',
  endDate: '2026-12-31',
  quarter: 'Q4',
  year: 2026,
  status: 'ACTIVE',
  goalSubmissionDeadline: '2026-01-31',
  checkInDeadline: '2026-03-31',
  isLocked: false,
};

export default {
  mockUsers,
  mockGoals,
  mockEscalations,
  mockAuditEvents,
  mockNotifications,
  mockSharedGoals,
  mockTeamMembers,
  mockActivities,
  mockDashboardData,
  mockDepartmentPerformance,
  mockThrustAreasData,
  mockQuarterTrends,
  checkInCompletionData,
  managerEffectivenessData,
  escalationStats,
  mockCycleConfig,
};