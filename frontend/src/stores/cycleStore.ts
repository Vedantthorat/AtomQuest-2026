// FILE: src/stores/cycleStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CyclePhase, getCurrentPhase, canPerformAction as checkAction, CycleWindow } from '../config/cycleConfig';

interface CycleState {
  overridePhase: CyclePhase | null;
  setOverridePhase: (phase: CyclePhase | null) => void;
  clearOverride: () => void;
  activePhase: () => CyclePhase;
  canDo: (action: string) => boolean;
  getActiveWindow: () => CycleWindow;
}

export const useCycleStore = create<CycleState>()(
  persist(
    (set, get) => ({
      overridePhase: null,

      setOverridePhase: (phase: CyclePhase | null) => {
        set({ overridePhase: phase });
      },

      clearOverride: () => {
        set({ overridePhase: null });
      },

      activePhase: (): CyclePhase => {
        const { overridePhase } = get();
        if (overridePhase) return overridePhase;
        return getCurrentPhase().phase;
      },

      canDo: (action: string): boolean => {
        const { overridePhase } = get();
        return checkAction(action as any, overridePhase || undefined);
      },

      getActiveWindow: (): CycleWindow => {
        const { overridePhase } = get();
        if (overridePhase) {
          const windows = {
            GOAL_SETTING: { phase: 'GOAL_SETTING' as CyclePhase, name: 'Goal Setting (Demo)', opensMonth: 4, closesMonth: 5, description: 'Demo mode', allowedActions: ['create_goals', 'edit_goals', 'submit_goals', 'approve_goals', 'submit_q1_checkin', 'view_q1_progress'] },
            Q1: { phase: 'Q1' as CyclePhase, name: 'Q1 Check-in (Demo)', opensMonth: 6, closesMonth: 6, description: 'Demo mode', allowedActions: ['submit_q1_checkin', 'view_q1_progress', 'manager_q1_comment'] },
            Q2: { phase: 'Q2' as CyclePhase, name: 'Q2 Check-in (Demo)', opensMonth: 9, closesMonth: 9, description: 'Demo mode', allowedActions: ['submit_q2_checkin', 'view_q2_progress', 'manager_q2_comment'] },
            Q3: { phase: 'Q3' as CyclePhase, name: 'Q3 Check-in (Demo)', opensMonth: 0, closesMonth: 1, description: 'Demo mode', allowedActions: ['submit_q3_checkin', 'view_q3_progress', 'manager_q3_comment'] },
            Q4: { phase: 'Q4' as CyclePhase, name: 'Q4 & Annual Review (Demo)', opensMonth: 2, closesMonth: 3, description: 'Demo mode', allowedActions: ['submit_q4_checkin', 'final_achievement', 'view_annual'] },
            CLOSED: { phase: 'CLOSED' as CyclePhase, name: 'Closed (Demo)', opensMonth: -1, closesMonth: -1, description: 'Demo mode', allowedActions: [] },
          };
          return windows[overridePhase] as CycleWindow;
        }
        return getCurrentPhase();
      },
    }),
    {
      name: 'atomtrack-cycle-storage',
      storage: {
        getItem: (name) => {
          const str = sessionStorage.getItem(name);
          return str ? JSON.parse(str) : null;
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name);
        },
      },
    }
  )
);

export default useCycleStore;