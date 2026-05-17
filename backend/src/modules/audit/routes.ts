import { Router, Response } from 'express';
import { AuthRequest, requireAdmin } from '../../middleware/auth';

const router = Router();

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const prisma = req.prisma;
    const { entityType, entityId, userId, action, limit, offset } = req.query;

    const where: any = {};
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    if (userId) where.userId = userId;
    if (action) where.action = { contains: action as string };

    const events = await prisma.auditEvent.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: parseInt(limit as string) || 50,
      skip: parseInt(offset as string) || 0
    });

    const total = await prisma.auditEvent.count({ where });

    res.json({ events, total });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit events' });
  }
});

router.get('/entity/:type/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { type, id } = req.params;
    const prisma = req.prisma;

    const events = await prisma.auditEvent.findMany({
      where: { entityType: type, entityId: id },
      orderBy: { timestamp: 'desc' }
    });

    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch entity history' });
  }
});

router.get('/user/:userId', async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const prisma = req.prisma;

    const events = await prisma.auditEvent.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: 20
    });

    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user activity' });
  }
});

router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const prisma = req.prisma;
    const { startDate, endDate } = req.query;

    const where: any = {};
    if (startDate && endDate) {
      where.timestamp = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    const stats = await prisma.auditEvent.groupBy({
      by: ['action'],
      where,
      _count: true
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit stats' });
  }
});

export default router;