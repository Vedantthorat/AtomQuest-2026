import { Router, Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { getDocsByField, updateDoc, getAllDocs } from '../../services/firestore';

const router = Router();

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { unreadOnly } = req.query;

    let notifications = await getDocsByField<any>('notifications', 'userId', user.id);
    if (unreadOnly === 'true') {
      notifications = notifications.filter(n => !n.read);
    }

    const unreadCount = notifications.filter(n => !n.read).length;
    
    res.json({ 
      notifications: notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 50), 
      unreadCount 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

router.put('/:id/read', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await updateDoc('notifications', id, { read: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

router.put('/read-all', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const notifications = await getDocsByField<any>('notifications', 'userId', user.id);
    
    for (const notification of notifications) {
      if (!notification.read) {
        await updateDoc('notifications', notification.id, { read: true });
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await updateDoc('notifications', id, { deleted: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

export default router;