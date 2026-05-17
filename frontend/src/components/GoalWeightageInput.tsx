// FILE: src/components/GoalWeightageInput.tsx

import { Trash2, AlertCircle } from 'lucide-react';

interface GoalInput {
  id: string;
  title: string;
  weightage: number;
}

interface GoalWeightageInputProps {
  goal: GoalInput;
  onUpdate: (id: string, updates: Partial<GoalInput>) => void;
  onDelete: (id: string) => void;
  remainingBudget: number;
  isLast: boolean;
}

export default function GoalWeightageInput({
  goal,
  onUpdate,
  onDelete,
  remainingBudget,
  isLast,
}: GoalWeightageInputProps) {
  const isBelowMin = goal.weightage < 10;
  const isOverBudget = goal.weightage > remainingBudget + goal.weightage;

  const handleWeightageChange = (value: number) => {
    if (value > 100) value = 100;
    if (value < 0) value = 0;
    onUpdate(goal.id, { weightage: value });
  };

  return (
    <div className={`p-4 rounded-lg border transition-all duration-200 ${
      isBelowMin ? 'border-red-500/50 bg-red-500/5' :
      isOverBudget ? 'border-amber-500/50 bg-amber-500/5' :
      'border-[var(--border)] bg-[var(--card)]'
    }`}>
      <div className="flex items-start gap-3">
        {/* Goal Title */}
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={goal.title}
            onChange={(e) => onUpdate(goal.id, { title: e.target.value })}
            className="input w-full"
            placeholder="Goal title"
          />
        </div>

        {/* Weightage Input */}
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={goal.weightage}
              onChange={(e) => handleWeightageChange(parseInt(e.target.value) || 0)}
              className={`input w-20 text-center ${
                isBelowMin ? 'border-red-500 focus:border-red-500' : ''
              }`}
              min={0}
              max={100}
            />
            <span className="text-[var(--muted-foreground)]">%</span>
          </div>

          {/* Usage indicator */}
          <div className={`text-xs ${
            isOverBudget ? 'text-amber-500' : 'text-[var(--muted-foreground)]'
          }`}>
            {goal.weightage > remainingBudget + goal.weightage
              ? `Uses ${goal.weightage - remainingBudget}% over budget`
              : `${goal.weightage}% of ${remainingBudget + goal.weightage}% available`}
          </div>

          {/* Error message */}
          {isBelowMin && (
            <div className="flex items-center gap-1 text-xs text-red-500">
              <AlertCircle size={12} />
              <span>Minimum 10% required</span>
            </div>
          )}
        </div>

        {/* Delete Button */}
        <button
          onClick={() => onDelete(goal.id)}
          disabled={isLast}
          className={`p-2 rounded-lg transition-colors ${
            isLast
              ? 'text-[var(--muted-foreground)] cursor-not-allowed'
              : 'text-[var(--muted-foreground)] hover:text-red-500 hover:bg-red-500/10'
          }`}
          title={isLast ? 'Cannot delete the last goal' : 'Delete goal'}
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}

export { GoalWeightageInput };