import { useState, useMemo } from 'react';
import { Save, X, CheckCircle, AlertTriangle, Edit2 } from 'lucide-react';
import type { Goal } from '../types';

interface BulkCheckInModeProps {
  goals: Goal[];
  currentQuarter: string;
  onSave: (updates: Array<{ goalId: string; actualValue: number; status: string; comment: string }>) => void;
  onCancel: () => void;
}

export default function BulkCheckInMode({ goals, currentQuarter, onSave, onCancel }: BulkCheckInModeProps) {
  const [updates, setUpdates] = useState<Record<string, { actualValue: number; status: string; comment: string }>>({});
  const [hasChanges, setHasChanges] = useState(false);

  const editableGoals = useMemo(() => {
    return goals.filter(g => 
      g.status === 'APPROVED' && 
      g.quarter === currentQuarter
    );
  }, [goals, currentQuarter]);

  const handleChange = (goalId: string, field: 'actualValue' | 'status' | 'comment', value: string | number) => {
    setUpdates(prev => ({
      ...prev,
      [goalId]: {
        ...prev[goalId],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const getInitialValue = (goalId: string, field: 'actualValue' | 'status' | 'comment') => {
    const goal = editableGoals.find(g => g.id === goalId);
    if (!goal) return '';

    if (field === 'actualValue') {
      const update = updates[goalId];
      if (update?.actualValue !== undefined) return update.actualValue;
      
      // Get quarter actual
      if (currentQuarter === 'Q1') return goal.q1Actual ?? '';
      if (currentQuarter === 'Q2') return goal.q2Actual ?? '';
      if (currentQuarter === 'Q3') return goal.q3Actual ?? '';
      if (currentQuarter === 'Q4') return goal.q4Actual ?? '';
      return '';
    }

    if (field === 'status') {
      const update = updates[goalId];
      if (update?.status) return update.status;
      return goal.progressStatus || 'NOT_STARTED';
    }

    if (field === 'comment') {
      const update = updates[goalId];
      if (update?.comment !== undefined) return update.comment;
      return '';
    }

    return '';
  };

  const calculateProgress = (goal: Goal, actualValue: number) => {
    if (goal.targetValue === 0) return 0;
    
    switch (goal.uomType) {
      case 'MAX':
        return Math.min(100, Math.round((actualValue / goal.targetValue) * 100));
      case 'MIN':
        if (actualValue === 0) return 0;
        return goal.targetValue > 0 ? Math.min(100, Math.round((goal.targetValue / actualValue) * 100)) : 0;
      case 'TIMELINE':
        return actualValue > 0 ? 100 : 0;
      default:
        return Math.round((actualValue / goal.targetValue) * 100);
    }
  };

  const handleSave = () => {
    const saveData = Object.entries(updates)
      .filter(([_, data]) => data.actualValue !== undefined)
      .map(([goalId, data]) => ({
        goalId,
        actualValue: data.actualValue,
        status: data.status || 'NOT_STARTED',
        comment: data.comment || ''
      }));
    
    onSave(saveData);
  };

  const handleClearAll = () => {
    setUpdates({});
    setHasChanges(false);
  };

  if (editableGoals.length === 0) {
    return (
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 text-center">
        <AlertTriangle className="mx-auto mb-2 text-yellow-500" size={32} />
        <p className="text-[var(--foreground)]">No approved goals for {currentQuarter}</p>
        <p className="text-sm text-[var(--muted-foreground)]">Only approved goals can be checked in</p>
        <button onClick={onCancel} className="mt-4 btn-secondary">Close</button>
      </div>
    );
  }

  return (
    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border)] flex items-center justify-between" style={{
        background: 'linear-gradient(90deg, #3b82f620 0%, transparent 100%)'
      }}>
        <div>
          <h3 className="font-semibold text-[var(--foreground)] flex items-center gap-2">
            <Edit2 className="text-blue-500" size={18} />
            Bulk Check-in: {currentQuarter}
          </h3>
          <p className="text-sm text-[var(--muted-foreground)]">
            Edit all goals in one spreadsheet-like view
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleClearAll}
            disabled={!hasChanges}
            className="px-3 py-1.5 text-sm rounded-lg border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)] disabled:opacity-50"
          >
            Clear All
          </button>
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-sm rounded-lg border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className="px-3 py-1.5 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 flex items-center gap-1"
          >
            <Save size={14} />
            Save All
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[var(--muted)]">
            <tr>
              <th className="text-left p-3 text-sm font-medium text-[var(--muted-foreground)]">Goal</th>
              <th className="text-center p-3 text-sm font-medium text-[var(--muted-foreground)]">Target</th>
              <th className="text-center p-3 text-sm font-medium text-[var(--muted-foreground)]">UOM</th>
              <th className="text-center p-3 text-sm font-medium text-[var(--muted-foreground)]">Actual</th>
              <th className="text-center p-3 text-sm font-medium text-[var(--muted-foreground)]">Progress</th>
              <th className="text-center p-3 text-sm font-medium text-[var(--muted-foreground)]">Status</th>
              <th className="text-center p-3 text-sm font-medium text-[var(--muted-foreground)]">Comment</th>
            </tr>
          </thead>
          <tbody>
            {editableGoals.map(goal => {
              const actualValue = getInitialValue(goal.id, 'actualValue') as number;
              const progress = goal.targetValue ? calculateProgress(goal, actualValue || 0) : 0;
              
              return (
                <tr key={goal.id} className="border-b border-[var(--border)] hover:bg-[var(--muted)]/50">
                  <td className="p-3">
                    <div className="max-w-[200px]">
                      <p className="text-sm font-medium text-[var(--foreground)] truncate">{goal.title}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{goal.thrustArea}</p>
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <span className="text-sm text-[var(--foreground)]">{goal.targetValue} {goal.unit}</span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="text-xs px-2 py-1 rounded bg-[var(--muted)] text-[var(--muted-foreground)]">
                      {goal.uomType}
                    </span>
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={getInitialValue(goal.id, 'actualValue')}
                      onChange={(e) => handleChange(goal.id, 'actualValue', parseFloat(e.target.value) || 0)}
                      className="w-20 p-2 text-center rounded-lg border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${progress >= 100 ? 'bg-green-500' : progress >= 70 ? 'bg-blue-500' : progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.min(100, progress)}%` }}
                        />
                      </div>
                      <span className="text-xs text-[var(--muted-foreground)]">{progress}%</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <select
                      value={getInitialValue(goal.id, 'status')}
                      onChange={(e) => handleChange(goal.id, 'status', e.target.value)}
                      className="p-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="NOT_STARTED">Not Started</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="ON_TRACK">On Track</option>
                      <option value="AT_RISK">At Risk</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <input
                      type="text"
                      value={getInitialValue(goal.id, 'comment')}
                      onChange={(e) => handleChange(goal.id, 'comment', e.target.value)}
                      placeholder="Add note..."
                      className="w-32 p-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[var(--border)] text-center">
        <p className="text-xs text-[var(--muted-foreground)]">
          {editableGoals.length} goals • {hasChanges ? 'Unsaved changes' : 'All changes saved'}
        </p>
      </div>
    </div>
  );
}