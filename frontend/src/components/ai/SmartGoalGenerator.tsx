// FILE: src/components/ai/SmartGoalGenerator.tsx

import { useState } from 'react';
import { generateSMARTGoal, getCacheStats } from '../../services/aiService';
import { THRUST_AREAS } from '../../types';
import { Sparkles, Loader2, Zap, Clock, Copy, Check, ArrowRight, AlertTriangle } from 'lucide-react';
import type { ThrustArea, UoMType } from '../../types';

interface SmartGoalGeneratorProps {
  onApplyToGoals?: (goal: {
    title: string;
    description: string;
    thrustArea: ThrustArea;
    uomType: UoMType;
    targetValue: number;
    weightage: number;
  }) => void;
}

interface GenerationHistory {
  id: number;
  input: string;
  result: Awaited<ReturnType<typeof generateSMARTGoal>>;
  timestamp: Date;
}

export default function SmartGoalGenerator({ onApplyToGoals }: SmartGoalGeneratorProps) {
  const [vagueGoal, setVagueGoal] = useState('');
  const [thrustArea, setThrustArea] = useState<ThrustArea>('Revenue & Growth');
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<Awaited<ReturnType<typeof generateSMARTGoal>> | null>(null);
  const [history, setHistory] = useState<GenerationHistory[]>([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!vagueGoal.trim()) {
      setError('Please describe your goal idea');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const result = await generateSMARTGoal(vagueGoal, thrustArea);
      setCurrentResult(result);
      
      // Add to history
      setHistory(prev => [
        { id: Date.now(), input: vagueGoal, result, timestamp: new Date() },
        ...prev.slice(0, 4), // Keep last 5
      ]);
    } catch (err) {
      setError('Failed to generate goal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!currentResult) return;
    navigator.clipboard.writeText(JSON.stringify(currentResult.result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    if (!currentResult || !onApplyToGoals) return;
    
    const target = parseFloat(currentResult.result.suggestedTarget) || 100;
    
    onApplyToGoals({
      title: currentResult.result.smartGoal,
      description: currentResult.result.rationale,
      thrustArea: thrustArea as ThrustArea,
      uomType: currentResult.result.suggestedUoM as UoMType,
      targetValue: isNaN(target) ? 100 : target,
      weightage: currentResult.result.suggestedWeightage,
    });
  };

  const handleHistoryClick = (item: GenerationHistory) => {
    setVagueGoal(item.input);
    setCurrentResult(item.result);
  };

  const cacheStats = getCacheStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="text-purple" size={24} />
          <h2 className="text-xl font-bold">SMART Goal Generator</h2>
        </div>
        <div className="text-xs text-[var(--muted-foreground)]">
          Cache: {cacheStats.hitRate} hit rate
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Describe your goal idea
          </label>
          <textarea
            value={vagueGoal}
            onChange={(e) => setVagueGoal(e.target.value)}
            placeholder="e.g., improve sales, reduce customer wait time, increase customer satisfaction, launch new product..."
            className="input w-full"
            rows={3}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) handleGenerate();
            }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Thrust Area</label>
          <select
            value={thrustArea}
            onChange={(e) => setThrustArea(e.target.value as ThrustArea)}
            className="input w-full"
          >
            {THRUST_AREAS.map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-500 text-sm">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Generating SMART Goal...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Generate SMART Goal
            </>
          )}
        </button>

        <p className="text-xs text-[var(--muted-foreground)] text-center">
          Press Ctrl+Enter to generate
        </p>
      </div>

      {/* Results Section */}
      {currentResult && (
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 space-y-4">
          {/* Cache Status */}
          <div className="flex items-center gap-2 text-sm">
            {currentResult.fromCache ? (
              <span className="flex items-center gap-1 text-green-500">
                <Zap size={16} /> Instant (cached)
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[var(--muted-foreground)]">
                <Clock size={16} />
                Generated in {currentResult.latencyMs}ms
              </span>
            )}
          </div>

          {/* SMART Goal */}
          <div className="bg-primary-500/10 rounded-lg p-4 border border-primary-500/20">
            <h3 className="font-semibold mb-2">SMART Goal</h3>
            <p className="text-lg">{currentResult.result.smartGoal}</p>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[var(--muted)] rounded-lg p-3 text-center">
              <div className="text-xs text-[var(--muted-foreground)]">KPI</div>
              <div className="font-semibold">{currentResult.result.kpiName}</div>
            </div>
            <div className="bg-[var(--muted)] rounded-lg p-3 text-center">
              <div className="text-xs text-[var(--muted-foreground)]">Target</div>
              <div className="font-semibold">{currentResult.result.suggestedTarget}</div>
            </div>
            <div className="bg-[var(--muted)] rounded-lg p-3 text-center">
              <div className="text-xs text-[var(--muted-foreground)]">Weightage</div>
              <div className="font-semibold">{currentResult.result.suggestedWeightage}%</div>
            </div>
            <div className="bg-[var(--muted)] rounded-lg p-3 text-center">
              <div className="text-xs text-[var(--muted-foreground)]">UoM</div>
              <div className="font-semibold">{currentResult.result.suggestedUoM}</div>
            </div>
          </div>

          {/* Quarterly Milestones */}
          <div>
            <h4 className="font-medium mb-2">Quarterly Milestones</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(currentResult.result.quarterlyMilestones).map(([q, desc]) => (
                <div key={q} className="bg-[var(--muted)] rounded p-2 text-sm">
                  <div className="font-semibold text-primary-500">{q}</div>
                  <div className="text-[var(--muted-foreground)] text-xs">{desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Flags */}
          {currentResult.result.riskFlags.length > 0 && (
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-500" />
                Risk Flags
              </h4>
              <div className="flex flex-wrap gap-2">
                {currentResult.result.riskFlags.map((flag, i) => (
                  <span key={i} className="text-xs bg-amber-500/10 text-amber-600 px-2 py-1 rounded">
                    {flag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-[var(--border)]">
            <button onClick={handleCopy} className="btn-secondary flex items-center gap-2">
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy JSON'}
            </button>
            {onApplyToGoals && (
              <button onClick={handleApply} className="btn-primary flex items-center gap-2 flex-1 justify-center">
                Apply to My Goals
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
          <h3 className="font-medium mb-3">Recent Generations</h3>
          <div className="space-y-2">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => handleHistoryClick(item)}
                className="w-full text-left p-2 rounded hover:bg-[var(--muted)] text-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">{item.input}</span>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {item.result.fromCache ? 'cached' : `${item.result.latencyMs}ms`}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export { SmartGoalGenerator };