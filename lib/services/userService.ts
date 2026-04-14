import { doc, getDoc, setDoc, updateDoc, deleteDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { db, collections } from '../firebase';
import { SystemUser } from '@/store/userStore';
import { DashboardTab } from '@/store/dashboardStore';

export const userService = {
  async getAll(): Promise<SystemUser[]> {
    const q = query(collection(db, collections.USERS));
    const snapshot = await getDocs(q);
    const users: SystemUser[] = [];
    snapshot.forEach((d) => {
      users.push(d.data() as SystemUser);
    });
    return users;
  },

  async getById(id: string): Promise<SystemUser | null> {
    const docRef = doc(db, collections.USERS, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return snapshot.data() as SystemUser;
  },

  async getByPin(pin: string): Promise<SystemUser | null> {
    const q = query(collection(db, collections.USERS), where('pin', '==', pin));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const user = snapshot.docs[0].data() as SystemUser;
    return user.isActive ? user : null;
  },

  async create(user: Omit<SystemUser, 'id' | 'createdAt'>): Promise<SystemUser> {
    const id = crypto.randomUUID();
    const newUser: SystemUser = {
      ...user,
      id,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, collections.USERS, id), newUser);
    return newUser;
  },

  async update(id: string, patch: Partial<SystemUser>): Promise<void> {
    const cleanPatch: Record<string, unknown> = {};
    Object.entries(patch).forEach(([k, v]) => {
      if (v !== undefined) cleanPatch[k] = v;
    });
    await updateDoc(doc(db, collections.USERS, id), cleanPatch);
  },

  async delete(id: string): Promise<void> {
    if (id === 'super-admin') throw new Error('Cannot delete super admin');
    await deleteDoc(doc(db, collections.USERS, id));
  },

  async setModules(id: string, modules: DashboardTab[]): Promise<void> {
    await this.update(id, { allowedModules: modules });
  },

  async toggleModule(id: string, module: DashboardTab): Promise<void> {
    const user = await this.getById(id);
    if (!user) throw new Error('User not found');
    
    const has = user.allowedModules.includes(module);
    const newModules = has
      ? user.allowedModules.filter(m => m !== module)
      : [...user.allowedModules, module];
    
    await this.update(id, { allowedModules: newModules });
  },
};