import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import { db } from '../../config/firebase';
import { getDocByField, createDoc, getAllDocs, updateDoc } from '../../services/firestore';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per window
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 registrations per hour
  message: { error: 'Too many accounts created. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

interface UserDoc {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  department: string;
  avatar?: string;
  managerId?: string;
  adminId?: string;
  createdAt: any;
  updatedAt: any;
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  department: z.string().min(1),
  role: z.enum(['EMPLOYEE', 'MANAGER', 'ADMIN']).optional(),
  managerId: z.string().optional(),
  adminId: z.string().optional()
});

router.post('/register', async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);

    const existingUser = await getDocByField<UserDoc>('users', 'email', data.email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const userId = await createDoc('users', {
      email: data.email,
      password: data.password,
      name: data.name,
      department: data.department,
      role: data.role || 'EMPLOYEE',
      managerId: data.managerId || null,
      adminId: data.adminId || null
    });

    const user: UserDoc = { id: userId, email: data.email, name: data.name, role: data.role || 'EMPLOYEE', department: data.department, password: data.password, createdAt: new Date(), updatedAt: new Date() };

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ user: { id: user.id, email: user.email, name: user.name, role: user.role, department: user.department, avatar: user.avatar }, token });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Registration failed' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await getDocByField<UserDoc>('users', 'email', data.email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.password !== data.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        avatar: user.avatar,
        managerId: user.managerId
      },
      token
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Login failed' });
  }
});

router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    const user = await db.collection('users').doc(decoded.id).get();
    if (!user.exists) return res.status(404).json({ error: 'User not found' });

    const userData = user.data() as UserDoc;
    res.json({
      id: user.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      department: userData.department,
      avatar: userData.avatar,
      managerId: userData.managerId
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

router.get('/users', async (req: Request, res: Response) => {
  try {
    const users = await getAllDocs<UserDoc>('users');
    res.json(users.map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role, department: u.department, avatar: u.avatar })).sort((a, b) => a.name.localeCompare(b.name)));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;