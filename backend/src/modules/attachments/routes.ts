import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: any;
  prisma: PrismaClient;
}

router.post('/goals/:goalId/attachments', async (req: AuthRequest, res: Response) => {
  try {
    const { goalId } = req.params;
    const { fileName, fileUrl, fileType, fileSize } = req.body;
    const userId = req.user.id;

    const goal = await prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    const attachment = await prisma.goalAttachment.create({
      data: {
        goalId,
        fileName,
        fileUrl,
        fileType,
        fileSize,
        uploadedBy: userId
      }
    });

    await prisma.activity.create({
      data: {
        userId,
        type: 'ATTACHMENT_UPLOADED',
        description: `Uploaded attachment: ${fileName}`,
        goalId
      }
    });

    res.json(attachment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/goals/:goalId/attachments', async (req: AuthRequest, res: Response) => {
  try {
    const { goalId } = req.params;

    const attachments = await prisma.goalAttachment.findMany({
      where: { goalId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(attachments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/attachments/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const attachment = await prisma.goalAttachment.findUnique({ where: { id } });
    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    if (attachment.uploadedBy !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.goalAttachment.delete({ where: { id } });

    res.json({ message: 'Attachment deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;