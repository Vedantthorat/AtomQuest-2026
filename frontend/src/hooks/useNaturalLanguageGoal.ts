import { useState, useCallback } from 'react';

interface ParsedGoal {
  title: string;
  description: string;
  uomType: 'MIN' | 'MAX' | 'TIMELINE' | 'ZERO' | 'BINARY';
  targetValue: number;
  unit: string;
  deadline: string;
  quarter: string;
  thrustArea: string;
  confidence: number;
}

const THRUST_AREAS = [
  'Revenue Growth',
  'Customer Experience',
  'Operational Excellence',
  'Innovation & R&D',
  'Employee Development',
  'Sustainability',
  'Digital Transformation',
  'Market Expansion'
];

const ACTION_VERBS = {
  increase: { uom: 'MAX', direction: 'increase', unit: '%' },
  reduce: { uom: 'MAX', direction: 'reduce', unit: '%' },
  improve: { uom: 'MAX', direction: 'improve', unit: '%' },
  decrease: { uom: 'MAX', direction: 'decrease', unit: '%' },
  achieve: { uom: 'MIN', direction: 'achieve', unit: 'target' },
  complete: { uom: 'BINARY', direction: 'complete', unit: 'task' },
  deliver: { uom: 'MIN', direction: 'deliver', unit: 'item' },
  launch: { uom: 'BINARY', direction: 'launch', unit: 'project' },
  implement: { uom: 'BINARY', direction: 'implement', unit: 'system' },
  create: { uom: 'MIN', direction: 'create', unit: 'item' },
  build: { uom: 'MIN', direction: 'build', unit: 'item' },
  develop: { uom: 'TIMELINE', direction: 'develop', unit: 'phase' },
  reach: { uom: 'MIN', direction: 'reach', unit: 'target' },
  attain: { uom: 'MIN', direction: 'attain', unit: 'target' },
};

const QUARTERS: Record<string, string> = {
  'january': 'Q1', 'february': 'Q1', 'march': 'Q1',
  'april': 'Q2', 'may': 'Q2', 'june': 'Q2',
  'july': 'Q3', 'august': 'Q3', 'september': 'Q3',
  'october': 'Q4', 'november': 'Q4', 'december': 'Q4',
  'q1': 'Q1', 'q2': 'Q2', 'q3': 'Q3', 'q4': 'Q4',
  'first quarter': 'Q1', 'second quarter': 'Q2', 'third quarter': 'Q3', 'fourth quarter': 'Q4',
  'first': 'Q1', 'second': 'Q2', 'third': 'Q3', 'fourth': 'Q4'
};

function extractNumber(text: string): { value: number; remaining: string } {
  const percentMatch = text.match(/(\d+)%/);
  if (percentMatch) {
    return { value: parseInt(percentMatch[1]), remaining: text.replace(percentMatch[0], '') };
  }
  
  const numberMatch = text.match(/(\d+(?:\.\d+)?)/);
  if (numberMatch) {
    return { value: parseFloat(numberMatch[1]), remaining: text.replace(numberMatch[0], '') };
  }
  
  // Handle word numbers
  const wordNumbers: Record<string, number> = {
    'half': 50, 'quarter': 25, 'third': 33, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
    'ten': 10, 'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50, 'sixty': 60,
    'seventy': 70, 'eighty': 80, 'ninety': 90, 'hundred': 100
  };
  
  for (const [word, num] of Object.entries(wordNumbers)) {
    if (text.toLowerCase().includes(word)) {
      const remaining = text.toLowerCase().replace(word, '');
      return { value: num, remaining: remaining.replace(new RegExp(word, 'gi'), '') };
    }
  }
  
  return { value: 0, remaining: text };
}

function detectThrustArea(text: string): string {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('revenue') || lowerText.includes('sales') || lowerText.includes('income')) {
    return 'Revenue Growth';
  }
  if (lowerText.includes('customer') || lowerText.includes('client') || lowerText.includes('satisfaction')) {
    return 'Customer Experience';
  }
  if (lowerText.includes('process') || lowerText.includes('efficiency') || lowerText.includes('cost')) {
    return 'Operational Excellence';
  }
  if (lowerText.includes('innovat') || lowerText.includes('研发') || lowerText.includes('research')) {
    return 'Innovation & R&D';
  }
  if (lowerText.includes('employee') || lowerText.includes('staff') || lowerText.includes('training') || lowerText.includes('skill')) {
    return 'Employee Development';
  }
  if (lowerText.includes('sustain') || lowerText.includes('carbon') || lowerText.includes('environment')) {
    return 'Sustainability';
  }
  if (lowerText.includes('digital') || lowerText.includes('tech') || lowerText.includes('software') || lowerText.includes('automate')) {
    return 'Digital Transformation';
  }
  if (lowerText.includes('market') || lowerText.includes('expand') || lowerText.includes('geography') || lowerText.includes('region')) {
    return 'Market Expansion';
  }
  
  return 'Operational Excellence'; // Default
}

export function useNaturalLanguageGoal() {
  const [isParsing, setIsParsing] = useState(false);
  const [parsedGoal, setParsedGoal] = useState<ParsedGoal | null>(null);
  const [error, setError] = useState<string | null>(null);

  const parseGoal = useCallback((input: string) => {
    setIsParsing(true);
    setError(null);
    
    return new Promise<ParsedGoal>((resolve, reject) => {
      setTimeout(() => {
        try {
          const lowerInput = input.toLowerCase().trim();
          
          if (lowerInput.length < 10) {
            throw new Error('Please provide more detail about your goal (at least 10 characters)');
          }

          // Detect action verb and UOM type
          let uomType: ParsedGoal['uomType'] = 'MIN';
          let unit = 'target';
          let targetValue = 100;
          
          for (const [verb, config] of Object.entries(ACTION_VERBS)) {
            if (lowerInput.includes(verb)) {
              uomType = config.uom as ParsedGoal['uomType'];
              unit = config.unit;
              
              // Extract target number
              const { value, remaining } = extractNumber(lowerInput);
              
              if (value > 0) {
                targetValue = value;
                
                // Adjust for direction
                if (config.direction === 'reduce' || config.direction === 'decrease') {
                  uomType = 'MAX';
                }
              }
              break;
            }
          }

          // Detect deadline and quarter
          let quarter = 'Q1';
          let deadline = '';
          
          for (const [month, q] of Object.entries(QUARTERS)) {
            if (lowerInput.includes(month)) {
              quarter = q;
              // Extract year if present
              const yearMatch = input.match(/(\d{4})/);
              deadline = yearMatch ? `December 31, ${yearMatch[1]}` : `December 31, ${new Date().getFullYear()}`;
              break;
            }
          }

          // Detect thrust area
          const thrustArea = detectThrustArea(input);

          // Build title from input
          let title = input.charAt(0).toUpperCase() + input.slice(1);
          if (title.length > 100) {
            title = title.substring(0, 97) + '...';
          }

          // Calculate confidence based on how many elements were detected
          let confidence = 50;
          if (targetValue > 0) confidence += 20;
          if (deadline) confidence += 15;
          if (thrustArea !== 'Operational Excellence') confidence += 10;
          if (Object.keys(ACTION_VERBS).some(v => lowerInput.includes(v))) confidence += 5;

          const parsed: ParsedGoal = {
            title,
            description: `Goal created from natural language: "${input}"`,
            uomType,
            targetValue,
            unit,
            deadline,
            quarter,
            thrustArea,
            confidence
          };

          setParsedGoal(parsed);
          setIsParsing(false);
          resolve(parsed);
        } catch (err: any) {
          setError(err.message);
          setIsParsing(false);
          reject(err);
        }
      }, 500);
    });
  }, []);

  const reset = useCallback(() => {
    setParsedGoal(null);
    setError(null);
  }, []);

  return {
    isParsing,
    parsedGoal,
    error,
    parseGoal,
    reset,
    THRUST_AREAS
  };
}

export default useNaturalLanguageGoal;