import { PrismaClient, Role, GoalStatus, KPIType, Priority, CycleStatus, NotificationType, EscalationStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const empPassword = await bcrypt.hash('Emp@123', 10);
  const mgrPassword = await bcrypt.hash('Mgr@123', 10);
  const adminPassword = await bcrypt.hash('Admin@123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@atomberg.com' },
    update: {},
    create: {
      email: 'admin@atomberg.com',
      password: adminPassword,
      name: 'System Admin',
      role: 'ADMIN',
      department: 'Operations',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
    }
  });

  const manager = await prisma.user.upsert({
    where: { email: 'vikram@atomberg.com' },
    update: {},
    create: {
      email: 'vikram@atomberg.com',
      password: mgrPassword,
      name: 'Vikram Sharma',
      role: 'MANAGER',
      department: 'Engineering',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vikram'
    }
  });

  const salesManager = await prisma.user.upsert({
    where: { email: 'meera@atomberg.com' },
    update: {},
    create: {
      email: 'meera@atomberg.com',
      password: mgrPassword,
      name: 'Meera Patel',
      role: 'MANAGER',
      department: 'Sales',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=meera'
    }
  });

  const employee1 = await prisma.user.upsert({
    where: { email: 'priya@atomberg.com' },
    update: {},
    create: {
      email: 'priya@atomberg.com',
      password: empPassword,
      name: 'Priya Singh',
      role: 'EMPLOYEE',
      department: 'Engineering',
      managerId: manager.id,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya'
    }
  });

  const employee2 = await prisma.user.upsert({
    where: { email: 'raj@atomberg.com' },
    update: {},
    create: {
      email: 'raj@atomberg.com',
      password: empPassword,
      name: 'Raj Kumar',
      role: 'EMPLOYEE',
      department: 'Sales',
      managerId: salesManager.id,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=raj'
    }
  });

  await prisma.department.createMany({
    data: [
      { name: 'Engineering', headId: manager.id },
      { name: 'Sales', headId: salesManager.id },
      { name: 'Marketing', headId: manager.id },
      { name: 'Operations', headId: admin.id }
    ],
    skipDuplicates: true
  });

  await prisma.cycleConfig.create({
    data: {
      name: 'Q1 2026 Planning Cycle',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-03-31'),
      quarter: 'Q1',
      year: 2026,
      status: 'ACTIVE'
    }
  });

  const goals = [
    {
      title: 'Complete AWS Certification',
      description: 'Obtain AWS Solutions Architect certification to improve cloud infrastructure knowledge',
      status: 'APPROVED' as GoalStatus,
      weightage: 30,
      kpiType: 'QUALITATIVE' as KPIType,
      targetValue: 1,
      currentValue: 0.7,
      unit: 'exam',
      quarter: 'Q1',
      year: 2026,
      priority: 'HIGH' as Priority,
      ownerId: employee1.id,
      approvedBy: manager.id,
      approvedAt: new Date('2026-01-20')
    },
    {
      title: 'Reduce API Response Time',
      description: 'Improve average API response time to under 200ms through optimization',
      status: 'APPROVED' as GoalStatus,
      weightage: 40,
      kpiType: 'QUANTITATIVE' as KPIType,
      targetValue: 200,
      currentValue: 245,
      unit: 'ms',
      quarter: 'Q1',
      year: 2026,
      priority: 'CRITICAL' as Priority,
      ownerId: employee1.id,
      approvedBy: manager.id,
      approvedAt: new Date('2026-01-15')
    },
    {
      title: 'Lead Code Review Sessions',
      description: 'Conduct weekly code review sessions for the team to ensure code quality',
      status: 'PENDING' as GoalStatus,
      weightage: 20,
      kpiType: 'QUALITATIVE' as KPIType,
      targetValue: 12,
      currentValue: 8,
      unit: 'sessions',
      quarter: 'Q1',
      year: 2026,
      priority: 'MEDIUM' as Priority,
      ownerId: employee1.id
    },
    {
      title: 'Increase Sales Revenue',
      description: 'Achieve 25% increase in Q1 sales compared to previous quarter',
      status: 'APPROVED' as GoalStatus,
      weightage: 50,
      kpiType: 'QUANTITATIVE' as KPIType,
      targetValue: 125,
      currentValue: 108,
      unit: '%',
      quarter: 'Q1',
      year: 2026,
      priority: 'CRITICAL' as Priority,
      ownerId: employee2.id,
      approvedBy: manager.id,
      approvedAt: new Date('2026-01-10')
    },
    {
      title: 'Mentor Junior Developers',
      description: 'Mentor 2 junior developers on core system features',
      status: 'DRAFT' as GoalStatus,
      weightage: 10,
      kpiType: 'QUALITATIVE' as KPIType,
      targetValue: 2,
      currentValue: 1,
      unit: 'devs',
      quarter: 'Q1',
      year: 2026,
      priority: 'LOW' as Priority,
      ownerId: employee1.id
    }
  ];

  for (const goal of goals) {
    await prisma.goal.upsert({
      where: { id: goal.title.slice(0, 8) },
      update: {},
      create: goal
    });
  }

  await prisma.sharedGoal.create({
    data: {
      title: 'Company Revenue Target',
      description: 'Achieve $10M in Q1 revenue',
      weightage: 100,
      targetValue: 10000000,
      currentValue: 7250000,
      unit: '$',
      department: 'Sales'
    }
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: employee1.id,
        title: 'Goal Approved',
        message: 'Your goal "Reduce API Response Time" has been approved',
        type: 'SUCCESS' as NotificationType,
        read: false
      },
      {
        userId: employee1.id,
        title: 'Check-in Reminder',
        message: 'Q1 check-in deadline is in 5 days',
        type: 'WARNING' as NotificationType,
        read: false
      },
      {
        userId: manager.id,
        title: 'New Goal Submitted',
        message: 'Alex Chen submitted a new goal for approval',
        type: 'INFO' as NotificationType,
        read: false
      }
    ]
  });

  await prisma.escalation.create({
    data: {
      goalId: (await prisma.goal.findFirst({ where: { title: { contains: 'Code Review' } } }))?.id || '',
      escalatedBy: employee1.id,
      reason: 'Need clarification on quarterly targets',
      status: 'OPEN' as EscalationStatus
    }
  });

  console.log('Database seeded successfully!');
  console.log('\nTest accounts:');
  console.log('  Admin: admin@atomberg.com / Admin@123');
  console.log('  Manager (Engineering): vikram@atomberg.com / Mgr@123');
  console.log('  Manager (Sales): meera@atomberg.com / Mgr@123');
  console.log('  Employee (Engineering): priya@atomberg.com / Emp@123');
  console.log('  Employee (Sales): raj@atomberg.com / Emp@123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });