import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: any;
  prisma: PrismaClient;
}

router.post('/send', async (req: AuthRequest, res: Response) => {
  try {
    const { receiverId, teamId, content } = req.body;
    const senderId = req.user.id;

    const message = await prisma.teamMessage.create({
      data: {
        senderId,
        receiverId,
        teamId,
        content
      }
    });

    res.json(message);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/conversations', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;

    const conversations = await prisma.teamMessage.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true }
        },
        receiver: {
          select: { id: true, name: true, avatar: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json(conversations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/conversation/:userId', async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const messages = await prisma.teamMessage.findMany({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: userId },
          { senderId: userId, receiverId: currentUserId }
        ]
      },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    await prisma.teamMessage.updateMany({
      where: { senderId: userId, receiverId: currentUserId, isRead: false },
      data: { isRead: true }
    });

    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/unread-count', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;

    const count = await prisma.teamMessage.count({
      where: { receiverId: userId, isRead: false }
    });

    res.json({ unreadCount: count });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;