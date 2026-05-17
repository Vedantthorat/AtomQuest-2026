// FILE: src/utils/performanceMonitor.ts

interface AppMetrics {
  apiCallsMade: number;
  cacheHits: number;
  totalLatencyMs: number;
  bundleLoadTimeMs: number;
}

interface PerformanceStats {
  apiCalls: number;
  cacheHits: number;
  cacheMisses: number;
  hitRate: string;
  avgLatency: number;
  estimatedCostSaved: number;
  bundleLoadTime: number;
}

class PerformanceMonitor {
  data: AppMetrics = {
    apiCallsMade: 0,
    cacheHits: 0,
    totalLatencyMs: 0,
    bundleLoadTimeMs: 0,
  };

  private startTime: number;

  constructor() {
    this.startTime = Date.now();
    // Measure initial page load
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        const loadTime = performance.now();
        this.data.bundleLoadTimeMs = Math.round(loadTime);
      });
    }
  }

  recordApiCall(latencyMs: number, fromCache: boolean): void {
    this.data.apiCallsMade++;
    this.data.totalLatencyMs += latencyMs;
    if (fromCache) {
      this.data.cacheHits++;
    }
  }

  getStats(): PerformanceStats {
    const totalCalls = this.data.apiCallsMade;
    const cacheHits = this.data.cacheHits;
    const cacheMisses = totalCalls - cacheHits;
    const hitRate = totalCalls > 0 ? Math.round((cacheHits / totalCalls) * 100) : 0;
    const avgLatency = totalCalls > 0 ? Math.round(this.data.totalLatencyMs / totalCalls) : 0;
    
    // Estimate cost savings: $0.003 per API call, but cache hits are free
    const estimatedCostPerCall = 0.003;
    const estimatedCostSaved = cacheHits * estimatedCostPerCall;

    return {
      apiCalls: totalCalls,
      cacheHits,
      cacheMisses,
      hitRate: `${hitRate}%`,
      avgLatency,
      estimatedCostSaved: Math.round(estimatedCostSaved * 100) / 100,
      bundleLoadTime: this.data.bundleLoadTimeMs,
    };
  }

  reset(): void {
    this.data = {
      apiCallsMade: 0,
      cacheHits: 0,
      totalLatencyMs: 0,
      bundleLoadTimeMs: this.data.bundleLoadTimeMs,
    };
  }

  getSessionDuration(): number {
    return Date.now() - this.startTime;
  }
}

// Singleton instance
export const metrics = new PerformanceMonitor();

// React hook for using metrics in components
export function useMetrics() {
  return metrics.getStats();
}

export default metrics;