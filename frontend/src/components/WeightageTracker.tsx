// FILE: src/components/WeightageTracker.tsx

import { useMemo } from 'react';
import { Target, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface GoalSummary {
  id: string;
  title: string;
  weightage: number;
}

interface WeightageTrackerProps {
  goals: GoalSummary[];
  maxGoals?: number;
  showDetails?: boolean;
}

interface ValidationResult {
  total: number;
  remaining: number;
  isValid: boolean;
  isOver: boolean;
  errors: string[];
}

export function useWeightageValidation(goals: GoalSummary[]): ValidationResult {
  return useMemo(() => {
    const total = goals.reduce((sum, g) => sum + g.weightage, 0);
    const remaining = 100 - total;
    const isOver = total > 100;
    const isValid = total === 100;
    const errors: string[] = [];

    // Check individual goal weightages
    goals.forEach((goal, index) => {
      if (goal.weightage < 10) {
        errors.push(`Goal "${goal.title}" is below 10% minimum (${goal.weightage}%)`);
      }
      if (goal.weightage > 100) {
        errors.push(`Goal "${goal.title}" exceeds 100% (${goal.weightage}%)`);
      }
    });

    // Check total
    if (total < 100) {
      errors.push(`Total weightage is ${total}% — must equal exactly 100%`);
    }
    if (total > 100) {
      errors.push(`Over budget by ${total - 100}% — reduce some goals`);
    }

    // Check max goals
    if (goals.length > 8) {
      errors.push(`You have ${goals.length} goals — maximum is 8`);
    }

    return { total, remaining, isValid, isOver, errors };
  }, [goals]);
}

export default function WeightageTracker({ goals, maxGoals = 8, showDetails = true }: WeightageTrackerProps) {
  const validation = useWeightageValidation(goals);

  const getBarColor = () => {
    if (validation.isOver) return 'bg-red-500';
    if (validation.isValid) return 'bg-green-500';
    return 'bg-amber-500';
  };

  const getStatusMessage = () => {
    if (validation.isOver) {
      return `⚠ Over budget by ${validation.total - 100}% — reduce some goals`;
    }
    if (validation.isValid) {
      return '✓ Exactly 100% — ready to submit!';
    }
    return `${validation.total}% used · ${validation.remaining}% remaining`;
  };

  const getStatusIcon = () => {
    if (validation.isOver) return <AlertTriangle className="text-red-500" size={18} />;
    if (validation.isValid) return <CheckCircle className="text-green-500" size={18} />;
    return <Info className="text-amber-500" size={18} />;
  };

  const getGoalChipColor = (weightage: number) => {
    if (weightage < 10) return 'bg-red-500';
    if (weightage >= 20) return 'bg-green-500';
    return 'bg-blue-500';
  };

  return (
    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="text-primary-500" size={20} />
          <span className="font-semibold">Weightage Budget</span>
        </div>
        <div className="text-sm text-[var(--muted-foreground)]">
          {goals.length} of {maxGoals} goals used
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="h-4 bg-[var(--muted)] rounded-full overflow-hidden transition-all duration-200 ease-in-out">
          <div
            className={`h-full rounded-full ${getBarColor()} transition-all duration-200 ease-in-out`}
            style={{ width: `${Math.min(validation.total, 100)}%` }}
          />
        </div>
        {/* Over-budget indicator */}
        {validation.isOver && (
          <div
            className="absolute top-0 h-4 bg-red-500/50 rounded-full transition-all duration-200"
            style={{
              left: '100%',
              width: `${Math.min(validation.total - 100, 50)}%`,
            }}
          />
        )}
      </div>

      {/* Status Message */}
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <span className={`text-sm font-medium ${
          validation.isOver ? 'text-red-500' :
          validation.isValid ? 'text-green-500' : 'text-amber-500'
        }`}>
          {getStatusMessage()}
        </span>
      </div>

      {/* Goal Chips */}
      {showDetails && goals.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--muted)] text-sm"
            >
              <div className={`w-2 h-2 rounded-full ${getGoalChipColor(goal.weightage)}`} />
              <span className="max-w-[150px] truncate">{goal.title}</span>
              <span className="text-[var(--muted-foreground)]">·</span>
              <span className="font-medium">{goal.weightage}%</span>
            </div>
          ))}
          {validation.remaining > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-sm">
              <span className="text-amber-500">Unassigned</span>
              <span className="text-amber-500">·</span>
              <span className="font-medium text-amber-500">{validation.remaining}%</span>
            </div>
          )}
        </div>
      )}

      {/* Helper Text */}
      <div className="text-xs text-[var(--muted-foreground)] pt-2 border-t border-[var(--border)]">
        <span className="font-medium">Rules:</span> Min 10% per goal · Max {maxGoals} goals · Must total exactly 100%
      </div>

      {/* Errors */}
      {validation.errors.length > 0 && (
        <div className="space-y-1">
          {validation.errors.slice(0, 3).map((error, index) => (
            <div key={index} className="text-xs text-red-500 flex items-start gap-1">
              <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ))}
          {validation.errors.length > 3 && (
            <div className="text-xs text-[var(--muted-foreground)]">
              +{validation.errors.length - 3} more issues
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export { WeightageTracker };