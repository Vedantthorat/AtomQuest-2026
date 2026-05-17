// FILE: src/utils/progressCalculator.ts

import type { UoMType, Goal } from '../types';

export type ProgressStatus = 'not_started' | 'at_risk' | 'on_track' | 'completed' | 'over_achieved';

export interface ProgressResult {
  percentage: number;
  status: ProgressStatus;
  label: string;
  color: string;
}

export interface UoMDescription {
  label: string;
  example: string;
  direction: 'higher_better' | 'lower_better' | 'binary' | 'time_based';
  icon: string;
}

export interface AchievementDisplay {
  formatted: string;
  subtext: string;
  isSuccess: boolean;
}

const STATUS_COLORS = {
  not_started: 'var(--color-text-secondary)',
  at_risk: 'var(--color-warning)',
  on_track: 'var(--color-success)',
  completed: 'var(--color-success)',
  over_achieved: 'var(--color-info)',
};

export function calculateProgress(
  uom: UoMType,
  target: number,
  achievement: number,
  targetDate?: string,
  startDate?: string,
  isCompleted?: boolean
): ProgressResult {
  const safeTarget = target ?? 0;
  const safeAchievement = achievement ?? 0;

  let percentage = 0;

  switch (uom) {
    case 'MIN': {
      // MIN: Higher is better (e.g., Revenue, Sales, Customer Satisfaction)
      // Formula: (achievement / target) * 100, cap at 150% to show over-achievement
      if (safeTarget === 0) {
        percentage = 0;
      } else {
        percentage = Math.min((safeAchievement / safeTarget) * 100, 150);
      }
      break;
    }

    case 'MAX': {
      // MAX: Lower is better (e.g., TAT, Cost, Defect rate)
      // Formula: (target / achievement) * 100, if achievement=0 return 100%
      if (safeAchievement === 0) {
        percentage = 100;
      } else if (safeTarget === 0) {
        percentage = 0;
      } else {
        percentage = Math.min((safeTarget / safeAchievement) * 100, 150);
      }
      break;
    }

    case 'TIMELINE': {
      // TIMELINE: Date-based completion
      // If marked complete → 100%, if past deadline → 0%, else → time remaining %
      if (isCompleted) {
        percentage = 100;
      } else if (targetDate && startDate) {
        const now = new Date();
        const deadline = new Date(targetDate);
        const start = new Date(startDate);

        if (now > deadline) {
          // Past deadline and not completed
          percentage = 0;
        } else {
          // Within deadline - show time remaining
          const totalDuration = deadline.getTime() - start.getTime();
          const elapsed = now.getTime() - start.getTime();
          
          if (totalDuration <= 0) {
            percentage = 0;
          } else {
            // Progress based on time elapsed (clamped to reasonable range)
            percentage = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
          }
        }
      } else {
        // No dates provided, fallback to achievement as percentage
        percentage = Math.min(safeAchievement, 100);
      }
      break;
    }

    case 'ZERO': {
      // ZERO: Zero = Success (e.g., Safety incidents, Complaints)
      // Binary: achievement === 0 → 100%, else → 0%
      percentage = safeAchievement === 0 ? 100 : 0;
      break;
    }

    default:
      percentage = 0;
  }

  // Determine status
  let status: ProgressStatus;
  if (percentage === 0) {
    status = 'not_started';
  } else if (percentage > 100) {
    status = 'over_achieved';
  } else if (percentage >= 100) {
    status = 'completed';
  } else if (percentage >= 70) {
    status = 'on_track';
  } else {
    status = 'at_risk';
  }

  // Determine label
  const labels: Record<ProgressStatus, string> = {
    not_started: 'Not Started',
    at_risk: 'At Risk',
    on_track: 'On Track',
    completed: 'Completed',
    over_achieved: 'Over-Achieved! 🎉',
  };

  return {
    percentage: Math.round(percentage * 10) / 10,
    status,
    label: labels[status],
    color: STATUS_COLORS[status],
  };
}

export function getUoMDescription(uom: UoMType): UoMDescription {
  const descriptions: Record<UoMType, UoMDescription> = {
    MIN: {
      label: 'Min (Higher is Better)',
      example: 'Revenue, Sales, Customer Satisfaction',
      direction: 'higher_better',
      icon: '📈',
    },
    MAX: {
      label: 'Max (Lower is Better)',
      example: 'TAT, Cost, Errors, Defects',
      direction: 'lower_better',
      icon: '📉',
    },
    TIMELINE: {
      label: 'Timeline (Date-based)',
      example: 'Project Delivery, Milestones',
      direction: 'time_based',
      icon: '📅',
    },
    ZERO: {
      label: 'Zero (0 = Success)',
      example: 'Safety Incidents, Complaints',
      direction: 'binary',
      icon: '✅',
    },
  };

  return descriptions[uom] || {
    label: 'Unknown',
    example: '',
    direction: 'higher_better',
    icon: '❓',
  };
}

export function formatAchievementDisplay(
  uom: UoMType,
  achievement: number,
  target: number,
  unit: string = ''
): AchievementDisplay {
  const safeTarget = target ?? 0;
  const safeAchievement = achievement ?? 0;
  const unitStr = unit ? ` ${unit}` : '';

  switch (uom) {
    case 'MIN': {
      // Higher is better - show "achievement / target"
      const percent = safeTarget > 0 ? Math.round((safeAchievement / safeTarget) * 100) : 0;
      return {
        formatted: `${safeAchievement}${unitStr} / ${safeTarget}${unitStr}`,
        subtext: `${percent}% of target`,
        isSuccess: percent >= 100,
      };
    }

    case 'MAX': {
      // Lower is better - show "achievement / target" with context
      const isBetter = safeAchievement <= safeTarget;
      const percent = safeAchievement > 0 ? Math.round((safeTarget / safeAchievement) * 100) : 100;
      return {
        formatted: `${safeAchievement}${unitStr} / ${safeTarget}${unitStr} target`,
        subtext: isBetter ? `${percent}% (better than target)` : `${percent}% (needs improvement)`,
        isSuccess: isBetter,
      };
    }

    case 'TIMELINE': {
      // Date-based
      if (safeAchievement >= 100) {
        return {
          formatted: '✅ Completed',
          subtext: 'Delivered on time',
          isSuccess: true,
        };
      }
      return {
        formatted: `${Math.round(safeAchievement)}% complete`,
        subtext: `${100 - Math.round(safeAchievement)}% remaining`,
        isSuccess: safeAchievement >= 70,
      };
    }

    case 'ZERO': {
      // Binary - 0 is success
      if (safeAchievement === 0) {
        return {
          formatted: '0 incidents',
          subtext: 'Success! Target achieved 🎉',
          isSuccess: true,
        };
      }
      return {
        formatted: `${safeAchievement} incidents`,
        subtext: 'Target was 0 — not achieved',
        isSuccess: false,
      };
    }

    default:
      return {
        formatted: `${safeAchievement}`,
        subtext: '',
        isSuccess: false,
      };
  }
}

export function calculateGoalProgress(goal: Goal): ProgressResult {
  return calculateProgress(
    goal.uomType,
    goal.targetValue,
    goal.actualAchievement ?? goal.currentValue ?? 0,
    goal.deadline,
    goal.startDate,
    !!goal.completedAt
  );
}

export function isGoalOverAchieved(goal: Goal): boolean {
  const result = calculateGoalProgress(goal);
  return result.status === 'over_achieved';
}

export function isGoalCompleted(goal: Goal): boolean {
  const result = calculateGoalProgress(goal);
  return result.status === 'completed' || result.status === 'over_achieved';
}

export function isGoalAtRisk(goal: Goal): boolean {
  const result = calculateGoalProgress(goal);
  return result.status === 'at_risk' || result.status === 'not_started';
}