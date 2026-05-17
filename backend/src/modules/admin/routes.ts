import { Router, Response } from 'express';
import { AuthRequest, requireAdmin } from '../../middleware/auth';
import { z } from 'zod';

const router = Router();

router.get('/users', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const prisma = req.prisma;
    const { role, department, search } = req.query;

    const where: any = {};
    if (role) where.role = role;
    if (department) where.department = department;
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        avatar: true,
        managerId: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.put('/users/:id/role', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const prisma = req.prisma;

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, name: true, role: true, department: true }
    });

    await prisma.auditEvent.create({
      data: {
        userId: req.user!.id,
        action: 'user_role_changed',
        entityType: 'user',
        entityId: id,
        newValue: { role }
      }
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

router.put('/users/:id/manager', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { managerId } = req.body;
    const prisma = req.prisma;

    const user = await prisma.user.update({
      where: { id },
      data: { managerId: managerId || null },
      select: { id: true, name: true, managerId: true }
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update manager' });
  }
});

router.get('/departments', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const prisma = req.prisma;

    const departments = await prisma.department.findMany({
      include: {
        _count: { select: { id: true } }
      }
    });

    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

router.post('/departments', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, headId } = req.body;
    const prisma = req.prisma;

    const department = await prisma.department.create({
      data: { name, headId }
    });

    res.status(201).json(department);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create department' });
  }
});

router.get('/cycles', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const prisma = req.prisma;

    const cycles = await prisma.cycleConfig.findMany({
      orderBy: { startDate: 'desc' }
    });

    res.json(cycles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cycles' });
  }
});

router.post('/cycles', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const cycleSchema = z.object({
      name: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      quarter: z.string(),
      year: z.number()
    });

    const data = cycleSchema.parse(req.body);
    const prisma = req.prisma;

    const cycle = await prisma.cycleConfig.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: 'PLANNING'
      }
    });

    res.status(201).json(cycle);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/cycles/:id/status', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const prisma = req.prisma;

    const cycle = await prisma.cycleConfig.update({
      where: { id },
      data: { status }
    });

    res.json(cycle);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update cycle status' });
  }
});

router.get('/settings', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const prisma = req.prisma;

    const settings = await prisma.systemSettings.findMany();
    res.json(settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {}));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.put('/settings', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { key, value } = req.body;
    const prisma = req.prisma;

    const setting = await prisma.systemSettings.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });

    res.json(setting);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

router.get('/overview', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const prisma = req.prisma;

    const [
      totalUsers,
      totalGoals,
      pendingApprovals,
      activeCycle
    ] = await Promise.all([
      prisma.user.count(),
      prisma.goal.count(),
      prisma.goal.count({ where: { status: 'PENDING' } }),
      prisma.cycleConfig.findFirst({ where: { status: 'ACTIVE' } })
    ]);

    res.json({
      totalUsers,
      totalGoals,
      pendingApprovals,
      activeCycle
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch overview' });
  }
});

export default router;