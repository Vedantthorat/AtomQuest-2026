import { Router, Response } from 'express';
import { AuthRequest, requireManager } from '../../middleware/auth';

const router = Router();

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const prisma = req.prisma;
    const { status } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (req.user?.role === 'EMPLOYEE') {
      where.escalatedBy = req.user.id;
    }

    const escalations = await prisma.escalation.findMany({
      where,
      include: {
        goal: { select: { id: true, title: true, ownerId: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(escalations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch escalations' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { goalId, reason } = req.body;
    const prisma = req.prisma;

    const goal = await prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal) return res.status(404).json({ error: 'Goal not found' });

    const escalation = await prisma.escalation.create({
      data: {
        goalId,
        escalatedBy: req.user!.id,
        reason,
        status: 'OPEN'
      },
      include: { goal: true }
    });

    await prisma.activity.create({
      data: {
        userId: req.user!.id,
        type: 'escalation_created',
        description: `Escalated goal: ${goal.title}`,
        goalId
      }
    });

    res.status(201).json(escalation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create escalation' });
  }
});

router.put('/:id/resolve', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { resolution } = req.body;
    const prisma = req.prisma;

    const escalation = await prisma.escalation.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolution,
        resolvedAt: new Date()
      },
      include: { goal: true }
    });

    await prisma.activity.create({
      data: {
        userId: req.user!.id,
        type: 'escalation_resolved',
        description: `Resolved escalation for: ${escalation.goal.title}`,
        goalId: escalation.goalId
      }
    });

    await prisma.notification.create({
      data: {
        userId: escalation.escalatedBy,
        title: 'Escalation Resolved',
        message: `Your escalation for "${escalation.goal.title}" has been resolved`,
        type: 'SUCCESS'
      }
    });

    res.json(escalation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to resolve escalation' });
  }
});

router.put('/:id/close', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const prisma = req.prisma;

    const escalation = await prisma.escalation.update({
      where: { id },
      data: { status: 'CLOSED' },
      include: { goal: true }
    });

    res.json(escalation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to close escalation' });
  }
});

export default router;