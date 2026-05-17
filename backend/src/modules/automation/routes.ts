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
    const userId = req.user.id;

    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin only' });
    }

    const workflows = await prisma.automationWorkflow.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json(workflows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;

    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin only' });
    }

    const { name, trigger, conditions, actions } = req.body;

    const workflow = await prisma.automationWorkflow.create({
      data: {
        name,
        trigger,
        conditions: conditions || {},
        actions,
        createdBy: userId
      }
    });

    res.json(workflow);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin only' });
    }

    const { name, trigger, conditions, actions, isActive } = req.body;

    const workflow = await prisma.automationWorkflow.update({
      where: { id },
      data: { name, trigger, conditions, actions, isActive }
    });

    res.json(workflow);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin only' });
    }

    await prisma.automationWorkflow.delete({ where: { id } });

    res.json({ message: 'Workflow deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/trigger', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { data } = req.body;

    const workflow = await prisma.automationWorkflow.findUnique({
      where: { id }
    });

    if (!workflow || !workflow.isActive) {
      return res.status(404).json({ error: 'Workflow not found or inactive' });
    }

    console.log(`Triggering workflow: ${workflow.name}`, data);

    res.json({ message: 'Workflow triggered', workflow: workflow.name });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;