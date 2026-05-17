import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, firebaseAuth as authService, firestoreDb } from '../firebase';
import { useAuthStore, DEMO_USERS } from '../stores/authStore';
import type { User, Role } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isFirebaseReady: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isFirebaseReady: false
});

export function useAuth() {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [loading, setLoading] = useState(true);
  const { user, setAuth, logout } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          let userData = await firestoreDb.getUserProfile(firebaseUser.uid);
          
          if (!userData) {
            userData = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || 'User',
              role: 'EMPLOYEE' as Role,
              department: 'General',
              avatar: firebaseUser.photoURL || undefined
            };
            
            await firestoreDb.updateUserProfile(firebaseUser.uid, userData);
          }
          
          setAuth(userData, firebaseUser.uid, true);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        const storedUser = useAuthStore.getState().user;
        const storedToken = useAuthStore.getState().token;
        
        if (storedUser && storedToken && !storedToken.startsWith('demo')) {
          // Firebase user logged out but we have a stored user that's not demo
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setAuth]);

  const value = {
    user,
    loading,
    isFirebaseReady: true
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;