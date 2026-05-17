import { useState, useCallback, useMemo } from 'react';

interface QualityScore {
  total: number;
  specific: number;
  measurable: number;
  achievable: number;
  relevant: number;
  timebound: number;
  feedback: string[];
  suggestions: string[];
}

interface SMARTAnalysis {
  score: QualityScore;
  isValid: boolean;
  criteria: {
    specific: { met: boolean; reason: string };
    measurable: { met: boolean; reason: string };
    achievable: { met: boolean; reason: string };
    relevant: { met: boolean; reason: string };
    timebound: { met: boolean; reason: string };
  };
}

const KEYWORDS = {
  specific: ['improve', 'reduce', 'increase', 'decrease', 'achieve', 'complete', 'deliver', 'implement', 'create', 'build', 'develop', 'launch', 'launch'],
  measurable: ['%', 'percent', 'number', 'count', 'target', 'goal', 'rate', 'ratio', 'score', 'points', 'units', 'hours', 'days'],
  achievable: ['realistic', 'possible', 'feasible', 'within', 'able', 'capable', 'can', 'will'],
  relevant: ['business', 'company', 'team', 'customer', 'stakeholder', 'department', 'organization', ' KPI', 'objective'],
  timebound: ['by', 'before', 'end of', 'quarter', 'month', 'year', 'deadline', 'date', 'Q1', 'Q2', 'Q3', 'Q4', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
};

function analyzeText(text: string): SMARTAnalysis {
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/);
  const feedback: string[] = [];
  const suggestions: string[] = [];

  // Specific: Check for clear, defined objective
  const specificKeywords = KEYWORDS.specific.filter(k => lowerText.includes(k));
  const specificLength = text.length >= 20;
  const specificScore = specificKeywords.length > 0 && specificLength ? 100 : 
                       specificKeywords.length > 0 || specificLength ? 60 : 20;
  
  const specific = {
    met: specificScore >= 60,
    reason: specificKeywords.length > 0 
      ? (specificLength ? 'Clear objective defined' : 'Objective defined but could be more detailed')
      : 'Add specific action words like "improve", "reduce", "achieve"'
  };
  if (!specific.met) suggestions.push('Make your goal more specific with action verbs');

  // Measurable: Check for numbers, percentages, targets
  const measurableKeywords = KEYWORDS.measurable.filter(k => lowerText.includes(k));
  const hasNumbers = /\d+/.test(text);
  const hasPercent = /%|percent/.test(lowerText);
  const measurableScore = (hasNumbers && hasPercent) ? 100 :
                          (hasNumbers || measurableKeywords.length > 0) ? 70 :
                          measurableKeywords.length > 0 ? 50 : 20;

  const measurable = {
    met: measurableScore >= 50,
    reason: hasNumbers && hasPercent
      ? 'Clear measurable target found'
      : hasNumbers
        ? 'Has numbers but add specific percentages or targets'
        : 'Add measurable targets with numbers or percentages'
  };
  if (!measurable.met) suggestions.push('Add specific numbers or percentages to measure success');

  // Achievable: Check for realistic language
  const achievableKeywords = KEYWORDS.achievable.filter(k => lowerText.includes(k));
  const hasNumbersForAchievable = /\d+/.test(text);
  const unrealisticWords = ['impossible', 'unachievable', '1000%', 'overnight'];
  const hasUnrealistic = unrealisticWords.some(w => lowerText.includes(w));
  
  let achievableScore = 50;
  if (achievableKeywords.length > 0) achievableScore += 30;
  if (hasNumbersForAchievable) achievableScore += 20;
  if (hasUnrealistic) achievableScore -= 40;

  const achievable = {
    met: achievableScore >= 50 && !hasUnrealistic,
    reason: achievableKeywords.length > 0 
      ? 'Language suggests achievable goal'
      : 'Add words like "realistic", "within", "able" to show feasibility'
  };
  if (!achievable.met) suggestions.push('Ensure the goal is realistic and achievable');

  // Relevant: Check for business relevance
  const relevantKeywords = KEYWORDS.relevant.filter(k => lowerText.includes(k));
  const relevantScore = relevantKeywords.length > 0 ? 80 : 
                        lowerText.includes('my work') || lowerText.includes('team') ? 50 : 30;

  const relevant = {
    met: relevantScore >= 50,
    reason: relevantKeywords.length > 0
      ? 'Shows clear business relevance'
      : 'Connect your goal to team or company objectives'
  };
  if (!relevant.met) suggestions.push('Link your goal to business or team objectives');

  // Timebound: Check for deadlines
  const timeboundKeywords = KEYWORDS.timebound.filter(k => lowerText.includes(k));
  const hasDate = /\d{4}|\d{1,2}\/\d{1,2}/.test(text);
  const hasMonth = /january|february|march|april|may|june|july|august|september|october|november|december/i.test(text);
  const timeboundScore = (hasDate && hasMonth) ? 100 :
                         timeboundKeywords.length > 0 ? 70 :
                         hasDate || hasMonth ? 60 : 20;

  const timebound = {
    met: timeboundScore >= 60,
    reason: timeboundKeywords.length > 0 || hasDate
      ? 'Clear deadline or timeframe identified'
      : 'Add a specific deadline or timeframe'
  };
  if (!timebound.met) suggestions.push('Add a clear deadline (e.g., "by December 31" or "Q2")');

  // Calculate total
  const total = Math.round((specificScore + measurableScore + achievableScore + relevantScore + timeboundScore) / 5);

  if (total >= 80) feedback.push('✓ Excellent goal! Meets all SMART criteria');
  else if (total >= 60) feedback.push('✓ Good goal, consider improvements noted above');
  else feedback.push('⚠ Goal needs refinement to meet SMART criteria');

  return {
    score: {
      total,
      specific: specificScore,
      measurable: measurableScore,
      achievable: achievableScore,
      relevant: relevantScore,
      timebound: timeboundScore,
      feedback,
      suggestions
    },
    isValid: total >= 60,
    criteria: { specific, measurable, achievable, relevant, timebound }
  };
}

export function useGoalQualityScorer() {
  const [analysis, setAnalysis] = useState<SMARTAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeGoal = useCallback((text: string) => {
    setIsAnalyzing(true);
    
    // Simulate AI processing delay
    setTimeout(() => {
      const result = analyzeText(text);
      setAnalysis(result);
      setIsAnalyzing(false);
    }, 300);
  }, []);

  const getQualityLevel = useMemo(() => {
    if (!analysis) return { level: 'neutral', color: '#6b7280', label: 'Start typing...' };
    const score = analysis.score.total;
    if (score >= 80) return { level: 'excellent', color: '#22c55e', label: 'Excellent' };
    if (score >= 60) return { level: 'good', color: '#3b82f6', label: 'Good' };
    if (score >= 40) return { level: 'fair', color: '#f59e0b', label: 'Needs Work' };
    return { level: 'poor', color: '#ef4444', label: 'Poor' };
  }, [analysis]);

  const reset = useCallback(() => {
    setAnalysis(null);
  }, []);

  return {
    analysis,
    isAnalyzing,
    analyzeGoal,
    getQualityLevel,
    reset
  };
}

export default useGoalQualityScorer;