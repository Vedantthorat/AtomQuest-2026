import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Goal, Activity, Notification, Escalation, Quarter, GoalProgressStatus } from '../types';
import { mockGoals, mockSharedGoals, mockNotifications, mockEscalations, mockAuditEvents, mockActivities, mockCycleConfig, mockDashboardData, mockTeamMembers, mockDepartmentPerformance, mockThrustAreasData, mockQuarterTrends, checkInCompletionData, managerEffectivenessData, escalationStats } from '../services/mockData';

interface DataState {
  goals: Goal[];
  sharedGoals: any[];
  activities: Activity[];
  notifications: Notification[];
  escalations: any[];
  auditEvents: any[];
  cycleConfig: any;
  currentUserId: string;
  setGoals: (goals: Goal[]) => void;
  addGoal: (goal: Goal) => void;
  updateGoal: (goalId: string, updates: Partial<Goal>) => void;
  deleteGoal: (goalId: string) => void;
  approveGoal: (goalId: string, approverId: string) => void;
  returnGoal: (goalId: string, feedback: string) => void;
  unlockGoal: (goalId: string) => void;
  addActivity: (activity: any) => void;
  addNotification: (notification: any) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  addEscalation: (escalation: any) => void;
  resolveEscalation: (escalationId: string, resolverId: string) => void;
  addSharedGoal: (goal: any) => void;
  updateSharedGoalProgress: (id: string) => void;
  getDashboardStats: () => any;
  getPendingApprovals: (managerId: string) => Goal[];
  getGoalsByStatus: (status: string) => Goal[];
  getAllGoalsForExport: () => any[];
  validateWeightage: (newWeightage: number, excludeId?: string) => { valid: boolean; message: string };
  canAddGoal: (ownerId: string) => { canAdd: boolean; message: string };
  submitCheckIn: (goalId: string, quarter: Quarter, actualValue: number, status: GoalProgressStatus, comment: string, managerComment?: string, userId?: string) => void;
  setCurrentUserId: (userId: string) => void;
  getTeamPerformance: () => any;
  getDepartmentPerformance: () => any;
  getThrustAreas: () => any;
  getQuarterTrends: () => any;
  getCheckInCompletion: () => any;
  getManagerEffectiveness: () => any;
  getEscalationStats: () => any;
  lockGoal: (goalId: string) => void;
  rejectGoal: (goalId: string) => void;
}

export const useDataStore = create<DataState>((set, get) => ({
  goals: mockGoals,
  sharedGoals: mockSharedGoals,
  notifications: mockNotifications,
  escalations: mockEscalations,
  auditEvents: mockAuditEvents,
  activities: mockActivities,
  cycleConfig: mockCycleConfig,
  currentUserId: '',

  setGoals: (goals) => set({ goals }),

  addGoal: (goal) => set((state) => ({ goals: [goal, ...state.goals] })),

  updateGoal: (id, updates) => set((state) => ({
    goals: state.goals.map((g) => g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g)
  })),

  deleteGoal: (id) => set((state) => ({
    goals: state.goals.filter((g) => g.id !== id)
  })),

  // Validation: Total weightage = 100%, min 10%, max 8 goals per employee
  validateWeightage: (newWeightage, excludeId) => {
    const currentGoals = get().goals.filter(g => g.id !== excludeId && g.status !== 'ARCHIVED');
    const currentTotal = currentGoals.reduce((sum, g) => sum + g.weightage, 0);
    const newTotal = currentTotal + newWeightage;
    
    if (newTotal > 100) {
      return { valid: false, message: `Total weightage would be ${newTotal}%. Maximum allowed is 100%.` };
    }
    if (newWeightage < 10) {
      return { valid: false, message: 'Minimum weightage per goal is 10%' };
    }
    return { valid: true, message: '' };
  },

  canAddGoal: (ownerId) => {
    const employeeGoals = get().goals.filter(g => g.ownerId === ownerId && g.status !== 'ARCHIVED');
    if (employeeGoals.length >= 8) {
      return { canAdd: false, message: 'Maximum 8 goals allowed per employee' };
    }
    return { canAdd: true, message: '' };
  },

submitCheckIn: (goalId, quarter, actualValue, status, comment, managerComment = '', userId = '') => {
    const goal = get().goals.find(g => g.id === goalId);
    if (!goal) return;
    
    const updates: Partial<Goal> = {
      actualAchievement: actualValue,
      progressStatus: status,
      currentValue: actualValue,
    };

    if (quarter === 'Q1') updates.q1Actual = actualValue;
    if (quarter === 'Q2') updates.q2Actual = actualValue;
    if (quarter === 'Q3') updates.q3Actual = actualValue;
    if (quarter === 'Q4') updates.q4Actual = actualValue;

    // Store check-in comment
    const existingComments = goal.checkInComments || [];
    const newComment = {
      id: `c${Date.now()}`,
      goalId,
      userId: userId || 'system',
      quarter,
      comment: managerComment || comment || '',
      createdAt: new Date().toISOString()
    };
    updates.checkInComments = [...existingComments, newComment];

    get().updateGoal(goalId, updates);
  },

  setCurrentUserId: (userId) => set({ currentUserId: userId }),

  approveGoal: (goalId, approverId) => set((state) => ({
    goals: state.goals.map((g) => g.id === goalId ? {
      ...g,
      status: 'APPROVED',
      approvedBy: approverId,
      approvedAt: new Date().toISOString(),
      lockedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } : g)
  })),

  rejectGoal: (goalId) => set((state) => ({
    goals: state.goals.map((g) => g.id === goalId ? { ...g, status: 'REJECTED', updatedAt: new Date().toISOString() } : g)
  })),

  returnGoal: (goalId, feedback) => set((state) => ({
    goals: state.goals.map((g) => g.id === goalId ? { ...g, status: 'RETURNED', updatedAt: new Date().toISOString() } : g)
  })),

  lockGoal: (goalId) => set((state) => ({
    goals: state.goals.map((g) => g.id === goalId ? { ...g, lockedAt: new Date().toISOString(), status: 'LOCKED' as any } : g)
  })),

  unlockGoal: (goalId) => set((state) => ({
    goals: state.goals.map((g) => g.id === goalId ? { ...g, lockedAt: undefined, status: 'APPROVED' as any } : g)
  })),

  markNotificationRead: (id) => set((state) => ({
    notifications: state.notifications.map((n) => n.id === id ? { ...n, read: true } : n)
  })),

  markAllNotificationsRead: () => set((state) => ({
    notifications: state.notifications.map((n) => ({ ...n, read: true }))
  })),

  addNotification: (notification) => set((state) => ({
    notifications: [notification, ...state.notifications]
  })),

  addActivity: (activity) => set((state) => ({
    activities: [activity, ...state.activities]
  })),

  addEscalation: (escalation) => set((state) => ({
    escalations: [escalation, ...state.escalations]
  })),

  resolveEscalation: (escalationId, resolverId) => set((state) => ({
    escalations: state.escalations.map(e => e.id === escalationId ? { ...e, resolved: true, resolvedBy: resolverId, resolvedAt: new Date().toISOString() } : e)
  })),

  addSharedGoal: (goal) => set((state) => ({
    sharedGoals: [...state.sharedGoals, goal]
  })),

  updateSharedGoalProgress: (id) => {
    const sharedGoal = get().sharedGoals.find(g => g.id === id);
    if (!sharedGoal) return;
    
    const linkedGoals = get().goals.filter(g => g.sharedGoalId === id);
    const avgProgress = linkedGoals.length > 0 
      ? linkedGoals.reduce((sum, g) => sum + (g.actualAchievement / g.targetValue) * 100, 0) / linkedGoals.length
      : 0;
    
    set((state) => ({
      sharedGoals: state.sharedGoals.map(g => g.id === id ? { ...g, currentValue: avgProgress, actualAchievement: avgProgress } : g)
    }));
  },

  getDashboardStats: () => ({ ...mockDashboardData, draftGoals: mockGoals.filter(g => g.status === 'DRAFT').length }),
  getTeamPerformance: () => mockTeamMembers,
  getDepartmentPerformance: () => mockDepartmentPerformance,
  getThrustAreas: () => mockThrustAreasData,
  getQuarterTrends: () => mockQuarterTrends,
  getCheckInCompletion: () => checkInCompletionData,
  getManagerEffectiveness: () => managerEffectivenessData,
  getEscalationStats: () => escalationStats,

  getPendingApprovals: (managerId: string) => get().goals.filter((g) => g.status === 'PENDING'),
  
  getGoalsByStatus: (status: string) => get().goals.filter((g) => g.status === status),
  
  getAllGoalsForExport: () => {
    return get().goals.map(goal => ({
      employeeName: goal.owner?.name || 'Unknown',
      department: goal.owner?.department || 'Unknown',
      goalTitle: goal.title,
      thrustArea: goal.thrustArea,
      uomType: goal.uomType,
      unit: goal.unit,
      targetValue: goal.targetValue,
      actualAchievement: goal.actualAchievement,
      progressPercent: goal.targetValue > 0 ? Math.round((goal.actualAchievement / goal.targetValue) * 100) : 0,
      weightage: goal.weightage,
      status: goal.status,
      quarter: goal.quarter
    }));
  }
}));