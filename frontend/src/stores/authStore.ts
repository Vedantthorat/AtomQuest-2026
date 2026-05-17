import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';
import { firebaseAuth } from '../firebase/authService';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isFirebaseMode: boolean;
  setAuth: (user: User, token: string, isFirebase?: boolean) => Promise<void>;
  setUser: (user: User) => void;
  logout: () => Promise<void>;
  loginWithFirebase: (email: string, password: string) => Promise<User>;
  registerWithFirebase: (email: string, password: string, name: string, role: 'EMPLOYEE' | 'MANAGER' | 'ADMIN', managerId?: string, adminId?: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isFirebaseMode: false,

      setAuth: async (user, token, isFirebase = false) => {
        set({ user, token, isAuthenticated: true, isFirebaseMode: isFirebase });
      },

      setUser: (user) => set({ user, isAuthenticated: true }),

      logout: async () => {
        try {
          await firebaseAuth.logout();
        } catch (error) {
          console.log('Firebase logout skipped (demo mode)');
        }
        set({ user: null, token: null, isAuthenticated: false, isFirebaseMode: false });
      },

      loginWithFirebase: async (email: string, password: string) => {
        const user = await firebaseAuth.login({ email, password });
        const token = await user.id; 
        set({ user, token, isAuthenticated: true, isFirebaseMode: true });
        return user;
      },

      registerWithFirebase: async (email: string, password: string, name: string, role, managerId, adminId) => {
        const user = await firebaseAuth.register({ email, password, name, role, managerId, adminId });
        const token = await user.id;
        set({ user, token, isAuthenticated: true, isFirebaseMode: true });
        return user;
      },

      loginWithGoogle: async () => {
        const user = await firebaseAuth.loginWithGoogle();
        const token = await user.id;
        set({ user, token, isAuthenticated: true, isFirebaseMode: true });
        return user;
      }
    }),
    {
      name: 'atomtrack-auth',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated, isFirebaseMode: state.isFirebaseMode })
    }
  )
);

// Demo users for offline mode
export const DEMO_USERS = {
  ADMIN: {
    id: 'u1',
    email: 'admin@atomtrack.com',
    name: 'System Admin',
    role: 'ADMIN' as const,
    department: 'Operations',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
  },
  MANAGER: {
    id: 'u2',
    email: 'manager@atomtrack.com',
    name: 'Sarah Mitchell',
    role: 'MANAGER' as const,
    department: 'Engineering',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah'
  },
  EMPLOYEE: {
    id: 'u3',
    email: 'employee@atomtrack.com',
    name: 'Alex Chen',
    role: 'EMPLOYEE' as const,
    department: 'Engineering',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex'
  }
};