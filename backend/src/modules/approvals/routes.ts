import { Router, Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../../middleware/auth';
import { db } from '../../config/firebase';
import { getAllDocs, getDoc, updateDoc, queryDocs, getDocsByField, createDoc } from '../../services/firestore';

const router = Router();

const updateGoalSchema = z.object({
  targetValue: z.number().positive().optional(),
  weightage: z.number().min(1).max(100).optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional()
});

router.get('/pending', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    let goals = await getAllDocs<any>('goals');
    let filteredGoals = goals.filter(g => g.status === 'PENDING');
    
    if (user.role === 'MANAGER') {
      const teamMembers = await queryDocs<any>('users', 'managerId', '==', user.id);
      const memberIds = teamMembers.map(m => m.id);
      filteredGoals = filteredGoals.filter(g => memberIds.includes(g.ownerId));
    }

    const goalsWithOwner = await Promise.all(filteredGoals.map(async (goal) => {
      const owner = await db.collection('users').doc(goal.ownerId).get();
      return { ...goal, owner: owner.exists ? { id: owner.id, name: owner.data()?.name, avatar: owner.data()?.avatar, department: owner.data()?.department } : null };
    }));

    res.json(goalsWithOwner.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pending approvals' });
  }
});

router.get('/history', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { status, quarter, year } = req.query;

    let goals = await queryDocs<any>('goals', 'approvedBy', '==', user.id);
    if (status) goals = goals.filter(g => g.status === status);
    if (quarter && year) goals = goals.filter(g => g.quarter === quarter && g.year === parseInt(year as string));

    const goalsWithOwner = await Promise.all(goals.map(async (goal) => {
      const owner = await db.collection('users').doc(goal.ownerId).get();
      return { ...goal, owner: owner.exists ? { id: owner.id, name: owner.data()?.name, avatar: owner.data()?.avatar, department: owner.data()?.department } : null };
    }));

    res.json(goalsWithOwner.sort((a, b) => new Date(b.approvedAt || 0).getTime() - new Date(a.approvedAt || 0).getTime()));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch approval history' });
  }
});

router.post('/:id/approve', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const goal = await getDoc<any>('goals', id);
    if (!goal) return res.status(404).json({ error: 'Goal not found' });

    await updateDoc('goals', id, { 
      status: 'APPROVED', 
      approvedBy: user.id, 
      approvedAt: new Date().toISOString(),
      isLocked: true
    });

    await createDoc('activities', {
      userId: user.id,
      type: 'goal_approved',
      description: `Approved goal: ${goal.title}`,
      goalId: id
    });

    await createDoc('notifications', {
      userId: goal.ownerId,
      title: 'Goal Approved',
      message: `Your goal "${goal.title}" has been approved`,
      type: 'SUCCESS',
      read: false
    });

    res.json({ message: 'Goal approved', goalId: id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve goal' });
  }
});

router.post('/:id/reject', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;
    const user = req.user!;

    const goal = await getDoc<any>('goals', id);
    if (!goal) return res.status(404).json({ error: 'Goal not found' });

    await updateDoc('goals', id, { 
      status: 'REJECTED', 
      approvedBy: user.id, 
      approvedAt: new Date().toISOString()
    });

    await createDoc('activities', {
      userId: user.id,
      type: 'goal_rejected',
      description: `Rejected goal: ${goal.title}`,
      goalId: id
    });

    await createDoc('notifications', {
      userId: goal.ownerId,
      title: 'Goal Rejected',
      message: `Your goal "${goal.title}" was rejected. ${feedback || ''}`,
      type: 'ERROR',
      read: false
    });

    res.json({ message: 'Goal rejected', goalId: id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject goal' });
  }
});

router.post('/:id/return', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;
    const user = req.user!;

    const goal = await getDoc<any>('goals', id);
    if (!goal) return res.status(404).json({ error: 'Goal not found' });

    await updateDoc('goals', id, { 
      status: 'RETURNED'
    });

    await createDoc('activities', {
      userId: user.id,
      type: 'goal_returned',
      description: `Returned goal for revision: ${goal.title}`,
      goalId: id
    });

    await createDoc('notifications', {
      userId: goal.ownerId,
      title: 'Goal Returned',
      message: `Your goal "${goal.title}" was returned for revision. ${feedback || ''}`,
      type: 'WARNING',
      read: false
    });

    res.json({ message: 'Goal returned for revision', goalId: id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to return goal' });
  }
});

export default router;