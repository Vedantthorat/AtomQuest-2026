import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: any;
  prisma: PrismaClient;
}

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin only' });
    }

    const backups = await prisma.backup.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    res.json(backups);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/create', async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin only' });
    }

    const userId = req.user.id;

    const goals = await prisma.goal.findMany();
    const users = await prisma.user.findMany({ select: { password: false } });
    const checkIns = await prisma.checkIn.findMany();
    const sharedGoals = await prisma.sharedGoal.findMany();

    const backupData = {
      goals,
      users,
      checkIns,
      sharedGoals,
      exportedAt: new Date().toISOString()
    };

    const backup = await prisma.backup.create({
      data: {
        fileName: `backup-${new Date().toISOString().split('T')[0]}.json`,
        fileUrl: JSON.stringify(backupData),
        createdBy: userId
      }
    });

    res.json({ message: 'Backup created successfully', backupId: backup.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/restore', async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin only' });
    }

    const { backupId } = req.body;

    const backup = await prisma.backup.findUnique({ where: { id: backupId } });
    if (!backup) {
      return res.status(404).json({ error: 'Backup not found' });
    }

    const backupData = JSON.parse(backup.fileUrl);

    res.json({
      message: 'Backup data retrieved',
      data: {
        goalsCount: backupData.goals?.length || 0,
        usersCount: backupData.users?.length || 0,
        checkInsCount: backupData.checkIns?.length || 0,
        sharedGoalsCount: backupData.sharedGoals?.length || 0
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin only' });
    }

    const { id } = req.params;

    await prisma.backup.delete({ where: { id } });

    res.json({ message: 'Backup deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;