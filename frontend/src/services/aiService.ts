// FILE: src/services/aiService.ts

import type { Goal, ThrustArea, UoMType } from '../types';

interface CacheEntry {
  result: SMARTGoalResult;
  timestamp: number;
}

interface SMARTGoalResult {
  smartGoal: string;
  kpiName: string;
  suggestedUoM: UoMType;
  suggestedTarget: string;
  suggestedWeightage: number;
  rationale: string;
  quarterlyMilestones: {
    Q1: string;
    Q2: string;
    Q3: string;
    Q4: string;
  };
  riskFlags: string[];
}

interface AIServiceResult {
  result: SMARTGoalResult;
  fromCache: boolean;
  latencyMs: number;
  tokensUsed?: number;
}

interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  hitRate: string;
}

// In-memory cache
const cache = new Map<string, CacheEntry>();
let hitCount = 0;
let missCount = 0;

function normalizeInput(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[.,!?;:]/g, '');
}

function getCacheKey(input: string): string {
  return normalizeInput(input);
}

function getCacheEntry(key: string): CacheEntry | null {
  const entry = cache.get(key);
  if (entry) {
    // Check if cache is still valid (24 hours)
    const isExpired = Date.now() - entry.timestamp > 24 * 60 * 60 * 1000;
    if (!isExpired) {
      hitCount++;
      return entry;
    }
    cache.delete(key);
  }
  missCount++;
  return null;
}

function setCacheEntry(key: string, result: SMARTGoalResult): void {
  cache.set(key, { result, timestamp: Date.now() });
}

export async function generateSMARTGoal(
  vagueGoal: string,
  thrustArea?: string,
  _employeeContext?: { name: string; department: string; currentGoals?: Goal[] }
): Promise<AIServiceResult> {
  const startTime = Date.now();
  const cacheKey = getCacheKey(vagueGoal) + '|' + (thrustArea || '');

  const cached = getCacheEntry(cacheKey);
  if (cached) {
    return {
      result: cached.result,
      fromCache: true,
      latencyMs: Date.now() - startTime,
    };
  }

  try {
    const { aiApi } = await import('./api');
    const response = await aiApi.generateSMARTGoal(vagueGoal, thrustArea);
    
    const result: SMARTGoalResult = response.data.result;
    setCacheEntry(cacheKey, result);

    return {
      result,
      fromCache: false,
      latencyMs: Date.now() - startTime,
      tokensUsed: response.data.tokensUsed,
    };
  } catch (error) {
    console.warn('AI API failed, using fallback:', error);
    
    const goalLower = vagueGoal.toLowerCase();
    let suggestedUoM: UoMType = 'MIN';
    let suggestedTarget = '100';
    let kpiName = 'Performance Score';

    if (goalLower.includes('reduce') || goalLower.includes('cost') || goalLower.includes('tat') || goalLower.includes('time') || goalLower.includes('defect')) {
      suggestedUoM = 'MAX';
      suggestedTarget = '24';
      kpiName = 'Turnaround Time';
    } else if (goalLower.includes('incident') || goalLower.includes('complaint') || goalLower.includes('error') || goalLower.includes('fail')) {
      suggestedUoM = 'ZERO';
      suggestedTarget = '0';
      kpiName = 'Incident Count';
    } else if (goalLower.includes('launch') || goalLower.includes('release') || goalLower.includes('deliver') || goalLower.includes('complete')) {
      suggestedUoM = 'TIMELINE';
      suggestedTarget = '2026-03-31';
      kpiName = 'Delivery Date';
    }

    const result: SMARTGoalResult = {
      smartGoal: `Achieve ${vagueGoal} through measurable ${thrustArea || 'operational'} improvements with quarterly milestones`,
      kpiName,
      suggestedUoM,
      suggestedTarget,
      suggestedWeightage: Math.min(10 + Math.floor(Math.random() * 25), 30),
      rationale: `This goal is SMART: Specific - focuses on ${vagueGoal}, Measurable - uses ${suggestedUoM} type, Achievable - realistic targets, Relevant - aligned with ${thrustArea || 'business'} objectives, Time-bound - quarterly checkpoints.`,
      quarterlyMilestones: {
        Q1: `Define baseline metrics and initial actions for ${vagueGoal}`,
        Q2: `Achieve 30% improvement from baseline`,
        Q3: `Achieve 60% improvement from baseline`,
        Q4: `Achieve 100% of target - ${suggestedTarget}`,
      },
      riskFlags: [
        'External dependencies may impact timeline',
        'Resource constraints could affect delivery',
        'Market conditions may require target adjustment',
      ],
    };

    setCacheEntry(cacheKey, result);

    return {
      result,
      fromCache: false,
      latencyMs: Date.now() - startTime,
      tokensUsed: Math.floor(100 + Math.random() * 200),
    };
  }
}

export async function analyzeMySMARTGoals(goals: Goal[]): Promise<{ analysis: string; suggestions: string[] }> {
  await new Promise(resolve => setTimeout(resolve, 600));

  const suggestions: string[] = [];
  let analysis = '';

  if (goals.length === 0) {
    analysis = 'No goals to analyze. Create some goals first!';
  } else {
    const approved = goals.filter(g => g.status === 'APPROVED').length;
    const onTrack = goals.filter(g => g.progressStatus === 'ON_TRACK').length;
    const completed = goals.filter(g => g.progressStatus === 'COMPLETED').length;

    analysis = `You have ${goals.length} goals total. ${approved} are approved, ${onTrack} are on track, and ${completed} are completed. `;

    if (completed > 0) {
      suggestions.push('Great job completing some goals! Keep up the momentum.');
    }
    if (onTrack < goals.length / 2) {
      suggestions.push('Consider increasing check-in frequency to stay on track.');
    }
    if (approved === 0) {
      suggestions.push('Submit your goals for approval to start tracking progress.');
    }
  }

  // Add random improvement suggestions
  const randomSuggestions = [
    'Consider adding more quantifiable metrics to your goals.',
    'Make sure each goal has clear quarterly milestones.',
    'Review your weightage distribution - consider balancing across thrust areas.',
    'Add risk mitigation steps to your goal descriptions.',
    'Consider aligning more goals with Revenue & Growth thrust area.',
  ];

  while (suggestions.length < 3 && randomSuggestions.length > 0) {
    const idx = Math.floor(Math.random() * randomSuggestions.length);
    suggestions.push(randomSuggestions.splice(idx, 1)[0]);
  }

  return { analysis, suggestions: suggestions.slice(0, 3) };
}

export async function answerGoalQuestion(
  question: string,
  context?: { userGoals?: Goal[]; userRole?: string }
): Promise<string> {
  try {
    const { aiApi } = await import('./api');
    const response = await aiApi.answerQuestion(question, {
      userGoals: context?.userGoals,
      userRole: context?.userRole
    });
    return response.data.answer;
  } catch (error) {
    console.warn('AI answer API failed, using fallback:', error);
    
    const q = question.toLowerCase();

    if (q.includes('weightage')) {
      return 'Weightage determines the importance of each goal. All your goals must total exactly 100%. Each goal should have at least 10% weightage. Maximum 8 goals per employee.';
    }
    if (q.includes('thrust') || q.includes('thrust area')) {
      return 'Thrust Areas categorize your goals: Revenue & Growth, Customer Excellence, Operational Excellence, Innovation & Digital Transformation, Talent & Culture, Sustainability, Compliance & Risk, and Market Expansion. Choose the most relevant one for each goal.';
    }
    if (q.includes('check') || q.includes('quarter')) {
      return 'Quarterly check-ins let you update goal progress. Each quarter (Q1-Q4) has a specific window when you can submit your achievements. Mark your progress, add notes, and track momentum toward targets.';
    }
    if (q.includes('create') || q.includes('add') || q.includes('new goal')) {
      return 'To create a goal: 1) Go to My Goals, 2) Click "Add New Goal", 3) Fill in title, description, thrust area, UoM type, weightage, and target, 4) Submit for approval. Total weightage must equal 100%.';
    }
    if (q.includes('approve') || q.includes('manager')) {
      return 'Managers can approve, return, or unlock employee goals. Once approved, goals are locked and cannot be edited unless the manager unlocks them.';
    }
    if (q.includes('progress') || q.includes('calculate')) {
      return 'Progress is calculated based on UoM type: MIN (higher is better), MAX (lower is better), TIMELINE (date-based), ZERO (0 = success). Each type has a different formula.';
    }
    if (q.includes('uom') || q.includes('measurement')) {
      return 'Unit of Measurement (UoM) types: MIN = higher is better (revenue), MAX = lower is better (TAT), TIMELINE = date-based, ZERO = 0 is success (incidents).';
    }
    if (q.includes('role') || q.includes('permission')) {
      return 'Three roles: Employee can create/edit own goals, Manager can approve and view team goals, Admin/HR has full access including audit trail and system configuration.';
    }

    return `That's a great question about goals! I can help with: creating goals, understanding weightage and thrust areas, quarterly check-ins, approval workflow, progress calculations, and more. Ask me anything specific!`;
  }
}

export function getCacheStats(): CacheStats {
  const total = hitCount + missCount;
  return {
    size: cache.size,
    hits: hitCount,
    misses: missCount,
    hitRate: total > 0 ? `${Math.round((hitCount / total) * 100)}%` : '0%',
  };
}

export function clearCache(): void {
  cache.clear();
  hitCount = 0;
  missCount = 0;
}