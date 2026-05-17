import { Router, Response } from 'express';
import { AuthRequest, requireManager } from '../../middleware/auth';

const router = Router();

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const prisma = req.prisma;
    const { department } = req.query;

    const where: any = {};
    if (department) where.department = department;

    const sharedGoals = await prisma.sharedGoal.findMany({
      where,
      include: {
        goals: {
          include: {
            owner: { select: { id: true, name: true, avatar: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(sharedGoals);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shared goals' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const prisma = req.prisma;

    const sharedGoal = await prisma.sharedGoal.findUnique({
      where: { id },
      include: {
        goals: {
          include: {
            owner: { select: { id: true, name: true, avatar: true } }
          }
        }
      }
    });

    if (!sharedGoal) {
      return res.status(404).json({ error: 'Shared goal not found' });
    }

    res.json(sharedGoal);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shared goal' });
  }
});

router.post('/', requireManager, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, weightage, targetValue, unit, department } = req.body;
    const prisma = req.prisma;

    const sharedGoal = await prisma.sharedGoal.create({
      data: {
        title,
        description,
        weightage,
        targetValue,
        unit,
        department
      }
    });

    res.status(201).json(sharedGoal);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create shared goal' });
  }
});

router.put('/:id', requireManager, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, weightage, targetValue, unit } = req.body;
    const prisma = req.prisma;

    const sharedGoal = await prisma.sharedGoal.update({
      where: { id },
      data: { title, description, weightage, targetValue, unit }
    });

    res.json(sharedGoal);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update shared goal' });
  }
});

router.delete('/:id', requireManager, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const prisma = req.prisma;

    await prisma.sharedGoal.delete({ where: { id } });

    res.json({ message: 'Shared goal deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete shared goal' });
  }
});

router.post('/:id/contributors', requireManager, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { userIds } = req.body;
    const prisma = req.prisma;

    const sharedGoal = await prisma.sharedGoal.update({
      where: { id },
      data: {
        contributors: {
          connect: userIds.map((uid: string) => ({ id: uid }))
        }
      },
      include: { contributors: { select: { id: true, name: true, avatar: true } } }
    });

    res.json(sharedGoal);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add contributors' });
  }
});

router.put('/:id/progress', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { currentValue } = req.body;
    const prisma = req.prisma;

    const sharedGoal = await prisma.sharedGoal.update({
      where: { id },
      data: { currentValue }
    });

    const linkedGoals = await prisma.goal.findMany({
      where: { sharedGoalId: id }
    });

    if (linkedGoals.length > 0) {
      const progressPercentage = sharedGoal.targetValue > 0 
        ? (currentValue / sharedGoal.targetValue) 
        : 0;

      await Promise.all(
        linkedGoals.map(goal => 
          prisma.goal.update({
            where: { id: goal.id },
            data: { currentValue: Math.round(goal.targetValue * progressPercentage) }
          })
        )
      );
    }

    const totalProgress = linkedGoals.reduce((sum, g) => sum + (g.currentValue / g.targetValue) * 100, 0);
    const avgProgress = linkedGoals.length > 0 ? totalProgress / linkedGoals.length : 0;

    res.json({ ...sharedGoal, avgProgress, syncedGoals: linkedGoals.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

export default router;