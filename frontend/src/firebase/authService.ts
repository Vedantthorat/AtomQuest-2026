import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';
import type { User, Role } from '../types';

const googleProvider = new GoogleAuthProvider();

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: Role;
  managerId?: string;
  adminId?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const firebaseAuth = {
  async register({ email, password, name, role, managerId, adminId }: RegisterData): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    await updateProfile(firebaseUser, { displayName: name });

    const userData: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email || email,
      name: name,
      role: role,
      department: 'General',
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), {
      ...userData,
      createdAt: serverTimestamp(),
      managerId: managerId || null,
      adminId: adminId || null
    });

    return userData;
  },

  async login({ email, password }: LoginData): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (userDoc.exists()) {
      return userDoc.data() as User;
    }

    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || email,
      name: firebaseUser.displayName || 'User',
      role: 'EMPLOYEE' as Role,
      department: 'General'
    };
  },

  async loginWithGoogle(): Promise<User> {
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;

    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

    if (!userDoc.exists()) {
      const userData: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || 'Google User',
        role: 'EMPLOYEE' as Role,
        department: 'General',
        avatar: firebaseUser.photoURL || undefined
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...userData,
        createdAt: serverTimestamp()
      });

      return userData;
    }

    return userDoc.data() as User;
  },

  async logout(): Promise<void> {
    await signOut(auth);
  },

  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  },

  async updateUserProfile(userId: string, data: Partial<User>): Promise<void> {
    await setDoc(doc(db, 'users', userId), data, { merge: true });
  },

  async getUserProfile(userId: string): Promise<User | null> {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data() as User;
    }
    return null;
  },

  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }
};

export default firebaseAuth;