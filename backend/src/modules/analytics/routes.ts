import { Router, Response } from 'express';
import { AuthRequest, requireRole } from '../../middleware/auth';
import { getAllDocs, queryDocs, getDocsByField } from '../../services/firestore';

const router = Router();

router.get('/dashboard', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { quarter, year } = req.query;
    const q = quarter as string || 'Q1';
    const y = parseInt(year as string) || new Date().getFullYear();

    let allGoals = await getAllDocs<any>('goals');
    allGoals = allGoals.filter(g => g.quarter === q && g.year === y);

    if (user.role === 'EMPLOYEE') {
      allGoals = allGoals.filter(g => g.ownerId === user.id);
    } else if (user.role === 'MANAGER') {
      const teamMembers = await queryDocs<any>('users', 'managerId', '==', user.id);
      const memberIds = teamMembers.map(m => m.id);
      allGoals = allGoals.filter(g => g.ownerId === user.id || memberIds.includes(g.ownerId));
    }

    const totalGoals = allGoals.length;
    const approvedGoals = allGoals.filter(g => g.status === 'APPROVED').length;
    const pendingGoals = allGoals.filter(g => g.status === 'PENDING').length;
    const draftGoals = allGoals.filter(g => g.status === 'DRAFT' || g.status === 'RETURNED').length;
    const avgProgress = totalGoals > 0 ? allGoals.reduce((sum, g) => sum + (g.currentValue / g.targetValue) * 100, 0) / totalGoals : 0;

    res.json({
      totalGoals,
      approvedGoals,
      pendingGoals,
      draftGoals,
      avgProgress: Math.round(avgProgress),
      completionRate: totalGoals > 0 ? Math.round((approvedGoals / totalGoals) * 100) : 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

router.get('/thrust-areas', async (req: AuthRequest, res: Response) => {
  try {
    const goals = await getAllDocs<any>('goals');
    const byThrustArea: Record<string, { count: number; avgProgress: number }> = {};
    
    goals.forEach(g => {
      if (!byThrustArea[g.thrustArea]) {
        byThrustArea[g.thrustArea] = { count: 0, avgProgress: 0 };
      }
      byThrustArea[g.thrustArea].count++;
      byThrustArea[g.thrustArea].avgProgress += (g.currentValue / g.targetValue) * 100;
    });

    Object.keys(byThrustArea).forEach(area => {
      byThrustArea[area].avgProgress = Math.round(byThrustArea[area].avgProgress / byThrustArea[area].count);
    });

    res.json(byThrustArea);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch thrust area analytics' });
  }
});

router.get('/quarter-trends', async (req: AuthRequest, res: Response) => {
  try {
    const goals = await getAllDocs<any>('goals');
    const byQuarter: Record<string, { goals: number; avgProgress: number }> = {};

    goals.forEach(g => {
      const key = `${g.quarter}-${g.year}`;
      if (!byQuarter[key]) {
        byQuarter[key] = { goals: 0, avgProgress: 0 };
      }
      byQuarter[key].goals++;
      byQuarter[key].avgProgress += (g.currentValue / g.targetValue) * 100;
    });

    Object.keys(byQuarter).forEach(key => {
      byQuarter[key].avgProgress = Math.round(byQuarter[key].avgProgress / byQuarter[key].goals);
    });

    res.json(byQuarter);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quarter trends' });
  }
});

export default router;