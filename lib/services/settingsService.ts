import { doc, getDoc, setDoc, updateDoc, getDocs, collection } from 'firebase/firestore';
import { db, collections } from '../firebase';

export interface Settings {
  id: string;
  siteName: string;
  currency: string;
  defaultTaxRate: number;
  lowStockThreshold: number;
  billDesign: Record<string, unknown>;
  updatedAt: string;
}

const DEFAULT_SETTINGS: Settings = {
  id: 'default',
  siteName: 'AERO RESIN',
  currency: 'USD',
  defaultTaxRate: 12,
  lowStockThreshold: 20,
  billDesign: {},
  updatedAt: new Date().toISOString(),
};

export const settingsService = {
  async get(): Promise<Settings> {
    const docRef = doc(db, collections.SETTINGS, 'default');
    const snapshot = await getDoc(docRef);
    
    if (snapshot.exists()) {
      return snapshot.data() as Settings;
    }
    
    await setDoc(docRef, DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  },

  async update(patch: Partial<Omit<Settings, 'id'>>): Promise<void> {
    const docRef = doc(db, collections.SETTINGS, 'default');
    await updateDoc(docRef, {
      ...patch,
      updatedAt: new Date().toISOString(),
    });
  },
};