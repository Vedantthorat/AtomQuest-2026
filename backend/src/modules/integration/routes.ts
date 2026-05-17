import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: any;
  prisma: PrismaClient;
}

interface IntegrationSettings {
  slack: { enabled: boolean; webhookUrl: string; channel: string };
  teams: { enabled: boolean; webhookUrl: string; channel: string };
  googleCalendar: { enabled: boolean; connected: boolean };
}

router.get('/integrations', async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin only' });
    }

    const settings = await prisma.systemSettings.findUnique({
      where: { key: 'integrations' }
    });

    const defaultSettings: IntegrationSettings = {
      slack: { enabled: false, webhookUrl: '', channel: '' },
      teams: { enabled: false, webhookUrl: '', channel: '' },
      googleCalendar: { enabled: false, connected: false }
    };

    res.json(settings?.value || defaultSettings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/integrations', async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin only' });
    }

    const { slack, teams, googleCalendar } = req.body;

    const settings = await prisma.systemSettings.upsert({
      where: { key: 'integrations' },
      update: { value: { slack, teams, googleCalendar } },
      create: { key: 'integrations', value: { slack, teams, googleCalendar } }
    });

    res.json({ message: 'Integration settings updated', settings: settings.value });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/test-slack', async (req: AuthRequest, res: Response) => {
  try {
    const { webhookUrl } = req.body;

    if (!webhookUrl) {
      return res.status(400).json({ error: 'Webhook URL required' });
    }

    const testMessage = {
      text: '🔔 AtomQuest test message: Your Slack integration is working!'
    };

    console.log('Would send to Slack:', testMessage);

    res.json({ message: 'Test message sent (simulated)', note: 'Configure actual webhook URL in production' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/test-teams', async (req: AuthRequest, res: Response) => {
  try {
    const { webhookUrl } = req.body;

    if (!webhookUrl) {
      return res.status(400).json({ error: 'Webhook URL required' });
    }

    const testMessage = {
      text: '🔔 AtomQuest test message: Your Microsoft Teams integration is working!'
    };

    console.log('Would send to Teams:', testMessage);

    res.json({ message: 'Test message sent (simulated)', note: 'Configure actual webhook URL in production' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;