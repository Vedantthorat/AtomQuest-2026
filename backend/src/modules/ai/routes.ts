import { Router, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { AuthRequest } from '../../middleware/auth';

const router = Router();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

interface SMARTGoalResult {
  smartGoal: string;
  kpiName: string;
  suggestedUoM: string;
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

router.post('/generate-smart-goal', async (req: AuthRequest, res: Response) => {
  try {
    const { vagueGoal, thrustArea } = req.body;

    if (!vagueGoal) {
      return res.status(400).json({ error: 'vagueGoal is required' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
    }

    const prompt = `You are a goal-setting expert for an enterprise performance management system. 
Given a vague goal input, generate a SMART goal with the following structure:

Input: "${vagueGoal}"
Thrust Area: ${thrustArea || 'General'}

Generate a response in this exact JSON format (no other text):
{
  "smartGoal": "A specific, measurable, achievable, relevant, time-bound version of the vague goal",
  "kpiName": "Name of the KPI being measured",
  "suggestedUoM": "MIN, MAX, TIMELINE, or ZERO",
  "suggestedTarget": "Target value or date",
  "suggestedWeightage": number between 10-30,
  "rationale": "Explanation of why this is a SMART goal",
  "quarterlyMilestones": {
    "Q1": "First quarter milestone",
    "Q2": "Second quarter milestone", 
    "Q3": "Third quarter milestone",
    "Q4": "Fourth quarter milestone - final target"
  },
  "riskFlags": ["Risk 1", "Risk 2", "Risk 3"]
}

Use UoM type:
- MIN: Higher values are better (revenue, satisfaction, etc.)
- MAX: Lower values are better (TAT, defects, costs, etc.)
- TIMELINE: Date-based deliverables
- ZERO: Zero is success (incidents, errors, complaints)`;

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }]
    });

    const responseText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : '';
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const result: SMARTGoalResult = JSON.parse(jsonMatch[0]);

    res.json({
      result,
      fromCache: false,
      latencyMs: 0,
      tokensUsed: message.usage.input_tokens + message.usage.output_tokens
    });
  } catch (error: any) {
    console.error('AI service error:', error.message);
    res.status(500).json({ 
      error: error.message || 'Failed to generate SMART goal',
      details: process.env.ANTHROPIC_API_KEY ? 'API key present' : 'No API key'
    });
  }
});

router.post('/answer', async (req: AuthRequest, res: Response) => {
  try {
    const { question, context } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'question is required' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
    }

    const userContext = context?.userRole ? `User role: ${context.userRole}` : '';
    const goalsContext = context?.userGoals?.length 
      ? `\nUser's goals: ${context.userGoals.map((g: any) => g.title).join(', ')}` 
      : '';

    const prompt = `You are an AI assistant for the AtomQuest goal management system. Answer the user's question about goals, weightage, thrust areas, approvals, or the system in general.

${userContext}${goalsContext}

Question: ${question}

Provide a clear, helpful answer. If the question is about specific functionality of the AtomQuest system, explain it accurately.`;

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }]
    });

    const answer = message.content[0].type === 'text' 
      ? message.content[0].text 
      : 'I apologize, but I could not generate a response.';

    res.json({
      answer,
      tokensUsed: message.usage.input_tokens + message.usage.output_tokens
    });
  } catch (error: any) {
    console.error('AI answer error:', error.message);
    res.status(500).json({ 
      error: error.message || 'Failed to answer question',
      details: process.env.ANTHROPIC_API_KEY ? 'API key present' : 'No API key'
    });
  }
});

router.post('/analyze-goals', async (req: AuthRequest, res: Response) => {
  try {
    const prisma = req.prisma;
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
    }

    const goals = await prisma.goal.findMany({
      where: { ownerId: req.user!.id },
      orderBy: { createdAt: 'desc' }
    });

    if (goals.length === 0) {
      return res.json({
        summary: 'No goals to analyze. Create some goals first!',
        atRiskGoals: [],
        recommendations: ['Create your first goal to get started with goal tracking.']
      });
    }

    const goalsSummary = goals.map(g => ({
      title: g.title,
      status: g.status,
      progress: g.targetValue > 0 ? Math.round((g.currentValue / g.targetValue) * 100) : 0,
      uomType: g.uomType,
      weightage: g.weightage,
      quarter: g.quarter
    }));

    const prompt = `You are an AI assistant for the AtomQuest goal management system. Analyze the following employee goals and provide a health summary.

Goals:
${goalsSummary.map((g, i) => `${i + 1}. ${g.title} - Status: ${g.status}, Progress: ${g.progress}%, UoM: ${g.uomType}, Weightage: ${g.weightage}%`).join('\n')}

Provide a response in this exact JSON format (no other text):
{
  "summary": "A 1-2 sentence overall health assessment",
  "atRiskGoals": ["List of goals that are at risk or need attention"],
  "misalignedGoals": ["List of goals that may have misaligned UoM types"],
  "recommendations": ["2-3 specific actionable recommendations"]
}`;

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }]
    });

    const responseText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : '';
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    let analysis = {
      summary: 'Unable to generate analysis',
      atRiskGoals: [] as string[],
      misalignedGoals: [] as string[],
      recommendations: ['Check your goals regularly to stay on track.']
    };

    if (jsonMatch) {
      try {
        analysis = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.warn('Failed to parse AI health analysis response');
      }
    }

    res.json({
      ...analysis,
      goalsCount: goals.length,
      tokensUsed: message.usage.input_tokens + message.usage.output_tokens
    });
  } catch (error: any) {
    console.error('AI goal health analysis error:', error.message);
    res.status(500).json({ 
      error: error.message || 'Failed to analyze goals',
      details: process.env.ANTHROPIC_API_KEY ? 'API key present' : 'No API key'
    });
  }
});

export default router;