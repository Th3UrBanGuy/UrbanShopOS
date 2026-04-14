import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { userService } from '@/lib/services/userService';
import { SystemUser } from './userStore';

interface AuthState {
  currentUser: SystemUser | null;
  firebaseUser: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  
  initialize: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<boolean>;
  loginWithPin: (pin: string) => Promise<boolean>;
  loginWithUser: (user: SystemUser) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      firebaseUser: null,
      loading: true,
      isAuthenticated: false,

      initialize: () => {
        return new Promise((resolve) => {
          onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
              set({ firebaseUser, loading: false });
              resolve();
            } else {
              set({ firebaseUser: null, loading: false });
              resolve();
            }
          });
        });
      },

      loginWithEmail: async (email: string, password: string) => {
        set({ loading: true });
        try {
          const result = await signInWithEmailAndPassword(auth, email, password);
          const firebaseUser = result.user;
          
          const user = await userService.getById(firebaseUser.uid);
          if (user && user.isActive) {
            set({ currentUser: user, firebaseUser, isAuthenticated: true, loading: false });
            return true;
          }
          
          await firebaseSignOut(auth);
          set({ loading: false });
          return false;
        } catch (e) {
          console.error('Login failed:', e);
          set({ loading: false });
          return false;
        }
      },

      loginWithPin: async (pin: string) => {
        set({ loading: true });
        try {
          const user = await userService.getByPin(pin);
          if (user && user.isActive) {
            set({ currentUser: user, isAuthenticated: true, loading: false });
            return true;
          }
          set({ loading: false });
          return false;
        } catch (e) {
          console.error('PIN login failed:', e);
          set({ loading: false });
          return false;
        }
      },

      loginWithUser: (user: SystemUser) => {
        set({ currentUser: user, isAuthenticated: true });
      },

      logout: async () => {
        try {
          await firebaseSignOut(auth);
        } catch (e) {
          console.log('Firebase logout skip:', e);
        }
        set({ currentUser: null, firebaseUser: null, isAuthenticated: false });
      },
    }),
    {
      name: 'aero-resin-auth',
      partialize: (state) => ({ isAuthenticated: state.isAuthenticated }),
    }
  )
);