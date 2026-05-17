import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  setDoc,
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './config';
import type { Goal, Activity, Notification, Escalation, Quarter, User } from '../types';

const COLLECTIONS = {
  GOALS: 'goals',
  ACTIVITIES: 'activities',
  NOTIFICATIONS: 'notifications',
  ESCALATIONS: 'escalations',
  DEPARTMENTS: 'departments',
  CYCLES: 'cycles'
};

export const firestoreDb = {
  // User Profile
  async getUserProfile(userId: string): Promise<User | null> {
    const docSnap = await getDoc(doc(db, 'users', userId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as User;
    }
    return null;
  },

  async updateUserProfile(userId: string, data: Partial<User>): Promise<void> {
    await setDoc(doc(db, 'users', userId), data, { merge: true });
  },

  // Goals
  async createGoal(goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.GOALS), {
      ...goal,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  async updateGoal(goalId: string, data: Partial<Goal>): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.GOALS, goalId), {
      ...data,
      updatedAt: serverTimestamp()
    });
  },

  async deleteGoal(goalId: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.GOALS, goalId));
  },

  async getGoal(goalId: string): Promise<Goal | null> {
    const docSnap = await getDoc(doc(db, COLLECTIONS.GOALS, goalId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Goal;
    }
    return null;
  },

  async getUserGoals(userId: string): Promise<Goal[]> {
    const q = query(
      collection(db, COLLECTIONS.GOALS),
      where('ownerId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal));
  },

  subscribeToUserGoals(userId: string, callback: (goals: Goal[]) => void): Unsubscribe {
    const q = query(
      collection(db, COLLECTIONS.GOALS),
      where('ownerId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const goals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal));
      callback(goals);
    });
  },

  async getTeamGoals(managerId: string): Promise<Goal[]> {
    const q = query(
      collection(db, COLLECTIONS.GOALS),
      where('managerId', '==', managerId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal));
  },

  // Activities
  async addActivity(activity: Omit<Activity, 'id' | 'timestamp'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.ACTIVITIES), {
      ...activity,
      timestamp: serverTimestamp()
    });
    return docRef.id;
  },

  async getUserActivities(userId: string, limit = 20): Promise<Activity[]> {
    const q = query(
      collection(db, COLLECTIONS.ACTIVITIES),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.slice(0, limit).map(doc => ({ id: doc.id, ...doc.data() } as Activity));
  },

  // Notifications
  async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
      ...notification,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  async getUserNotifications(userId: string): Promise<Notification[]> {
    const q = query(
      collection(db, COLLECTIONS.NOTIFICATIONS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
  },

  subscribeToUserNotifications(userId: string, callback: (notifications: Notification[]) => void): Unsubscribe {
    const q = query(
      collection(db, COLLECTIONS.NOTIFICATIONS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
      callback(notifications);
    });
  },

  async markNotificationRead(notificationId: string): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, notificationId), {
      read: true
    });
  },

  // Escalations
  async createEscalation(escalation: Omit<Escalation, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.ESCALATIONS), {
      ...escalation,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  async getGoalEscalations(goalId: string): Promise<Escalation[]> {
    const q = query(
      collection(db, COLLECTIONS.ESCALATIONS),
      where('goalId', '==', goalId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Escalation));
  },

  async resolveEscalation(escalationId: string, resolvedBy: string): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.ESCALATIONS, escalationId), {
      status: 'RESOLVED',
      resolvedBy,
      resolvedAt: serverTimestamp()
    });
  }
};

export default firestoreDb;