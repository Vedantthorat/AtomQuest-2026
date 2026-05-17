import { useState, useEffect, useCallback } from 'react';
import { useGoalQualityScorer } from '../hooks/useGoalQualityScorer';
import { Sparkles, Target, CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react';

interface GoalQualityScorerProps {
  value: string;
  onChange?: (value: string) => void;
  compact?: boolean;
}

export default function GoalQualityScorer({ value, onChange, compact = false }: GoalQualityScorerProps) {
  const { analysis, isAnalyzing, analyzeGoal } = useGoalQualityScorer();
  
  const getScoreLevel = () => {
    if (!analysis) return { level: 'neutral', color: '#6b7280', label: 'Start typing...' };
    const score = analysis.score.total;
    if (score >= 80) return { level: 'excellent', color: '#22c55e', label: 'Excellent' };
    if (score >= 60) return { level: 'good', color: '#3b82f6', label: 'Good' };
    if (score >= 40) return { level: 'fair', color: '#f59e0b', label: 'Needs Work' };
    return { level: 'poor', color: '#ef4444', label: 'Poor' };
  };
  
  const level = getScoreLevel();
  const [lastAnalyzed, setLastAnalyzed] = useState('');

  // Debounced analysis
  useEffect(() => {
    if (value === lastAnalyzed || value.length < 10) return;
    
    const timer = setTimeout(() => {
      analyzeGoal(value);
      setLastAnalyzed(value);
    }, 500);

    return () => clearTimeout(timer);
  }, [value, lastAnalyzed, analyzeGoal]);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {/* Mini Progress Bar */}
        <div className="flex-1 h-2 bg-[var(--muted)] rounded-full overflow-hidden">
          <div 
            className="h-full transition-all duration-500 rounded-full"
            style={{ 
              width: `${analysis?.score.total || 0}%`,
              background: `linear-gradient(90deg, ${level.color}, ${level.color}80)`
            }}
          />
        </div>
        {/* Score Badge */}
        <div 
          className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ 
            background: `${level.color}20`,
            color: level.color
          }}
        >
          {analysis ? `${analysis.score.total}%` : '...'}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-[var(--border)] flex items-center justify-between" style={{
        background: `linear-gradient(90deg, ${level.color}10 0%, transparent 100%)`
      }}>
        <div className="flex items-center gap-2">
          <Sparkles className={isAnalyzing ? 'animate-spin' : ''} style={{ color: level.color }} size={18} />
          <span className="font-medium text-[var(--foreground)]">AI Quality Score</span>
        </div>
        <div 
          className="text-sm font-bold px-3 py-1 rounded-full"
          style={{ 
            background: `${level.color}20`,
            color: level.color
          }}
        >
          {analysis ? `${analysis.score.total}%` : 'Start typing...'}
        </div>
      </div>

      {analysis ? (
        <>
          {/* Quality Meter */}
          <div className="p-4">
            <div className="h-3 bg-[var(--muted)] rounded-full overflow-hidden mb-4">
              <div 
                className="h-full transition-all duration-700 rounded-full"
                style={{ 
                  width: `${analysis.score.total}%`,
                  background: `linear-gradient(90deg, ${level.color}, ${level.color}80)`,
                  boxShadow: `0 0 10px ${level.color}50`
                }}
              />
            </div>

            {/* SMART Criteria Bars */}
            <div className="grid grid-cols-5 gap-2">
              {[
                { key: 'specific', label: 'Specific', icon: Target },
                { key: 'measurable', label: 'Measurable', icon: CheckCircle },
                { key: 'achievable', label: 'Achievable', icon: CheckCircle },
                { key: 'relevant', label: 'Relevant', icon: Lightbulb },
                { key: 'timebound', label: 'Time-bound', icon: AlertTriangle },
              ].map(criteria => {
                const score = analysis.score[criteria.key as keyof typeof analysis.score] as number;
                const met = analysis.criteria[criteria.key as keyof typeof analysis.criteria].met;
                
                return (
                  <div key={criteria.key} className="text-center">
                    <div className="h-16 bg-[var(--muted)] rounded-lg overflow-hidden relative mb-1">
                      <div 
                        className="absolute bottom-0 w-full transition-all duration-500 rounded-lg"
                        style={{ 
                          height: `${score}%`,
                          background: met ? '#22c55e' : '#f59e0b'
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <criteria.icon size={10} className={met ? 'text-green-500' : 'text-yellow-500'} />
                      <span className="text-[10px] text-[var(--muted-foreground)]">{criteria.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Feedback Section */}
          {analysis.score.feedback.length > 0 && (
            <div className="px-4 pb-2">
              <div className="p-3 rounded-lg bg-[var(--muted)]">
                {analysis.score.feedback.map((fb, i) => (
                  <p key={i} className="text-sm text-[var(--foreground)]">{fb}</p>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {analysis.score.suggestions.length > 0 && (
            <div className="px-4 pb-4">
              <p className="text-xs font-medium text-[var(--muted-foreground)] mb-2">Suggestions:</p>
              <ul className="space-y-1">
                {analysis.score.suggestions.slice(0, 3).map((suggestion, i) => (
                  <li key={i} className="text-xs text-[var(--muted-foreground)] flex items-start gap-2">
                    <span className="text-[var(--primary-color)]">•</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <div className="p-8 text-center text-[var(--muted-foreground)]">
          <Sparkles className="mx-auto mb-2 opacity-50" size={32} />
          <p>Start typing your goal to see the AI quality analysis</p>
          <p className="text-xs mt-2">We analyze on Specific, Measurable, Achievable, Relevant, Time-bound criteria</p>
        </div>
      )}
    </div>
  );
}