// FILE: src/config/cycleConfig.ts

export type CyclePhase = 
  | 'GOAL_SETTING'
  | 'Q1'
  | 'Q2'
  | 'Q3'
  | 'Q4'
  | 'CLOSED';

export type ActionType = 
  | 'create_goals'
  | 'edit_goals'
  | 'submit_goals'
  | 'approve_goals'
  | 'submit_q1_checkin'
  | 'view_q1_progress'
  | 'manager_q1_comment'
  | 'submit_q2_checkin'
  | 'view_q2_progress'
  | 'manager_q2_comment'
  | 'submit_q3_checkin'
  | 'view_q3_progress'
  | 'manager_q3_comment'
  | 'submit_q4_checkin'
  | 'final_achievement'
  | 'view_annual';

export interface CycleWindow {
  phase: CyclePhase;
  name: string;
  opensMonth: number;
  closesMonth: number;
  description: string;
  allowedActions: ActionType[];
}

export const CYCLE_WINDOWS: CycleWindow[] = [
  {
    phase: 'GOAL_SETTING',
    name: 'Goal Setting Window',
    opensMonth: 4,  // May (0-indexed)
    closesMonth: 5, // June
    description: 'Set and submit goals for the upcoming year',
    allowedActions: ['create_goals', 'edit_goals', 'submit_goals', 'approve_goals'],
  },
  {
    phase: 'Q1',
    name: 'Q1 Check-in Window',
    opensMonth: 6,  // July
    closesMonth: 6, // July
    description: 'Submit Q1 progress and achievements',
    allowedActions: ['submit_q1_checkin', 'view_q1_progress', 'manager_q1_comment'],
  },
  {
    phase: 'Q2',
    name: 'Q2 Check-in Window',
    opensMonth: 9,  // October
    closesMonth: 9, // October
    description: 'Submit Q2 progress and achievements',
    allowedActions: ['submit_q2_checkin', 'view_q2_progress', 'manager_q2_comment'],
  },
  {
    phase: 'Q3',
    name: 'Q3 Check-in Window',
    opensMonth: 0,  // January
    closesMonth: 1, // February
    description: 'Submit Q3 progress and achievements',
    allowedActions: ['submit_q3_checkin', 'view_q3_progress', 'manager_q3_comment'],
  },
  {
    phase: 'Q4',
    name: 'Q4 & Annual Review',
    opensMonth: 2,  // March
    closesMonth: 3, // April
    description: 'Final Q4 check-in and annual performance review',
    allowedActions: ['submit_q4_checkin', 'final_achievement', 'view_annual'],
  },
  {
    phase: 'CLOSED',
    name: 'Cycle Closed',
    opensMonth: -1,
    closesMonth: -1,
    description: 'No active window - cycle has ended',
    allowedActions: [],
  },
];

export function getCurrentPhase(): CycleWindow {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Find the active window based on current month
  for (const window of CYCLE_WINDOWS) {
    if (window.phase === 'CLOSED') continue;
    
    // Handle wrap-around for Q3 (Jan-Feb) and Q4 (Mar-Apr)
    if (window.phase === 'Q3') {
      if (currentMonth === 0 || currentMonth === 1) { // Jan or Feb
        return window;
      }
    } else if (window.phase === 'Q4') {
      if (currentMonth === 2 || currentMonth === 3) { // Mar or Apr
        return window;
      }
    } else if (window.opensMonth <= window.closesMonth) {
      // Normal case (GOAL_SETTING: May-Jun)
      if (currentMonth >= window.opensMonth && currentMonth <= window.closesMonth) {
        return window;
      }
    }
  }

  // Default to closed if no window matches
  return CYCLE_WINDOWS.find(w => w.phase === 'CLOSED')!;
}

export function canPerformAction(action: ActionType, overridePhase?: CyclePhase): boolean {
  const phase = overridePhase || getCurrentPhase();
  const window = CYCLE_WINDOWS.find(w => w.phase === phase);
  
  if (!window) return false;
  return window.allowedActions.includes(action);
}

export function getDaysUntilNextWindow(): { window: CycleWindow; days: number } | null {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Find the next window
  const upcomingWindows = CYCLE_WINDOWS
    .filter(w => w.phase !== 'CLOSED')
    .map(w => {
      let targetMonth = w.opensMonth;
      let targetYear = currentYear;

      // If the window opens in the past this year, look at next year
      if (w.phase === 'Q3' && currentMonth > 1) {
        targetYear = currentYear + 1;
      } else if (w.phase === 'Q4' && currentMonth > 3) {
        targetYear = currentYear + 1;
      } else if (w.opensMonth <= currentMonth && w.closesMonth >= currentMonth) {
        return { window: w, days: 0 }; // Currently open
      }

      const targetDate = new Date(targetYear, targetMonth, 1);
      const days = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      return { window: w, days };
    })
    .filter(r => r.days > 0)
    .sort((a, b) => a.days - b.days);

  return upcomingWindows.length > 0 ? upcomingWindows[0] : null;
}

export function isWindowOpen(phase: CyclePhase): boolean {
  const current = getCurrentPhase();
  return current.phase === phase;
}

export function getPhaseInfo(phase: CyclePhase): CycleWindow | undefined {
  return CYCLE_WINDOWS.find(w => w.phase === phase);
}

export function getNextPhase(): CycleWindow | null {
  const current = getCurrentPhase();
  const currentIndex = CYCLE_WINDOWS.findIndex(w => w.phase === current.phase);
  
  if (currentIndex < CYCLE_WINDOWS.length - 1) {
    return CYCLE_WINDOWS[currentIndex + 1];
  }
  return null;
}

export const PHASE_LABELS: Record<CyclePhase, string> = {
  GOAL_SETTING: 'Goal Setting',
  Q1: 'Q1 Check-in',
  Q2: 'Q2 Check-in',
  Q3: 'Q3 Check-in',
  Q4: 'Q4 & Annual',
  CLOSED: 'Closed',
};

export const PHASE_COLORS: Record<CyclePhase, string> = {
  GOAL_SETTING: 'bg-blue-500',
  Q1: 'bg-green-500',
  Q2: 'bg-amber-500',
  Q3: 'bg-purple-500',
  Q4: 'bg-pink-500',
  CLOSED: 'bg-gray-500',
};