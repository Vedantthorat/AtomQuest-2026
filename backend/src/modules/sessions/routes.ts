import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const router = Router();
const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: any;
  prisma: PrismaClient;
}

router.post('/send-2fa-code', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.twoFactorCode.create({
      data: {
        userId: user.id,
        code,
        method: 'EMAIL',
        expiresAt
      }
    });

    console.log(`2FA Code for ${email}: ${code}`);

    res.json({ message: '2FA code sent to your email' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/verify-2fa', async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const validCode = await prisma.twoFactorCode.findFirst({
      where: {
        userId: user.id,
        code,
        isUsed: false,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!validCode) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }

    await prisma.twoFactorCode.update({
      where: { id: validCode.id },
      data: { isUsed: true }
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        avatar: user.avatar
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/sessions', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;

    const sessions = await prisma.userSession.findMany({
      where: { userId, isValid: true },
      orderBy: { lastActive: 'desc' },
      select: {
        id: true,
        deviceInfo: true,
        ipAddress: true,
        lastActive: true,
        createdAt: true
      }
    });

    res.json(sessions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/sessions/:id/revoke', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const session = await prisma.userSession.findUnique({ where: { id } });
    if (!session || session.userId !== userId) {
      return res.status(404).json({ error: 'Session not found' });
    }

    await prisma.userSession.update({
      where: { id },
      data: { isValid: false }
    });

    res.json({ message: 'Session revoked' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/revoke-all-sessions', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;

    await prisma.userSession.updateMany({
      where: { userId, isValid: true },
      data: { isValid: false }
    });

    res.json({ message: 'All sessions revoked' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;