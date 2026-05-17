import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: any;
  prisma: PrismaClient;
}

const DEFAULT_WIDGETS = [
  { type: 'goalProgress', title: 'Goal Progress', position: 0 },
  { type: 'quarterlyPerformance', title: 'Quarterly Performance', position: 1 },
  { type: 'thrustAreaBreakdown', title: 'Thrust Area Breakdown', position: 2 },
  { type: 'achievementRate', title: 'Achievement Rate', position: 3 }
];

router.get('/kpi', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;

    const dashboards = await prisma.kPIDashboard.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    });

    res.json(dashboards);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/kpi', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const { name, widgets } = req.body;

    const dashboard = await prisma.kPIDashboard.create({
      data: {
        userId,
        name,
        widgets: widgets || DEFAULT_WIDGETS
      }
    });

    res.json(dashboard);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/kpi/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const dashboard = await prisma.kPIDashboard.findFirst({
      where: { id, userId }
    });

    if (!dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }

    const goals = await prisma.goal.findMany({
      where: { ownerId: userId }
    });

    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.currentValue >= g.targetValue).length;
    const inProgressGoals = goals.filter(g => g.currentValue > 0 && g.currentValue < g.targetValue).length;

    const thrustAreas = goals.reduce((acc: any, g) => {
      acc[g.thrustArea] = (acc[g.thrustArea] || 0) + 1;
      return acc;
    }, {});

    res.json({
      ...dashboard,
      stats: {
        totalGoals,
        completedGoals,
        inProgressGoals,
        achievementRate: totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0,
        thrustAreas
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/kpi/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, widgets } = req.body;

    const dashboard = await prisma.kPIDashboard.findFirst({
      where: { id, userId }
    });

    if (!dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }

    const updated = await prisma.kPIDashboard.update({
      where: { id },
      data: { name, widgets }
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/kpi/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const dashboard = await prisma.kPIDashboard.findFirst({
      where: { id, userId }
    });

    if (!dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }

    await prisma.kPIDashboard.delete({ where: { id } });

    res.json({ message: 'Dashboard deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;