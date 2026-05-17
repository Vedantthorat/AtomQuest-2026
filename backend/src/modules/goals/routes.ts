import { Router, Response } from 'express';
import { z } from 'zod';
import { AuthRequest, requireAdmin } from '../../middleware/auth';
import { HttpError } from '../../middleware/errorHandler';
import { db } from '../../config/firebase';
import { getDoc, getAllDocs, createDoc, updateDoc, deleteDoc, getDocsByField, queryDocs } from '../../services/firestore';

const router = Router();

const goalSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  weightage: z.number().min(1).max(100),
  thrustArea: z.string().optional().default('General'),
  uomType: z.string().optional().default('MIN'),
  kpiType: z.enum(['QUANTITATIVE', 'QUALITATIVE']),
  targetValue: z.number().positive(),
  unit: z.string().min(1),
  quarter: z.string(),
  year: z.number(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional()
});

const checkInSchema = z.object({
  value: z.number(),
  notes: z.string().optional()
});

interface GoalDoc {
  id: string;
  title: string;
  description: string;
  status: string;
  weightage: number;
  thrustArea: string;
  uomType: string;
  isLocked: boolean;
  kpiType: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  quarter: string;
  year: number;
  priority: string;
  ownerId: string;
  approvedBy?: string;
  approvedAt?: any;
  sharedGoalId?: string;
  createdAt: any;
  updatedAt: any;
}

interface UserDoc {
  id: string;
  email: string;
  name: string;
  role: string;
  department: string;
  avatar?: string;
  managerId?: string;
}

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { quarter, year, status } = req.query;
    const user = req.user!;

    let goals: GoalDoc[];

    if (user.role === 'EMPLOYEE') {
      goals = await getDocsByField<GoalDoc>('goals', 'ownerId', user.id);
    } else if (user.role === 'MANAGER') {
      const teamMembers = await queryDocs<UserDoc>('users', 'managerId', '==', user.id);
      const memberIds = teamMembers.map(m => m.id);
      const allGoals = await getAllDocs<GoalDoc>('goals');
      goals = allGoals.filter(g => g.ownerId === user.id || memberIds.includes(g.ownerId));
    } else {
      goals = await getAllDocs<GoalDoc>('goals');
    }

    if (quarter && year) {
      goals = goals.filter(g => g.quarter === quarter && g.year === parseInt(year as string));
    }
    if (status) {
      goals = goals.filter(g => g.status === status);
    }

    const goalsWithOwner = await Promise.all(goals.map(async (goal) => {
      const owner = await db.collection('users').doc(goal.ownerId).get();
      return {
        ...goal,
        owner: owner.exists ? { id: owner.id, name: owner.data()?.name, avatar: owner.data()?.avatar, department: owner.data()?.department } : null
      };
    }));

    res.json(goalsWithOwner.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const goal = await getDoc<GoalDoc>('goals', id);
    if (!goal) throw new HttpError(404, 'Goal not found');

    const owner = await db.collection('users').doc(goal.ownerId).get();
    const checkIns = await queryDocs<any>('checkIns', 'goalId', '==', id);
    const activities = await queryDocs<any>('activities', 'goalId', '==', id);

    res.json({
      ...goal,
      owner: owner.exists ? { id: owner.id, name: owner.data()?.name, avatar: owner.data()?.avatar, department: owner.data()?.department } : null,
      checkIns: checkIns.sort((a: any, b: any) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()),
      activities: activities.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10)
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const data = goalSchema.parse(req.body);
    const userId = req.user!.id;

    const userGoals = await queryDocs<GoalDoc>('goals', 'ownerId', '==', userId);
    const quarterGoals = userGoals.filter(g => g.quarter === data.quarter && g.year === data.year);

    if (quarterGoals.length >= 8) {
      return res.status(400).json({ error: 'Maximum 8 goals per quarter allowed' });
    }

    const totalWeightage = quarterGoals.reduce((sum, g) => sum + g.weightage, 0);
    if (totalWeightage + data.weightage > 100) {
      return res.status(400).json({ error: 'Total weightage cannot exceed 100%' });
    }

    if (data.weightage < 10) {
      return res.status(400).json({ error: 'Minimum weightage is 10%' });
    }

    const goalId = await createDoc('goals', {
      title: data.title,
      description: data.description,
      weightage: data.weightage,
      thrustArea: data.thrustArea || 'General',
      uomType: data.uomType || 'MIN',
      kpiType: data.kpiType,
      targetValue: data.targetValue,
      currentValue: 0,
      unit: data.unit,
      quarter: data.quarter,
      year: data.year,
      priority: data.priority || 'MEDIUM',
      ownerId: userId,
      status: 'DRAFT',
      isLocked: false
    });

    await createDoc('activities', {
      userId,
      type: 'goal_created',
      description: `Created goal: ${data.title}`,
      goalId
    });

    const owner = await db.collection('users').doc(userId).get();
    res.status(201).json({ id: goalId, ...data, status: 'DRAFT', owner: { id: userId, name: owner.data()?.name, avatar: owner.data()?.avatar } });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to create goal' });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = goalSchema.partial().parse(req.body);
    const user = req.user!;

    const goal = await getDoc<GoalDoc>('goals', id);
    if (!goal) throw new HttpError(404, 'Goal not found');

    if (goal.ownerId !== user.id && user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (goal.isLocked && user.role !== 'ADMIN') {
      return res.status(400).json({ error: 'Cannot edit locked goals' });
    }

    if (goal.sharedGoalId && (data.title || data.targetValue)) {
      return res.status(400).json({ error: 'Cannot modify title or target value for goals linked to a shared goal' });
    }

    await updateDoc('goals', id, data);

    await createDoc('activities', {
      userId: user.id,
      type: 'goal_updated',
      description: `Updated goal: ${data.title || goal.title}`,
      goalId: id
    });

    const owner = await db.collection('users').doc(goal.ownerId).get();
    res.json({ ...goal, ...data, owner: { id: owner.id, name: owner.data()?.name, avatar: owner.data()?.avatar } });
  } catch (error: any) {
    res.status(error.statusCode || 400).json({ error: error.message });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const goal = await getDoc<GoalDoc>('goals', id);
    if (!goal) throw new HttpError(404, 'Goal not found');

    if (goal.ownerId !== user.id && user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await deleteDoc('goals', id);
    res.json({ message: 'Goal deleted' });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.post('/:id/submit', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const goal = await getDoc<GoalDoc>('goals', id);
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    if (goal.ownerId !== user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    if (goal.status !== 'DRAFT') {
      return res.status(400).json({ error: 'Goal already submitted' });
    }

    const allGoals = await queryDocs<GoalDoc>('goals', 'ownerId', '==', user.id);
    const quarterGoals = allGoals.filter(g => g.quarter === goal.quarter && g.year === goal.year);
    const totalWeightage = quarterGoals.reduce((sum, g) => sum + g.weightage, 0);

    if (totalWeightage !== 100) {
      return res.status(400).json({ error: `Total weightage must be 100%. Current: ${totalWeightage}%` });
    }

    await updateDoc('goals', id, { status: 'PENDING' });

    await createDoc('activities', {
      userId: user.id,
      type: 'goal_submitted',
      description: `Submitted goals for review`,
      goalId: id
    });

    const userDoc = await db.collection('users').doc(user.id).get();
    if (userDoc.data()?.managerId) {
      await createDoc('notifications', {
        userId: userDoc.data()?.managerId,
        title: 'Goals Submitted',
        message: `${userDoc.data()?.name} submitted goals for review`,
        type: 'INFO',
        read: false
      });
    }

    res.json({ ...goal, status: 'PENDING' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/checkin', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = checkInSchema.parse(req.body);
    const user = req.user!;

    const goal = await getDoc<GoalDoc>('goals', id);
    if (!goal) throw new HttpError(404, 'Goal not found');

    if (goal.ownerId !== user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const checkInId = await createDoc('checkIns', {
      goalId: id,
      userId: user.id,
      value: data.value,
      notes: data.notes || '',
      quarter: goal.quarter
    });

    await updateDoc('goals', id, { currentValue: data.value });

    await createDoc('activities', {
      userId: user.id,
      type: 'checkin_submitted',
      description: `Submitted check-in for: ${goal.title}`,
      goalId: id
    });

    res.status(201).json({ id: checkInId, goalId: id, value: data.value, notes: data.notes });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/submit-all', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { quarter, year } = req.body;

    if (!quarter || !year) {
      return res.status(400).json({ error: 'quarter and year are required' });
    }

    const allGoals = await queryDocs<GoalDoc>('goals', 'ownerId', '==', user.id);
    const draftGoals = allGoals.filter(g => g.quarter === quarter && g.year === parseInt(year) && g.status === 'DRAFT');

    if (draftGoals.length === 0) {
      return res.status(400).json({ error: 'No draft goals to submit' });
    }

    const totalWeightage = draftGoals.reduce((sum, g) => sum + g.weightage, 0);
    if (totalWeightage !== 100) {
      return res.status(400).json({ error: `Total weightage must be 100%. Current: ${totalWeightage}%` });
    }

    for (const goal of draftGoals) {
      await updateDoc('goals', goal.id, { status: 'PENDING' });
    }

    await createDoc('activities', {
      userId: user.id,
      type: 'goal_submitted',
      description: `Submitted ${draftGoals.length} goals for review`
    });

    const userDoc = await db.collection('users').doc(user.id).get();
    if (userDoc.data()?.managerId) {
      await createDoc('notifications', {
        userId: userDoc.data()?.managerId,
        title: 'Goals Submitted',
        message: `${userDoc.data()?.name} submitted ${draftGoals.length} goals for review`,
        type: 'INFO',
        read: false
      });
    }

    res.json({ message: 'All goals submitted', goals: draftGoals.map(g => ({ ...g, status: 'PENDING' })) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/unlock', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const goal = await getDoc<GoalDoc>('goals', id);
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    await updateDoc('goals', id, { isLocked: false });

    await createDoc('activities', {
      userId: user.id,
      type: 'goal_unlocked',
      description: `Unlocked goal: ${goal.title}`,
      goalId: id
    });

    if (req.io) {
      req.io.to(`user-${goal.ownerId}`).emit('goal-unlocked', { id, isLocked: false });
    }

    res.json({ ...goal, isLocked: false });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to unlock goal' });
  }
});

export default router;