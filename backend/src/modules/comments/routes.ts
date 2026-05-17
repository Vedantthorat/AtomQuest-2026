import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: any;
  prisma: PrismaClient;
}

router.post('/goals/:goalId/comments', async (req: AuthRequest, res: Response) => {
  try {
    const { goalId } = req.params;
    const { content, parentId } = req.body;
    const userId = req.user.id;

    const goal = await prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    const comment = await prisma.goalComment.create({
      data: {
        goalId,
        userId,
        content,
        parentId
      },
      include: {
        parent: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true }
            }
          }
        }
      }
    });

    await prisma.activity.create({
      data: {
        userId,
        type: 'COMMENT_ADDED',
        description: `Added comment on goal`,
        goalId
      }
    });

    res.json(comment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/goals/:goalId/comments', async (req: AuthRequest, res: Response) => {
  try {
    const { goalId } = req.params;

    const comments = await prisma.goalComment.findMany({
      where: { goalId, parentId: null },
      include: {
        user: {
          select: { id: true, name: true, avatar: true, role: true }
        },
        replies: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true, role: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(comments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/comments/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const comment = await prisma.goalComment.findUnique({ where: { id } });
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updated = await prisma.goalComment.update({
      where: { id },
      data: { content }
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/comments/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const comment = await prisma.goalComment.findUnique({ where: { id } });
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.goalComment.delete({ where: { id } });

    res.json({ message: 'Comment deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;