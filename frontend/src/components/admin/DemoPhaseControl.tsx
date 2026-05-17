// FILE: src/components/admin/DemoPhaseControl.tsx

import { useCycleStore } from '../../stores/cycleStore';
import { CyclePhase, PHASE_LABELS, PHASE_COLORS } from '../../config/cycleConfig';
import { Settings, RotateCcw, AlertTriangle } from 'lucide-react';

const PHASES: CyclePhase[] = ['GOAL_SETTING', 'Q1', 'Q2', 'Q3', 'Q4'];

export default function DemoPhaseControl() {
  const { overridePhase, setOverridePhase, clearOverride, activePhase } = useCycleStore();
  const current = activePhase();

  const handlePhaseClick = (phase: CyclePhase) => {
    if (overridePhase === phase) {
      clearOverride();
    } else {
      setOverridePhase(phase);
    }
  };

  return (
    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Settings className="text-primary-500" size={20} />
        <h3 className="font-semibold text-lg">Demo Mode — Simulate Cycle Phase</h3>
      </div>

      <p className="text-sm text-[var(--muted-foreground)]">
        Switch phases to show judges how enforcement works live. This lets you demonstrate:
      </p>

      <ul className="text-sm text-[var(--muted-foreground)] space-y-1 list-disc list-inside">
        <li>Goal creation only allowed during Goal Setting window</li>
        <li>Check-in submission only allowed during respective Q windows</li>
        <li>UI disables/enables features based on active phase</li>
      </ul>

      {/* Phase Buttons */}
      <div className="flex flex-wrap gap-2">
        {PHASES.map((phase) => {
          const isActive = current === phase;
          const isOverride = overridePhase === phase;

          return (
            <button
              key={phase}
              onClick={() => handlePhaseClick(phase)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isOverride
                  ? `${PHASE_COLORS[phase]} text-white ring-2 ring-offset-2 ring-offset-[var(--card)] ring-${PHASE_COLORS[phase]}`
                  : isActive
                    ? `bg-[var(--muted)] text-[var(--foreground)]`
                    : 'bg-[var(--muted)]/50 text-[var(--muted-foreground)] hover:bg-[var(--muted)]'
              }`}
            >
              {PHASE_LABELS[phase]}
              {isOverride && ' ✓'}
            </button>
          );
        })}
      </div>

      {/* Clear Override */}
      {overridePhase && (
        <button
          onClick={clearOverride}
          className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          <RotateCcw size={14} />
          Reset to current date
        </button>
      )}

      {/* Warning */}
      <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-sm text-amber-600 dark:text-amber-400">
        <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
        <span>
          This override resets when you close the browser tab (session-based).
          In production, this would persist in the database.
        </span>
      </div>

      {/* Current Status */}
      <div className="pt-4 border-t border-[var(--border)]">
        <div className="text-sm">
          <span className="text-[var(--muted-foreground)]">Current active phase: </span>
          <span className={`font-medium ${PHASE_COLORS[current]} text-white px-2 py-0.5 rounded`}>
            {PHASE_LABELS[current]}
          </span>
        </div>
      </div>
    </div>
  );
}

export { DemoPhaseControl };