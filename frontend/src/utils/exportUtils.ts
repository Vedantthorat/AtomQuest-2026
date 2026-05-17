import type { Goal, User } from '../types';

interface ReportRow {
  employeeName: string;
  employeeEmail: string;
  department: string;
  goalTitle: string;
  thrustArea: string;
  uomType: string;
  unit: string;
  targetValue: number;
  q1Actual: number | undefined;
  q2Actual: number | undefined;
  q3Actual: number | undefined;
  q4Actual: number | undefined;
  actualAchievement: number;
  weightage: number;
  status: string;
  quarter: string;
  progressPercent: number;
}

export function exportGoalsToCSV(goals: Goal[], users: User[], quarter: string, year: number): void {
  const rows: ReportRow[] = goals
    .filter(g => g.quarter === quarter && g.year === year)
    .map(goal => {
      const owner = users.find(u => u.id === goal.ownerId);
      const progress = calculateProgress(goal);
      
      return {
        employeeName: owner?.name || 'Unknown',
        employeeEmail: owner?.email || '',
        department: owner?.department || '',
        goalTitle: goal.title,
        thrustArea: goal.thrustArea,
        uomType: goal.uomType,
        unit: goal.unit,
        targetValue: goal.targetValue,
        q1Actual: goal.q1Actual,
        q2Actual: goal.q2Actual,
        q3Actual: goal.q3Actual,
        q4Actual: goal.q4Actual,
        actualAchievement: goal.actualAchievement,
        weightage: goal.weightage,
        status: goal.status,
        quarter: goal.quarter,
        progressPercent: Math.round(progress)
      };
    });

  const headers = [
    'Employee Name',
    'Employee Email',
    'Department',
    'Goal Title',
    'Thrust Area',
    'UOM Type',
    'Unit',
    'Target Value',
    'Q1 Actual',
    'Q2 Actual',
    'Q3 Actual',
    'Q4 Actual',
    'Actual Achievement',
    'Weightage (%)',
    'Status',
    'Quarter',
    'Progress (%)'
  ];

  const csvContent = [
    headers.join(','),
    ...rows.map(row => [
      row.employeeName,
      row.employeeEmail,
      row.department,
      `"${row.goalTitle.replace(/"/g, '""')}"`,
      row.thrustArea,
      row.uomType,
      row.unit,
      row.targetValue,
      row.q1Actual ?? '',
      row.q2Actual ?? '',
      row.q3Actual ?? '',
      row.q4Actual ?? '',
      row.actualAchievement,
      row.weightage,
      row.status,
      row.quarter,
      row.progressPercent
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `goals_report_${quarter}_${year}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function calculateProgress(goal: Goal): number {
  const target = goal.targetValue;
  const actual = goal.actualAchievement ?? goal.currentValue ?? 0;
  
  switch (goal.uomType) {
    case 'MIN':
      if (target === 0) return 0;
      return Math.min((actual / target) * 100, 100);
    case 'MAX':
      if (actual === 0) return 100;
      if (target === 0) return 0;
      return Math.min((target / actual) * 100, 100);
    case 'TIMELINE':
      if (goal.completedAt) return 100;
      return Math.min(actual, 100);
    case 'ZERO':
      return actual === 0 ? 100 : 0;
    default:
      return 0;
  }
}

export default exportGoalsToCSV;