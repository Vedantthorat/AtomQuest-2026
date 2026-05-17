import { useMemo, useState } from 'react';
import type { Goal } from '../types';

interface AnomalyResult {
  goalId: string;
  goalTitle: string;
  type: 'spike' | 'drop' | 'stall' | 'pattern';
  severity: 'high' | 'medium' | 'low';
  message: string;
  details: {
    previousQuarter: string;
    previousValue: number;
    currentQuarter: string;
    currentValue: number;
    changePercent: number;
  };
  recommendedAction: string;
  requiresManagerReview: boolean;
}

interface RiskPrediction {
  goalId: string;
  goalTitle: string;
  riskLevel: 'high' | 'medium' | 'low';
  projectedScore: number;
  confidence: number;
  reasoning: string;
  atRiskFactors: string[];
}

interface ManagerEffectiveness {
  managerId: string;
  managerName: string;
  quarters: {
    [quarter: string]: {
      checkInCompletionRate: number;
      avgApprovalTime: number;
      approvalRate: number;
      escalationsHandled: number;
    };
  };
  overallScore: number;
}

export function useAnomalyDetection(goals: Goal[]) {
  const [anomalies, setAnomalies] = useState<AnomalyResult[]>([]);

  const detectAnomalies = useMemo((): AnomalyResult[] => {
    const results: AnomalyResult[] = [];
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    const currentQuarterIndex = quarters.indexOf(new Date().getFullYear() % 4 === 0 ? 'Q4' : quarters[Math.floor((new Date().getMonth()) / 3)]);

    goals.forEach(goal => {
      const quarterData: { [key: string]: number } = {};
      
      // Get actual values for each quarter
      if (goal.q1Actual !== undefined) quarterData['Q1'] = goal.q1Actual;
      if (goal.q2Actual !== undefined) quarterData['Q2'] = goal.q2Actual;
      if (goal.q3Actual !== undefined) quarterData['Q3'] = goal.q3Actual;
      if (goal.q4Actual !== undefined) quarterData['Q4'] = goal.q4Actual;

      const filledQuarters = Object.keys(quarterData);
      
      if (filledQuarters.length < 2) return;

      // Check for spikes/drops between consecutive quarters
      for (let i = 1; i < filledQuarters.length; i++) {
        const prevQ = filledQuarters[i - 1];
        const currQ = filledQuarters[i];
        const prevValue = quarterData[prevQ];
        const currValue = quarterData[currQ];

        if (prevValue === 0 || prevValue === undefined) continue;

        const changePercent = ((currValue - prevValue) / prevValue) * 100;
        
        // Spike detection (significant increase)
        if (changePercent > 200) {
          results.push({
            goalId: goal.id,
            goalTitle: goal.title,
            type: 'spike',
            severity: changePercent > 400 ? 'high' : 'medium',
            message: `Achievement jumped ${Math.abs(Math.round(changePercent))}% from ${prevQ} to ${currQ}`,
            details: {
              previousQuarter: prevQ,
              previousValue: prevValue,
              currentQuarter: currQ,
              currentValue: currValue,
              changePercent
            },
            recommendedAction: 'Request documentation of how this achievement was reached',
            requiresManagerReview: changePercent > 300
          });
        }

        // Drop detection (significant decrease)
        if (changePercent < -50) {
          results.push({
            goalId: goal.id,
            goalTitle: goal.title,
            type: 'drop',
            severity: changePercent < -75 ? 'high' : 'medium',
            message: `Achievement dropped ${Math.abs(Math.round(changePercent))}% from ${prevQ} to ${currQ}`,
            details: {
              previousQuarter: prevQ,
              previousValue: prevValue,
              currentQuarter: currQ,
              currentValue: currValue,
              changePercent
            },
            recommendedAction: 'Review blockers or challenges preventing progress',
            requiresManagerReview: true
          });
        }
      }

      // Stall detection - no progress for 2+ quarters
      if (filledQuarters.length >= 2) {
        const lastTwo = filledQuarters.slice(-2);
        const lastQValue = quarterData[lastTwo[1]];
        const prevQValue = quarterData[lastTwo[0]];
        
        if (lastQValue === prevQValue && lastQValue < goal.targetValue) {
          results.push({
            goalId: goal.id,
            goalTitle: goal.title,
            type: 'stall',
            severity: 'low',
            message: `No progress made from ${lastTwo[0]} to ${lastTwo[1]}`,
            details: {
              previousQuarter: lastTwo[0],
              previousValue: prevQValue,
              currentQuarter: lastTwo[1],
              currentValue: lastQValue,
              changePercent: 0
            },
            recommendedAction: 'Identify obstacles and adjust goal timeline if needed',
            requiresManagerReview: false
          });
        }
      }
    });

    return results.sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }, [goals]);

  const predictRisks = useMemo((): RiskPrediction[] => {
    const results: RiskPrediction[] = [];
    const currentQuarter = new Date().getFullYear() % 4 === 0 ? 'Q4' : 
      ['Q1', 'Q2', 'Q3', 'Q4'][Math.floor(new Date().getMonth() / 3)];
    const quarterIndex = ['Q1', 'Q2', 'Q3', 'Q4'].indexOf(currentQuarter);
    const totalQuarters = 4;
    const weeksElapsed = ((quarterIndex + 1) / totalQuarters) * 52;
    const totalWeeks = 52;

    goals.forEach(goal => {
      const actual = goal.actualAchievement || 0;
      const target = goal.targetValue || 1;
      const currentProgress = (actual / target) * 100;
      
      // Calculate projected score based on trajectory
      let projectedScore: number;
      if (weeksElapsed > 0) {
        projectedScore = Math.round((actual / weeksElapsed) * totalWeeks);
      } else {
        projectedScore = currentProgress;
      }

      // Cap at 100%
      projectedScore = Math.min(projectedScore, 100);

      // Determine risk level
      let riskLevel: 'high' | 'medium' | 'low' = 'low';
      const atRiskFactors: string[] = [];

      if (projectedScore < 50) {
        riskLevel = 'high';
        atRiskFactors.push('Projected to achieve less than 50% of target');
      } else if (projectedScore < 75) {
        riskLevel = 'medium';
        atRiskFactors.push('Projected below target achievement');
      }

      // Check for stalls
      if (goal.q1Actual && goal.q2Actual && goal.q1Actual === goal.q2Actual) {
        riskLevel = 'high';
        atRiskFactors.push('No progress between Q1 and Q2');
      }

      // Check for declining trajectory
      const quarters = [];
      if (goal.q1Actual !== undefined) quarters.push({ q: 'Q1', v: goal.q1Actual });
      if (goal.q2Actual !== undefined) quarters.push({ q: 'Q2', v: goal.q2Actual });
      if (goal.q3Actual !== undefined) quarters.push({ q: 'Q3', v: goal.q3Actual });
      
      if (quarters.length >= 2) {
        const trend = quarters[quarters.length - 1].v - quarters[0].v;
        if (trend < 0) {
          atRiskFactors.push('Declining performance trend');
          if (riskLevel !== 'high') riskLevel = 'medium';
        }
      }

      // Calculate confidence based on data available
      const confidence = Math.min(100, 50 + (quarters.length * 15));

      if (riskLevel !== 'low' || projectedScore < 90) {
        results.push({
          goalId: goal.id,
          goalTitle: goal.title,
          riskLevel,
          projectedScore: Math.round(projectedScore),
          confidence,
          reasoning: `Based on ${quarters.length || 1} quarter(s) of data, projecting ${Math.round(projectedScore)}% final score`,
          atRiskFactors
        });
      }
    });

    return results.sort((a, b) => {
      const riskOrder = { high: 0, medium: 1, low: 2 };
      return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
    });
  }, [goals]);

  return {
    anomalies,
    detectAnomalies,
    predictRisks,
    highPriorityAnomalies: anomalies.filter(a => a.severity === 'high'),
    atRiskGoals: predictRisks.filter(p => p.riskLevel !== 'low')
  };
}

export function useManagerEffectiveness(goals: Goal[], users: any[]) {
  return useMemo((): ManagerEffectiveness[] => {
    const managerData: { [managerId: string]: any } = {};
    
    // Get unique managers from goals
    goals.forEach(goal => {
      if (goal.approvedBy) {
        if (!managerData[goal.approvedBy]) {
          managerData[goal.approvedBy] = {
            managerId: goal.approvedBy,
            managerName: users.find(u => u.id === goal.approvedBy)?.name || 'Unknown',
            quarters: {}
          };
        }
      }
    });

    // Calculate metrics per quarter
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    
    Object.values(managerData).forEach((manager: any) => {
      quarters.forEach(quarter => {
        const quarterGoals = goals.filter(g => 
          g.approvedBy === manager.managerId && 
          g.quarter === quarter &&
          g.status !== 'DRAFT'
        );

        const totalGoals = quarterGoals.length;
        if (totalGoals === 0) return;

        const approvedGoals = quarterGoals.filter(g => g.status === 'APPROVED').length;
        const checkedInGoals = quarterGoals.filter(g => 
          quarter === 'Q1' ? g.q1Actual !== undefined :
          quarter === 'Q2' ? g.q2Actual !== undefined :
          quarter === 'Q3' ? g.q3Actual !== undefined :
          g.q4Actual !== undefined
        ).length;

        manager.quarters[quarter] = {
          checkInCompletionRate: Math.round((checkedInGoals / totalGoals) * 100),
          avgApprovalTime: Math.round(Math.random() * 48 + 2), // Simulated in hours
          approvalRate: Math.round((approvedGoals / totalGoals) * 100),
          escalationsHandled: Math.floor(Math.random() * 5)
        };
      });

      // Calculate overall score
      const allQuarters = Object.values(manager.quarters);
      if (allQuarters.length > 0) {
        manager.overallScore = Math.round(
          allQuarters.reduce((sum: number, q: any) => 
            sum + (q.checkInCompletionRate * 0.4 + q.approvalRate * 0.4 + (100 - Math.min(q.avgApprovalTime, 100)) * 0.2), 0
          ) / allQuarters.length
        );
      }
    });

    return Object.values(managerData).sort((a: any, b: any) => b.overallScore - a.overallScore);
  }, [goals, users]);
}

export default useAnomalyDetection;