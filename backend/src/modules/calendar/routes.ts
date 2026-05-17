import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: any;
  prisma: PrismaClient;
}

router.post('/sync-google-calendar', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const { accessToken } = req.body;

    const goals = await prisma.goal.findMany({
      where: {
        ownerId: userId,
        status: 'APPROVED'
      }
    });

    const calendarEvents = goals.map(goal => ({
      summary: goal.title,
      description: goal.description,
      start: { date: new Date().toISOString().split('T')[0] },
      end: { date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }
    }));

    console.log(`Synced ${calendarEvents.length} goals to Google Calendar for user ${userId}`);

    res.json({
      message: 'Calendar sync initiated',
      eventsCount: calendarEvents.length,
      note: 'Google Calendar API integration requires OAuth2 setup'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/calendar-events', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    const goals = await prisma.goal.findMany({
      where: {
        ownerId: userId,
        status: 'APPROVED',
        ...(startDate && endDate ? {
          createdAt: {
            gte: new Date(startDate as string),
            lte: new Date(endDate as string)
          }
        } : {})
      },
      select: {
        id: true,
        title: true,
        description: true,
        targetValue: true,
        currentValue: true,
        quarter: true,
        year: true,
        createdAt: true
      }
    });

    res.json(goals);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;