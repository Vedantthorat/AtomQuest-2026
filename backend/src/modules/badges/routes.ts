import { Router, Request, Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { getDocsByField, createDoc, getAllDocs, getDoc } from '../../services/firestore';
import { db } from '../../config/firebase';

const router = Router();

const BADGE_DEFINITIONS: Record<string, { name: string; description: string; icon: string }> = {
  GOAL_MASTER: { name: 'Goal Master', description: 'Created 10+ goals', icon: '🏆' },
  FIRST_GOAL: { name: 'First Goal', description: 'Created your first goal', icon: '🎯' },
  QUARTER_COMPLETE: { name: 'Quarter Complete', description: 'Completed a quarterly goal', icon: '📅' },
  STREAK_7_DAYS: { name: '7 Day Streak', description: '7 days of check-ins', icon: '🔥' },
  STREAK_30_DAYS: { name: '30 Day Streak', description: '30 days of check-ins', icon: '⚡' },
  TOP_PERFORMER: { name: 'Top Performer', description: 'Achieved 100% of goals', icon: '⭐' },
  QUICK_ACHIEVER: { name: 'Quick Achiever', description: 'Completed goal before deadline', icon: '🚀' },
  CONSISTENT: { name: 'Consistent', description: '6+ months active', icon: '💪' },
  TEAM_PLAYER: { name: 'Team Player', description: 'Contributed to shared goals', icon: '🤝' },
  INNOVATOR: { name: 'Innovator', description: 'Created innovative goals', icon: '💡' }
};

router.get('/badges', async (req: AuthRequest, res: Response) => {
  res.json(BADGE_DEFINITIONS);
});

router.get('/my-badges', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const badges = await getDocsByField<any>('userBadges', 'userId', userId);
    
    const badgesWithDefinition = badges.map(b => ({
      ...b,
      definition: BADGE_DEFINITIONS[b.badge]
    }));

    res.json(badgesWithDefinition.sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime()));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/check-badges', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const goals = await getDocsByField<any>('goals', 'ownerId', userId);
    const approvedGoals = goals.filter(g => g.status === 'APPROVED');
    const earnedBadges: string[] = [];

    if (approvedGoals.length >= 1) {
      const existing = await getDocsByField<any>('userBadges', 'userId', userId);
      const hasFirstGoal = existing.some(b => b.badge === 'FIRST_GOAL');
      if (!hasFirstGoal) {
        await createDoc('userBadges', { userId, badge: 'FIRST_GOAL', earnedAt: new Date().toISOString() });
        earnedBadges.push('FIRST_GOAL');
      }
    }

    if (approvedGoals.length >= 10) {
      const existing = await getDocsByField<any>('userBadges', 'userId', userId);
      const hasMaster = existing.some(b => b.badge === 'GOAL_MASTER');
      if (!hasMaster) {
        await createDoc('userBadges', { userId, badge: 'GOAL_MASTER', earnedAt: new Date().toISOString() });
        earnedBadges.push('GOAL_MASTER');
      }
    }

    res.json({ earned: earnedBadges, message: earnedBadges.length > 0 ? `Earned ${earnedBadges.length} new badge(s)` : 'No new badges earned' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const badges = await getDocsByField<any>('userBadges', 'userId', userId);
    const goals = await getDocsByField<any>('goals', 'ownerId', userId);
    const approvedGoals = goals.filter(g => g.status === 'APPROVED');
    
    res.json({
      totalEarned: badges.length,
      totalAvailable: Object.keys(BADGE_DEFINITIONS).length,
      completedGoals: approvedGoals.length,
      completionRate: goals.length > 0 ? Math.round((approvedGoals.length / goals.length) * 100) : 0
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;