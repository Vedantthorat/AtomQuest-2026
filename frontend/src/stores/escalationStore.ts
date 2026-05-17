// FILE: src/stores/escalationStore.ts

import { create } from 'zustand';
import type { EscalationRule, EscalationItem, EscalationStats } from '../types/escalation';
import { DEFAULT_RULES, checkAllEscalations, getEscalationStats, MOCK_EMPLOYEES } from '../services/escalationEngine';

interface EscalationState {
  rules: EscalationRule[];
  escalations: EscalationItem[];
  stats: EscalationStats;
  updateRule: (id: string, updates: Partial<EscalationRule>) => void;
  resolveEscalation: (id: string, note: string) => void;
  dismissEscalation: (id: string) => void;
  addNote: (id: string, note: string) => void;
  refreshEscalations: () => void;
  resetRules: () => void;
}

const initialEscalations = checkAllEscalations(MOCK_EMPLOYEES, DEFAULT_RULES);
const initialStats = getEscalationStats(initialEscalations);

export const useEscalationStore = create<EscalationState>((set, get) => ({
  rules: DEFAULT_RULES,
  escalations: initialEscalations,
  stats: initialStats,

  updateRule: (id: string, updates: Partial<EscalationRule>) => {
    set((state) => {
      const newRules = state.rules.map(rule =>
        rule.id === id ? { ...rule, ...updates } : rule
      );
      // Re-check escalations with updated rules
      const newEscalations = checkAllEscalations(MOCK_EMPLOYEES, newRules);
      return {
        rules: newRules,
        escalations: newEscalations,
        stats: getEscalationStats(newEscalations),
      };
    });
  },

  resolveEscalation: (id: string, note: string) => {
    set((state) => {
      const newEscalations = state.escalations.map(esc =>
        esc.id === id
          ? {
              ...esc,
              status: 'RESOLVED' as const,
              resolvedAt: new Date().toISOString(),
              resolvedBy: 'current-user',
              notes: esc.notes ? `${esc.notes}\n[${new Date().toISOString()}] Resolution: ${note}` : `[${new Date().toISOString()}] Resolution: ${note}`,
            }
          : esc
      );
      return {
        escalations: newEscalations,
        stats: getEscalationStats(newEscalations),
      };
    });
  },

  dismissEscalation: (id: string) => {
    set((state) => {
      const newEscalations = state.escalations.map(esc =>
        esc.id === id
          ? {
              ...esc,
              status: 'DISMISSED' as const,
              resolvedAt: new Date().toISOString(),
            }
          : esc
      );
      return {
        escalations: newEscalations,
        stats: getEscalationStats(newEscalations),
      };
    });
  },

  addNote: (id: string, note: string) => {
    set((state) => {
      const newEscalations = state.escalations.map(esc =>
        esc.id === id
          ? {
              ...esc,
              status: 'IN_PROGRESS' as const,
              notes: esc.notes ? `${esc.notes}\n[${new Date().toISOString()}] ${note}` : `[${new Date().toISOString()}] ${note}`,
            }
          : esc
      );
      return {
        escalations: newEscalations,
        stats: getEscalationStats(newEscalations),
      };
    });
  },

  refreshEscalations: () => {
    const { rules } = get();
    const newEscalations = checkAllEscalations(MOCK_EMPLOYEES, rules);
    set({
      escalations: newEscalations,
      stats: getEscalationStats(newEscalations),
    });
  },

  resetRules: () => {
    set({
      rules: DEFAULT_RULES,
    });
    get().refreshEscalations();
  },
}));

export default useEscalationStore;