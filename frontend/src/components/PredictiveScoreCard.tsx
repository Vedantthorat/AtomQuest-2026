import { useMemo } from 'react';
import { TrendingUp, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import type { Goal } from '../types';

interface PredictiveScoreCardProps {
  goals: Goal[];
  showDetails?: boolean;
}

export default function PredictiveScoreCard({ goals, showDetails = false }: PredictiveScoreCardProps) {
  const prediction = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentQuarter = Math.floor(currentMonth / 3);
    const totalQuarters = 4;
    const weeksElapsed = ((currentQuarter + 1) / totalQuarters) * 12 * 4; // Approximate weeks
    const totalWeeks = 12 * 4; // 48 weeks (4 quarters * 12 weeks)
    
    let totalWeightedScore = 0;
    let totalWeightage = 0;
    const goalPredictions: Array<{
      title: string;
      weightage: number;
      currentScore: number;
      projected: number;
      status: 'on-track' | 'at-risk' | 'exceeded';
    }> = [];

    goals.forEach(goal => {
      if (goal.status === 'ARCHIVED' || goal.status === 'DRAFT') return;
      
      const weightage = goal.weightage || 10;
      const target = goal.targetValue || 1;
      const actual = goal.actualAchievement || 0;
      const currentProgress = (actual / target) * 100;
      
      // Projected score formula: (currentAchievement / weeksElapsed) * totalWeeks
      let projected: number;
      if (weeksElapsed > 0 && goal.status === 'APPROVED') {
        projected = Math.round((actual / weeksElapsed) * totalWeeks);
      } else {
        projected = currentProgress;
      }
      
      // Cap at 100% for projection
      projected = Math.min(100, Math.max(0, projected));
      
      // Determine status
      let status: 'on-track' | 'at-risk' | 'exceeded';
      if (projected >= 100) status = 'exceeded';
      else if (projected >= 70) status = 'on-track';
      else status = 'at-risk';

      totalWeightedScore += projected * weightage;
      totalWeightage += weightage;

      goalPredictions.push({
        title: goal.title.length > 30 ? goal.title.slice(0, 27) + '...' : goal.title,
        weightage,
        currentScore: Math.round(currentProgress),
        projected,
        status
      });
    });

    const overallScore = totalWeightage > 0 ? Math.round(totalWeightedScore / totalWeightage) : 0;
    const atRiskCount = goalPredictions.filter(g => g.status === 'at-risk').length;
    const onTrackCount = goalPredictions.filter(g => g.status === 'on-track').length;
    const exceededCount = goalPredictions.filter(g => g.status === 'exceeded').length;

    return {
      overallScore,
      goalPredictions,
      atRiskCount,
      onTrackCount,
      exceededCount,
      totalGoals: goals.filter(g => g.status !== 'ARCHIVED' && g.status !== 'DRAFT').length
    };
  }, [goals]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return { bg: 'from-green-500 to-emerald-600', text: 'text-green-400', ring: '#22c55e' };
    if (score >= 60) return { bg: 'from-blue-500 to-cyan-600', text: 'text-blue-400', ring: '#3b82f6' };
    if (score >= 40) return { bg: 'from-yellow-500 to-orange-600', text: 'text-yellow-400', ring: '#f59e0b' };
    return { bg: 'from-red-500 to-rose-600', text: 'text-red-400', ring: '#ef4444' };
  };

  const colors = getScoreColor(prediction.overallScore);

  return (
    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border)]" style={{
        background: `linear-gradient(135deg, ${colors.ring}20 0%, transparent 100%)`
      }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className={colors.text} size={20} />
            <h3 className="font-semibold text-[var(--foreground)]">Year-End Projected Score</h3>
          </div>
          {prediction.atRiskCount > 0 && (
            <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-500">
              <AlertTriangle size={12} />
              {prediction.atRiskCount} at risk
            </span>
          )}
        </div>
      </div>

      {/* Main Score Display */}
      <div className="p-6">
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            {/* Circular Progress */}
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="var(--border)"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke={colors.ring}
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${(prediction.overallScore / 100) * 352} 352`}
                strokeLinecap="round"
                style={{ 
                  filter: `drop-shadow(0 0 10px ${colors.ring}50)`,
                  transition: 'stroke-dasharray 1s ease-out'
                }}
              />
            </svg>
            
            {/* Score Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-bold ${colors.text}`}>
                {prediction.overallScore}
              </span>
              <span className="text-xs text-[var(--muted-foreground)]">out of 100</span>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 rounded-lg bg-green-500/10">
            <CheckCircle className="mx-auto mb-1 text-green-500" size={20} />
            <div className="text-xl font-bold text-green-500">{prediction.exceededCount}</div>
            <div className="text-xs text-[var(--muted-foreground)]">On Track</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-blue-500/10">
            <Target className="mx-auto mb-1 text-blue-500" size={20} />
            <div className="text-xl font-bold text-blue-500">{prediction.onTrackCount}</div>
            <div className="text-xs text-[var(--muted-foreground)]">Expected</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-red-500/10">
            <AlertTriangle className="mx-auto mb-1 text-red-500" size={20} />
            <div className="text-xl font-bold text-red-500">{prediction.atRiskCount}</div>
            <div className="text-xs text-[var(--muted-foreground)]">At Risk</div>
          </div>
        </div>

        {/* Goal Breakdown */}
        {showDetails && prediction.goalPredictions.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <h4 className="text-sm font-medium text-[var(--muted-foreground)] mb-3">Goal Breakdown</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {prediction.goalPredictions.map((goal, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      goal.status === 'exceeded' ? 'bg-green-500' :
                      goal.status === 'at-risk' ? 'bg-red-500' : 'bg-blue-500'
                    }`}></div>
                    <span className="text-[var(--foreground)] truncate max-w-[150px]">{goal.title}</span>
                    <span className="text-xs text-[var(--muted-foreground)]">({goal.weightage}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--muted-foreground)]">{goal.currentScore}%</span>
                    <span className="text-[var(--foreground)]">→</span>
                    <span className={`font-medium ${
                      goal.projected >= 80 ? 'text-green-500' :
                      goal.projected >= 50 ? 'text-yellow-500' : 'text-red-500'
                    }`}>{goal.projected}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formula Note */}
        <div className="mt-4 text-xs text-[var(--muted-foreground)] text-center">
          Formula: Projected = (Current Achievement / Weeks Elapsed) × Total Weeks × Weightage
        </div>
      </div>
    </div>
  );
}