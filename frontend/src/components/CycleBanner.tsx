// FILE: src/components/CycleBanner.tsx

import { useCycleStore } from '../stores/cycleStore';
import { getDaysUntilNextWindow, PHASE_LABELS, PHASE_COLORS } from '../config/cycleConfig';
import { Calendar, Clock, AlertCircle } from 'lucide-react';

export default function CycleBanner() {
  const { overridePhase, getActiveWindow, canDo } = useCycleStore();
  const activeWindow = getActiveWindow();
  const nextWindow = getDaysUntilNextWindow();

  const isInWindow = activeWindow.allowedActions.length > 0;

  return (
    <div className={`sticky top-0 z-50 px-4 py-2 border-b transition-colors ${
      overridePhase 
        ? 'bg-yellow-500/10 border-yellow-500/30' 
        : isInWindow 
          ? 'bg-primary-500/10 border-primary-500/30' 
          : 'bg-[var(--card)] border-[var(--border)]'
    }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          {/* Phase Badge */}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${PHASE_COLORS[activeWindow.phase]} text-white`}>
            <Calendar size={14} />
            <span className="font-medium">{PHASE_LABELS[activeWindow.phase]}</span>
          </div>

          {/* Description */}
          <span className="text-[var(--muted-foreground)] hidden md:inline">
            {activeWindow.description}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Override indicator */}
          {overridePhase && (
            <div className="flex items-center gap-2 px-2 py-1 bg-yellow-500/20 rounded text-yellow-600 dark:text-yellow-400">
              <AlertCircle size={14} />
              <span className="font-medium text-xs">DEMO MODE</span>
            </div>
          )}

          {/* Next window countdown */}
          {!isInWindow && nextWindow && (
            <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
              <Clock size={14} />
              <span>
                Next: <span className="font-medium">{nextWindow.window.name}</span> in{' '}
                <span className="font-medium text-[var(--foreground)]">{nextWindow.days} days</span>
              </span>
            </div>
          )}

          {/* Actions available */}
          {isInWindow && (
            <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
              <span className="hidden sm:inline">
                {canDo('create_goals') && 'Can create & edit goals'}
                {canDo('submit_q1_checkin') && !canDo('create_goals') && 'Can submit check-ins'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export { CycleBanner };