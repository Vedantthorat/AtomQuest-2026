// FILE: src/components/ai/CostMeter.tsx

import { useState, useEffect } from 'react';
import { getCacheStats } from '../../services/aiService';
import { Zap, DollarSign, Clock, Gauge } from 'lucide-react';

interface CostMeterProps {
  showDetails?: boolean;
}

export default function CostMeter({ showDetails = true }: CostMeterProps) {
  const [stats, setStats] = useState({ hits: 0, misses: 0, hitRate: '0%', size: 0 });

  useEffect(() => {
    // Update stats periodically
    const interval = setInterval(() => {
      const cacheStats = getCacheStats();
      setStats(cacheStats);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const apiCalls = stats.hits + stats.misses;
  const estimatedCostPerCall = 0.003; // $0.003 per API call
  const estimatedCostSaved = stats.hits * estimatedCostPerCall;

  if (!showDetails) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Zap className="text-amber-500" size={16} />
        <span className="text-[var(--muted-foreground)]">
          {apiCalls} calls · {stats.hits} cached
        </span>
      </div>
    );
  }

  return (
    <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Gauge className="text-primary-500" size={18} />
        <span className="font-semibold">AI Cost & Performance</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* API Calls */}
        <div className="bg-[var(--muted)] rounded-lg p-3">
          <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] mb-1">
            <Clock size={12} />
            API Calls
          </div>
          <div className="text-xl font-bold">{apiCalls}</div>
          <div className="text-xs text-[var(--muted-foreground)]">
            cached: {stats.hits}
          </div>
        </div>

        {/* Cache Hit Rate */}
        <div className="bg-[var(--muted)] rounded-lg p-3">
          <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] mb-1">
            <Zap size={12} />
            Cache Hit Rate
          </div>
          <div className="text-xl font-bold text-green-500">{stats.hitRate}</div>
          <div className="text-xs text-[var(--muted-foreground)]">
            {stats.size} entries
          </div>
        </div>

        {/* Estimated Cost */}
        <div className="bg-[var(--muted)] rounded-lg p-3">
          <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] mb-1">
            <DollarSign size={12} />
            Est. Cost
          </div>
          <div className="text-xl font-bold">${(apiCalls * estimatedCostPerCall).toFixed(3)}</div>
          <div className="text-xs text-[var(--muted-foreground)]">
            @ $0.003/call
          </div>
        </div>

        {/* Cost Saved */}
        <div className="bg-[var(--muted)] rounded-lg p-3">
          <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] mb-1">
            <Zap size={12} />
            Saved by Cache
          </div>
          <div className="text-xl font-bold text-green-500">
            ${estimatedCostSaved.toFixed(3)}
          </div>
          <div className="text-xs text-[var(--muted-foreground)]">
            {stats.hits} free calls
          </div>
        </div>
      </div>

      <div className="text-xs text-[var(--muted-foreground)] pt-2 border-t border-[var(--border)]">
        This demonstrates cost-aware architecture with intelligent caching.
      </div>
    </div>
  );
}

export { CostMeter };