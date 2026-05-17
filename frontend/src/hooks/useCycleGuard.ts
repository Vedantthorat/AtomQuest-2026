// FILE: src/hooks/useCycleGuard.ts

import { useMemo } from 'react';
import { useCycleStore } from '../stores/cycleStore';
import { CycleWindow, canPerformAction as checkAction, getCurrentPhase } from '../config/cycleConfig';

interface CycleGuardResult {
  allowed: boolean;
  reason: string;
  activePhase: CycleWindow | null;
  isDemoMode: boolean;
}

export function useCycleGuard(action: string): CycleGuardResult {
  const { overridePhase, canDo, getActiveWindow } = useCycleStore();

  return useMemo(() => {
    const activeWindow = getActiveWindow();
    const isDemoMode = !!overridePhase;
    const allowed = canDo(action);

    // Generate reason based on state
    let reason = '';
    if (!allowed) {
      if (isDemoMode) {
        reason = `Action "${action}" is not allowed during ${activeWindow.name}`;
      } else {
        const currentPhase = getCurrentPhase();
        reason = `This action is only available during ${currentPhase.name}. Currently in ${currentPhase.phase === 'CLOSED' ? 'a closed period' : currentPhase.name}.`;
      }
    }

    return {
      allowed,
      reason,
      activePhase: activeWindow,
      isDemoMode,
    };
  }, [action, overridePhase, canDo, getActiveWindow]);
}

export function useCanPerform(actions: string | string[]): boolean {
  const { canDo } = useCycleStore();
  
  if (Array.isArray(actions)) {
    return actions.some(action => canDo(action));
  }
  
  return canDo(actions);
}

export function useCurrentPhase() {
  const { getActiveWindow, overridePhase } = useCycleStore();
  return getActiveWindow();
}

export function useIsDemoMode() {
  const { overridePhase } = useCycleStore();
  return !!overridePhase;
}

export default useCycleGuard;