import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

import authRoutes from './modules/auth/routes';
import goalsRoutes from './modules/goals/routes';
import approvalsRoutes from './modules/approvals/routes';
import analyticsRoutes from './modules/analytics/routes';
import notificationsRoutes from './modules/notifications/routes';
import escalationRoutes from './modules/escalation/routes';
import auditRoutes from './modules/audit/routes';
import adminRoutes from './modules/admin/routes';
import sharedGoalsRoutes from './modules/shared-goals/routes';
import aiRoutes from './modules/ai/routes';
import attachmentsRoutes from './modules/attachments/routes';
import commentsRoutes from './modules/comments/routes';
import sessionsRoutes from './modules/sessions/routes';
import recurringRoutes from './modules/recurring/routes';
import badgesRoutes from './modules/badges/routes';
import messagesRoutes from './modules/messages/routes';
import dashboardRoutes from './modules/dashboard/routes';
import automationRoutes from './modules/automation/routes';
import backupRoutes from './modules/backup/routes';
import calendarRoutes from './modules/calendar/routes';
import integrationRoutes from './modules/integration/routes';

import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';

import { db } from './config/firebase';

dotenv.config();

const app: Express = express();
const httpServer = createServer(app);
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';

const io = new Server(httpServer, {
  cors: { origin: ALLOWED_ORIGIN, methods: ['GET', 'POST'], credentials: true }
});

app.use(cors({ origin: ALLOWED_ORIGIN, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req: Request, res: Response, next: NextFunction) => {
  (req as any).io = io;
  next();
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/goals', authMiddleware, goalsRoutes);
app.use('/api/approvals', authMiddleware, approvalsRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);
app.use('/api/notifications', authMiddleware, notificationsRoutes);
app.use('/api/escalations', authMiddleware, escalationRoutes);
app.use('/api/audit', authMiddleware, auditRoutes);
app.use('/api/admin', authMiddleware, adminRoutes);
app.use('/api/shared-goals', authMiddleware, sharedGoalsRoutes);
app.use('/api/ai', authMiddleware, aiRoutes);
app.use('/api/attachments', authMiddleware, attachmentsRoutes);
app.use('/api/comments', authMiddleware, commentsRoutes);
app.use('/api/sessions', authMiddleware, sessionsRoutes);
app.use('/api/recurring', authMiddleware, recurringRoutes);
app.use('/api/badges', authMiddleware, badgesRoutes);
app.use('/api/messages', authMiddleware, messagesRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/automation', authMiddleware, automationRoutes);
app.use('/api/backup', authMiddleware, backupRoutes);
app.use('/api/calendar', authMiddleware, calendarRoutes);
app.use('/api/integrations', authMiddleware, integrationRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`🚀 AtomQuest API running on port ${PORT}`);
  console.log(`📊 WebSocket server ready`);
});

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  socket.on('join-user-room', (userId: string) => {
    socket.join(`user-${userId}`);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

process.on('SIGTERM', async () => {
  process.exit(0);
});

export { io };