import cron from 'node-cron';
import { db } from '../config/firebase';
import { getAllDocs, createDoc, queryDocs } from '../services/firestore';

export const schedulerJobs = () => {
  cron.schedule('0 9 * * *', async () => {
    console.log('Running daily notification job...');
    
    const goals = await getAllDocs<any>('goals');
    const pendingGoals = goals.filter(g => g.status === 'PENDING');

    for (const goal of pendingGoals) {
      const daysPending = Math.floor((Date.now() - new Date(goal.updatedAt).getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysPending >= 3 && goal.ownerId) {
        const owner = await db.collection('users').doc(goal.ownerId).get();
        const managerId = owner.data()?.managerId;
        
        if (managerId) {
          await createDoc('notifications', {
            userId: managerId,
            title: 'Pending Goal Reminder',
            message: `Goal "${goal.title}" has been pending for ${daysPending} days`,
            type: 'WARNING',
            read: false
          });
        }
      }
    }
  });

  cron.schedule('0 0 * * 1', async () => {
    console.log('Running weekly analytics job...');
    
    const cycles = await queryDocs<any>('cycleConfigs', 'status', '==', 'ACTIVE');
    const activeCycle = cycles[0];

    if (activeCycle) {
      const goals = await getAllDocs<any>('goals');
      const quarterGoals = goals.filter(g => 
        g.quarter === activeCycle.quarter && 
        g.year === activeCycle.year &&
        ['APPROVED', 'PENDING', 'DRAFT'].includes(g.status)
      );

      const avgProgress = quarterGoals.reduce((sum, g) => sum + (g.currentValue / g.targetValue) * 100, 0) / (quarterGoals.length || 1);
      
      console.log(`Weekly report: ${quarterGoals.length} active goals, ${avgProgress.toFixed(1)}% average progress`);
    }
  });

  cron.schedule('0 0 1 * *', async () => {
    console.log('Running monthly escalation check...');
    
    const escalations = await queryDocs<any>('escalations', 'status', '==', 'OPEN');

    for (const escalation of escalations) {
      const daysOpen = Math.floor((Date.now() - new Date(escalation.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysOpen >= 7) {
        const users = await getAllDocs<any>('users');
        const admins = users.filter(u => u.role === 'ADMIN');

        for (const admin of admins) {
          await createDoc('notifications', {
            userId: admin.id,
            title: 'Stale Escalation Alert',
            message: `Escalation #${escalation.id} has been open for ${daysOpen} days`,
            type: 'ERROR',
            read: false
          });
        }
      }
    }
  });

  console.log('Scheduler jobs initialized');
};

schedulerJobs();