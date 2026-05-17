export type Role = 'EMPLOYEE' | 'MANAGER' | 'ADMIN';

export type GoalStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED' | 'ARCHIVED' | 'LOCKED';

export type KPIType = 'QUANTITATIVE' | 'QUALITATIVE';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// Unit of Measurement types as per BRD
// MIN = Higher is better (e.g., Revenue, Sales - cap at 100%)
// MAX = Lower is better (e.g., TAT, Cost, Errors - if 0, return 100%)
// TIMELINE = Date-based (before deadline = 100%, else partial or 0%)
// ZERO = Binary (0 = 100%, anything else = 0%)
export type UoMType = 'MIN' | 'MAX' | 'TIMELINE' | 'ZERO';

export const UOM_LABELS: Record<UoMType, { label: string; description: string; example: string }> = {
  'MIN': { 
    label: 'Min (Higher is Better)', 
    description: 'Progress = achievement ÷ target × 100 (capped at 100%)',
    example: 'Revenue, Sales, Customer Satisfaction'
  },
  'MAX': { 
    label: 'Max (Lower is Better)', 
    description: 'Progress = target ÷ achievement × 100 (if achievement=0, return 100%)',
    example: 'TAT, Cost, Errors, Defects'
  },
  'TIMELINE': { 
    label: 'Timeline (Date-based)', 
    description: 'If done before deadline → 100%, else partial based on time remaining',
    example: 'Project Delivery, Milestone Completion'
  },
  'ZERO': { 
    label: 'Zero (0 = Success)', 
    description: 'If achievement === 0 → 100%, else 0% (binary)',
    example: 'Safety Incidents, Complaints, Errors'
  }
};

// Thrust Areas
export const THRUST_AREAS = [
  'Revenue & Growth',
  'Customer Excellence',
  'Operational Excellence',
  'Innovation & Digital Transformation',
  'Talent & Culture',
  'Sustainability',
  'Compliance & Risk',
  'Market Expansion'
] as const;

export type ThrustArea = typeof THRUST_AREAS[number];

// Goal Status for tracking
export type GoalProgressStatus = 'NOT_STARTED' | 'ON_TRACK' | 'COMPLETED' | 'AT_RISK';

// Check-in quarter
export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  department: string;
  avatar?: string;
  managerId?: string;
  createdAt?: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  thrustArea: ThrustArea;
  status: GoalStatus;
  weightage: number;
  kpiType: KPIType;
  uomType: UoMType;
  targetValue: number;
  currentValue: number;
  actualAchievement: number;
  unit: string;
  quarter: Quarter;
  year: number;
  priority: Priority;
  progressStatus: GoalProgressStatus;
  ownerId: string;
  owner?: User;
  approvedBy?: string;
  approvedByUser?: User;
  approvedAt?: string;
  lockedAt?: string;
  sharedGoalId?: string;
  startDate?: string;     // For TIMELINE UoM
  deadline?: string;    // For TIMELINE UoM
  completedAt?: string; // For TIMELINE UoM
  createdAt: string;
  updatedAt: string;
  // Check-in fields
  checkInComments?: CheckInComment[];
  q1Actual?: number;
  q2Actual?: number;
  q3Actual?: number;
  q4Actual?: number;
  milestones?: Milestone[];
}

export interface Milestone {
  id: string;
  goalId: string;
  title: string;
  description?: string;
  targetDate: string;
  completedDate?: string;
  isCompleted: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CheckInComment {
  id: string;
  goalId: string;
  userId: string;
  user?: User;
  quarter: Quarter;
  comment: string;
  createdAt: string;
}

export interface SharedGoal {
  id: string;
  title: string;
  description: string;
  thrustArea: ThrustArea;
  weightage: number;
  targetValue: number;
  currentValue: number;
  actualAchievement: number;
  unit: string;
  uomType: UoMType;
  department: string;
  isReadOnly: boolean;
  goals: Goal[];
  contributors: User[];
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  userId: string;
  type: string;
  description: string;
  goalId?: string;
  timestamp: string;
}

export interface Escalation {
  id: string;
  goalId?: string;
  userId: string;
  user?: User;
  escalatedBy: string;
  escalatedByUser?: User;
  reason: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  escalationLevel: number;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface AuditEvent {
  id: string;
  userId: string;
  user?: User;
  action: string;
  entityType: 'goal' | 'user' | 'department' | 'cycle' | 'shared_goal';
  entityId: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface CycleConfig {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  quarter: Quarter;
  year: number;
  status: 'PLANNING' | 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
  goalSubmissionDeadline: string;
  checkInDeadline: string;
  isLocked: boolean;
}

export interface Department {
  id: string;
  name: string;
  headId: string;
  head?: User;
}

export interface TeamMember {
  id: string;
  name: string;
  department: string;
  avatar?: string;
  totalGoals: number;
  completedGoals: number;
  avgProgress: number;
  performance: number;
  checkInCompleted: boolean;
}

export interface ReportData {
  employeeName: string;
  department: string;
  goalTitle: string;
  thrustArea: ThrustArea;
  uomType: UoMType;
  unit: string;
  targetValue: number;
  actualAchievement: number;
  progressPercent: number;
  weightage: number;
  status: GoalStatus;
  quarter: Quarter;
}

// ============================================
// CORRECT UoM FORMULAS AS PER BRD
// ============================================

/**
 * Calculate progress based on UoM type using correct BRD formulas:
 * 
 * MIN (higher is better): achievement ÷ target × 100 (cap at 100%)
 * MAX (lower is better): target ÷ achievement × 100 (if achievement=0, return 100%)
 * TIMELINE: If done before deadline → 100%, else partial = (deadline - today) / (deadline - start)
 * ZERO: If achievement === 0 → 100%, else 0% (binary only)
 */
export function calculateProgress(goal: Goal): number {
  const target = goal.targetValue;
  const actual = goal.actualAchievement ?? goal.currentValue ?? 0;
  
  switch (goal.uomType) {
    case 'MIN':
      // MIN = Higher is better (e.g., Revenue, Sales, Customer Satisfaction)
      // Formula: achievement ÷ target × 100, capped at 100%
      if (target === 0) return 0;
      return Math.min((actual / target) * 100, 100);
    
    case 'MAX':
      // MAX = Lower is better (e.g., TAT, Cost, Errors, Defects)
      // Formula: target ÷ achievement × 100, if achievement=0 return 100%
      if (actual === 0) return 100; // Edge case: if no incidents/errors, 100% success
      if (target === 0) return 0;
      return Math.min((target / actual) * 100, 100);
    
    case 'TIMELINE':
      // TIMELINE = Date-based completion
      // If completed before deadline → 100%
      // Else partial = (deadline - today) / (deadline - start)
      if (goal.completedAt) {
        const deadline = goal.deadline ? new Date(goal.deadline) : null;
        const completed = new Date(goal.completedAt);
        if (deadline && completed <= deadline) {
          return 100;
        }
      }
      
      // Calculate partial progress based on time
      const now = new Date();
      const start = goal.startDate ? new Date(goal.startDate) : null;
      const deadline = goal.deadline ? new Date(goal.deadline) : null;
      
      if (!start || !deadline) {
        // If no dates, use actual as percentage
        return Math.min(actual, 100);
      }
      
      const totalDuration = deadline.getTime() - start.getTime();
      if (totalDuration <= 0) return 0;
      
      const elapsed = now.getTime() - start.getTime();
      const remaining = deadline.getTime() - now.getTime();
      
      if (remaining < 0) {
        // Past deadline - no progress = 0%
        return 0;
      }
      
      // Partial progress = time elapsed / total time
      const progress = (elapsed / totalDuration) * 100;
      return Math.min(Math.max(progress, 0), 100);
    
    case 'ZERO':
      // ZERO = Binary (0 = Success, anything else = Failure)
      // If achievement === 0 → 100%, else 0%
      if (actual === 0) return 100;
      return 0;
    
    default:
      return 0;
  }
}

/**
 * Get progress display text explaining the calculation
 */
export function getProgressExplanation(goal: Goal): string {
  const target = goal.targetValue;
  const actual = goal.actualAchievement ?? goal.currentValue ?? 0;
  const progress = calculateProgress(goal);
  
  switch (goal.uomType) {
    case 'MIN':
      return `${actual} ÷ ${target} × 100 = ${progress.toFixed(1)}% (capped at 100%)`;
    
    case 'MAX':
      if (actual === 0) return `${target} ÷ 0 = 100% (no incidents = full success)`;
      return `${target} ÷ ${actual} × 100 = ${progress.toFixed(1)}%`;
    
    case 'TIMELINE':
      if (goal.completedAt) {
        const deadline = goal.deadline ? new Date(goal.deadline) : null;
        const completed = new Date(goal.completedAt);
        if (deadline && completed <= deadline) {
          return `Completed before deadline = 100%`;
        }
      }
      return `Time-based progress: ${progress.toFixed(1)}%`;
    
    case 'ZERO':
      if (actual === 0) return `Zero incidents = 100% (success!)`;
      return `${actual} incidents = 0% (target was 0)`;
    
    default:
      return `${progress}%`;
  }
}

/**
 * Check if goal is at risk based on UoM type
 */
export function isGoalAtRisk(goal: Goal): boolean {
  const progress = calculateProgress(goal);
  
  // For ZERO type, any achievement > 0 means at risk
  if (goal.uomType === 'ZERO') {
    return (goal.actualAchievement ?? goal.currentValue ?? 0) > 0;
  }
  
  // For TIMELINE, check if past deadline without completion
  if (goal.uomType === 'TIMELINE' && goal.deadline && !goal.completedAt) {
    const now = new Date();
    const deadline = new Date(goal.deadline);
    return now > deadline;
  }
  
  // General: below 50% progress is at risk
  return progress < 50;
}

/**
 * Check if goal is completed based on UoM type
 */
export function isGoalCompleted(goal: Goal): boolean {
  const progress = calculateProgress(goal);
  
  // For ZERO type, completed only if actual = 0
  if (goal.uomType === 'ZERO') {
    return (goal.actualAchievement ?? goal.currentValue ?? 0) === 0;
  }
  
  // For TIMELINE, completed if marked as done before deadline
  if (goal.uomType === 'TIMELINE' && goal.completedAt && goal.deadline) {
    const completed = new Date(goal.completedAt);
    const deadline = new Date(goal.deadline);
    return completed <= deadline;
  }
  
  // General: 100% = completed
  return progress >= 100;
}