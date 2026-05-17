import { useState } from 'react';
import { useNaturalLanguageGoal } from '../hooks/useNaturalLanguageGoal';
import { Sparkles, Wand2, ArrowRight, RefreshCw, Edit3, CheckCircle, Loader2 } from 'lucide-react';

interface NaturalLanguageGoalCreatorProps {
  onGoalCreated?: (goal: any) => void;
}

export default function NaturalLanguageGoalCreator({ onGoalCreated }: NaturalLanguageGoalCreatorProps) {
  const [input, setInput] = useState('');
  const { isParsing, parsedGoal, error, parseGoal, reset, THRUST_AREAS } = useNaturalLanguageGoal();
  const [showResult, setShowResult] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  const handleParse = async () => {
    if (input.trim().length < 10) return;
    
    try {
      await parseGoal(input);
      setShowResult(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirm = () => {
    if (parsedGoal && onGoalCreated) {
      onGoalCreated(parsedGoal);
      setInput('');
      reset();
      setShowResult(false);
    }
  };

  const handleEdit = () => {
    setShowEditor(true);
  };

  const handleTryAgain = () => {
    setInput('');
    reset();
    setShowResult(false);
  };

  return (
    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border)]" style={{
        background: 'linear-gradient(90deg, #8b5cf620 0%, transparent 100%)'
      }}>
        <div className="flex items-center gap-2">
          <Sparkles className="text-purple-500" size={20} />
          <div>
            <h3 className="font-semibold text-[var(--foreground)]">AI Goal Creator</h3>
            <p className="text-xs text-[var(--muted-foreground)]">Type naturally, we'll structure it for you</p>
          </div>
        </div>
      </div>

      {!showResult ? (
        <>
          {/* Input Area */}
          <div className="p-4">
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Example: I want to reduce customer complaints by half before December"
                className="w-full p-4 pr-12 rounded-xl border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    handleParse();
                  }
                }}
              />
              <button
                onClick={handleParse}
                disabled={input.trim().length < 10 || isParsing}
                className="absolute bottom-3 right-3 p-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isParsing ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
              </button>
            </div>

            {/* Example Hints */}
            <div className="mt-3">
              <p className="text-xs text-[var(--muted-foreground)] mb-2">Try typing something like:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  'Reduce customer complaints by 50%',
                  'Increase sales by 25% this quarter',
                  'Complete product launch by March',
                  'Improve team productivity by 30%',
                  'Achieve 100% compliance training'
                ].map((example, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(example)}
                    className="text-xs px-2 py-1 rounded-full bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-purple-500/10 hover:text-purple-500 transition-colors"
                  >
                    {example.length > 30 ? example.slice(0, 27) + '...' : example}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 pb-4 flex items-center justify-between">
            <span className="text-xs text-[var(--muted-foreground)]">
              Press Ctrl+Enter to create
            </span>
            <span className="text-xs text-[var(--muted-foreground)]">
              {input.length}/500 characters
            </span>
          </div>
        </>
      ) : parsedGoal ? (
        <>
          {/* Parsed Result */}
          <div className="p-4 space-y-4">
            {/* Confidence Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-500" size={16} />
                <span className="text-sm text-[var(--foreground)]">AI successfully parsed your goal</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                parsedGoal.confidence >= 80 ? 'bg-green-500/10 text-green-500' :
                parsedGoal.confidence >= 60 ? 'bg-yellow-500/10 text-yellow-500' :
                'bg-orange-500/10 text-orange-500'
              }`}>
                {parsedGoal.confidence}% confidence
              </span>
            </div>

            {/* Parsed Fields */}
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[var(--muted-foreground)]">Title</label>
                <p className="font-medium text-[var(--foreground)]">{parsedGoal.title}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[var(--muted-foreground)]">Measurement Type</label>
                  <p className="font-medium text-[var(--foreground)]">{parsedGoal.uomType}</p>
                </div>
                <div>
                  <label className="text-xs text-[var(--muted-foreground)]">Target Value</label>
                  <p className="font-medium text-[var(--foreground)]">{parsedGoal.targetValue}%</p>
                </div>
                <div>
                  <label className="text-xs text-[var(--muted-foreground)]">Quarter</label>
                  <p className="font-medium text-[var(--foreground)]">{parsedGoal.quarter}</p>
                </div>
                <div>
                  <label className="text-xs text-[var(--muted-foreground)]">Thrust Area</label>
                  <p className="font-medium text-[var(--foreground)]">{parsedGoal.thrustArea}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleTryAgain}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors"
              >
                <CheckCircle size={16} />
                Use This Goal
              </button>
            </div>
          </div>
        </>
      ) : error ? (
        <div className="p-4 text-center">
          <p className="text-red-500 mb-3">{error}</p>
          <button
            onClick={handleTryAgain}
            className="px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : null}
    </div>
  );
}