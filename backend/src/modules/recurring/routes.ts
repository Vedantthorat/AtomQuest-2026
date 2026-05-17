import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: any;
  prisma: PrismaClient;
}

router.post('/goals/:goalId/recurring', async (req: AuthRequest, res: Response) => {
  try {
    const { goalId } = req.params;
    const { recurrence, endDate } = req.body;

    const goal = await prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    const nextDueDate = calculateNextDueDate(new Date(), recurrence);

    const recurringGoal = await prisma.recurringGoal.create({
      data: {
        goalId,
        recurrence,
        nextDueDate,
        endDate: endDate ? new Date(endDate) : null
      }
    });

    res.json(recurringGoal);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

function calculateNextDueDate(startDate: Date, recurrence: string): Date {
  const date = new Date(startDate);
  switch (recurrence) {
    case 'DAILY':
      date.setDate(date.getDate() + 1);
      break;
    case 'WEEKLY':
      date.setDate(date.getDate() + 7);
      break;
    case 'BIWEEKLY':
      date.setDate(date.getDate() + 14);
      break;
    case 'MONTHLY':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'QUARTERLY':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'YEARLY':
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
  return date;
}

router.get('/goals/:goalId/recurring', async (req: AuthRequest, res: Response) => {
  try {
    const { goalId } = req.params;

    const recurring = await prisma.recurringGoal.findUnique({
      where: { goalId }
    });

    res.json(recurring);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/recurring/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive, recurrence, endDate } = req.body;

    const updated = await prisma.recurringGoal.update({
      where: { id },
      data: {
        isActive,
        recurrence,
        endDate: endDate ? new Date(endDate) : null
      }
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/recurring/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.recurringGoal.delete({ where: { id } });

    res.json({ message: 'Recurring goal removed' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;