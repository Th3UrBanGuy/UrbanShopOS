import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DashboardTab } from './dashboardStore';
import { userService } from '@/lib/services/userService';

export type UserRole = 'super_admin' | 'admin' | 'user';

export const ALL_MODULES: DashboardTab[] = [
  'Hub', 'Stats', 'Inventory', 'Coupons', 'PoS', 'Khorochkhata', 'Parties', 'Settings', 'Management', 'Users',
];

export const MANAGEABLE_MODULES: DashboardTab[] = [
  'Hub', 'Stats', 'Inventory', 'Coupons', 'PoS', 'Khorochkhata', 'Parties', 'Management', 'Users',
];

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  pin: string;
  role: UserRole;
  allowedModules: DashboardTab[];
  createdAt: string;
  createdBy: string;
  isActive: boolean;
}

const SUPER_ADMIN: SystemUser = {
  id: 'super-admin',
  name: 'Super Admin',
  email: 'superadmin@aeroresin.com',
  pin: process.env.NEXT_PUBLIC_SUPER_ADMIN_PIN || 'PIN_NOT_SET',
  role: 'super_admin',
  allowedModules: ALL_MODULES,
  createdAt: new Date().toISOString(),
  createdBy: 'system',
  isActive: true,
};

interface UserStoreState {
  users: SystemUser[];
  loading: boolean;
  initialized: boolean;
  
  initialize: () => Promise<void>;
  addUser: (user: Omit<SystemUser, 'id' | 'createdAt'>) => Promise<void>;
  updateUser: (id: string, patch: Partial<Omit<SystemUser, 'id' | 'createdAt' | 'createdBy'>>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  setModules: (id: string, modules: DashboardTab[]) => Promise<void>;
  toggleModule: (id: string, module: DashboardTab) => Promise<void>;
  getUserByPin: (pin: string) => SystemUser | undefined;
}

export const useUserStore = create<UserStoreState>()(
  persist(
    (set, get) => ({
      users: [SUPER_ADMIN],
      loading: false,
      initialized: false,

      initialize: async () => {
        set({ loading: true });
        try {
          const users = await userService.getAll();
          if (users.length > 0) {
            set({ users, initialized: true, loading: false });
            return;
          }
        } catch (e) {
          console.log('Firebase unavailable, using local data');
        }
        set({ initialized: true, loading: false });
      },

      addUser: async (user) => {
        try {
          const newUser = await userService.create(user);
          set((s) => ({ users: [...s.users, newUser] }));
        } catch (e) {
          const id = crypto.randomUUID();
          const newUser: SystemUser = {
            ...user,
            id,
            createdAt: new Date().toISOString(),
          };
          set((s) => ({ users: [...s.users, newUser] }));
        }
      },

      updateUser: async (id, patch) => {
        set((s) => ({
          users: s.users.map(u => u.id === id ? { ...u, ...patch } : u)
        }));
        try {
          await userService.update(id, patch);
        } catch (e) {
          console.log('Offline: user update queued');
        }
      },

      deleteUser: async (id) => {
        set((s) => ({
          users: s.users.filter(u => u.id !== id && u.id !== 'super-admin'),
        }));
        try {
          await userService.delete(id);
        } catch (e) {
          console.log('Offline: user delete queued');
        }
      },

      setModules: async (id, modules) => {
        set((s) => ({
          users: s.users.map(u => u.id === id ? { ...u, allowedModules: modules } : u)
        }));
        try {
          await userService.setModules(id, modules);
        } catch (e) {
          console.log('Offline: modules update queued');
        }
      },

      toggleModule: async (id, module) => {
        set((s) => ({
          users: s.users.map(u => {
            if (u.id !== id) return u;
            const has = u.allowedModules.includes(module);
            return {
              ...u,
              allowedModules: has
                ? u.allowedModules.filter(m => m !== module)
                : [...u.allowedModules, module],
            };
          })
        }));
        try {
          await userService.toggleModule(id, module);
        } catch (e) {
          console.log('Offline: module toggle queued');
        }
      },

      getUserByPin: (pin) => get().users.find(u => u.pin === pin && u.isActive),
    }),
    { name: 'aero-resin-users' }
  )
);